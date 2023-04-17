import { UsePipes, ValidationPipe, forwardRef, Inject } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  WsException
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { REQUEST_TIMEOUT } from '../constants';
import {
  EventEmitterNameSpace,
  IResponse,
  IVehicleStatus,
  SocketEnum,
  SocketEventEnum
} from '../core';
import { InterfaceService } from '../interface/interface.service';
import { RegisterAgentDTO } from '../vehicle/dto/registerAgent.dto';
import { VehicleService } from '../vehicle/vehicle.service';
import { VehicleStatus } from './../core/enums/enum';
import { InterfaceDetailStatusDTO } from './dto/interfaceDetailStatus.res.dto';
import { InterfaceInformationDTO } from './dto/interfaceInformation.res.dto';

@WebSocketGateway({
  namespace: 'nissan'
})
export class AgentGateway {
  constructor(
    @Inject(forwardRef(() => VehicleService))
    private readonly vehicleService: VehicleService,
    private readonly eventEmitter: EventEmitter2,
    private readonly interfaceService: InterfaceService
  ) {}
  @WebSocketServer()
  server: Server;

  async emitToRoom(event: string, room: string, data: any) {
    return await new Promise((resolve, reject) => {
      this.server
        .timeout(REQUEST_TIMEOUT)
        .to(room)
        .emit(event, data, (err: any, responses: IResponse[]) => {
          if (err) {
            reject(err.message);
          } else {
            resolve(responses.reduce((acc, cur) => ({ ...acc, ...cur }), {}));
          }
        });
    });
  }

  async emitToClient(event: string, clientId: string, data?: any) {
    return await new Promise((resolve, reject) => {
      this.server
        .timeout(REQUEST_TIMEOUT)
        .to(clientId) //DEFAULT ROOM FOR SOCKET
        .emit(event, data, (err, responses) => {
          if (err) {
            reject(err.message);
          } else {
            resolve(responses);
          }
        });
    });
  }

  async handleConnection(client: Socket) {
    // eslint-disable-next-line no-console
    console.log('connected', client.id);

    const clientKey = client.handshake.headers.certkey as string;
    const vehicle = await this.vehicleService.handleVehicleConnection(clientKey);
    if (vehicle) {
      client.join(`${SocketEnum.ROOM_PREFIX}${clientKey}`);

      this.emitToRoom(
        SocketEventEnum.VEHICLE_STATUS,
        `${SocketEnum.ROOM_PREFIX}${clientKey}`,
        vehicle.status
      ).catch((e) => {
        console.error(`[handleConnection] Emit VEHICLE_STATUS failed with error: ${e}`);
      });
    } else {
      this.emitToClient(SocketEventEnum.REGISTRATION_REQUEST, client.id).catch((e) => {
        console.error(`[handleConnection] Emit REGISTRATION_REQUEST failed with error: ${e}`);
      });

      this.emitToClient(
        SocketEventEnum.VEHICLE_STATUS,
        `${SocketEnum.ROOM_PREFIX}${clientKey}`,
        VehicleStatus.WAITING
      ).catch((e) => {
        console.error(`[handleConnection] Emit VEHICLE_STATUS failed with error: ${e}`);
      });
    }
  }

  async handleDisconnect(client: Socket) {
    // eslint-disable-next-line no-console
    console.log('disconnected', client.id);

    await this.vehicleService.handleVehicleDisconnection(
      client.handshake.headers.certkey as string
    );
  }

  @OnEvent(EventEmitterNameSpace.VEHICLE_STATUS)
  handleVehicleStatus(payload: IVehicleStatus) {
    this.emitToRoom(
      SocketEventEnum.VEHICLE_STATUS,
      `${SocketEnum.ROOM_PREFIX}${payload.vehicleCertKey}`,
      payload.status
    ).catch((e) => {
      console.error(`[EventEmitterNameSpace.VEHICLE_STATUS] failed with error: ${e}`);
    });
  }

  @UsePipes(
    new ValidationPipe({
      enableDebugMessages: true,
      transform: true,
      exceptionFactory(errors) {
        throw new WsException(errors);
      }
    })
  )
  @SubscribeMessage(SocketEventEnum.VEHICLE_REGISTRATION)
  async onEvent(@ConnectedSocket() client: Socket, @MessageBody() data: RegisterAgentDTO) {
    client.join(`${SocketEnum.ROOM_PREFIX}${data?.certKey}`);

    const vehicle = await this.vehicleService.registerVehicle(data);
    try {
      await this.vehicleService.getResultFromAgent(vehicle, SocketEventEnum.REGISTRATION_RESPONSE, {
        certKey: vehicle.certKey
      });
    } catch (e) {
      console.error(`[SocketEventEnum.VEHICLE_REGISTRATION] failed with error: ${e}`);
    }
  }

  @UsePipes(
    new ValidationPipe({
      enableDebugMessages: true,
      transform: true,
      exceptionFactory(errors) {
        throw new WsException(errors);
      }
    })
  )
  @SubscribeMessage(SocketEventEnum.VEHICLE_STATUS)
  async onStatusRequestEvent(@ConnectedSocket() client: Socket) {
    try {
      const clientKey = client.handshake.headers.certkey as string;
      const vehicle = await this.vehicleService.getVehicleOnCertKey(clientKey);
      await this.emitToRoom(
        SocketEventEnum.VEHICLE_STATUS,
        `${SocketEnum.ROOM_PREFIX}${clientKey}`,
        vehicle.status
      );
    } catch (e) {
      console.error(`[SocketEventEnum.VEHICLE_STATUS] failed with error: ${e}`);
    }
  }

  @UsePipes(
    new ValidationPipe({
      enableDebugMessages: true,
      transform: true,
      exceptionFactory(errors) {
        throw new WsException(errors);
      }
    })
  )
  @SubscribeMessage(SocketEventEnum.GET_INTERFACE_DETAIL_STATUS)
  async onGetInterfaceDetailStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: InterfaceDetailStatusDTO
  ) {
    const clientKey = client.handshake.headers.certkey as string;
    const vehicle = await this.vehicleService.getVehicleOnCertKey(clientKey);
    const { interfaceName, algorithms, machines, sensors } = data;
    const agentInterface = await this.interfaceService.getInterfaceByName(interfaceName);
    if (!agentInterface) {
      return;
    }
    this.eventEmitter.emit(
      EventEmitterNameSpace.VEHICLE_INTERFACE_DETAIL_STATUS,
      new InterfaceInformationDTO(vehicle.id, agentInterface.id, machines, algorithms, sensors)
    );
  }
}

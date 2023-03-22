import { UsePipes, ValidationPipe, forwardRef, Inject } from '@nestjs/common';
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
import { IResponse, SocketEnum, SocketEventEnum } from '../core';
import { RegisterAgentDTO } from '../vehicle/dto/registerAgent.dto';
import { VehicleService } from '../vehicle/vehicle.service';

@WebSocketGateway({
  namespace: 'nissan'
})
export class AgentGateway {
  constructor(
    @Inject(forwardRef(() => VehicleService))
    private readonly vehicleService: VehicleService
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

  async handleConnection(client: any) {
    const clientKey = client.handshake.headers.certkey;
    const isRegistered = await this.vehicleService.handleVehicleConnection(clientKey);
    if (isRegistered) {
      client.join(`${SocketEnum.ROOM_PREFIX}${clientKey}`);
    } else {
      this.emitToClient(SocketEventEnum.REGISTRATION_REQUEST, client.id);
    }
    // eslint-disable-next-line no-console
    console.log('connected', client.id);
  }

  async handleDisconnect(client: any) {
    // eslint-disable-next-line no-console
    console.log('disconnected', client.id);
    await this.vehicleService.handleVehicleDisconnection(client.handshake.headers.certkey);
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
    await this.vehicleService.getResultFromAgent(vehicle, SocketEventEnum.REGISTRATION_RESPONSE, {
      certKey: vehicle.certKey
    });
  }
}

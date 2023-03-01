import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CarService } from '../car/car.service';
import { SocketEnum, SocketJoiValidatorPipe } from '../core';
import { RegisterAgentDTO, vRegisterAgentDTO } from './dto/registerAgent.dto';

@WebSocketGateway({
  namespace: 'nissan',
})
export class AgentGateway {
  constructor(private readonly carService: CarService) {}
  @WebSocketServer()
  server: Server;

  async emitToRoom(event: string, room: string, data: any) {
    return await new Promise((resolve, reject) => {
      this.server
        .timeout(SocketEnum.TIME_OUT)
        .to(room)
        .emit(event, data, (err, responses) => {
          if (err) {
            reject(err.message);
          } else {
            resolve(responses);
          }
        });
    });
  }

  handleConnection(client: any) {
    console.log('connected', client.id);
  }

  handleDisconnect(client) {
    console.log('disconnected', client.id);
  }

  @UsePipes(
    new ValidationPipe({
      enableDebugMessages: true,
      transform: true,
      exceptionFactory(errors) {
        throw new WsException(errors);
      },
    }),
  )
  @SubscribeMessage('join')
  async onEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: RegisterAgentDTO,
  ) {
    client.join(`${SocketEnum.ROOM_PREFIX}${data?.certKey}`);
    const car = await this.carService.registerCar(data);

    await this.emitToRoom(
      SocketEnum.EVENT_REGISTRATION_RESPONSE,
      `${SocketEnum.ROOM_PREFIX}${car?.certKey}`,
      {
        certKey: car.certKey,
      },
    );
  }
}

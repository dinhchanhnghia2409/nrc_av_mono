import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CarService } from '../car/car.service';
import { SocketEnum } from '../core';

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

  @SubscribeMessage('join')
  async onEvent(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    data = JSON.parse(data);
    client.join(`${SocketEnum.ROOM_PREFIX}${data?.certKey}`);
    const car = await this.carService.registerCar(
      data.certKey,
      data.macAddress,
      data.licenseNumber,
    );

    await this.emitToRoom(
      SocketEnum.EVENT_REGISTRATION_RESPONSE,
      `${SocketEnum.ROOM_PREFIX}${data?.certKey}`,
      {
        certKey: car.certKey,
      },
    );
  }
}

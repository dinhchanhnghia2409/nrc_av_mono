import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: 'nissan',
})
export class CarGateway {
  @WebSocketServer()
  server: Server;

  async emitToRoom(event: string, room: string, data: any) {
    const result = await new Promise((resolve, reject) => {
      this.server
        .timeout(1000)
        .to(room)
        .emit(event, data, (err, responses) => {
          if (err) {
            throw err;
          } else {
            resolve(responses);
          }
        });
    });
    return result;
  }
}

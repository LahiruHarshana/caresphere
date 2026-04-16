import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'video',
})
export class VideoGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string },
  ) {
    client.join(`room:${data.bookingId}`);
    console.log(`Client ${client.id} joined video room ${data.bookingId}`);
  }

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { offer: any; bookingId: string },
  ) {
    client.to(`room:${data.bookingId}`).emit('offer', data.offer);
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { answer: any; bookingId: string },
  ) {
    client.to(`room:${data.bookingId}`).emit('answer', data.answer);
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { candidate: any; bookingId: string },
  ) {
    client.to(`room:${data.bookingId}`).emit('ice-candidate', data.candidate);
  }

  @SubscribeMessage('end-call')
  handleEndCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string },
  ) {
    this.server.to(`room:${data.bookingId}`).emit('call-ended');
  }
}

import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'video',
})
export class VideoGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly prisma: PrismaService) {}

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string; userId: string },
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: data.bookingId },
    });

    if (!booking || (booking.customerId !== data.userId && booking.caregiverId !== data.userId)) {
      client.emit('error', 'Not authorized to join this call');
      return;
    }

    if (booking.status !== 'IN_PROGRESS' && booking.status !== 'CONFIRMED') {
      client.emit('error', 'Booking is not active');
      return;
    }

    client.join(`room:${data.bookingId}`);
    client.to(`room:${data.bookingId}`).emit('user-joined', { userId: data.userId });
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

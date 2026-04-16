import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'location',
})
@UseGuards(WsJwtGuard)
export class LocationGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('subscribe-to-booking')
  handleSubscribeToBooking(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string },
  ) {
    client.join(`booking:${data.bookingId}`);
    console.log(`Client ${client.id} subscribed to booking ${data.bookingId}`);
  }

  @SubscribeMessage('update-location')
  handleUpdateLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { lat: number; lng: number; bookingId: string },
  ) {
    // Broadcast to the booking room
    this.server.to(`booking:${data.bookingId}`).emit('location-updated', {
      lat: data.lat,
      lng: data.lng,
      bookingId: data.bookingId,
    });
  }
}

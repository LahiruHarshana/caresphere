import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/ws-jwt.guard'; // I need to create this

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-chat')
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; otherId: string },
  ) {
    const room = this.getRoomName(data.userId, data.otherId);
    client.join(room);
    console.log(`Client ${client.id} joined room ${room}`);
  }

  @SubscribeMessage('send-message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { senderId: string; receiverId: string; content: string; bookingId?: string },
  ) {
    const message = await this.chatService.createMessage(
      data.senderId,
      data.receiverId,
      data.content,
      data.bookingId,
    );

    const room = this.getRoomName(data.senderId, data.receiverId);
    this.server.to(room).emit('receive-message', message);
    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: string; receiverId: string; isTyping: boolean },
  ) {
    const room = this.getRoomName(data.senderId, data.receiverId);
    client.to(room).emit('typing', { userId: data.senderId, isTyping: data.isTyping });
  }

  @SubscribeMessage('read-receipt')
  async handleReadReceipt(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; senderId: string; receiverId: string },
  ) {
    await this.chatService.markAsRead(data.messageId);
    const room = this.getRoomName(data.senderId, data.receiverId);
    client.to(room).emit('read-receipt', { messageId: data.messageId });
  }

  private getRoomName(userId1: string, userId2: string): string {
    const ids = [userId1, userId2].sort();
    return `chat:${ids[0]}:${ids[1]}`;
  }
}

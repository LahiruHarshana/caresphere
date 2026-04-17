import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get(':otherUserId')
  async getChatHistory(@Request() req: any, @Param('otherUserId') otherUserId: string) {
    return this.chatService.getChatHistory(req.user.userId, otherUserId);
  }

  @Get('conversations')
  async getConversations(@Request() req: any) {
    return this.chatService.getConversations(req.user.userId);
  }
}

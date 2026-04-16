import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('history/:otherUserId')
  async getChatHistory(@Request() req, @Param('otherUserId') otherUserId: string) {
    return this.chatService.getChatHistory(req.user.id, otherUserId);
  }
}

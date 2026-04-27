import { Controller, Get, Post, Body, Req, UseGuards, UseInterceptors, UploadedFile, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/profile.dto';
import { UpdateCustomerProfileDto } from './dto/customer-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    return this.usersService.getCustomerDashboard(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.usersService.getProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('customer-profile')
  async getCustomerProfile(@Req() req: any) {
    return this.usersService.getCustomerProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async upsertProfile(@Req() req: any, @Body() data: UpdateProfileDto) {
    return this.usersService.upsertProfile(req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('customer-profile')
  async upsertCustomerProfile(@Req() req: any, @Body() data: UpdateCustomerProfileDto) {
    return this.usersService.upsertCustomerProfile(req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: memoryStorage(),
  }))
  async uploadAvatar(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateAvatar(req.user.userId, file);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }
}

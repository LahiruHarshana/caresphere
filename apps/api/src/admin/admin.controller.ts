import { Controller, Get, Post, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, VerificationStatus } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers(@Query('search') search?: string, @Query('role') role?: string) {
    return this.adminService.getUsers(search, role);
  }

  @Post('users/:id/ban')
  toggleBan(@Param('id') id: string, @Req() req: any) {
    return this.adminService.toggleBan(id, req.user.id);
  }

  @Get('caregivers/pending')
  getPendingCaregivers() {
    return this.adminService.getPendingCaregivers();
  }

  @Post('caregivers/:userId/verify')
  verifyCaregiver(
    @Param('userId') userId: string,
    @Body('status') status: VerificationStatus,
    @Req() req: any,
  ) {
    return this.adminService.verifyCaregiver(userId, status, req.user.id);
  }

  @Get('logs')
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Get('analytics')
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get('bookings')
  getBookings(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getBookings(
      status,
      parseInt(page || '1'),
      parseInt(limit || '20'),
      search,
    );
  }

  @Post('bookings/:id/cancel')
  cancelBooking(@Param('id') id: string, @Req() req: any) {
    return this.adminService.adminCancelBooking(id, req.user.userId);
  }
}

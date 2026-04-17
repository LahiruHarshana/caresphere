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

  @Post('caregivers/:id/verify')
  verifyCaregiver(
    @Param('id') id: string,
    @Body('status') status: VerificationStatus,
    @Req() req: any,
  ) {
    return this.adminService.verifyCaregiver(id, status, req.user.id);
  }

  @Get('logs')
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Get('analytics')
  getAnalytics() {
    return this.adminService.getAnalytics();
  }
}

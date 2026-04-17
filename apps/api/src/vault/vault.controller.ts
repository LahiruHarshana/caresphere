import { Controller, Post, Get, Body, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { VaultService } from './vault.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('vault')
@UseGuards(JwtAuthGuard)
export class VaultController {
  constructor(private vaultService: VaultService) {}

  @Post()
  async createEntry(@Request() req: any, @Body('data') data: string) {
    return this.vaultService.createVaultEntry(req.user.userId, data);
  }

  @Get()
  async listEntries(@Request() req: any) {
    return this.vaultService.listVaultEntries(req.user.userId);
  }

  @Get(':id')
  async getEntry(@Request() req: any, @Param('id') id: string) {
    return this.vaultService.getVaultEntry(id, req.user.userId, req.user.role);
  }

  @Post(':id/grant')
  async grantAccess(@Request() req: any, @Param('id') id: string, @Body('caregiverId') caregiverId: string) {
    return this.vaultService.grantAccess(id, req.user.userId, caregiverId);
  }

  @Post(':id/revoke')
  async revokeAccess(@Request() req: any, @Param('id') id: string, @Body('caregiverId') caregiverId: string) {
    return this.vaultService.revokeAccess(id, req.user.userId, caregiverId);
  }
}

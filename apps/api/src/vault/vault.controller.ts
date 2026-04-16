import { Controller, Post, Get, Body, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { VaultService } from './vault.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('vault')
@UseGuards(JwtAuthGuard)
export class VaultController {
  constructor(private vaultService: VaultService) {}

  @Post()
  async createEntry(@Request() req, @Body('data') data: string) {
    return this.vaultService.createVaultEntry(req.user.id, data);
  }

  @Get()
  async listEntries(@Request() req) {
    return this.vaultService.listVaultEntries(req.user.id);
  }

  @Get(':id')
  async getEntry(@Request() req, @Param('id') id: string) {
    return this.vaultService.getVaultEntry(id, req.user.id, req.user.role);
  }

  @Post(':id/grant')
  async grantAccess(@Request() req, @Param('id') id: string, @Body('caregiverId') caregiverId: string) {
    return this.vaultService.grantAccess(id, req.user.id, caregiverId);
  }

  @Delete(':id/revoke')
  async revokeAccess(@Request() req, @Param('id') id: string, @Body('caregiverId') caregiverId: string) {
    return this.vaultService.revokeAccess(id, req.user.id, caregiverId);
  }
}

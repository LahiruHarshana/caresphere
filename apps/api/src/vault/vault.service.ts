import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class VaultService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key = Buffer.from(process.env.VAULT_ENCRYPTION_KEY || '0'.repeat(64), 'hex');

  constructor(private prisma: PrismaService) {}

  async createVaultEntry(customerId: string, plaintext: string) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    // Store authTag with encrypted data for GCM
    const storedData = `${encrypted}:${authTag}`;

    return this.prisma.familyVault.create({
      data: {
        customerId,
        encryptedData: storedData,
        iv: iv.toString('hex'),
        allowedCaregiverIds: [],
      },
    });
  }

  async listVaultEntries(customerId: string) {
    return this.prisma.familyVault.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getVaultEntry(vaultId: string, userId: string, userRole: string) {
    const entry = await this.prisma.familyVault.findUnique({
      where: { id: vaultId },
    });

    if (!entry) throw new NotFoundException('Vault entry not found');

    // Access control
    if (userRole === 'CUSTOMER' && entry.customerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (userRole === 'CAREGIVER') {
      if (!entry.allowedCaregiverIds.includes(userId)) {
        throw new ForbiddenException('Access denied - not authorized');
      }

      // Check booking window (simplified check for now)
      const activeBooking = await this.prisma.booking.findFirst({
        where: {
          customerId: entry.customerId,
          caregiverId: userId,
          status: 'IN_PROGRESS',
        },
      });

      if (!activeBooking) {
        throw new ForbiddenException('Access denied - no active booking');
      }
    }

    // Decrypt
    const [encrypted, authTag] = entry.encryptedData.split(':');
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(entry.iv, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return { ...entry, decryptedData: decrypted };
  }

  async grantAccess(vaultId: string, customerId: string, caregiverId: string) {
    const entry = await this.prisma.familyVault.findUnique({ where: { id: vaultId } });
    if (!entry || entry.customerId !== customerId) throw new ForbiddenException();

    return this.prisma.familyVault.update({
      where: { id: vaultId },
      data: {
        allowedCaregiverIds: {
          push: caregiverId,
        },
      },
    });
  }

  async revokeAccess(vaultId: string, customerId: string, caregiverId: string) {
    const entry = await this.prisma.familyVault.findUnique({ where: { id: vaultId } });
    if (!entry || entry.customerId !== customerId) throw new ForbiddenException();

    const newList = entry.allowedCaregiverIds.filter(id => id !== caregiverId);

    return this.prisma.familyVault.update({
      where: { id: vaultId },
      data: {
        allowedCaregiverIds: newList,
      },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User, Profile } from '@prisma/client';
import { UpdateProfileDto } from './dto/profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async getProfile(userId: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({
      where: { userId },
    });
  }

  async upsertProfile(userId: string, data: UpdateProfileDto): Promise<Profile> {
    return this.prisma.profile.upsert({
      where: { userId },
      update: data,
      create: {
        ...data,
        userId,
      },
    });
  }
}

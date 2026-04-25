import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(registerDto: RegisterDto) {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      phone,
      address,
      dateOfBirth,
      bio,
      specialties,
      experienceYears,
      hourlyRate,
      certifications,
      careType,
      careFrequency,
      specialRequirements,
      preferredSchedule,
    } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const passwordHash = await argon2.hash(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        profile: {
          create: {
            firstName,
            lastName,
            phone: phone || null,
            address: address || null,
            bio: bio || null,
          },
        },
        ...(role === 'CAREGIVER' && {
          caregiverProfile: {
            create: {
              hourlyRate: hourlyRate || 0,
              experienceYears: experienceYears || 0,
              certifications: certifications || [],
              specialties: specialties || [],
            },
          },
        }),
      },
      include: {
        profile: true,
        caregiverProfile: true,
      },
    });

    const tokens = await this.getTokens(user.id, user.email, user.role);
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName,
        lastName,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await argon2.verify(user.passwordHash, loginDto.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const profile = await this.usersService.getProfile(user.id);
    const tokens = await this.getTokens(user.id, user.email, user.role);
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
      },
      ...tokens,
    };
  }

  async refreshTokens(userId: string, email: string, role: string) {
    const tokens = await this.getTokens(userId, email, role);
    return tokens;
  }

  private async getTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'super-secret',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'super-refresh-secret',
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
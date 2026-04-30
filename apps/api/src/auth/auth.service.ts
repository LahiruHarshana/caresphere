import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'caresphere-9b92c',
  });
}

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
      agreeToBackgroundCheck,
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
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          },
        },
        ...(role === 'CUSTOMER' && {
          customerProfile: {
            create: {
              careType: careType || null,
              careFrequency: careFrequency || null,
              specialRequirements: specialRequirements || null,
              preferredSchedule: preferredSchedule || null,
            },
          },
        }),
        ...(role === 'CAREGIVER' && {
          caregiverProfile: {
            create: {
              hourlyRate: hourlyRate || 0,
              experienceYears: experienceYears || 0,
              certifications: certifications || [],
              specialties: specialties || [],
              agreedToBackgroundCheck: agreeToBackgroundCheck || false,
            },
          },
        }),
      },
      include: {
        profile: true,
        caregiverProfile: true,
        customerProfile: true,
      },
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        type: 'EMAIL_VERIFY',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email
    this.sendVerificationEmail(email, verificationToken);

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
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }

  private sendVerificationEmail(email: string, token: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

    console.log(`📧 Verification link for ${email}: ${verifyUrl}`);
  }

  async verifyEmail(token: string) {
    const record = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record) {
      throw new BadRequestException('Invalid verification token');
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    if (record.type !== 'EMAIL_VERIFY') {
      throw new BadRequestException('Invalid token type');
    }

    // Mark user as verified
    await this.prisma.user.update({
      where: { id: record.userId },
      data: { isVerified: true },
    });

    // Delete the used token
    await this.prisma.verificationToken.delete({
      where: { id: record.id },
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerification(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return {
        message: 'If the email exists, a verification link has been sent.',
      };
    }

    if (user.isVerified) {
      return { message: 'Email is already verified.' };
    }

    // Delete old tokens
    await this.prisma.verificationToken.deleteMany({
      where: { userId: user.id, type: 'EMAIL_VERIFY' },
    });

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        type: 'EMAIL_VERIFY',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    this.sendVerificationEmail(email, verificationToken);

    return {
      message: 'If the email exists, a verification link has been sent.',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    // Delete old reset tokens
    await this.prisma.verificationToken.deleteMany({
      where: { userId: user.id, type: 'PASSWORD_RESET' },
    });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    console.log(`📧 Password reset link for ${email}: ${resetUrl}`);

    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.type !== 'PASSWORD_RESET') {
      throw new BadRequestException('Invalid reset token');
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    const passwordHash = await argon2.hash(newPassword);

    await this.prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });

    // Delete the used token
    await this.prisma.verificationToken.delete({
      where: { id: record.id },
    });

    return { message: 'Password has been reset successfully.' };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await argon2.verify(
      user.passwordHash,
      loginDto.password,
    );
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

  async googleAuth(googleAuthDto: GoogleAuthDto) {
    let decoded;

    try {
      decoded = await getAuth().verifyIdToken(googleAuthDto.idToken);
    } catch {
      throw new BadRequestException(
        'Google sign-in token is invalid or expired. Please try again.',
      );
    }

    const email = decoded.email?.toLowerCase();

    if (!email) {
      throw new BadRequestException(
        'Google account must include a verified email address',
      );
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ firebaseUid: decoded.uid }, { email }],
      },
      include: { profile: true },
    });

    if (existingUser) {
      const user =
        existingUser.firebaseUid === decoded.uid
          ? existingUser
          : await this.prisma.user.update({
              where: { id: existingUser.id },
              data: {
                firebaseUid: decoded.uid,
                authProvider:
                  existingUser.authProvider === 'EMAIL'
                    ? 'EMAIL_GOOGLE'
                    : existingUser.authProvider,
                isVerified: true,
              },
              include: { profile: true },
            });

      const tokens = await this.getTokens(user.id, user.email, user.role);
      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.profile?.firstName || '',
          lastName: user.profile?.lastName || '',
        },
        ...tokens,
      };
    }

    if (!googleAuthDto.role) {
      return {
        needsOnboarding: true,
        googleProfile: this.getGoogleProfile(decoded),
      };
    }

    this.validateGoogleCompletion(googleAuthDto);

    const googleProfile = this.getGoogleProfile(decoded);
    const firstName =
      googleAuthDto.firstName?.trim() || googleProfile.firstName;
    const lastName =
      googleAuthDto.lastName?.trim() || googleProfile.lastName || 'User';
    const passwordHash = await argon2.hash(
      crypto.randomBytes(48).toString('hex'),
    );

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firebaseUid: decoded.uid,
        authProvider: 'GOOGLE',
        role: googleAuthDto.role,
        isVerified: true,
        profile: {
          create: {
            firstName,
            lastName,
            phone: googleAuthDto.phone || null,
            address: googleAuthDto.address || null,
            bio: googleAuthDto.bio || null,
            dateOfBirth: googleAuthDto.dateOfBirth
              ? new Date(googleAuthDto.dateOfBirth)
              : null,
            avatarUrl: googleProfile.avatarUrl,
          },
        },
        ...(googleAuthDto.role === 'CUSTOMER' && {
          customerProfile: {
            create: {
              careType: googleAuthDto.careType || null,
              careFrequency: googleAuthDto.careFrequency || null,
              specialRequirements: googleAuthDto.specialRequirements || null,
              preferredSchedule: googleAuthDto.preferredSchedule || null,
            },
          },
        }),
        ...(googleAuthDto.role === 'CAREGIVER' && {
          caregiverProfile: {
            create: {
              hourlyRate: googleAuthDto.hourlyRate || 0,
              experienceYears: googleAuthDto.experienceYears || 0,
              certifications: googleAuthDto.certifications || [],
              specialties: googleAuthDto.specialties || [],
              agreedToBackgroundCheck:
                googleAuthDto.agreeToBackgroundCheck || false,
              bio: googleAuthDto.bio || null,
            },
          },
        }),
      },
      include: { profile: true },
    });

    const tokens = await this.getTokens(user.id, user.email, user.role);
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
      },
      ...tokens,
      message: 'Google account connected successfully.',
    };
  }

  private getGoogleProfile(decoded: { name?: string; picture?: string }) {
    const [firstName = '', ...lastNameParts] = (decoded.name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return {
      firstName,
      lastName: lastNameParts.join(' '),
      avatarUrl: decoded.picture || null,
    };
  }

  private validateGoogleCompletion(dto: GoogleAuthDto) {
    if (!dto.firstName?.trim()) {
      throw new BadRequestException('First name is required');
    }
    if (!dto.lastName?.trim()) {
      throw new BadRequestException('Last name is required');
    }
    if (!dto.phone?.trim()) {
      throw new BadRequestException('Phone number is required');
    }

    if (dto.role === 'CUSTOMER') {
      if (!dto.careType) {
        throw new BadRequestException('Care type is required');
      }
      if (!dto.careFrequency) {
        throw new BadRequestException('Care frequency is required');
      }
    }

    if (dto.role === 'CAREGIVER') {
      if (!dto.specialties?.length) {
        throw new BadRequestException('At least one specialty is required');
      }
      if (dto.experienceYears === undefined || dto.experienceYears < 0) {
        throw new BadRequestException('Valid years of experience are required');
      }
      if (dto.hourlyRate === undefined || dto.hourlyRate <= 0) {
        throw new BadRequestException('Valid hourly rate is required');
      }
      if (!dto.agreeToBackgroundCheck) {
        throw new BadRequestException('Background check consent is required');
      }
    }
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

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('Account has been suspended');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      avatarUrl: user.profile?.avatarUrl || null,
      isVerified: user.isVerified,
    };
  }
}

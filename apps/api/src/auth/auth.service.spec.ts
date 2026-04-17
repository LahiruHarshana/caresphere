import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';

const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        role: 'CUSTOMER',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        id: 'user-1',
        email: registerDto.email,
        role: registerDto.role,
      });
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(registerDto.email);
      expect(mockUsersService.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: '1' });
      const registerDto = { email: 'test@example.com', password: '123', role: 'CUSTOMER', firstName: 'A', lastName: 'B' };

      await expect(service.register(registerDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should login correctly with valid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const passwordHash = await argon2.hash(loginDto.password);

      mockUsersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: loginDto.email,
        passwordHash,
        role: 'CUSTOMER',
      });
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('mock-token');
      expect(result.user.id).toBe('user-1');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
        mockUsersService.findByEmail.mockResolvedValue({
          id: 'user-1',
          email: 'test@example.com',
          passwordHash: await argon2.hash('correct-password'),
          role: 'CUSTOMER',
        });
  
        const loginDto = { email: 'test@example.com', password: 'wrong-password' };
  
        await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      });
  });
});

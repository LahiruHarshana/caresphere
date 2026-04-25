import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: PrismaService;

  const mockPrisma = {
    booking: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    caregiverProfile: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should reject booking with overlapping schedule', async () => {
      // Mock existing booking in the same time range
      mockPrisma.booking.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.createBooking('customer-1', {
          caregiverId: 'caregiver-1',
          serviceType: 'Elderly Care',
          scheduledAt: new Date('2024-03-01T09:00:00'),
          endAt: new Date('2024-03-01T11:00:00'),
        }),
      ).rejects.toThrow('Caregiver is not available');
    });

    it('should create booking and calculate cost', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(null); // No overlap
      mockPrisma.caregiverProfile.findUnique.mockResolvedValue({
        hourlyRate: 25,
      });
      mockPrisma.booking.create.mockResolvedValue({
        id: 'booking-1',
        totalCost: 50, // 2 hours × $25
        status: 'PENDING',
      });

      const result = await service.createBooking('customer-1', {
        caregiverId: 'caregiver-1',
        serviceType: 'Elderly Care',
        scheduledAt: new Date('2024-03-01T09:00:00'),
        endAt: new Date('2024-03-01T11:00:00'),
      });

      expect(result.totalCost).toBe(50);
    });
  });
});

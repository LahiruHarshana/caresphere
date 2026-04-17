import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from './matching.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  user: {
    findMany: jest.fn(),
  },
};

describe('MatchingService', () => {
  let service: MatchingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findMatches', () => {
    it('should calculate weighted scores correctly and sort results', async () => {
      const mockCaregivers = [
        {
          id: '1',
          email: 'caregiver1@example.com',
          role: 'CAREGIVER',
          profile: { lat: 40.7128, lng: -74.006, languages: ['English'] },
          caregiverProfile: { specialties: ['Elderly Care'], isAvailable: true, verificationStatus: 'APPROVED' },
          reviewsReceived: [{ rating: 5 }, { rating: 5 }],
        },
        {
          id: '2',
          email: 'caregiver2@example.com',
          role: 'CAREGIVER',
          profile: { lat: 40.75, lng: -73.98, languages: ['English', 'Spanish'] },
          caregiverProfile: { specialties: ['Elderly Care', 'Dementia Care'], isAvailable: true, verificationStatus: 'APPROVED' },
          reviewsReceived: [{ rating: 4 }],
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockCaregivers);

      const dto = {
        lat: 40.7128,
        lng: -74.006,
        skills: ['Elderly Care', 'Dementia Care'],
        languages: ['English', 'Spanish'],
        maxDistanceKm: 100,
      };

      const result = await service.findMatches(dto);

      expect(result).toHaveLength(2);
      
      // Caregiver 2 should be first because they match more skills and languages
      // even though they are slightly further away and have lower rating.
      // Caregiver 1: 0km (30pts), 1/2 skills (20pts), 1/2 langs (5pts), 5 rating (20pts) = 75
      // Caregiver 2: ~4km (distScore ~27), 2/2 skills (40pts), 2/2 langs (10pts), 4 rating (16pts) = ~93
      
      expect(result[0].caregiver.id).toBe('2');
      expect(result[0].matchBreakdown.totalScore).toBeGreaterThan(result[1].matchBreakdown.totalScore);
    });

    it('should filter caregivers by maxDistanceKm', async () => {
        const mockCaregivers = [
          {
            id: '1',
            email: 'close@example.com',
            role: 'CAREGIVER',
            profile: { lat: 40.7128, lng: -74.006, languages: ['English'] },
            caregiverProfile: { specialties: ['Elderly Care'], isAvailable: true, verificationStatus: 'APPROVED' },
            reviewsReceived: [],
          },
          {
            id: '2',
            email: 'far@example.com',
            role: 'CAREGIVER',
            profile: { lat: 34.0522, lng: -118.2437, languages: ['English'] }, // LA
            caregiverProfile: { specialties: ['Elderly Care'], isAvailable: true, verificationStatus: 'APPROVED' },
            reviewsReceived: [],
          },
        ];
  
        mockPrismaService.user.findMany.mockResolvedValue(mockCaregivers);
  
        const dto = {
          lat: 40.7128, // NYC
          lng: -74.006,
          skills: ['Elderly Care'],
          languages: ['English'],
          maxDistanceKm: 50,
        };
  
        const result = await service.findMatches(dto);
  
        expect(result).toHaveLength(1);
        expect(result[0].caregiver.id).toBe('1');
      });
  });
});

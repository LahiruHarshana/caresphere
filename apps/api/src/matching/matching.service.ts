import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindMatchesDto } from './dto/find-matches.dto';

export interface MatchBreakdown {
  skillsScore: number;
  distanceScore: number;
  ratingScore: number;
  languageScore: number;
  totalScore: number;
  distanceKm?: number;
}

@Injectable()
export class MatchingService {
  constructor(private prisma: PrismaService) {}

  // Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async findMatches(dto: FindMatchesDto) {
    const { lat, lng, skills, languages, maxDistanceKm, serviceType } = dto;

    // Fetch all available caregivers with APPROVED status
    const caregivers = await this.prisma.user.findMany({
      where: {
        role: 'CAREGIVER',
        caregiverProfile: {
          isAvailable: true,
          verificationStatus: 'APPROVED',
        },
      },
      include: {
        profile: true,
        caregiverProfile: true,
        reviewsReceived: true,
      },
    });

    const matches = [];

    for (const caregiver of caregivers) {
      let distanceKm: number | undefined = undefined;
      
      // 1. Distance Calculation (30% weight)
      let distanceScore = 0;
      if (lat !== undefined && lng !== undefined && caregiver.profile?.lat !== null && caregiver.profile?.lng !== null) {
        distanceKm = this.calculateDistance(lat, lng, caregiver.profile!.lat!, caregiver.profile!.lng!);
        
        // Filter out if beyond max distance
        if (maxDistanceKm && distanceKm > maxDistanceKm) {
          continue;
        }

        // Distance scoring: 0km = 100%, 50km = 0% (example scaling)
        // Adjust scale as needed, using a max meaningful distance of 50km for scoring
        const maxScoreDistance = 50; 
        const normalizedDistance = Math.max(0, 1 - (distanceKm / maxScoreDistance));
        distanceScore = normalizedDistance * 30; // 30% max weight
      } else if (lat === undefined && lng === undefined) {
        distanceScore = 15; // default half score if no location provided
      }

      // Filter by serviceType if strictly needed
      if (serviceType && caregiver.caregiverProfile?.specialties) {
        if (!caregiver.caregiverProfile.specialties.includes(serviceType)) {
          // If we want it to be a strict filter instead of just a skill:
          // continue; 
        }
      }

      // 2. Skills Calculation (40% weight)
      let skillsScore = 0;
      if (skills && skills.length > 0) {
        const caregiverSkills = caregiver.caregiverProfile?.specialties || [];
        const matchedSkills = skills.filter(skill => caregiverSkills.includes(skill));
        const matchRatio = matchedSkills.length / skills.length;
        skillsScore = matchRatio * 40; // 40% max weight
      } else {
        skillsScore = 20; // default half score
      }

      // 3. Language Calculation (10% weight)
      let languageScore = 0;
      if (languages && languages.length > 0) {
        const caregiverLangs = caregiver.profile?.languages || [];
        const matchedLangs = languages.filter(lang => caregiverLangs.includes(lang));
        const matchRatio = matchedLangs.length / languages.length;
        languageScore = matchRatio * 10; // 10% max weight
      } else {
        languageScore = 5; // default half score
      }

      // 4. Rating Calculation (20% weight)
      let ratingScore = 0;
      const reviews = caregiver.reviewsReceived;
      if (reviews && reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        // Rating is out of 5
        const normalizedRating = avgRating / 5;
        ratingScore = normalizedRating * 20; // 20% max weight
      } else {
        // New caregivers default to some baseline or 0
        ratingScore = 10; // Default equivalent to 2.5 stars
      }

      const totalScore = distanceScore + skillsScore + languageScore + ratingScore;

      const matchBreakdown: MatchBreakdown = {
        distanceScore: Number(distanceScore.toFixed(2)),
        skillsScore: Number(skillsScore.toFixed(2)),
        languageScore: Number(languageScore.toFixed(2)),
        ratingScore: Number(ratingScore.toFixed(2)),
        totalScore: Number(totalScore.toFixed(2)),
        distanceKm: distanceKm !== undefined ? Number(distanceKm.toFixed(2)) : undefined,
      };

      // Ensure we don't leak password hash
      const { passwordHash, ...userWithoutPassword } = caregiver;

      matches.push({
        caregiver: userWithoutPassword,
        matchBreakdown,
      });
    }

    // Sort by total score descending
    matches.sort((a, b) => b.matchBreakdown.totalScore - a.matchBreakdown.totalScore);

    // Return top 10
    return matches.slice(0, 10);
  }
}

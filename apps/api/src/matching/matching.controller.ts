import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { FindMatchesDto } from './dto/find-matches.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('matching')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('caregivers')
  @Roles(Role.CUSTOMER, Role.ADMIN)
  async findMatches(@Query() query: FindMatchesDto) {
    // Ensuring query params are parsed properly if not handled by global validation pipes.
    // Transform arrays if they come as single strings
    let skills = query.skills;
    if (typeof skills === 'string') {
      skills = [skills];
    }
    let languages = query.languages;
    if (typeof languages === 'string') {
      languages = [languages];
    }
    
    const dto = {
      ...query,
      skills,
      languages,
      lat: query.lat ? Number(query.lat) : undefined,
      lng: query.lng ? Number(query.lng) : undefined,
      maxDistanceKm: query.maxDistanceKm ? Number(query.maxDistanceKm) : undefined,
    };
    
    return this.matchingService.findMatches(dto);
  }
}

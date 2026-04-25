import { Module } from '@nestjs/common';
import { VideoGateway } from './video.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [VideoGateway],
})
export class VideoModule {}

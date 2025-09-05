import { Module } from '@nestjs/common';
import { FestivalsController } from './conference.controller';
import { FestivalsService } from './conference.service';

@Module({
  controllers: [FestivalsController],
  providers: [FestivalsService]
})
export class FestivalsModule {}

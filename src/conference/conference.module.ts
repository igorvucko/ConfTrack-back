import { Module } from '@nestjs/common';
import { ConferencesController } from './conference.controller';
import { ConferencesService } from './conference.service';

@Module({
  controllers: [ConferencesController],
  providers: [ConferencesService]
})
export class ConferencesModule {}

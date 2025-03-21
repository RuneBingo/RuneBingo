import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { entities } from '..';
import { SeedingService } from './seeding.service';

@Module({
  imports: [TypeOrmModule.forFeature([...entities])],
  providers: [SeedingService],
  exports: [SeedingService],
})
export class SeedingModule {}

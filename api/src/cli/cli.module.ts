import { Module } from '@nestjs/common';
import { CommandRunnerModule } from 'nest-commander';

import { dbModule } from '@/db';
import { SeedingModule } from '@/db/seeding/seeding.module';

import { GenerateTypesCommand } from './generate-types.cli';
import { SeedCommand } from './seed.cli';
import { configModule } from '../config';

@Module({
  imports: [CommandRunnerModule, configModule, dbModule, SeedingModule],
  providers: [GenerateTypesCommand, SeedCommand],
})
export class CliModule {}

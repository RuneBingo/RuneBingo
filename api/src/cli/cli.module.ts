import { Module } from '@nestjs/common';
import { CommandRunnerModule } from 'nest-commander';

import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingModule } from '@/db/seeding/seeding.module';
import { bullModule } from '@/jobs/bull';
import { JobsModule } from '@/jobs/jobs.module';

import { GenerateTypesCommand } from './generate-types.cli';
import { RunJobCommand } from './run-job.cli';
import { SeedCommand } from './seed.cli';

@Module({
  imports: [CommandRunnerModule, configModule, bullModule, dbModule, SeedingModule, JobsModule],
  providers: [GenerateTypesCommand, SeedCommand, RunJobCommand],
})
export class CliModule {}

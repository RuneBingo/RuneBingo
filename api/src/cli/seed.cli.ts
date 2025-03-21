import { Injectable } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';

import { SeedingService } from '@/db/seeding/seeding.service';

@Injectable()
@Command({ name: 'seed', description: 'Runs the database seeding process' })
export class SeedCommand extends CommandRunner {
  constructor(private readonly seedingService: SeedingService) {
    super();
  }

  async run() {
    console.log('🌱 Running database seeding...');
    await this.seedingService.initialize();
    console.log('✅ Seeding completed!');
  }
}

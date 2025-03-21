import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import type { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';

import { entities } from '..';
import { Seeder } from './seeder';
import { UserSeeder } from './user.seeder';
import { AppConfig } from '../../config';

@Injectable()
export class SeedingService {
  private readonly logger = new Logger(SeedingService.name);

  private readonly seedingEntityOrder = [
    // Strong entities
    UserSeeder,
    // Weak entities
    // Add more seeders here
  ];

  private readonly seederTypeMap = new Map<string, EntityTarget<ObjectLiteral>>(entities.map((e) => [e.name, e]));

  private readonly seederMap = new Map<EntityTarget<ObjectLiteral>, Seeder<ObjectLiteral, unknown>>();

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  public async initialize() {
    for (const seeder of this.seedingEntityOrder) {
      const instance = new seeder(this.configService, this.dataSource);
      await instance.seed();

      if (!this.seederTypeMap.has(instance.entityName)) {
        this.logger.error(
          `Seeder for entity ${instance.entityName} not found in 'seederTypeMap' but was present in 'seedingEntityOrder'.`,
        );
      }

      this.seederMap.set(this.seederTypeMap.get(instance.entityName)!, instance);
    }
  }

  public async clear() {
    const env = this.configService.getOrThrow('NODE_ENV', { infer: true });
    if (env !== 'development' && env !== 'test') {
      throw new Error('Clearing the database is only allowed in development or test environments');
    }

    await this.dataSource.destroy();
    this.seederMap.clear();
  }

  public getEntity<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>, key: string): Entity | null {
    const seeder = this.seederMap.get(entity);
    if (!seeder) return null;

    return seeder.getEntity(key) as Entity;
  }
}

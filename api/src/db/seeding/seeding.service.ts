import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import type { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';

import { entities } from '..';
import { Seeder } from './seeder';
import { SessionSeeder } from './session.seeder';
import { UserSeeder } from './user.seeder';
import { AppConfig } from '../../config';

@Injectable()
export class SeedingService {
  private shouldInitializeDataSource = false;
  private readonly logger = new Logger(SeedingService.name);

  private readonly seedingEntityOrder = [
    // Strong entities
    UserSeeder,
    SessionSeeder,
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
    if (this.shouldInitializeDataSource) {
      await this.dataSource.initialize();
      this.shouldInitializeDataSource = false;
    }

    for (const seeder of this.seedingEntityOrder) {
      const instance = new seeder(this.configService, this.dataSource, this);
      await instance.seed();

      if (!this.seederTypeMap.has(instance.entityName)) {
        this.logger.error(
          `Seeder for entity ${instance.entityName} not found in 'seederTypeMap' but was present in 'seedingEntityOrder'.`,
        );
      }

      const entityType = this.seederTypeMap.get(instance.entityName)!;
      this.seederMap.set(entityType, instance as Seeder<ObjectLiteral, unknown>);
    }
  }

  public async clear() {
    const env = this.configService.getOrThrow('NODE_ENV', { infer: true });
    if (env !== 'development' && env !== 'test') {
      throw new Error('Clearing the database is only allowed in development or test environments');
    }

    await this.dataSource.destroy();
    this.seederMap.clear();
    this.shouldInitializeDataSource = true;
  }

  public getEntity<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>, key: string): Entity {
    const seeder = this.seederMap.get(entity);
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-base-to-string
    if (!seeder) throw new Error(`Seeder for entity ${entity} not found`);

    const result = seeder.getEntity(key) as Entity | null;
    if (!result) throw new Error(`Entity with key ${key} not found`);

    return result;
  }
}

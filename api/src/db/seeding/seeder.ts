import { access, constants, readFile } from 'fs/promises';
import { join } from 'path';

import { Logger } from '@nestjs/common';
import { type ConfigService } from '@nestjs/config';
import type Joi from 'joi';
import { type ObjectLiteral, type DataSource, type FindOptionsWhere } from 'typeorm';
import YAML from 'yaml';

import { type SeedingService } from './seeding.service';
import { type AppConfig } from '../../config';

type IdentifierRecord<Entity extends ObjectLiteral> = Partial<Record<keyof Entity, Entity[keyof Entity]>>;

export abstract class Seeder<Entity extends ObjectLiteral, Schema> {
  public abstract readonly entityName: string;

  protected abstract readonly schema: Joi.Schema<Record<string, Schema>>;
  protected abstract readonly identifierColumns: (keyof Entity)[];

  protected readonly entityMapping = new Map<string, Entity>();
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly configService: ConfigService<AppConfig>,
    protected readonly db: DataSource,
    protected readonly seedingService: SeedingService,
  ) {}

  public async seed() {
    const seeds = await this.getSeedData();
    if (!seeds) {
      return;
    }

    const identifierToKeyMap = new Map<string, string>();
    const repository = this.db.getRepository<Entity>(this.entityName);

    const seedEntities = await Promise.all(
      Object.entries(seeds).map(async ([key, seed]) => {
        const entity = await this.deserialize(seed);
        const identifier = await this.getIdentifier(entity);

        identifierToKeyMap.set(JSON.stringify(identifier), key);
        return entity;
      }),
    );

    if (seedEntities.length === 0) return;

    await repository.upsert(seedEntities, this.identifierColumns as string[]);

    const identifiers = (await Promise.all(
      seedEntities.map((e) => this.getIdentifier(e)),
    )) as IdentifierRecord<Entity>[];

    const where: FindOptionsWhere<Entity>[] = identifiers.map((identifier) => {
      const clause: Partial<Entity> = {};
      this.identifierColumns.forEach((column) => {
        clause[column] = identifier[column];
      });

      return clause;
    });

    const savedEntities = await repository.find({
      where,
      withDeleted: true,
    });

    for (const entity of savedEntities) {
      const identifier = await this.getIdentifier(entity);
      const key = identifierToKeyMap.get(JSON.stringify(identifier));
      if (!key) continue;

      this.entityMapping.set(key, entity);
    }
  }

  public getEntity(key: string): Entity | null {
    return this.entityMapping.get(key) || null;
  }

  protected abstract deserialize(seed: Schema): Entity | Promise<Entity>;

  protected abstract getIdentifier(entity: Entity): Promise<IdentifierRecord<Entity>> | IdentifierRecord<Entity>;

  private async getSeedData(): Promise<Record<string, Schema> | undefined> {
    try {
      await access(this.seedPath, constants.R_OK);

      const seedFileContents = await readFile(this.seedPath, 'utf-8');
      const seedFileData = YAML.parse(seedFileContents) as Record<string, Schema>;
      return this.schema.validateAsync(seedFileData);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
        return {};
      }

      this.logger.error(e);
      return undefined;
    }
  }

  private get seedPath() {
    const env = this.configService.get('NODE_ENV', { infer: true });
    const envDir = env ?? 'production';

    // Convert the seeder class name to kebab-case
    const seederName = this.constructor.name
      .replace('Seeder', '')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .toLowerCase();

    return join(__dirname, `./${envDir}/${seederName}.yml`);
  }
}

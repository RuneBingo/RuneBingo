import { readFile } from 'fs/promises';
import { join } from 'path';

import { Logger } from '@nestjs/common';
import { type ConfigService } from '@nestjs/config';
import type Joi from 'joi';
import { type ObjectLiteral, type DataSource, In, type FindOptionsWhere } from 'typeorm';
import YAML from 'yaml';

import { type AppConfig } from '../../config';

export abstract class Seeder<Entity extends ObjectLiteral, Schema, Identifier = string> {
  public abstract readonly entityName: string;

  protected abstract readonly schema: Joi.Schema<Record<string, Schema>>;
  protected abstract readonly identifierColumn: keyof Entity;
  protected readonly entityMapping = new Map<string, Entity>();
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly configService: ConfigService<AppConfig>,
    protected readonly db: DataSource,
  ) {}

  public async seed() {
    const seeds = await this.getSeedData();
    if (!seeds) {
      return;
    }

    const identifierToKeyMap = new Map<Identifier, string>();
    const repository = this.db.getRepository<Entity>(this.entityName);

    const seedEntities = await Promise.all(
      Object.entries(seeds).map(async ([key, seed]) => {
        const entity = await this.deserialize(seed);
        const identifier = await this.getIdentifier(entity);

        identifierToKeyMap.set(identifier, key);
        return entity;
      }),
    );

    if (seedEntities.length === 0) return;

    await repository.upsert(seedEntities, [this.identifierColumn as string]);

    const identifiers = await Promise.all(seedEntities.map((e) => this.getIdentifier(e)));
    const savedEntities = await repository.find({
      where: { [this.identifierColumn]: In(identifiers) } as FindOptionsWhere<Entity>,
    });

    for (const entity of savedEntities) {
      const identifier = await this.getIdentifier(entity);
      if (!identifierToKeyMap.has(identifier)) continue;

      this.entityMapping.set(identifierToKeyMap.get(identifier)!, entity);
    }
  }

  public getEntity(key: string): Entity | null {
    return this.entityMapping.get(key) || null;
  }

  protected abstract deserialize(seed: Schema): Entity | Promise<Entity>;

  protected abstract getIdentifier(entity: Entity): Identifier | Promise<Identifier>;

  private async getSeedData(): Promise<Record<string, Schema> | undefined> {
    try {
      const seedFileContents = await readFile(this.seedPath, 'utf-8');
      const seedFileData = YAML.parse(seedFileContents) as Record<string, Schema>;
      return this.schema.validateAsync(seedFileData);
    } catch (e) {
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

import { WorkerHost, Processor } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line import/named -- I don't know why it's complaining here...
import { DataSource, In, LessThan, Not, QueryRunner } from 'typeorm';

import type { Job } from '@/jobs/job';
import { CloudinaryService } from '@/media/cloudinary.service';
import { Media } from '@/media/media.entity';

export type MediaCleanupParams = object;

type TableWithMediaId = {
  table_schema: string;
  table_name: string;
  column_name: string;
  referenced_table: string;
  referenced_column: string;
};

export class MediaCleanupJob implements Job<MediaCleanupParams> {
  public readonly queue = 'media-cleanup';
}

@Injectable()
@Processor('media-cleanup')
export class MediaCleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(MediaCleanupProcessor.name);

  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async process(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      const referencedIds = await this.findReferencedMediaIds(queryRunner);
      const deletedCount = await this.deleteUnreferencedMedia(referencedIds);

      this.logger.log(`Deleted ${deletedCount} unreferenced media files`);
    } catch (error) {
      this.logger.error(error);
    } finally {
      await queryRunner.release();
    }
  }

  private async findReferencedMediaIds(queryRunner: QueryRunner): Promise<number[]> {
    const referencedIds = new Set<number>();

    // Find all foreign keys that point to the media table's id column
    const tablesWithMediaId = (await queryRunner.query(`
      SELECT
        tc.table_schema,
        tc.table_name,
        kcu.column_name
      FROM
        information_schema.table_constraints AS tc
      JOIN
        information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.constraint_schema = kcu.constraint_schema
      JOIN
        information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.constraint_schema = tc.constraint_schema
      WHERE
        tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'media'
        AND ccu.column_name = 'id';
      `)) as TableWithMediaId[];

    // Find all media ids that are referenced by the foreign keys
    for (const { table_schema, table_name, column_name } of tablesWithMediaId) {
      const batchSize = 1000;
      const offset = 0;

      while (true) {
        const rows = (await queryRunner.query(`
          SELECT DISTINCT ${column_name} FROM ${table_schema}.${table_name} 
          WHERE "${column_name}" IS NOT NULL
          LIMIT ${batchSize} OFFSET ${offset};
        `)) as { [key: string]: number }[];

        for (const row of rows) referencedIds.add(row[column_name]);

        if (rows.length < batchSize) break;
      }
    }

    return Array.from(referencedIds);
  }

  private async deleteUnreferencedMedia(referencedIds: number[]): Promise<number> {
    const mediaRepository = this.dataSource.getRepository(Media);

    const yesterday = new Date(Date.now() - (1).dayMs);
    const batchSize = 1000;
    const offset = 0;
    let deletedCount = 0;

    while (true) {
      const medias = await mediaRepository.find({
        where: { id: Not(In(referencedIds)), createdAt: LessThan(yesterday) },
        skip: offset,
        take: batchSize,
      });

      if (medias.length === 0) break;

      const ids = medias.map((media) => media.id);
      const publicIds = medias.map((media) => media.publicId);

      await this.cloudinaryService.deleteMany(publicIds);
      await mediaRepository.delete(ids);

      deletedCount += medias.length;

      if (medias.length < batchSize) break;
    }

    return deletedCount;
  }
}

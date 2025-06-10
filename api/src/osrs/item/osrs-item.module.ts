import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OsrsItem } from '@/osrs/item/osrs-item.entity';

import { OsrsItemController } from './osrs-item.controller';
import { SearchOsrsItemsHandler } from './queries/search-osrs-items.query';
import { SyncOsrsItemsProcessor } from './sync-osrs-items.job';
@Module({
  imports: [TypeOrmModule.forFeature([OsrsItem])],
  providers: [
    // Jobs
    SyncOsrsItemsProcessor,
    // Queries
    SearchOsrsItemsHandler,
  ],
  exports: [SyncOsrsItemsProcessor],
  controllers: [OsrsItemController],
})
export class OsrsItemModule {}

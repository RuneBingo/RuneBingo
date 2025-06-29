import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Media } from '@/media/media.entity';
import { OsrsItem } from '@/osrs/item/osrs-item.entity';

import { BingoTileItem } from './bingo-tile-item';
import { BingoTileController } from './bingo-tile.controller';
import { BingoTile } from './bingo-tile.entity';
import { Bingo } from '../bingo.entity';
import { CreateOrEditBingoTileCommandHandler } from './commands/create-or-edit-bingo-tile.command';
import { DeleteBingoTileCommandHandler } from './commands/delete-bingo-tile.command';
import { MoveBingoTileCommandHandler } from './commands/move-bingo-tile.command';
import { FindBingoTilesByCoordinatesHandler } from './queries/find-bingo-tile-by-coordinates.query';
import { ListBingoTilesHandler } from './queries/list-bingo-tiles.query';
import { BingoParticipant } from '../participant/bingo-participant.entity';
import { BingoTileDeletedHandler } from './events/bingo-tile-deleted.event';
import { BingoTileMovedHandler } from './events/bingo-tile-moved.event';
import { BingoTileSetHandler } from './events/bingo-tile-set.event';

@Module({
  imports: [TypeOrmModule.forFeature([Bingo, BingoParticipant, BingoTile, BingoTileItem, Media, OsrsItem])],
  controllers: [BingoTileController],
  providers: [
    // Commands
    CreateOrEditBingoTileCommandHandler,
    DeleteBingoTileCommandHandler,
    MoveBingoTileCommandHandler,
    // Events
    BingoTileDeletedHandler,
    BingoTileSetHandler,
    BingoTileMovedHandler,
    // Queries
    FindBingoTilesByCoordinatesHandler,
    ListBingoTilesHandler,
  ],
})
export class BingoTileModule {}

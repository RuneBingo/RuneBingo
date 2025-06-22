import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { BaseEntity } from '@/db/base.entity';
import { OsrsItemDto } from '@/osrs/item/dto/osrs-item.dto';
import { OsrsItem } from '@/osrs/item/osrs-item.entity';
import { User } from '@/user/user.entity';

import { BingoTile } from './bingo-tile.entity';
import { BingoTileItemDto } from './dto/bingo-tile-item.dto';

@Entity()
export class BingoTileItem extends BaseEntity {
  @PrimaryColumn({ name: 'bingo_tile_id', type: 'int' })
  @JoinColumn({ name: 'bingo_tile_id' })
  bingoTileId: number;

  @PrimaryColumn({ name: 'osrs_item_id', type: 'int' })
  @JoinColumn({ name: 'osrs_item_id' })
  osrsItemId: number;

  @PrimaryColumn({ name: 'index', type: 'int' })
  index: number;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @ManyToOne(() => BingoTile, (bingoTile) => bingoTile.items)
  @JoinColumn({ name: 'bingo_tile_id' })
  bingoTile: Promise<BingoTile>;

  @ManyToOne(() => OsrsItem)
  @JoinColumn({ name: 'osrs_item_id' })
  osrsItem: Promise<OsrsItem>;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: Promise<User | null>;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: Promise<User | null>;

  static async fromBingoTileItem(bingoTileItem: BingoTileItem): Promise<BingoTileItemDto> {
    const item = await bingoTileItem.osrsItem;

    const dto = new BingoTileItemDto();
    dto.item = OsrsItemDto.fromOsrsItem(item);
    dto.quantity = bingoTileItem.quantity;

    return dto;
  }
}

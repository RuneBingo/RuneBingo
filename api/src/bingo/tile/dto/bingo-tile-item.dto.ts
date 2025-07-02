import { ApiProperty } from '@nestjs/swagger';

import { OsrsItemDto } from '@/osrs/item/dto/osrs-item.dto';

import { BingoTileItem } from '../bingo-tile-item';

export class BingoTileItemDto {
  @ApiProperty({ type: 'number' })
  index: number;

  @ApiProperty({ type: 'number' })
  quantity: number;

  @ApiProperty({ type: OsrsItemDto })
  item: OsrsItemDto;

  static async fromBingoTileItem(bingoTileItem: BingoTileItem): Promise<BingoTileItemDto> {
    const item = await bingoTileItem.osrsItem;

    const dto = new BingoTileItemDto();
    dto.index = bingoTileItem.index;
    dto.quantity = bingoTileItem.quantity;
    dto.item = OsrsItemDto.fromOsrsItem(item);

    return dto;
  }
}

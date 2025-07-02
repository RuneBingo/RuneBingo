import { ApiProperty } from '@nestjs/swagger';

import { MediaDto } from '@/media/dto/media.dto';

import { BingoTileCompletionMode } from '../bingo-tile-completion-mode.enum';
import { BingoTileItemDto } from './bingo-tile-item.dto';
import { BingoTile } from '../bingo-tile.entity';

export class DetailedBingoTileDto {
  @ApiProperty()
  x: number;

  @ApiProperty()
  y: number;

  @ApiProperty()
  value: number;

  @ApiProperty()
  free: boolean;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: BingoTileCompletionMode })
  completionMode: BingoTileCompletionMode;

  @ApiProperty({ type: MediaDto, nullable: true })
  media: MediaDto | null;

  @ApiProperty()
  imageUrl: string | null;

  @ApiProperty({ type: [BingoTileItemDto] })
  items: BingoTileItemDto[];

  static async fromBingoTile(bingoTile: BingoTile): Promise<DetailedBingoTileDto> {
    const media = await bingoTile.media;
    const items = await bingoTile.items;
    const itemDtos = await Promise.all(
      items?.map(async (item) => await BingoTileItemDto.fromBingoTileItem(item)) ?? [],
    );

    const dto = new DetailedBingoTileDto();
    dto.x = bingoTile.x;
    dto.y = bingoTile.y;
    dto.value = bingoTile.value;
    dto.free = bingoTile.free;
    dto.title = bingoTile.title;
    dto.description = bingoTile.description;
    dto.completionMode = bingoTile.completionMode;
    dto.media = media ? await MediaDto.fromMedia(media) : null;
    dto.imageUrl = bingoTile.imageUrl;
    dto.items = itemDtos;

    return dto;
  }
}

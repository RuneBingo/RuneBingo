import { ApiProperty } from '@nestjs/swagger';

import { MediaDto } from '@/media/dto/media.dto';

import { BingoTile } from '../bingo-tile.entity';

export class BingoTileDto {
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

  @ApiProperty({ type: MediaDto, nullable: true })
  media: MediaDto | null;

  @ApiProperty()
  imageUrl: string | null;

  static async fromBingoTile(bingoTile: BingoTile): Promise<BingoTileDto> {
    const media = await bingoTile.media;

    const dto = new BingoTileDto();
    dto.x = bingoTile.x;
    dto.y = bingoTile.y;
    dto.value = bingoTile.value;
    dto.free = bingoTile.free;
    dto.title = bingoTile.title;
    dto.description = bingoTile.description;
    dto.media = media ? await MediaDto.fromMedia(media) : null;
    dto.imageUrl = bingoTile.imageUrl;

    return dto;
  }
}

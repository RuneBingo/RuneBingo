import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

import { BingoTileCompletionMode } from '../bingo-tile-completion-mode.enum';

export class CreateOrEditBingoTileItemDto {
  @ApiProperty()
  @IsInt()
  itemId: number;

  @ApiProperty({ default: 1 })
  @IsInt()
  @Min(1)
  quantity: number = 1;
}

export class CreateOrEditBingoTileDto {
  @ApiProperty()
  @IsOptional()
  title?: string;

  @ApiProperty()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Min(0)
  value?: number;

  @ApiProperty()
  @IsOptional()
  free?: boolean;

  @ApiProperty({ enum: BingoTileCompletionMode })
  @IsOptional()
  completionMode?: BingoTileCompletionMode;

  @ApiProperty({ type: 'string', nullable: true })
  @IsOptional()
  mediaId?: string | null;

  @ApiProperty({ type: 'string', nullable: true })
  @IsOptional()
  imageUrl?: string | null;

  @ApiProperty({ type: [CreateOrEditBingoTileItemDto] })
  @IsOptional()
  items?: CreateOrEditBingoTileItemDto[];
}

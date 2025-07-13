import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class KickBingoParticipantDto {
  @ApiProperty({
    description: 'Whether to delete the tile completions of the participant.',
    required: false,
  })
  @Optional()
  @IsBoolean()
  deleteTileCompletions?: boolean;
}

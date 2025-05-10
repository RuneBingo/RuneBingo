import { ApiProperty } from '@nestjs/swagger';

export class UpdateBingoParticipantDto {
  @ApiProperty({ required: false })
  teamName?: string;
  @ApiProperty({ required: false })
  role?: string;
}

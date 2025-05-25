import { ApiProperty } from '@nestjs/swagger';

export class SetCurrentBingoDto {
  @ApiProperty()
  bingoId: string;
}

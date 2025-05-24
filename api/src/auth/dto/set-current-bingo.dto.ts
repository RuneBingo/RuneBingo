import { ApiProperty } from '@nestjs/swagger';

export class SetCurrentBingoDto {
  @ApiProperty()
  slug: string; // TODO: Replace with bingoId once #38 is merged
}

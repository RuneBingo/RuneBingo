import { ApiProperty } from '@nestjs/swagger';

import { PaginatedDtoWithoutTotal } from '@/db/dto/paginated.dto';

import { BingoDto } from './bingo.dto';

export class PaginatedBingosDto extends PaginatedDtoWithoutTotal<BingoDto> {
  @ApiProperty({ type: [BingoDto] })
  declare items: BingoDto[];
}

import { ApiProperty } from '@nestjs/swagger';

import { PaginatedDto } from '@/db/dto/paginated.dto';

import { OsrsItemDto } from './osrs-item.dto';

export class PaginatedOsrsItemsDto extends PaginatedDto<OsrsItemDto> {
  @ApiProperty({ type: [OsrsItemDto] })
  declare items: OsrsItemDto[];
}

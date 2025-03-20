import { ApiProperty } from '@nestjs/swagger';

import type { PaginatedResult, PaginatedResultWithoutTotal } from '../paginated-query.utils';

export class PaginatedDto<T extends object> {
  @ApiProperty({ type: [Object] })
  items: T[];

  @ApiProperty()
  limit: number;

  @ApiProperty()
  offset: number;

  @ApiProperty()
  total: number;

  constructor({ items, limit, offset, total }: PaginatedResult<T>) {
    this.items = items;
    this.limit = limit;
    this.offset = offset;
    this.total = total;
  }
}

export class PaginatedDtoWithoutTotal<T extends object> {
  @ApiProperty({ type: [Object] })
  items: T[];

  @ApiProperty()
  limit: number;

  @ApiProperty()
  offset: number;

  @ApiProperty()
  hasPreviousPage: boolean;

  @ApiProperty()
  hasNextPage: boolean;

  constructor({ items, limit, offset, hasPreviousPage, hasNextPage }: PaginatedResultWithoutTotal<T>) {
    this.items = items;
    this.limit = limit;
    this.offset = offset;
    this.hasPreviousPage = hasPreviousPage;
    this.hasNextPage = hasNextPage;
  }
}

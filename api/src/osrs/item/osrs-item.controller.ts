import { Controller, DefaultValuePipe, Get, ParseBoolPipe, ParseIntPipe, Query, Req } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { OsrsItemDto } from './dto/osrs-item.dto';
import { PaginatedOsrsItemsDto } from './dto/paginated-osrs-items.dto';
import { SearchOsrsItemsQuery } from './queries/search-osrs-items.query';

@Controller('v1/osrs/item')
export class OsrsItemController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Search for OSRS items' })
  @ApiOkResponse({
    description: 'A list of paginated OSRS items that match the search query.',
    type: PaginatedOsrsItemsDto,
  })
  @ApiQuery({ name: 'search', required: true, type: String, minLength: 3 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, minimum: 1, maximum: 100 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0, minimum: 0 })
  @ApiQuery({ name: 'enabled', required: false, type: Boolean, example: true })
  async searchItems(
    @Query('search') search: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('enabled', new ParseBoolPipe({ optional: true })) enabled: boolean | undefined,
    @Req() req: Request,
  ) {
    const requester = req.userEntity;
    const { items, ...pagination } = await this.queryBus.execute(
      new SearchOsrsItemsQuery({ requester, search, limit, offset, enabled }),
    );

    const itemDtos = items.map((item) => OsrsItemDto.fromOsrsItem(item));

    return new PaginatedOsrsItemsDto({ items: itemDtos, ...pagination });
  }
}

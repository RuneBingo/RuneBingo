import { ApiProperty } from '@nestjs/swagger';

import { PaginatedDtoWithoutTotal } from '@/db/dto/paginated.dto';

import { ActivityDto } from './activity.dto';

export class PaginatedActivitiesDto extends PaginatedDtoWithoutTotal<ActivityDto> {
  @ApiProperty({ type: [ActivityDto] })
  declare items: ActivityDto[];
}

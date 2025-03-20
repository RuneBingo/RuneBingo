import { ApiProperty } from '@nestjs/swagger';

import { ActivityDto } from '@/activity/dto/activity.dto';
import { PaginatedDtoWithoutTotal } from '@/db/dto/paginated.dto';

import { UserDto } from './user.dto';

export class UserActivityDto extends ActivityDto<UserDto> {
  @ApiProperty({ type: UserDto })
  declare trackable: UserDto;
}

export class PaginatedUserActivitiesDto extends PaginatedDtoWithoutTotal<UserActivityDto> {
  @ApiProperty({ type: [UserActivityDto] })
  declare items: UserActivityDto[];
}

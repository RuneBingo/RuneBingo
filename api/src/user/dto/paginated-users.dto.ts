import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from './user.dto';
import { PaginatedDtoWithoutTotal } from '../../db/dto/paginated.dto';

export class PaginatedUsersDto extends PaginatedDtoWithoutTotal<UserDto> {
  @ApiProperty({ type: [UserDto] })
  declare items: UserDto[];
}

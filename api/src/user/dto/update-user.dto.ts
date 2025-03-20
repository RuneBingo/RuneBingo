import { ApiProperty } from '@nestjs/swagger';

import { Roles } from '@/auth/roles/roles.constants';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  username?: string;

  @ApiProperty({ required: false })
  language?: string;

  @ApiProperty({ enum: Roles, required: false })
  role?: Roles;
}

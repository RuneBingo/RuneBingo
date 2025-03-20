import { ApiProperty } from '@nestjs/swagger';

import { User } from '../user.entity';

export class UserDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  usernameNormalized: string;

  @ApiProperty({ required: false, type: String })
  gravatarHash: string | null;

  @ApiProperty()
  language: string;

  @ApiProperty()
  role: string;

  constructor(user: User) {
    this.username = user.username;
    this.usernameNormalized = user.usernameNormalized;
    this.gravatarHash = user.gravatarHash;
    this.language = user.language;
    this.role = user.role;
  }
}

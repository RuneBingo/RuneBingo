import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from '@/user/dto/user.dto';

export class ActivityDto {
  @ApiProperty({ type: UserDto })
  createdBy: UserDto | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  key: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false, type: Array })
  body?: string[] | string;

  constructor(createdBy: UserDto | null, createdAt: Date, key: string, title: string, body?: string[] | string) {
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.key = key;
    this.title = title;
    this.body = body;
  }
}

import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

import { UserDto } from '@/user/dto/user.dto';

import { Media } from '../media.entity';

export class MediaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  format: string;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  width: number;

  @ApiProperty()
  height: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ oneOf: [{ $ref: getSchemaPath(UserDto) }, { type: 'string' }] })
  createdBy: UserDto | string;

  @ApiProperty()
  updatedBy?: UserDto;

  public static async fromMedia(media: Media) {
    const dto = new MediaDto();
    dto.id = media.publicId;
    dto.url = media.url;
    dto.format = media.format;
    dto.originalName = media.originalName;
    dto.size = media.size;
    dto.width = media.width;
    dto.height = media.height;
    dto.createdAt = media.createdAt;
    dto.updatedAt = media.updatedAt;

    const createdBy = await media.createdBy;
    dto.createdBy = createdBy ? new UserDto(createdBy) : 'System';

    const updatedBy = await media.updatedBy;
    dto.updatedBy = updatedBy ? new UserDto(updatedBy) : undefined;

    return dto;
  }
}

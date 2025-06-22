import { ApiProperty } from '@nestjs/swagger';

import { OsrsItem } from '../osrs-item.entity';

export class OsrsItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  configName: string;

  @ApiProperty()
  exchangeable: boolean;

  @ApiProperty()
  members: boolean;

  @ApiProperty()
  examine: string;

  @ApiProperty()
  iconUrl: string;

  @ApiProperty()
  imageUrl: string;

  static fromOsrsItem(entity: OsrsItem) {
    const dto = new OsrsItemDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.configName = entity.configName;
    dto.exchangeable = entity.exchangeable;
    dto.members = entity.members;
    dto.examine = entity.examine;
    dto.iconUrl = entity.iconUrl;
    dto.imageUrl = entity.imageUrl;

    return dto;
  }
}

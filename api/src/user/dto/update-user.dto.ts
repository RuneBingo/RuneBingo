import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Length, Matches } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { Roles } from '@/auth/roles/roles.constants';
import { I18nTranslations } from '@/i18n/types';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @Length(3, 25, {
    message: i18nValidationMessage<I18nTranslations>('validation.username.invalidLength'),
  })
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: i18nValidationMessage<I18nTranslations>('validation.username.noSpecialCharacters'),
  })
  @IsOptional()
  username?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  language?: string;

  @ApiProperty({ enum: Roles, required: false })
  @IsOptional()
  role?: Roles;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Length, Matches } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import type { I18nTranslations } from '@/i18n/types';

export class SignUpWithEmailDto {
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('validation.invalidEmail') })
  @ApiProperty()
  email: string;

  @ApiProperty()
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: i18nValidationMessage<I18nTranslations>('validation.username.noSpecialCharacters'),
  })
  @Length(3, 25, {
    message: i18nValidationMessage<I18nTranslations>('validation.username.invalidLength'),
  })
  username: string;
}

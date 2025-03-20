import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import type { I18nTranslations } from '@/i18n/types';

export class VerifyAuthCodeDto {
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('validation.invalidEmail') })
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.notEmpty') })
  @ApiProperty()
  code: string;
}

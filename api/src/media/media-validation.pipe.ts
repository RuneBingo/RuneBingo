import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { I18nTranslations } from '@/i18n/types';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10MB

@Injectable()
export class MediaValidationPipe implements PipeTransform {
  constructor(private readonly i18n: I18nService<I18nTranslations>) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    if (!value || !this.isFile(value)) throw new BadRequestException(this.i18n.t('media.validation.noFileUploaded'));

    if (value.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        this.i18n.t('media.validation.tooLarge', { args: { size: `${MAX_FILE_SIZE / (1024 * 1024)}MB` } }),
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(value.mimetype)) {
      throw new BadRequestException(this.i18n.t('media.validation.invalidType'));
    }

    return value;
  }

  private isFile(value: unknown): value is Express.Multer.File {
    return (
      typeof value === 'object' &&
      value !== null &&
      'buffer' in value &&
      'originalname' in value &&
      'mimetype' in value &&
      'size' in value &&
      Buffer.isBuffer((value as Express.Multer.File).buffer)
    );
  }
}

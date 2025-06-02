import { BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { Command, CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import sharp from 'sharp';
import { Repository } from 'typeorm';

import { I18nTranslations } from '@/i18n/types';
import { type User } from '@/user/user.entity';

import { CloudinaryService } from '../cloudinary.service';
import { Media } from '../media.entity';

export type UploadImageParams = {
  requester: User;
  file: Express.Multer.File;
};

export type UploadImageResult = Media;

export class UploadImageCommand extends Command<Media> {
  public readonly requester: User;
  public readonly file: Express.Multer.File;

  constructor({ requester, file }: UploadImageParams) {
    super();

    this.requester = requester;
    this.file = file;
  }
}

@CommandHandler(UploadImageCommand)
export class UploadImageHandler {
  private readonly logger = new Logger(UploadImageHandler.name);

  constructor(
    private readonly i18nService: I18nService<I18nTranslations>,
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(Media) private readonly mediaRepository: Repository<Media>,
  ) {}

  async execute(command: UploadImageCommand): Promise<UploadImageResult> {
    try {
      const { requester, file } = command;

      const imageUri = await this.convertImageToWebp(file);
      const result = await this.cloudinaryService.upload(imageUri, {
        display_name: file.originalname,
        resource_type: 'image',
      });

      const media = new Media();
      media.assetId = result.asset_id as string;
      media.publicId = result.public_id;
      media.originalName = file.originalname;
      media.size = result.bytes;
      media.format = result.format;
      media.url = result.secure_url;
      media.width = result.width;
      media.height = result.height;
      media.createdById = requester.id;
      media.createdBy = Promise.resolve(requester);

      await this.mediaRepository.save(media);

      return media;
    } catch (error) {
      // These errors should have been handled by our MediaValidationPipe but we might miss some edge cases.
      if (this.cloudinaryService.isCloudinaryError(error)) {
        this.logger.error(error);

        switch (error.http_code) {
          case 400:
          case 422:
            throw new BadRequestException(this.i18nService.t('media.validation.invalidType'));
          case 413:
            throw new BadRequestException(this.i18nService.t('media.validation.tooLarge'));
          default:
            break;
        }
      }

      throw new InternalServerErrorException(this.i18nService.t('general.error.unexpected'));
    }
  }

  private async convertImageToWebp(file: Express.Multer.File): Promise<string> {
    const image = await sharp(file.buffer).toFormat('webp').toBuffer();
    const imageUri = `data:image/webp;base64,${image.toString('base64')}`;

    return imageUri;
  }
}

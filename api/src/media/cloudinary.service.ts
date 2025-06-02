import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiOptions, type UploadApiErrorResponse } from 'cloudinary';

import { AppConfig } from '@/config';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    const { cloudName, apiKey, apiSecret } = this.configService.getOrThrow<AppConfig['cloudinary']>('cloudinary');

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  public async deleteMany(ids: string[]): Promise<void> {
    await cloudinary.api.delete_resources(ids);
  }

  public async upload(file: string, options?: UploadApiOptions) {
    return cloudinary.uploader.upload(file, options);
  }

  public isCloudinaryError(error: unknown): error is UploadApiErrorResponse {
    return typeof error === 'object' && error !== null && 'message' in error && 'name' in error;
  }
}

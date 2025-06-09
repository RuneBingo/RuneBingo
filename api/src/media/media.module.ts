import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JobsModule } from '@/jobs/jobs.module';

import { CloudinaryService } from './cloudinary.service';
import { UploadImageHandler } from './commands/upload-image.command';
import { MediaCleanupProcessor } from './media-cleanup.job';
import { MediaController } from './media.controller';
import { Media } from './media.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Media]), forwardRef(() => JobsModule)],
  providers: [
    // Commands
    UploadImageHandler,
    // Jobs
    MediaCleanupProcessor,
    // Services
    CloudinaryService,
  ],
  exports: [CloudinaryService, MediaCleanupProcessor],
  controllers: [MediaController],
})
export class MediaModule {}

import { Controller, HttpCode, HttpStatus, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthGuard } from '@/auth/guards/auth.guard';

import { UploadImageCommand } from './commands/upload-image.command';
import { MediaDto } from './dto/media.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MediaValidationPipe } from './media-validation.pipe';

@Controller('v1/media')
export class MediaController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a media file' })
  @ApiCreatedResponse({
    description: 'The uploaded media file details',
    type: MediaDto,
  })
  @ApiBadRequestResponse({ description: 'The uploaded media file is invalid' })
  @ApiUnauthorizedResponse({ description: 'The user is not authenticated' })
  @ApiBody({ type: UploadMediaDto })
  @ApiConsumes('multipart/form-data')
  async uploadMedia(@UploadedFile(MediaValidationPipe) file: Express.Multer.File, @Req() req: Request) {
    const user = req.userEntity!;

    const media = await this.commandBus.execute(new UploadImageCommand({ requester: user, file }));

    return MediaDto.fromMedia(media);
  }
}

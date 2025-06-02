import { post } from '.';
import { type MediaDto, type UploadMediaDto } from './types';

export async function uploadMedia(file: File) {
  return post<UploadMediaDto, MediaDto>('/media', { file }, { contentType: 'multipart/form-data' });
}

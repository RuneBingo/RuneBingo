'use client';

import { useMutation } from '@tanstack/react-query';
import { X } from 'lucide-react';
import NextImage from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

import { uploadMedia } from '@/api/media';
import type { MediaDto } from '@/api/types';
import { Button } from '@/design-system/ui/button';
import { Input } from '@/design-system/ui/input';
import { Skeleton } from '@/design-system/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/design-system/ui/tooltip';

import { getImageAspectRatio } from '../utils/image';
import transformApiError from '../utils/transform-api-error';

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/gif', 'image/png', 'image/apng', 'image/tiff'];

export type ImageUploaderProps = {
  value: MediaDto | null;
  onChange: (value: MediaDto | null) => void;
};

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [aspectRatio, setAspectRatio] = useState(1);

  const { mutate: handleUpload, isPending: isUploading } = useMutation({
    mutationKey: ['uploadImage'],
    mutationFn: async (file: File) => {
      const response = await uploadMedia(file);
      if ('error' in response) {
        const { message } = transformApiError(response);
        if (message) toast.error(message, { richColors: true, dismissible: true, position: 'bottom-center' });

        return;
      }

      onChange(response.data);
    },
  });

  const handleRemove = () => {
    onChange(null);
  };

  if (isUploading) {
    return <Skeleton className="w-full" style={{ aspectRatio }} />;
  }

  if (value) {
    return (
      <Tooltip>
        <div className="relative w-fit min-w-16 min-h-8 max-w-full group">
          <TooltipTrigger asChild>
            <a href={value.url} target="_blank" rel="noopener noreferrer">
              <NextImage
                src={value.url}
                alt="Uploaded image"
                width={value.width}
                height={value.height}
                className="max-w-full h-auto min-w-8 min-h-8"
              />
            </a>
          </TooltipTrigger>
          <TooltipContent side="bottom">{value.originalName}</TooltipContent>
          <Button
            variant="secondary"
            size="icon-xs"
            className="rounded-full absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={handleRemove}
          >
            <X />
          </Button>
        </div>
      </Tooltip>
    );
  }

  return (
    <Input
      type="file"
      accept={IMAGE_MIME_TYPES.join(',')}
      onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const aspectRatio = await getImageAspectRatio(file);
        setAspectRatio(aspectRatio);
        handleUpload(file);
      }}
    />
  );
}

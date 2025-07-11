import { type CreateOrEditBingoTileDto } from '@/api/types';

import { type FormValues } from './types';

export function formValuesToInput(values: FormValues): CreateOrEditBingoTileDto {
  return {
    title: values.title,
    description: values.description,
    value: values.value,
    free: values.free,
    completionMode: values.completionMode,
    mediaId: values.media?.id ?? null,
    imageUrl: values.useFirstItemImage ? values.items[0].item.imageUrl : null,
    items: values.items.map((item) => ({
      itemId: item.item.id,
      quantity: item.quantity,
    })),
  };
}

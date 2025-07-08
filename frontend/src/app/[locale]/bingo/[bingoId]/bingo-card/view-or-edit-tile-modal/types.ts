import { type CreateOrEditBingoTileDto, type MediaDto, type BingoTileItemDto } from '@/api/types';

export type Mode = 'create' | 'edit' | 'view';

export type FormValues = Omit<CreateOrEditBingoTileDto, 'mediaId' | 'items'> & {
  media: MediaDto | null;
  items: BingoTileItemDto[];
  useFirstItemImage: boolean;
};

export type ViewOrEditTileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export type ViewOrEditImageProps = {
  mode: Mode;
};

export type ViewOrEditItemsProps = {
  mode: Mode;
};

import { type HTMLAttributes, type ComponentProps } from 'react';

import { type DialogFooter, type DialogHeader, type Dialog, type DialogDescription } from '@/design-system/ui/dialog';

export type ModalProps = {
  disableInteractOutside?: boolean;
  onExited?: () => void;
} & ComponentProps<typeof Dialog>;

export type ModalBodyProps = HTMLAttributes<HTMLDivElement>;

export type ModalFooterProps = ComponentProps<typeof DialogFooter>;

export type ModalDescriptionProps = ComponentProps<typeof DialogDescription>;

export type ModalHeaderProps = {
  title: string;
} & ComponentProps<typeof DialogHeader>;

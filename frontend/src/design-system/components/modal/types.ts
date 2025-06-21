import { type HTMLAttributes, type ComponentProps } from 'react';

import { type DialogFooter, type DialogHeader, type Dialog } from '@/design-system/ui/dialog';

export type ModalProps = ComponentProps<typeof Dialog>;

export type ModalBodyProps = HTMLAttributes<HTMLDivElement>;

export type ModalFooterProps = ComponentProps<typeof DialogFooter>;

export type ModalHeaderProps = {
  title: string;
} & ComponentProps<typeof DialogHeader>;

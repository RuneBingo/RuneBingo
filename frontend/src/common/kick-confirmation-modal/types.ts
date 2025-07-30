import { type VariantProps } from 'class-variance-authority';
import { type ComponentProps, type ReactNode } from 'react';

import { type buttonVariants } from '@/design-system/ui/button';
import { type Dialog } from '@/design-system/ui/dialog';

export type KickConfirmationModalOptions = Omit<
  ComponentProps<typeof Dialog>,
  'open' | 'onOpenChange' | 'children' | 'title'
> & {
  title: ReactNode;
  description: ReactNode;
  description2?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: VariantProps<typeof buttonVariants>['variant'];
  withDeleteCompletionsToggle?: boolean;
};

export type KickConfirmationModalProps = ComponentProps<typeof Dialog> &
  KickConfirmationModalOptions & {
    onConfirm: (deleteCompletions?: boolean) => void;
    onCancel: () => void;
  };

export type KickConfirmationModalContextType = {
  askKickConfirmation: (
    options: KickConfirmationModalOptions,
  ) => Promise<{ confirmed: boolean; deleteCompletions?: boolean }>;
};

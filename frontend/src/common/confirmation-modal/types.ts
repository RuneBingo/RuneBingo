import type { ComponentProps, PropsWithChildren, ReactNode } from 'react';

import type { Button } from '@/design-system/ui/button';

export type AskConfirmationArgs = Omit<PropsState, 'open'>;

export type ConfirmationModalContextType = {
  askConfirmation(args: AskConfirmationArgs): Promise<boolean>;
};

export type ConfirmationModalProps = {
  open: boolean;
  title: string;
  description: ReactNode | string;
  confirmLabel?: string;
  confirmVariant?: ComponentProps<typeof Button>['variant'];
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export type ConfirmationModalProviderProps = PropsWithChildren;

export type PropsState = Omit<ConfirmationModalProps, 'onConfirm' | 'onCancel'>;

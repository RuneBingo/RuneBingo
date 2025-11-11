import { DialogDescription } from '@/design-system/ui/dialog';

import type { ModalDescriptionProps } from './types';

export default function ModalDescription({ children }: ModalDescriptionProps) {
  return <DialogDescription>{children}</DialogDescription>;
}

import { DialogFooter } from '@/design-system/ui/dialog';

import type { ModalFooterProps } from './types';

export default function ModalFooter({ children }: ModalFooterProps) {
  return <DialogFooter className="p-4">{children}</DialogFooter>;
}

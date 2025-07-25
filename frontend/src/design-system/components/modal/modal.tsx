import { Dialog, DialogContent } from '@/design-system/ui/dialog';

import type { ModalProps } from './types';

export default function Modal({ children, disableInteractOutside, ...props }: ModalProps) {
  return (
    <Dialog {...props} modal>
      <DialogContent
        className="gap-0 max-h-screen p-0 overflow-hidden flex flex-col"
        hideCloseButton
        onInteractOutside={disableInteractOutside ? (e) => e.preventDefault() : undefined}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

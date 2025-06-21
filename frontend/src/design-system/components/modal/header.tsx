import { XIcon } from 'lucide-react';

import { Button } from '@/design-system/ui/button';
import { DialogClose, DialogHeader, DialogTitle } from '@/design-system/ui/dialog';

import type { ModalHeaderProps } from './types';
import { Title } from '../title';

export default function ModalHeader({ title, children }: ModalHeaderProps) {
  return (
    <DialogHeader className="p-4 z-10">
      <div className="flex justify-between items-center">
        <Title.Secondary className="!mb-0">{title}</Title.Secondary>
        <DialogClose asChild>
          <Button variant="ghost" size="icon">
            <XIcon className="size-4" />
          </Button>
        </DialogClose>
      </div>
      <DialogTitle className="sr-only">{title}</DialogTitle>
      {children}
    </DialogHeader>
  );
}

import { useTranslations } from 'next-intl';

import { Button } from '@/design-system/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/ui/dialog';

import { type ConfirmationModalProps } from './types';

export default function ConfirmationModal({
  confirmLabel,
  cancelLabel,
  confirmVariant,
  onConfirm,
  onCancel,
  ...props
}: ConfirmationModalProps) {
  const t = useTranslations('common.confirmationModal');
  const { title, description } = props;

  const handleOpenChange = (_: boolean) => {
    onCancel();
  };

  return (
    <Dialog {...props} onOpenChange={handleOpenChange}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{description}</DialogDescription>
        <DialogFooter>
          <Button variant={confirmVariant || 'default'} onClick={onConfirm}>
            {confirmLabel || t('confirm')}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel || t('cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

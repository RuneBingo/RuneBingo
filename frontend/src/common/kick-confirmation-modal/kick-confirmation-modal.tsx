import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/design-system/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/ui/dialog';
import { Label } from '@/design-system/ui/label';
import { Switch } from '@/design-system/ui/switch';

import { type KickConfirmationModalProps } from './types';

export default function KickConfirmationModal({
  confirmLabel,
  cancelLabel,
  confirmVariant,
  onConfirm,
  onCancel,
  withDeleteCompletionsToggle,
  ...props
}: KickConfirmationModalProps) {
  const t = useTranslations('common.confirmationModal');
  const { title, description, description2 } = props;
  const [deleteCompletions, setDeleteCompletions] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setDeleteCompletions(false); // Reset state on close
    }
    onCancel();
  };

  return (
    <Dialog {...props} onOpenChange={handleOpenChange}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <DialogDescription>{description}</DialogDescription>
          {description2 && <DialogDescription>{description2}</DialogDescription>}
          {withDeleteCompletionsToggle && (
            <div className="flex items-center gap-2">
              <Switch id="delete-completions" checked={deleteCompletions} onCheckedChange={setDeleteCompletions} />
              <Label htmlFor="delete-completions">{t('delete_completions')}</Label>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant={confirmVariant || 'default'} onClick={() => onConfirm(deleteCompletions)}>
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

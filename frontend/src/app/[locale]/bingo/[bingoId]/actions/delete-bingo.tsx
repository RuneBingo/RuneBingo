import { useTranslations } from 'next-intl';

import Modal from '@/design-system/components/modal';
import { Button } from '@/design-system/ui/button';

import { useActionsContext } from './provider';

export default function DeleteBingo() {
  const { currentAction, closeAction, deleteBingo } = useActionsContext();
  const t = useTranslations('bingo.bingoCard.deleteBingo');

  return (
    <Modal open={currentAction === 'delete'} onOpenChange={closeAction}>
      <Modal.Header title={t('title')} />
      <Modal.Body>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="destructive" onClick={() => deleteBingo({ input: undefined })}>
          {t('submit')}
        </Button>
        <Button variant="outline" onClick={closeAction}>
          {t('cancel')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

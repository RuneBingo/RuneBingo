import { useTranslations } from 'next-intl';

import Modal from '@/design-system/components/modal';
import { Button } from '@/design-system/ui/button';

import { useActionsContext } from './provider';

export default function CancelBingo() {
  const { currentAction, closeAction, cancelBingo } = useActionsContext();
  const t = useTranslations('bingo.bingoCard.cancelBingo');

  return (
    <Modal open={currentAction === 'cancel'} onOpenChange={closeAction}>
      <Modal.Header title={t('title')} />
      <Modal.Body>
        {t.rich('descriptionHtml', {
          p: (chunks) => <p className="text-sm text-muted-foreground">{chunks}</p>,
        })}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="default" onClick={() => cancelBingo({ input: undefined })}>
          {t('submit')}
        </Button>
        <Button variant="outline" onClick={closeAction}>
          {t('cancel')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

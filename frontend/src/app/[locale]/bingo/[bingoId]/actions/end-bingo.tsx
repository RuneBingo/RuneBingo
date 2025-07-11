import { useTranslations } from 'next-intl';

import Modal from '@/design-system/components/modal';
import { Button } from '@/design-system/ui/button';

import { useActionsContext } from './provider';

export default function EndBingo() {
  const { currentAction, closeAction, endBingo } = useActionsContext();
  const t = useTranslations('bingo.bingoCard.endBingo');

  return (
    <Modal open={currentAction === 'end'} onOpenChange={closeAction}>
      <Modal.Header title={t('title')} />
      <Modal.Body>
        {t.rich('descriptionHtml', {
          p: (chunks) => <p className="text-sm text-muted-foreground">{chunks}</p>,
        })}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="default" onClick={() => endBingo({ input: undefined })}>
          {t('submit')}
        </Button>
        <Button variant="outline" onClick={closeAction}>
          {t('cancel')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

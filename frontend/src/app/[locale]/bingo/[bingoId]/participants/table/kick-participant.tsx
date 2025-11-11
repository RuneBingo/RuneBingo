import { useLocale, useTranslations } from 'next-intl';
import { type ReactNode, useState } from 'react';

import { BingoStatus, type BingoDto, type BingoParticipantDto } from '@/api/types';
import { formatDateToLocale } from '@/common/utils/date';
import Modal from '@/design-system/components/modal';
import SwitchField from '@/design-system/components/switch-field';
import { asyncDialog, type AsyncDialogRef } from '@/design-system/hoc/dialog';
import { Button } from '@/design-system/ui/button';

type KickParticipantRef = AsyncDialogRef<
  { bingo: BingoDto; participant: BingoParticipantDto },
  { kick: true; deleteTileCompletions: boolean }
>;

const KickParticipant = asyncDialog<KickParticipantRef>(({ input, open, submit, cancel, onExited }) => {
  const t = useTranslations('bingo-participant.actions.kick');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [deleteTileCompletions, setDeleteTileCompletions] = useState(false);

  const handleSubmit = () => {
    submit({ kick: true, deleteTileCompletions });
  };

  const description: string | ReactNode = (() => {
    if (input.bingo.status === BingoStatus.Pending) {
      if (input.bingo.private) return t('description.pending.private');

      if (input.bingo.maxRegistrationDate) {
        return t.rich('description.pending.publicWithDateHtml', {
          maxRegistrationDate: formatDateToLocale(input.bingo.maxRegistrationDate, locale),
          b: (chunks) => <span className="font-semibold">{chunks}</span>,
          p: (chunks) => <p>{chunks}</p>,
        });
      }

      return t('description.pending.public');
    }

    if (input.bingo.status === BingoStatus.Ongoing) {
      return t.rich('description.ongoingHtml', { p: (chunks) => <p>{chunks}</p> });
    }

    return '';
  })();

  return (
    <Modal open={open} onOpenChange={cancel} onExited={onExited}>
      <Modal.Header title={t('title', { username: input.participant!.user?.username || '' })} />
      <Modal.Body>
        <Modal.Description asChild>{description}</Modal.Description>
        <SwitchField
          label={t('deleteTileCompletions')}
          value={deleteTileCompletions}
          onChange={setDeleteTileCompletions}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="default" onClick={handleSubmit}>
          {t('confirmLabel', { username: input.participant!.user?.username || '' })}
        </Button>
        <Button variant="outline" onClick={cancel}>
          {tCommon('cancel')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
});

export default KickParticipant;

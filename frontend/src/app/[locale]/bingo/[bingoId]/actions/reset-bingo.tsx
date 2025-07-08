import { formatDate } from 'date-fns';
import { Form, FormikContext, useFormik } from 'formik';
import { MoveRightIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import DateField from '@/design-system/components/date-field';
import Modal from '@/design-system/components/modal';
import SwitchField from '@/design-system/components/switch-field';
import { Button } from '@/design-system/ui/button';

import { useActionsContext } from './provider';
import type { ResetBingoFormValues } from './types';

export default function ResetBingo() {
  const { currentAction, closeAction, resetBingo } = useActionsContext();
  const t = useTranslations('bingo.bingoCard.resetBingo');
  const locale = useLocale();

  const today = formatDate(new Date(), 'yyyy-MM-dd');
  const formik = useFormik<ResetBingoFormValues>({
    initialValues: {
      startDate: today,
      endDate: today,
      maxRegistrationDate: today,
      deleteTiles: false,
      deleteTeams: false,
      deleteParticipants: false,
    },
    onSubmit: (values, { setErrors }) => resetBingo({ input: values, setErrors }),
  });

  const { values, errors, setFieldValue, resetForm, submitForm } = formik;

  const handleCancel = () => {
    resetForm();
    closeAction();
  };

  return (
    <Modal open={currentAction === 'reset'} onOpenChange={handleCancel}>
      <Modal.Header title={t('title')} />
      <FormikContext.Provider value={formik}>
        <Modal.Body>
          {t.rich('descriptionHtml', {
            p: (chunks) => <p className="text-sm text-muted-foreground">{chunks}</p>,
          })}
          <Form>
            <div className="flex items-center gap-2.5 w-full">
              <DateField
                name="startDate"
                locale={locale}
                label={t('form.startDate')}
                value={values.startDate ?? ''}
                onChange={(value) => setFieldValue('startDate', value)}
                error={errors.startDate}
                modal
              />
              <MoveRightIcon className="size-6 mt-1 shrink-0 text-gray-500" />
              <DateField
                name="endDate"
                locale={locale}
                label={t('form.endDate')}
                value={values.endDate ?? ''}
                onChange={(value) => setFieldValue('endDate', value)}
                error={errors.endDate}
                modal
              />
            </div>
            <DateField
              name="maxRegistrationDate"
              locale={locale}
              label={t('form.maxRegistrationDate')}
              value={values.maxRegistrationDate ?? ''}
              onChange={(value) => setFieldValue('maxRegistrationDate', value)}
              error={errors.maxRegistrationDate}
            />
            <p className="text-sm text-muted-foreground">{t('form.entitiesToClear')}</p>
            <SwitchField
              name="deleteTiles"
              label={t('form.deleteTiles')}
              value={values.deleteTiles}
              onChange={(value) => setFieldValue('deleteTiles', value)}
            />
            <SwitchField
              name="deleteTeams"
              label={t('form.deleteTeams')}
              value={values.deleteTeams}
              onChange={(value) => setFieldValue('deleteTeams', value)}
            />
            <SwitchField
              name="deleteParticipants"
              label={t('form.deleteParticipants')}
              value={values.deleteParticipants}
              onChange={(value) => setFieldValue('deleteParticipants', value)}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="default" onClick={submitForm}>
            {t('submit')}
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            {t('cancel')}
          </Button>
        </Modal.Footer>
      </FormikContext.Provider>
    </Modal>
  );
}

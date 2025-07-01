import { Form, FormikContext, useFormik } from 'formik';
import { useLocale, useTranslations } from 'next-intl';

import DateField from '@/design-system/components/date-field';
import Modal from '@/design-system/components/modal';
import SwitchField from '@/design-system/components/switch-field';
import { Button } from '@/design-system/ui/button';

import { useActionsContext } from './provider';
import type { StartBingoFormValues } from './types';

export default function StartBingo() {
  const { bingo, currentAction, closeAction, startBingo } = useActionsContext();
  const t = useTranslations('bingo.bingoCard.startBingo');
  const locale = useLocale();

  const formik = useFormik<StartBingoFormValues>({
    initialValues: { endDate: undefined },
    onSubmit: (values, { setErrors }) => startBingo({ input: { endDate: values.endDate ?? undefined }, setErrors }),
  });

  const { values, errors, setFieldValue, resetForm, submitForm } = formik;

  const handleCancel = () => {
    resetForm();
    closeAction();
  };

  const handleSwitchChange = (checked: boolean) => {
    setFieldValue('endDate', checked ? bingo.endDate : undefined);
  };

  return (
    <Modal open={currentAction === 'start'} onOpenChange={handleCancel}>
      <Modal.Header title={t('title')} />
      <FormikContext.Provider value={formik}>
        <Modal.Body>
          {t.rich('descriptionHtml', {
            p: (chunks) => <p className="text-sm text-muted-foreground">{chunks}</p>,
          })}
          <Form>
            <SwitchField
              name="endDate"
              label={t('endDate.switch')}
              value={values.endDate !== undefined}
              onChange={handleSwitchChange}
            >
              <DateField
                name="endDate"
                locale={locale}
                value={values.endDate ?? ''}
                onChange={(value) => setFieldValue('endDate', value)}
                error={errors.endDate}
                placeholder={t('endDate.placeholder')}
              />
            </SwitchField>
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

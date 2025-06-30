import { Form, FormikContext, useFormik } from 'formik';
import { MoveRightIcon, XIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import BingoCardPreview from '@/common/bingo/card-preview';
import DateField from '@/design-system/components/date-field';
import Modal from '@/design-system/components/modal';
import NumberField from '@/design-system/components/number-field/number-field';
import SelectField from '@/design-system/components/select-field';
import SwitchField from '@/design-system/components/switch-field';
import TextAreaField from '@/design-system/components/text-area-field';
import TextField from '@/design-system/components/text-field';
import { Button } from '@/design-system/ui/button';
import { Separator } from '@/design-system/ui/separator';
import { SUPPORTED_LOCALES } from '@/i18n';

import { useActionsContext } from './provider';
import type { FormValues } from './types';

export default function EditDetails() {
  const { bingo, currentAction, closeAction, updateBingo } = useActionsContext();
  const tCommon = useTranslations('common');
  const t = useTranslations('bingo.bingoCard.editDetails');
  const locale = useLocale();

  const formik = useFormik<FormValues>({
    initialValues: {
      language: bingo.language,
      title: bingo.title,
      description: bingo.description,
      private: bingo.private,
      startDate: bingo.startDate,
      endDate: bingo.endDate,
      maxRegistrationDate: bingo.maxRegistrationDate,
      width: bingo.width,
      height: bingo.height,
      fullLineValue: bingo.fullLineValue,
    },
    onSubmit: (values, { setErrors }) => updateBingo({ input: values, setErrors }),
  });

  // TODO: In the future, support more languages than the application so we can translate to other users
  const languagesOptions = SUPPORTED_LOCALES.map((locale) => ({
    label: tCommon(`languages.${locale}`),
    value: locale,
  }));

  const { values, errors, setFieldValue, resetForm, handleSubmit } = formik;
  const submitDisabled = [values.width, values.height, values.fullLineValue].some((value) => value === null);

  const handleCancel = () => {
    resetForm();
    closeAction();
  };

  return (
    <Modal open={currentAction === 'editDetails'} onOpenChange={closeAction}>
      <Modal.Header title={t('title')} />
      <FormikContext.Provider value={formik}>
        <Modal.Body>
          <Form>
            <SelectField
              name="language"
              label={t('form.language')}
              options={languagesOptions}
              value={values.language ?? ''}
              onChange={(value) => setFieldValue('language', value)}
              modal
            />
            <TextField
              name="title"
              label={t('form.title')}
              value={values.title ?? ''}
              onChange={(value) => setFieldValue('title', value)}
              error={errors.title}
            />
            <TextAreaField
              name="description"
              label={t('form.description')}
              value={values.description ?? ''}
              onChange={(value) => setFieldValue('description', value)}
              error={errors.description}
            />
            <SwitchField
              name="public"
              label={t('form.public')}
              value={!values.private}
              onChange={(value) => setFieldValue('private', !value)}
              error={errors.private}
            />
            <Separator className="my-5" />
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
            <Separator className="my-5" />
            <BingoCardPreview width={values.width} height={values.height} />
            <div className="flex items-center gap-2.5 w-full">
              <NumberField
                className="flex-grow-1"
                min={1}
                max={10}
                name="width"
                label={t('form.width')}
                value={values.width}
                onChange={(value) => setFieldValue('width', value)}
                error={errors.width}
              />
              <XIcon className="size-6 mt-1 shrink-0 text-gray-500" />
              <NumberField
                className="flex-grow-1"
                min={1}
                max={10}
                name="height"
                label={t('form.height')}
                value={values.height}
                onChange={(value) => setFieldValue('height', value)}
                error={errors.height}
              />
            </div>
            <div className="w-1/2 pr-5">
              <NumberField
                min={0}
                name="fullLineValue"
                label={t('form.fullLineValue')}
                value={values.fullLineValue}
                onChange={(value) => setFieldValue('fullLineValue', value)}
                error={errors.fullLineValue}
              />
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" onClick={() => handleSubmit()} disabled={submitDisabled}>
            {t('form.submit')}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t('form.cancel')}
          </Button>
        </Modal.Footer>
      </FormikContext.Provider>
    </Modal>
  );
}

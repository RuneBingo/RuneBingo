import { Form, FormikContext, useFormik } from 'formik';
import { MoveRightIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { type UpdateBingoDto } from '@/api/types';
import DateField from '@/design-system/components/date-field';
import SelectField from '@/design-system/components/select-field';
import SwitchField from '@/design-system/components/switch-field';
import TextAreaField from '@/design-system/components/text-area-field';
import TextField from '@/design-system/components/text-field';
import { Title } from '@/design-system/components/title';
import { Button } from '@/design-system/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/design-system/ui/dialog';
import { Separator } from '@/design-system/ui/separator';
import { SUPPORTED_LOCALES } from '@/i18n';

import { useActionsContext } from './provider';

export default function EditDetails() {
  const { bingo, currentAction, closeAction, updateBingo } = useActionsContext();
  const tCommon = useTranslations('common');
  const t = useTranslations('bingo.bingoCard.editDetails');
  const locale = useLocale();

  const formik = useFormik<UpdateBingoDto>({
    initialValues: { ...bingo },
    onSubmit: (values, { setErrors }) => updateBingo({ input: values, setErrors }),
  });

  // TODO: In the future, support more languages than the application so we can translate to other users
  const languagesOptions = SUPPORTED_LOCALES.map((locale) => ({
    label: tCommon(`languages.${locale}`),
    value: locale,
  }));

  const { values, errors, setFieldValue, resetForm, handleSubmit } = formik;

  const handleCancel = () => {
    resetForm();
    closeAction();
  };

  return (
    <Dialog open={currentAction === 'editDetails'} onOpenChange={closeAction}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="sr-only">{t('title')}</DialogTitle>
          <Title.Secondary>{t('title')}</Title.Secondary>
        </DialogHeader>
        <FormikContext.Provider value={formik}>
          <Form>
            <SelectField
              name="language"
              label={t('form.language')}
              options={languagesOptions}
              value={values.language ?? ''}
              onChange={(value) => setFieldValue('language', value)}
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
              />
              <MoveRightIcon className="size-6 mt-2 shrink-0" />
              <DateField
                name="endDate"
                locale={locale}
                label={t('form.endDate')}
                value={values.endDate ?? ''}
                onChange={(value) => setFieldValue('endDate', value)}
                error={errors.endDate}
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
            {/* TODO: add card size to UpdateBingoDto, add fields and a preview of the new card */}
            <TextField
              className="w-1/2"
              type="number"
              name="fullLineValue"
              label={t('form.fullLineValue')}
              value={values.fullLineValue?.toString() ?? ''}
              onChange={(value) => setFieldValue('fullLineValue', Number(value))}
              error={errors.fullLineValue}
            />
          </Form>
          <DialogFooter>
            <Button type="submit" onClick={() => handleSubmit()}>
              {t('form.submit')}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t('form.cancel')}
            </Button>
          </DialogFooter>
        </FormikContext.Provider>
      </DialogContent>
    </Dialog>
  );
}

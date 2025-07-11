'use client';

import { useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';

import SelectField from '@/design-system/components/select-field';
import SwitchField from '@/design-system/components/switch-field';
import TextAreaField from '@/design-system/components/text-area-field';
import TextField from '@/design-system/components/text-field';
import { SUPPORTED_LOCALES } from '@/i18n';

import { type FormValues } from '../types';

export default function StepBasics() {
  const { values, errors, setFieldValue } = useFormikContext<FormValues>();
  const t = useTranslations('create-bingo');
  const tCommon = useTranslations('common');

  const languagesOptions = SUPPORTED_LOCALES.map((locale) => ({
    label: tCommon(`languages.${locale}`),
    value: locale,
  }));

  return (
    <>
      <SelectField
        name="language"
        label={t('form.language')}
        options={languagesOptions}
        value={values.language}
        onChange={(value) => setFieldValue('language', value)}
      />
      <TextField
        name="title"
        label={t('form.title')}
        value={values.title}
        onChange={(value) => setFieldValue('title', value)}
        error={errors.title}
        placeholder={t('form.titlePlaceholder')}
      />
      <TextAreaField
        name="description"
        label={t('form.description')}
        value={values.description}
        onChange={(value) => setFieldValue('description', value)}
        error={errors.description}
        placeholder={t('form.descriptionPlaceholder')}
      />
      <SwitchField
        name="public"
        label={t('form.public')}
        value={!values.private}
        onChange={(value) => setFieldValue('private', !value)}
        error={errors.private}
      />
    </>
  );
}

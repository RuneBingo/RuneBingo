'use client';

import { useFormikContext } from 'formik';
import { MoveRightIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import DateField from '@/design-system/components/date-field';

import { type FormValues } from '../types';

export default function StepDates() {
  const { values, errors, setFieldValue } = useFormikContext<FormValues>();
  const t = useTranslations('create-bingo');
  const locale = useLocale();

  return (
    <>
      <div className="flex items-center gap-2.5 w-full">
        <DateField
          name="startDate"
          locale={locale}
          label={t('form.startDate')}
          placeholder={t('form.startDatePlaceholder')}
          value={values.startDate}
          onChange={(value) => setFieldValue('startDate', value)}
          error={errors.startDate}
        />
        <MoveRightIcon className="size-6 mt-1 shrink-0 text-gray-500" />
        <DateField
          name="endDate"
          locale={locale}
          label={t('form.endDate')}
          placeholder={t('form.endDatePlaceholder')}
          value={values.endDate}
          onChange={(value) => setFieldValue('endDate', value)}
          error={errors.endDate}
        />
      </div>
      <DateField
        name="maxRegistrationDate"
        locale={locale}
        label={t('form.maxRegistrationDate')}
        value={values.maxRegistrationDate}
        onChange={(value) => setFieldValue('maxRegistrationDate', value)}
        error={errors.maxRegistrationDate}
        placeholder={t('form.maxRegistrationDatePlaceholder')}
      />
    </>
  );
}

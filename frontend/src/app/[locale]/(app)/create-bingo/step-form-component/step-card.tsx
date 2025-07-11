'use client';

import { useFormikContext } from 'formik';
import { XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import BingoCardPreview from '@/common/bingo/card-preview';
import NumberField from '@/design-system/components/number-field/number-field';

import { type FormValues } from '../types';

export default function StepCard() {
  const { values, errors, setFieldValue } = useFormikContext<FormValues>();
  const t = useTranslations('create-bingo');

  return (
    <>
      <BingoCardPreview width={values.width ?? 5} height={values.height ?? 5} />
      <div className="flex items-center gap-2.5 w-full">
        <NumberField
          className="flex-grow-1"
          min={1}
          max={10}
          name="width"
          label={t('form.width')}
          value={values.width === null ? undefined : values.width}
          onChange={(value) => setFieldValue('width', value)}
          error={errors.width}
          placeholder={t('form.widthPlaceholder')}
        />
        <XIcon className="size-6 mt-1 shrink-0 text-gray-500" />
        <NumberField
          className="flex-grow-1"
          min={1}
          max={10}
          name="height"
          label={t('form.height')}
          value={values.height === null ? undefined : values.height}
          onChange={(value) => setFieldValue('height', value)}
          error={errors.height}
          placeholder={t('form.heightPlaceholder')}
        />
      </div>
      <NumberField
        min={0}
        name="fullLineValue"
        label={t('form.fullLineValue')}
        value={values.fullLineValue === null ? undefined : values.fullLineValue}
        onChange={(value) => setFieldValue('fullLineValue', value)}
        error={errors.fullLineValue}
        placeholder={t('form.fullLineValuePlaceholder')}
      />
    </>
  );
}

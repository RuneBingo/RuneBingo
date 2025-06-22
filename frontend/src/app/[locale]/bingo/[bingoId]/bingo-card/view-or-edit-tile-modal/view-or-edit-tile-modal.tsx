'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { FormikContext, useFormik, type FormikHelpers } from 'formik';
import { useTranslations } from 'next-intl';
import { Fragment, useMemo } from 'react';

import { findBingoTileByCoordinates } from '@/api/bingo';
import { createOrEditBingoTile } from '@/api/bingo';
import { type BingoTileCompletionMode, type CreateOrEditBingoTileDto } from '@/api/types';
import ImageUploader from '@/common/image-uploader';
import SelectItem from '@/common/select-item';
import toast from '@/common/utils/toast';
import transformApiError from '@/common/utils/transform-api-error';
import Modal from '@/design-system/components/modal';
import NumberField from '@/design-system/components/number-field';
import SwitchField from '@/design-system/components/switch-field';
import TextAreaField from '@/design-system/components/text-area-field';
import TextField from '@/design-system/components/text-field';
import { Title } from '@/design-system/components/title';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/ui/alert';
import { Button } from '@/design-system/ui/button';

import Loading from './loading';
import type { FormValues, ViewOrEditTileModalProps } from './types';
import { formValuesToInput } from './utils';
import { useBingoCard } from '../provider';

export default function ViewOrEditTileModal({ open, onOpenChange }: ViewOrEditTileModalProps) {
  const t = useTranslations('bingo.bingoCard.viewOrEditTile');
  const {
    bingo: { bingoId },
    viewingOrEditingTile,
    readOnly,
    refetch,
  } = useBingoCard();

  const x = viewingOrEditingTile?.x;
  const y = viewingOrEditingTile?.y;

  const {
    data: detailedBingoTile,
    isFetching,
    refetch: refetchTile,
  } = useQuery({
    queryKey: ['view-bingo-tile', x, y],
    queryFn: async () => {
      if (!x || !y) return null;

      const response = await findBingoTileByCoordinates(bingoId, x, y);
      if ('error' in response) {
        // TODO: handle error
        return null;
      }

      return response.data;
    },
    enabled: Boolean(viewingOrEditingTile),
  });

  const mode = (() => {
    if (readOnly) return 'view';
    if (!detailedBingoTile) return 'create';

    return 'edit';
  })();

  const { mutate: createOrEdit } = useMutation({
    mutationKey: ['create-or-edit-bingo-tile', x, y],
    mutationFn: async ({
      values,
      setErrors,
    }: {
      values: FormValues;
      setErrors: FormikHelpers<CreateOrEditBingoTileDto>['setErrors'];
    }) => {
      if (mode === 'view' || x === undefined || y === undefined) return;

      const input = formValuesToInput(values);
      const response = await createOrEditBingoTile(bingoId, x, y, input);
      if ('error' in response) {
        const { message, validationErrors } = transformApiError(response);
        if (message) toast.error(message);
        if (validationErrors) setErrors(validationErrors);

        return;
      }

      toast.success(t(`success.${mode}`));
      onOpenChange(false);
      await refetch();
      await refetchTile();
      setTimeout(() => {
        resetForm();
      }, 200);
    },
  });

  const initialValues = useMemo(
    () =>
      ({
        title: detailedBingoTile?.title ?? '',
        description: detailedBingoTile?.description ?? '',
        value: detailedBingoTile?.value ?? 0,
        free: detailedBingoTile?.free ?? false,
        media: detailedBingoTile?.media ?? null,
        items: detailedBingoTile?.items ?? [],
        completionMode: detailedBingoTile?.completionMode ?? ('all' as BingoTileCompletionMode),
      }) satisfies FormValues,
    [detailedBingoTile],
  );

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: (values, { setErrors }) => createOrEdit({ values, setErrors }),
  });

  const { values, errors, setFieldValue, resetForm, submitForm } = formik;

  return (
    <FormikContext.Provider value={formik}>
      <Modal open={open} onOpenChange={onOpenChange} disableInteractOutside>
        <Modal.Header title={t(`title.${mode}`, { x: x ?? 0, y: y ?? 0 })} />
        <Modal.Body>
          {isFetching ? (
            <Loading />
          ) : (
            <Fragment>
              <Title.Ternary>{t('form.information')}</Title.Ternary>
              {mode === 'view' && values.free && (
                <div className="mb-5">
                  <Alert variant="tip">
                    <AlertTitle>
                      {t.rich('freeTip.title', {
                        span: (chunk) => <span className="text-lg">{chunk}</span>,
                      })}
                    </AlertTitle>
                    <AlertDescription>
                      {t.rich('freeTip.description', {
                        span: (chunk) => <span className="text-lg">{chunk}</span>,
                      })}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              <TextField
                label={t('form.title')}
                value={values.title}
                readOnly={mode === 'view'}
                onChange={(value) => setFieldValue('title', value)}
                error={errors.title}
              />
              <TextAreaField
                label={t('form.description')}
                value={values.description}
                readOnly={mode === 'view'}
                onChange={(value) => setFieldValue('description', value)}
                error={errors.description}
              />
              <NumberField
                label={t('form.value')}
                value={values.value}
                readOnly={mode === 'view'}
                onChange={(value) => setFieldValue('value', value)}
                error={errors.value}
              />
              {mode !== 'view' && (
                <SwitchField
                  label={t('form.free')}
                  value={values.free}
                  onChange={(value) => setFieldValue('free', value)}
                  error={errors.free}
                />
              )}
              <Title.Ternary>{t('form.image')}</Title.Ternary>
              <ImageUploader
                value={values.media}
                readOnly={mode === 'view'}
                emptyMessage={t('form.noImage')}
                onChange={(value) => setFieldValue('media', value)}
              />
              <Title.Ternary>{t('form.items')}</Title.Ternary>
              <SelectItem
                side="top"
                align="start"
                value={values.items}
                onChange={(value) => setFieldValue('items', value)}
                readOnly={mode === 'view'}
                emptyMessage={t('form.noItems')}
              />
            </Fragment>
          )}
        </Modal.Body>
        {mode !== 'view' && (
          <Modal.Footer>
            <Button type="submit" onClick={submitForm}>
              {t('form.submit')}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('form.cancel')}
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </FormikContext.Provider>
  );
}

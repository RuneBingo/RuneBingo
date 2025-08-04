'use client';

import { useMutation } from '@tanstack/react-query';
import { FormikContext, useFormik } from 'formik';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import { createBingo } from '@/api/bingo';
import transformApiError from '@/common/utils/transform-api-error';
import { Badge } from '@/design-system/ui/badge';
import { Button } from '@/design-system/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/design-system/ui/card';
import { useRouter } from '@/i18n/navigation';

import StepBasics from './step-form-component/step-basics';
import StepCard from './step-form-component/step-card';
import StepDates from './step-form-component/step-dates';
import { type FormValues, type Step } from './types';

const INITIAL_VALUES: FormValues = {
  language: 'en',
  title: '',
  description: '',
  private: false,
  startDate: '',
  endDate: '',
  maxRegistrationDate: '',
  width: null,
  height: null,
  fullLineValue: null,
};

export default function CreateBingoPage() {
  const [step, setStep] = useState<Step>('details');
  const t = useTranslations('create-bingo');
  const router = useRouter();

  const { mutate: handleCreateBingo, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        ...values,
        width: values.width ?? 5,
        height: values.height ?? 5,
        fullLineValue: values.fullLineValue ?? 0,
      };

      const response = await createBingo(payload);

      if ('error' in response) {
        const { message, validationErrors } = transformApiError(response);
        if (validationErrors) {
          formik.setErrors(validationErrors);
        }
        if (message) {
          toast.error(message, { richColors: true, dismissible: true, position: 'bottom-center' });
        }
        return;
      }

      toast.success(t('success'), { richColors: true, dismissible: true, position: 'bottom-center' });
      router.push('/dashboard');
    },
  });

  const formik = useFormik<FormValues>({
    initialValues: INITIAL_VALUES,
    onSubmit: (values) => handleCreateBingo(values),
  });

  const steps = {
    details: {
      title: t('step1Title'),
      description: t('step1Description'),
      component: StepBasics,
    },
    dates: {
      title: t('step2Title'),
      description: t('step2Description'),
      component: StepDates,
    },
    card: {
      title: t('step3Title'),
      description: t('step3Description'),
      component: StepCard,
    },
  };

  const stepOrder: Step[] = ['details', 'dates', 'card'];
  const currentStepIndex = stepOrder.indexOf(step);
  const currentStep = steps[step];

  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentStepIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentStepIndex + 1];
      setStep(nextStep);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setStep(stepOrder[currentStepIndex - 1]);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <FormikContext.Provider value={formik}>
          <CardHeader>
            <Badge variant="default" className="w-fit rounded-full px-2.5 py-1 mb-2">
              Step {currentStepIndex + 1} / {stepOrder.length}
            </Badge>
            <CardTitle className="mb-2 text-2xl font-semibold">{currentStep.title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">{currentStep.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={formik.handleSubmit}>
              <currentStep.component />
              <div className="flex justify-end gap-2 mt-6">
                {step !== 'details' && (
                  <Button type="button" variant="outline" onClick={handleBack}>
                    {t('form.back')}
                  </Button>
                )}
                {step === 'details' && (
                  <Button type="button" variant="ghost" onClick={handleCancel}>
                    {t('form.cancel')}
                  </Button>
                )}
                {step !== 'card' ? (
                  <Button type="button" onClick={handleContinue}>
                    {t('form.continue')}
                  </Button>
                ) : (
                  <Button type="submit" disabled={isPending}>
                    {t('form.submit')}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </FormikContext.Provider>
      </Card>
    </div>
  );
}

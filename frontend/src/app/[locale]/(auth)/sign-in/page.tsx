'use client';

import { Form, FormikContext, type FormikHelpers, useFormik } from 'formik';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';
import { toast } from 'sonner';

import { signInWithEmail } from '@/api/auth';
import transformApiError from '@/common/utils/transform-api-error';
import TextField from '@/design-system/components/text-field';
import { Title } from '@/design-system/components/title';
import { Button } from '@/design-system/ui/button';
import { Separator } from '@/design-system/ui/separator';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';

type SignInFormValues = {
  email: string;
};

export default function SignInPage() {
  const router = useRouter();
  const t = useTranslations('auth.signIn');

  const onSubmit = async (values: SignInFormValues, { setErrors }: FormikHelpers<SignInFormValues>) => {
    const response = await signInWithEmail(values.email);
    if ('error' in response) {
      const { message, validationErrors } = transformApiError(response);
      if (validationErrors) setErrors(validationErrors);
      if (message) toast.error(message, { richColors: true, dismissible: true, position: 'bottom-center' });

      return;
    }

    const urlSafeEmail = encodeURIComponent(values.email);
    router.push(`/verify-code?email=${urlSafeEmail}`);
  };

  const formik = useFormik<SignInFormValues>({ initialValues: { email: '' }, onSubmit });

  const { values, errors, isSubmitting, setFieldValue } = formik;

  return (
    <Fragment>
      <Title.Secondary>{t('title')}</Title.Secondary>
      <p className="text-sm text-muted-foreground">
        {t('noAccount.text')}{' '}
        <Link className="text-blue-500 underline" href="/sign-up">
          {t('noAccount.link')}
        </Link>
      </p>
      <Separator className="my-6" />
      <FormikContext.Provider value={formik}>
        <Form>
          <TextField
            label={t('form.email.label')}
            name="email"
            value={values.email}
            onChange={(value) => setFieldValue('email', value)}
            error={errors.email}
          />
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {t('form.submit')}
          </Button>
        </Form>
      </FormikContext.Provider>
    </Fragment>
  );
}

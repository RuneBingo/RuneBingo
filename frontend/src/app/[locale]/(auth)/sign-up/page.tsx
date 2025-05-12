'use client';

import { Form, FormikContext, type FormikHelpers, useFormik } from 'formik';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';
import { toast } from 'sonner';

import { requestSignUp } from '@/api/auth';
import TextField from '@/design-system/components/text-field';
import { Title } from '@/design-system/components/title';
import { Button } from '@/design-system/ui/button';
import { Separator } from '@/design-system/ui/separator';
import { transformApiError } from '@/design-system/utils/transform-api-error';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';

type SignUpFormValues = {
  email: string;
  username: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const t = useTranslations('auth.signUp');

  const onSubmit = async (values: SignUpFormValues, { setErrors }: FormikHelpers<SignUpFormValues>) => {
    const response = await requestSignUp(values.email, values.username);
    if ('error' in response) {
      const { message, validationErrors } = transformApiError(response);
      if (validationErrors) setErrors(validationErrors);
      if (message) toast.error(message, { richColors: true, dismissible: true, position: 'bottom-center' });

      return;
    }

    const urlSafeEmail = encodeURIComponent(values.email);
    router.push(`/verify-code?email=${urlSafeEmail}`);
  };

  const formik = useFormik<SignUpFormValues>({ initialValues: { email: '', username: '' }, onSubmit });

  const { values, errors, isSubmitting, setFieldValue } = formik;

  return (
    <Fragment>
      <Title.Secondary>{t('title')}</Title.Secondary>
      <p className="text-sm text-muted-foreground">
        {t('alreadyHaveAccount.text')}{' '}
        <Link className="text-blue-500 underline" href="/sign-in">
          {t('alreadyHaveAccount.link')}
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
          <TextField
            label={t('form.username.label')}
            name="username"
            value={values.username}
            onChange={(value) => setFieldValue('username', value)}
            error={errors.username}
          />
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {t('form.submit')}
          </Button>
        </Form>
      </FormikContext.Provider>
    </Fragment>
  );
}

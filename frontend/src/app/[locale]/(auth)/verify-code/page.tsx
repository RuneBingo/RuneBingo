'use client';

import { Form, FormikContext, type FormikHelpers, useFormik } from 'formik';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Fragment } from 'react';
import { toast } from 'sonner';

import { verifyCode } from '@/api/auth';
import { useAppContext } from '@/common/context';
import { transformApiError } from '@/common/utils/transform-api-error';
import CodeInput from '@/design-system/components/code-input';
import { Title } from '@/design-system/components/title';
import { Button } from '@/design-system/ui/button';
import { Separator } from '@/design-system/ui/separator';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';

type VerifyCodeFormValues = {
  code: string;
};

export default function VerifyCodePage() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { refreshUser } = useAppContext();

  const t = useTranslations('auth.verifyCode');

  const email = decodeURIComponent(searchParams.get('email') ?? '');

  const onSubmit = async (values: VerifyCodeFormValues, { setErrors }: FormikHelpers<VerifyCodeFormValues>) => {
    if (!email) return;

    const response = await verifyCode(email, values.code);
    if ('error' in response) {
      const { message, validationErrors } = transformApiError(response);
      if (validationErrors) setErrors(validationErrors);
      if (message) toast.error(message, { richColors: true, dismissible: true, position: 'bottom-center' });

      return;
    }

    const user = await refreshUser();
    router.push('/', { locale: user?.language ?? locale });
  };

  const formik = useFormik<VerifyCodeFormValues>({ initialValues: { code: '' }, onSubmit });

  if (!email) {
    router.push('/sign-in');
    return null;
  }

  const { values, isSubmitting, setFieldValue } = formik;

  return (
    <Fragment>
      <Title.Secondary>{t('title')}</Title.Secondary>
      <p className="text-sm text-muted-foreground">
        {t('emailSent.before', { email })} <b>{email}</b>
        {t('emailSent.after')}
      </p>
      <p className="text-sm text-muted-foreground">
        {t('notYou.text')}{' '}
        <Link className="underline text-blue-500" href="/sign-in">
          {t('notYou.link')}
        </Link>
        .
      </p>
      <Separator className="my-6" />
      <FormikContext.Provider value={formik}>
        <Form>
          <CodeInput value={values.code} onChange={(value) => setFieldValue('code', value)} inputMode="text" />
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {t('form.submit')}
          </Button>
        </Form>
      </FormikContext.Provider>
    </Fragment>
  );
}

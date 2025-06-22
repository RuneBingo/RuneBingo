'use client';

import { Form, FormikContext, type FormikHelpers, useFormik } from 'formik';
import { CameraIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { type UserDto } from '@/api/types';
import { updateUserByUsername } from '@/api/user';
import { useAppContext } from '@/common/context';
import useSuccessMessages from '@/common/hooks/use-success-messages';
import toast from '@/common/utils/toast';
import transformApiError from '@/common/utils/transform-api-error';
import Avatar from '@/design-system/components/avatar';
import SelectField from '@/design-system/components/select-field';
import TextField from '@/design-system/components/text-field';
import { Title } from '@/design-system/components/title';
import { Button } from '@/design-system/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/design-system/ui/popover';
import { SUPPORTED_LOCALES } from '@/i18n';
import { Link } from '@/i18n/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';

type MyAccountFormProps = {
  user: UserDto;
};

type AccountFormValues = {
  username: string;
  language: string;
};

export default function MyAccountForm({ user }: MyAccountFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const { refreshUser } = useAppContext();

  const t = useTranslations('my.account.form');
  const tCommon = useTranslations('common');

  const languagesOptions = SUPPORTED_LOCALES.map((locale) => ({
    label: tCommon(`languages.${locale}`),
    value: locale,
  }));

  useSuccessMessages('my.account.form', ['success']);

  const onSubmit = async (_: AccountFormValues, { setErrors }: FormikHelpers<AccountFormValues>) => {
    if (!Object.keys(actualUpdates).length) return;

    const response = await updateUserByUsername(user.usernameNormalized, { ...actualUpdates });
    if ('error' in response) {
      const { message, validationErrors } = transformApiError(response);
      if (validationErrors) setErrors(validationErrors);
      if (message) toast.error(message);

      return;
    }

    const refreshedUser = await refreshUser();
    // If the user has changed their language, redirect to the account settings page with the new language and a success message
    if (refreshedUser && refreshedUser.language !== locale) {
      router.push({ pathname, query: { message: 'success' } }, { locale: refreshedUser.language });
      return;
    }

    router.refresh();
    toast.success(t('success'));
  };

  const formik = useFormik<AccountFormValues>({
    initialValues: {
      username: user.username,
      language: user.language,
    },
    onSubmit,
  });

  const { values, errors, isSubmitting, setFieldValue } = formik;

  // Determine which fields are actually updated to avoid unnecessary API calls
  const actualUpdates = useMemo(() => {
    return Object.fromEntries(Object.entries(values).filter(([key, value]) => value !== user[key as keyof UserDto]));
  }, [values, user]);

  return (
    <FormikContext.Provider value={formik}>
      <Form>
        <Title.Secondary>{t('personalInformation.title')}</Title.Secondary>
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 items-center">
          <div className="relative pr-3 pb-3">
            <Avatar user={user} size={200} />
            <Popover>
              <PopoverTrigger asChild>
                <div className="cursor-help absolute bottom-0 right-0 bg-background rounded-full p-2">
                  <div className="p-4 rounded-full bg-primary text-primary-foreground">
                    <CameraIcon size={32} />
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent>
                {t('personalInformation.avatarPopover.text')}
                <Link className="underline" href="https://gravatar.com" target="_blank">
                  {t('personalInformation.avatarPopover.link')}
                </Link>
                .
              </PopoverContent>
            </Popover>
          </div>
          <div className="w-full sm:max-w-xs">
            <TextField
              name="username"
              label={t('personalInformation.fields.username.label')}
              value={values.username}
              onChange={(value) => setFieldValue('username', value)}
              error={errors.username}
            />
            <SelectField
              name="language"
              label={t('personalInformation.fields.language.label')}
              options={languagesOptions}
              value={values.language}
              onChange={(value: string) => setFieldValue('language', value)}
              className="w-full"
            />
          </div>
        </div>
        <div className="mt-6">
          <Button size="lg" type="submit" disabled={Object.keys(actualUpdates).length === 0 || isSubmitting}>
            {t('submit')}
          </Button>
        </div>
      </Form>
    </FormikContext.Provider>
  );
}

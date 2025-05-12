'use client';

import { useLocale, useTranslations } from 'next-intl';

import SelectField from '@/design-system/components/select-field';
import { SUPPORTED_LOCALES } from '@/i18n';
import { usePathname, useRouter } from '@/i18n/navigation';

export type SelectLanguageProps = {
  short?: boolean;
};

export default function SelectLanguage({ short }: SelectLanguageProps) {
  const key = short ? 'languagesShort' : 'languages';
  const t = useTranslations(`common.${key}`);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const languagesOptions = SUPPORTED_LOCALES.map((locale) => ({
    label: t(locale),
    value: locale,
  }));

  const handleChange = (value: string) => {
    router.push(pathname, { locale: value });
  };

  return <SelectField containerClassName="mb-0" value={locale} options={languagesOptions} onChange={handleChange} />;
}

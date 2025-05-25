'use client';

import { useTranslations } from 'next-intl';

import SelectLanguage from '@/common/select-language';
import { Title } from '@/design-system/components/title';
import { useAboveBreakpoint } from '@/design-system/hooks/responsive';
import { Card, CardContent, CardFooter } from '@/design-system/ui/card';
import { Link } from '@/i18n/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { sm } = useAboveBreakpoint('sm');
  const t = useTranslations('auth.layout');
  const tCommon = useTranslations('common');

  if (sm) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center px-6 py-8">
        <Card className="w-full max-w-md text-center">
          <CardContent>
            <Title.Ternary>{tCommon('appName')}</Title.Ternary>
            {children}
          </CardContent>
          <CardFooter>
            <div className="flex items-center justify-between w-full gap-2">
              <Link href="/" className="text-sm text-blue-500 underline">
                {t('backToHome')}
              </Link>
              <SelectLanguage />
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-screen items-center justify-between px-6 py-8">
      <Title.Ternary>{tCommon('appName')}</Title.Ternary>
      <div className="text-center w-full">{children}</div>
      <div className="flex flex-col gap-4 text-center items-center">
        <Link href="/" className="text-sm text-blue-500 underline">
          {t('backToHome')}
        </Link>
        <SelectLanguage short />
      </div>
    </div>
  );
}

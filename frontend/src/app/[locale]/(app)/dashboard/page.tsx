import { ChevronRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getAuthenticatedUser } from '@/api/auth';
import { Button } from '@/design-system/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/design-system/ui/card';
import { Link } from '@/i18n/navigation';

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  const t = await getTranslations('dashboard');

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="mb-3 text-2xl font-semibold">{t('title', { name: user.username })}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{t('description')}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <Link href="/create-bingo" className="block">
            <Button
              className="h-auto w-full p-4 text-left text-primary-foreground flex items-center justify-between gap-3"
              variant="default"
            >
              <div className="flex-1 min-w-0">
                <p className="mb-1 text-2xl font-semibold">{t('button.organize.title')}</p>
                <p className="text-sm text-muted-background leading-relaxed break-words whitespace-normal">
                  {t('button.organize.description')}
                </p>
              </div>

              <ChevronRight className="h-5 w-5 text-background flex-shrink-0" />
            </Button>
          </Link>

          <Button className="h-auto w-full p-4 text-left flex items-center justify-between gap-3" variant="outline">
            <div className="flex-1 min-w-0">
              <p className="mb-1 text-2xl font-semibold">{t('button.join.title')}</p>
              <p className="text-sm text-muted-foreground leading-relaxed break-words whitespace-normal">
                {t('button.join.description')}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-foreground flex-shrink-0" />
          </Button>

          <div className="flex justify-end gap-2 px-1.5 pb-1.5 underline">
            <Link href="#" className="text-xs text-blue-500 ">
              {t('viewApp')}
            </Link>
            <span className="text-xs">|</span>
            <Link href="#" className="text-xs text-blue-500 ">
              {t('viewInvite')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

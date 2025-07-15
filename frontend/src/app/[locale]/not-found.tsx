import Link from 'next/link'
import { getTranslations } from 'next-intl/server';
import { Button } from '@/design-system/ui/button';


export default async function NotFound() {
  const t = await getTranslations('site.errors.404');

return (
  <div>
    <h2>{t('title')}</h2>
    <p>{t('description')}</p>
    
    <Link href="/en">
      <Button className="w-full" type="button">
              {t('returnHome')}
      </Button>
    </Link>
  </div>
)

}
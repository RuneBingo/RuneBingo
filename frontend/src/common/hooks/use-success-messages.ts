import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';

import { usePathname, useRouter } from '@/i18n/navigation';

export default function useSuccessMessages(basePath: string, supportedMessages: string[]) {
  const router = useRouter();
  const pathname = usePathname();

  const t = useTranslations(basePath);
  const searchParams = useSearchParams();

  const sendSuccessMessage = useCallback(
    (key: string) =>
      toast.success(t(key), {
        richColors: true,
        dismissible: true,
        position: 'bottom-center',
      }),
    [t],
  );

  useEffect(() => {
    const message = searchParams.get('message');
    if (message && supportedMessages.includes(message)) {
      setTimeout(() => sendSuccessMessage(message), 100);
      const query = Object.fromEntries(searchParams.entries().filter(([key]) => key !== 'message'));
      router.replace({ pathname, query });
    }
  }, [searchParams, sendSuccessMessage, supportedMessages, pathname, router]);
}

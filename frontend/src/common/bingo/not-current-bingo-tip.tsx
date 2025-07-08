'use client';

import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { setCurrentBingo as setCurrentBingoApi } from '@/api/auth';
import { BingoRoles } from '@/api/types';
import { useAppContext } from '@/common/context';
import toast from '@/common/utils/toast';
import transformApiError from '@/common/utils/transform-api-error';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/ui/alert';
import { useRouter } from '@/i18n/navigation';

type NotCurrentBingoTipProps = {
  role: BingoRoles | undefined;
  bingoId: string;
  visible: boolean;
};

export default function NotCurrentBingoTip({ role, bingoId, visible }: NotCurrentBingoTipProps) {
  const router = useRouter();
  const t = useTranslations('bingo.notCurrentBingoTip');
  const { refreshUser } = useAppContext();
  const { mutate: setCurrentBingo } = useMutation({
    mutationKey: ['set-current-bingo-tip', bingoId],
    mutationFn: async () => {
      const response = await setCurrentBingoApi(bingoId);
      if ('error' in response) {
        const { message } = transformApiError(response);
        if (message) toast.error(message);

        return;
      }

      await refreshUser();
      router.refresh();
    },
  });

  // This should never happen, but just in case
  if (!role || role === BingoRoles.Participant) return null;

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <Alert variant="tip" className="mb-5">
            <AlertTitle className="flex items-center gap-2">
              <Lightbulb size={20} />
              {t(`title.${role}`)}
            </AlertTitle>
            <AlertDescription>
              <span>
                {t.rich('description', {
                  button: (chunks) => (
                    <button className="inline underline cursor-pointer" onClick={() => setCurrentBingo()}>
                      {chunks}
                    </button>
                  ),
                })}
              </span>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

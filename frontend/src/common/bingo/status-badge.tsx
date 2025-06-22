import { useTranslations } from 'next-intl';
import { type ComponentProps } from 'react';

import { BingoStatus } from '@/api/types';
import { Badge } from '@/design-system/ui/badge';

export type BingoStatusBadgeProps = {
  status: BingoStatus;
  className?: string;
};

export default function BingoStatusBadge({ status, className }: BingoStatusBadgeProps) {
  const t = useTranslations('bingo.status');

  const badgeVariant = (() => {
    switch (status) {
      case BingoStatus.Pending:
        return 'warning';
      case BingoStatus.Ongoing:
        return 'active';
      case BingoStatus.Completed:
        return 'success';
      case BingoStatus.Canceled:
        return 'destructive';
    }
  })() satisfies ComponentProps<typeof Badge>['variant'];

  return (
    <Badge variant={badgeVariant} className={className}>
      {t(status)}
    </Badge>
  );
}

import { useTranslations } from 'next-intl';
import { type ComponentProps } from 'react';

import { BingoStatus } from '@/api/types';
import { Badge } from '@/design-system/ui/badge';

export type StatusBadgeProps = {
  status: BingoStatus;
  className?: string;
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const t = useTranslations('bingo.status');

  const badgeVariant = (() => {
    switch (status) {
      case BingoStatus.Pending:
        return 'warning';
      case BingoStatus.Ongoing:
        return 'success';
      case BingoStatus.Completed:
        return 'gray';
    }
  })() satisfies ComponentProps<typeof Badge>['variant'];

  return (
    <Badge variant={badgeVariant} className={className}>
      {t(status)}
    </Badge>
  );
}

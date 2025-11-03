import { useTranslations } from 'next-intl';

import { BingoRoles } from '@/api/types';
import { cn } from '@/design-system/lib/utils';
import { Badge } from '@/design-system/ui/badge';
import Select from '@/design-system/ui/select';

export type SelectRoleProps = {
  value: BingoRoles;
  disabled?: boolean;
  readonly?: boolean;
  onChange: (value: BingoRoles) => void;
};

export default function SelectRole({ value, disabled, readonly, onChange }: SelectRoleProps) {
  const t = useTranslations('bingo.roles');

  if (readonly) {
    return <span>{t(value)}</span>;
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <Select.Trigger asChild>
        <Badge className={cn('flex items-center gap-2', { 'cursor-pointer': !disabled })} variant="default">
          {t(value)}
          {!disabled && <Select.Chevron className="opacity-100" />}
        </Badge>
      </Select.Trigger>
      <Select.Content>
        <Select.Item value={BingoRoles.Participant}>{t(BingoRoles.Participant)}</Select.Item>
        <Select.Item value={BingoRoles.Organizer}>{t(BingoRoles.Organizer)}</Select.Item>
      </Select.Content>
    </Select>
  );
}

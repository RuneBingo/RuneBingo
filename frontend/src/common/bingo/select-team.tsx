import { useTranslations } from 'next-intl';

import { type BingoTeamDto } from '@/api/types';
import { cn } from '@/design-system/lib/utils';
import { Badge } from '@/design-system/ui/badge';
import Select from '@/design-system/ui/select';

const EMPTY_VALUE = 'empty';

export type SelectTeamProps = {
  value: string | null;
  teams: BingoTeamDto[];
  disabled?: boolean;
  readonly?: boolean;
  onChange: (value: string | null) => void;
};

export default function SelectTeam({ value = EMPTY_VALUE, teams, disabled, readonly, onChange }: SelectTeamProps) {
  const t = useTranslations('bingo.selectTeam');
  const selectedTeam = teams.find((team) => team.nameNormalized === value);

  if (readonly) return <span>{selectedTeam?.name ?? '—'}</span>;

  const badgeVariant = value ? 'default' : 'outline';

  const handleChange = (newValue: string | null) => {
    if (value === newValue) return;

    onChange(newValue === EMPTY_VALUE ? null : newValue);
  };

  return (
    <Select value={value ?? EMPTY_VALUE} onValueChange={handleChange} disabled={disabled}>
      <Select.Trigger asChild>
        <Badge className={cn('flex items-center gap-2', { 'cursor-pointer': !disabled })} variant={badgeVariant}>
          {selectedTeam?.name ?? t('empty')}
          {!disabled && <Select.Chevron className="opacity-100" />}
        </Badge>
      </Select.Trigger>
      <Select.Content>
        {teams.map((team) => (
          <Select.Item key={team.nameNormalized} value={team.nameNormalized}>
            {team.name}
          </Select.Item>
        ))}
        <Select.Item value={EMPTY_VALUE}>{t('empty')}</Select.Item>
      </Select.Content>
    </Select>
  );
}

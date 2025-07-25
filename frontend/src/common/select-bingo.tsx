import { useMutation, useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDownIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { listMyBingos, setCurrentBingo as setCurrentBingoApi } from '@/api/auth';
import { BingoRoles, BingoStatus, type ShortBingoDto } from '@/api/types';
import toast from '@/common/utils/toast';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/ui/button';
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/design-system/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/design-system/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/design-system/ui/tooltip';
import { useRouter } from '@/i18n/navigation';

import { useAppContext } from './context';
import transformApiError from './utils/transform-api-error';

type SelectBingoValueDisplayProps = {
  title: string;
  status?: BingoStatus;
};

function SelectBingoValueDisplay({ title, status }: SelectBingoValueDisplayProps) {
  const t = useTranslations('bingo.status');

  const statusColor = (() => {
    switch (status) {
      case BingoStatus.Canceled:
        return 'bg-destructive';
      case BingoStatus.Completed:
        return 'bg-success';
      case BingoStatus.Ongoing:
        return 'bg-active';
      case BingoStatus.Pending:
        return 'bg-warning';
      default:
        return undefined;
    }
  })();

  return (
    <div className="flex items-center gap-2">
      {status && statusColor && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`w-2 h-2 rounded-full ${statusColor}`} />
          </TooltipTrigger>
          <TooltipContent>{t(status)}</TooltipContent>
        </Tooltip>
      )}
      {title}
    </div>
  );
}

export default function SelectBingo() {
  const router = useRouter();
  const { user, refreshUser } = useAppContext();
  const [open, setOpen] = useState(false);
  const [selectedBingo, setSelectedBingo] = useState<ShortBingoDto | null>(null);
  const t = useTranslations('bingo');

  useEffect(() => {
    if (user?.currentBingo?.id) {
      setSelectedBingo(user.currentBingo);
    }
  }, [user?.currentBingo]);

  const { data: myBingos } = useQuery({
    queryKey: ['search-bingos'],
    queryFn: () => listMyBingos(),
  });

  const { mutate: setCurrentBingo, isPending: isSettingCurrentBingo } = useMutation({
    mutationKey: ['set-current-bingo', selectedBingo?.id],
    mutationFn: async (bingo: ShortBingoDto) => {
      setSelectedBingo(bingo);
      setOpen(false);

      const response = await setCurrentBingoApi(bingo.id);
      if ('error' in response) {
        const { message } = transformApiError(response);
        if (message) toast.error(message);

        return;
      }

      await refreshUser();
      router.push(`/bingo/${bingo.id}`);
    },
  });

  const groupedBingos = useMemo(() => {
    if (!myBingos) return [];

    const organizer = {
      heading: t('roles.organizer'),
      bingos: myBingos.filter((bingo) => bingo.role !== BingoRoles.Participant),
    };

    const participant = {
      heading: t('roles.participant'),
      bingos: myBingos.filter((bingo) => bingo.role === BingoRoles.Participant),
    };

    return [organizer, participant];
  }, [myBingos, t]);

  if (!user?.hasBingos) return null;

  const valueDisplay = (() => {
    if (selectedBingo) {
      return {
        label: selectedBingo.title,
        status: selectedBingo.status,
        id: selectedBingo.id,
      };
    }

    if (user?.currentBingo?.title) {
      return {
        label: user.currentBingo.title,
        status: user.currentBingo.status,
        id: user.currentBingo.id,
      };
    }

    return { label: t('selectBingo.noValue') };
  })();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="min-w-[200px] justify-between"
          disabled={isSettingCurrentBingo}
        >
          <SelectBingoValueDisplay title={valueDisplay.label} status={valueDisplay.status} />
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0">
        <Command>
          <CommandInput placeholder={t('selectBingo.searchPlaceholder')} />
          <CommandList>
            <CommandEmpty>{t('selectBingo.empty')}</CommandEmpty>
            {groupedBingos.map(({ heading, bingos }) =>
              bingos.length === 0 ? null : (
                <CommandGroup heading={heading} key={heading}>
                  {bingos.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => setCurrentBingo(item)}
                      className="gap-4 justify-between"
                    >
                      <SelectBingoValueDisplay title={item.title} status={item.status} />
                      <Check className={cn('h-4 w-4', valueDisplay.id === item.id ? 'opacity-100' : 'opacity-0')} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ),
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

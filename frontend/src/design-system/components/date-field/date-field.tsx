'use client';

import { format, parse } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useId } from 'react';

import { cn, getDateFnsLocale } from '@/design-system/lib/utils';
import { Button } from '@/design-system/ui/button';
import { Calendar } from '@/design-system/ui/calendar';
import { Label } from '@/design-system/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/design-system/ui/popover';

import type { DateFieldProps } from './types';

export default function DateField({
  label,
  value,
  onChange,
  error,
  placeholder,
  locale,
  className,
  modal,
  ...props
}: DateFieldProps) {
  const id = useId();
  const dateFnsLocale = getDateFnsLocale(locale);

  const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    const valueFormatted = date ? format(date, 'yyyy-MM-dd') : undefined;
    onChange?.(valueFormatted);
  };

  const displayText = selectedDate ? format(selectedDate, 'PPP', { locale: dateFnsLocale }) : placeholder;

  return (
    <div className="mb-5">
      {label && (
        <Label htmlFor={id} className="mb-2">
          {label}
        </Label>
      )}
      <Popover modal={modal}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground',
              className,
            )}
            {...props}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={dateFnsLocale}
            initialFocus
            defaultMonth={selectedDate}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="mt-1 text-left text-sm text-red-500">{error}</p>}
    </div>
  );
}

'use client';

import { SearchIcon, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { Button } from '@/design-system/ui/button';
import { Input } from '@/design-system/ui/input';

import type { SearchInputProps } from './types';

export default function SearchInput({ debounceSeconds = 300, onChange, ...props }: SearchInputProps) {
  const [inputValue, setInputValue] = useState(props.value);
  const [debouncedValue] = useDebounce(inputValue, debounceSeconds);

  useEffect(() => {
    if (debouncedValue === props.value) return;
    onChange(debouncedValue);
  }, [debouncedValue, props.value, onChange]);

  const handleClear = () => setInputValue('');

  return (
    <div className="relative mb-5">
      <Input {...props} value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="px-9" />
      <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
      {props.clearable && inputValue && (
        <Button
          variant="ghost"
          size="icon-xs"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

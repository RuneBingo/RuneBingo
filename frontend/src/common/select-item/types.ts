import { type PopoverContentProps } from '@radix-ui/react-popover';

import type { OsrsItemDto } from '@/api/types';

export type SelectItemValue = { item: OsrsItemDto; quantity: number | null };

export type SelectItemContextType = {
  open: boolean;
  page: number;
  query: string;
  value: SelectItemValue[];
  items: OsrsItemDto[] | null;
  valueRef: React.RefObject<HTMLDivElement | null>;
  isError: boolean;
  isLoading: boolean;
  pagerOpen: boolean;
  totalCount: number;
  focusNewItem: (id: number) => void;
  onOpenChange: (isOpen: boolean) => void;
  setPagerOpen: (isOpen: boolean) => void;
  onChange: (value: SelectItemValue[]) => void;
  setQuery: (query: string) => void;
  setPage: (page: number) => void;
};

export type SelectItemProviderProps = {
  value: SelectItemValue[];
  children: (context: SelectItemContextType) => React.ReactNode;
  onChange: (value: SelectItemValue[]) => void;
};

export type SelectItemValueProps = {
  readOnly?: boolean;
  emptyMessage?: string;
};

export type SelectItemProps = {
  value: SelectItemValue[];
  readOnly?: boolean;
  emptyMessage?: string;
  onChange: (value: SelectItemValue[]) => void;
} & Pick<PopoverContentProps, 'side' | 'align'>;

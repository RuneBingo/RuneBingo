import type { OsrsItemDto } from '@/api/types';

export type SelectItemContextType = {
  open: boolean;
  page: number;
  query: string;
  value: OsrsItemDto[];
  items: OsrsItemDto[] | null;
  isError: boolean;
  isLoading: boolean;
  pagerOpen: boolean;
  totalCount: number;
  onOpenChange: (isOpen: boolean) => void;
  setPagerOpen: (isOpen: boolean) => void;
  onChange: (value: OsrsItemDto[]) => void;
  setQuery: (query: string) => void;
  setPage: (page: number) => void;
};

export type SelectItemProviderProps = {
  value: OsrsItemDto[];
  children: (context: SelectItemContextType) => React.ReactNode;
  onChange: (value: OsrsItemDto[]) => void;
};

export type SelectItemProps = {
  value: OsrsItemDto[];
  onChange: (value: OsrsItemDto[]) => void;
};

import { useQuery } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';

import { searchItems } from '@/api/osrs-item';

import { ITEMS_PER_PAGE } from './constants';
import type { SelectItemProviderProps, SelectItemContextType } from './types';

const SelectItemContext = createContext<SelectItemContextType | undefined>(undefined);

export default function Provider({ value, children, onChange }: SelectItemProviderProps) {
  // Workaround to avoid closing the popover when the select is open
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [pagerOpen, setPagerOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (pagerOpen) return;

      setPopoverOpen(isOpen);
    },
    [pagerOpen],
  );

  const handlePageChange = useCallback((page: number) => {
    setPage(page);
  }, []);

  const handleQueryChange = useCallback((query: string) => {
    flushSync(() => {
      setQuery(query);
      setPage(0);
    });
  }, []);

  const {
    data: response,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['items', query, page],
    queryFn: () => {
      if (query.length < 3) return null;
      return searchItems(query, true, ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    },
  });

  const contextValue = useMemo(() => {
    const [items, totalCount] = (() => {
      if (!response || 'error' in response) return [null, 0];

      const { items, total } = response.data;
      return [items, total];
    })();

    return {
      open: popoverOpen,
      page,
      query,
      value,
      items,
      isError,
      isLoading,
      pagerOpen,
      totalCount,
      setPage: handlePageChange,
      setQuery: handleQueryChange,
      onChange,
      onOpenChange: handleOpenChange,
      setPagerOpen,
    } satisfies SelectItemContextType;
  }, [
    page,
    query,
    value,
    response,
    isError,
    isLoading,
    pagerOpen,
    popoverOpen,
    handleQueryChange,
    handleOpenChange,
    handlePageChange,
    onChange,
  ]);

  return <SelectItemContext.Provider value={contextValue}>{children(contextValue)}</SelectItemContext.Provider>;
}

export function useSelectItemContext() {
  const context = useContext(SelectItemContext);
  if (!context) {
    throw new Error('useSelectItemContext must be used within a SelectItemProvider');
  }

  return context;
}

import { useQuery } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { searchItems } from '@/api/osrs-item';

import { ITEMS_PER_PAGE } from './constants';
import type { SelectItemProviderProps, SelectItemContextType, SelectItemValue } from './types';

const SelectItemContext = createContext<SelectItemContextType | undefined>(undefined);

export default function Provider({ value, children, onChange }: SelectItemProviderProps) {
  const valueRef = useRef<HTMLDivElement>(null);

  // Workaround to avoid closing the popover when the select is open
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [pagerOpen, setPagerOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');

  const handleChange = useCallback(
    (value: SelectItemValue[]) => {
      onChange(value);
      setPopoverOpen(false);
    },
    [onChange],
  );

  const handleFocusNewItem = useCallback((id: number) => {
    setTimeout(() => {
      const valueElement = valueRef.current;
      if (!valueElement) return;

      const item = valueElement.querySelector<HTMLInputElement>(`input[data-id="${id}"]`);
      if (!item) return;

      item.focus();
    }, 200);
  }, []);

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
    setQuery(query);
    setPage(0);
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
      valueRef,
      isError,
      isLoading,
      pagerOpen,
      totalCount,
      setPage: handlePageChange,
      setQuery: handleQueryChange,
      onChange: handleChange,
      onOpenChange: handleOpenChange,
      setPagerOpen,
      focusNewItem: handleFocusNewItem,
    } satisfies SelectItemContextType;
  }, [
    page,
    query,
    value,
    response,
    isError,
    valueRef,
    isLoading,
    pagerOpen,
    popoverOpen,
    handleFocusNewItem,
    handleQueryChange,
    handleOpenChange,
    handlePageChange,
    handleChange,
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

import { useQuery } from '@tanstack/react-query';
import { createContext, Fragment, useCallback, useContext, useMemo, useState } from 'react';

import { listBingoTiles } from '@/api/bingo';

import type { BingoCardContextType, BingoCardProviderProps, TileCoordinates } from './types';
import ViewOrEditTileModal from './view-or-edit-tile-modal/view-or-edit-tile-modal';

const BingoCardContext = createContext<BingoCardContextType | undefined>(undefined);

export default function BingoCardProvider({ children, role, bingo, bingoTiles, readOnly }: BingoCardProviderProps) {
  const [dropTarget, setDropTarget] = useState<{ x: number; y: number } | null>(null);
  const [draggingTile, setDraggingTile] = useState<{ x: number; y: number } | null>(null);
  const [viewingOrEditingTile, viewOrEditTile] = useState<{ x: number; y: number } | null>(null);
  const [viewOrEditTileModalOpen, setViewOrEditTileModalOpen] = useState(false);

  const handleViewOrEditTile = useCallback((tile: TileCoordinates) => {
    viewOrEditTile(tile);
    setViewOrEditTileModalOpen(true);
  }, []);

  const handleCloseViewOrEditTileModal = useCallback(() => {
    setViewOrEditTileModalOpen(false);
    setTimeout(() => {
      viewOrEditTile(null);
    }, 200);
  }, []);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['bingo-tiles', bingo],
    queryFn: async () => {
      const response = await listBingoTiles(bingo.bingoId);
      if ('error' in response) return null;

      return response.data;
    },
    enabled: false,
    initialData: bingoTiles,
  });

  const handleRefetch = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const value = useMemo(
    () => ({
      role,
      bingo,
      bingoTiles: data,
      readOnly,
      dropTarget,
      isFetching,
      draggingTile,
      viewingOrEditingTile,
      setDropTarget,
      setDraggingTile,
      viewOrEditTile: handleViewOrEditTile,
      refetch: handleRefetch,
    }),
    [
      role,
      bingo,
      data,
      readOnly,
      dropTarget,
      isFetching,
      draggingTile,
      viewingOrEditingTile,
      handleViewOrEditTile,
      handleRefetch,
    ],
  );

  return (
    <BingoCardContext.Provider value={value}>
      <Fragment>{children(value)}</Fragment>
      <ViewOrEditTileModal open={viewOrEditTileModalOpen} onOpenChange={handleCloseViewOrEditTileModal} />
    </BingoCardContext.Provider>
  );
}

export function useBingoCard() {
  const context = useContext(BingoCardContext);
  if (!context) throw new Error('useBingoCard must be used within a BingoCardProvider');

  return context;
}

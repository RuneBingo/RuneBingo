import { type ReactNode, type SetStateAction } from 'react';
import { type Dispatch } from 'react';

import type { BingoDto, BingoRoles, BingoTileDto } from '@/api/types';

export type TileCoordinates = { x: number; y: number };

export type BingoCardContextType = {
  role: BingoRoles | undefined;
  bingo: BingoDto;
  bingoTiles: BingoTileDto[] | null;
  readOnly: boolean;
  isFetching: boolean;
  dropTarget: TileCoordinates | null;
  draggingTile: TileCoordinates | null;
  viewingOrEditingTile: TileCoordinates | null;
  setDraggingTile: Dispatch<SetStateAction<TileCoordinates | null>>;
  setDropTarget: Dispatch<SetStateAction<TileCoordinates | null>>;
  viewOrEditTile: (tile: TileCoordinates) => void;
  refetch: () => Promise<void>;
};

export type BingoCardProviderProps = {
  children: (value: BingoCardContextType) => ReactNode;
  role: BingoRoles | undefined;
  bingo: BingoDto;
  bingoTiles: BingoTileDto[] | null;
  readOnly: boolean;
};

export type BingoCardProps = Omit<BingoCardProviderProps, 'children'>;

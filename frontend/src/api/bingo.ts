import { _delete, get, put, type PaginatedQueryParams } from '.';
import type {
  BingoDto,
  BingoTileDto,
  CreateOrEditBingoTileDto,
  DetailedBingoTileDto,
  PaginatedBingosDto,
  UpdateBingoDto,
} from './types';

type SearchBingosParams = PaginatedQueryParams<{
  search?: string;
  status?: string;
  isPrivate?: boolean;
  participating?: boolean;
  limit?: number;
  offset?: number;
}>;

export async function searchBingos(params: SearchBingosParams) {
  const queryParams: Record<string, string> = {
    ...(params.search ? { search: params.search } : {}),
    ...(params.status !== undefined ? { status: params.status } : {}),
    ...(params.isPrivate !== undefined ? { isPrivate: params.isPrivate.toString() } : {}),
    ...(params.participating !== undefined ? { participating: params.participating.toString() } : {}),
    ...(params.limit !== undefined ? { limit: params.limit.toString() } : {}),
    ...(params.offset !== undefined ? { offset: params.offset.toString() } : {}),
  };

  const response = await get<PaginatedBingosDto>('/bingo', queryParams);
  if ('error' in response) {
    throw new Error(response.error);
  }

  return response.data;
}

export async function getBingo(bingoId: string) {
  return get<BingoDto>(`/bingo/${bingoId}`);
}

export async function listBingoTiles(bingoId: string) {
  return get<BingoTileDto[]>(`/bingo/${bingoId}/tile`);
}

export async function findBingoTileByCoordinates(bingoId: string, x: number, y: number) {
  return get<DetailedBingoTileDto>(`/bingo/${bingoId}/tile/${x}/${y}`);
}

export async function createOrEditBingoTile(bingoId: string, x: number, y: number, data: CreateOrEditBingoTileDto) {
  return put<CreateOrEditBingoTileDto, DetailedBingoTileDto>(`/bingo/${bingoId}/tile/${x}/${y}`, data);
}

export async function deleteBingoTile(bingoId: string, x: number, y: number) {
  return _delete(`/bingo/${bingoId}/tile/${x}/${y}`);
}

export async function moveBingoTile(bingoId: string, x: number, y: number, toX: number, toY: number) {
  return put<DetailedBingoTileDto>(`/bingo/${bingoId}/tile/${x}/${y}/move/${toX}/${toY}`);
}

export async function updateBingo(bingoId: string, updates: UpdateBingoDto) {
  return put<UpdateBingoDto, BingoDto>(`/bingo/${bingoId}`, updates);
}

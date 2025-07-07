import { get, post, put, type PaginatedQueryParams } from '.';
import type { BingoDto, CreateBingoDto, PaginatedBingosDto, UpdateBingoDto } from './types';

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

export async function updateBingo(bingoId: string, updates: UpdateBingoDto) {
  return put<UpdateBingoDto, BingoDto>(`/bingo/${bingoId}`, updates);
}

export async function createBingo(bingo: CreateBingoDto) {
  return post<CreateBingoDto, BingoDto>('/bingo', bingo);
}

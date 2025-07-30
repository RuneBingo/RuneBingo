import { _delete, execute, get, post, put, type PaginatedQueryParams } from '.';
import type {
  BingoDto,
  BingoParticipantDto,
  BingoRoles,
  BingoTeamDto,
  BingoTileDto,
  CreateBingoDto,
  CreateOrEditBingoTileDto,
  DetailedBingoTileDto,
  PaginatedBingoParticipantsDto,
  PaginatedBingosDto,
  ResetBingoDto,
  StartBingoDto,
  UpdateBingoDto,
  UpdateBingoParticipantDto,
} from './types';

//
// Bingo
//--------------------------------
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

export async function startBingo(bingoId: string, endDate?: string) {
  return post<StartBingoDto, BingoDto>(`/bingo/${bingoId}/start`, { endDate });
}

export async function endBingo(bingoId: string) {
  return post<void, BingoDto>(`/bingo/${bingoId}/end`);
}

export async function cancelBingo(bingoId: string) {
  return post<void, BingoDto>(`/bingo/${bingoId}/cancel`);
}

export async function deleteBingo(bingoId: string) {
  return _delete(`/bingo/${bingoId}`);
}

export async function resetBingo(bingoId: string, data: ResetBingoDto) {
  return post<ResetBingoDto, BingoDto>(`/bingo/${bingoId}/reset`, data);
}

//
// Bingo Participant
//--------------------------------
export type SearchBingoParticipantsParams = PaginatedQueryParams<{
  query?: string;
  team?: string;
  role?: BingoRoles;
  limit?: number;
  offset?: number;
  sort?: 'username' | 'role' | 'teamName';
  order?: 'ASC' | 'DESC';
}>;

export async function searchBingoParticipants(bingoId: string, params: SearchBingoParticipantsParams) {
  const queryParams: Record<string, string> = {
    ...(params.query ? { query: params.query } : {}),
    ...(params.team ? { team: params.team } : {}),
    ...(params.role ? { role: params.role } : {}),
    ...(params.limit !== undefined ? { limit: params.limit.toString() } : {}),
    ...(params.offset !== undefined ? { offset: params.offset.toString() } : {}),
    ...(params.sort ? { sort: params.sort } : {}),
    ...(params.order ? { order: params.order } : {}),
  };

  return get<PaginatedBingoParticipantsDto>(`/bingo/${bingoId}/participant`, queryParams);
}

export async function updateBingoParticipant(bingoId: string, username: string, updates: UpdateBingoParticipantDto) {
  return put<UpdateBingoParticipantDto, BingoParticipantDto>(`/bingo/${bingoId}/participant/${username}`, updates);
}

export async function kickBingoParticipant(bingoId: string, username: string, deleteTileCompletions: boolean) {
  return execute('DELETE', `/bingo/${bingoId}/participant/${username}/kick`, { deleteTileCompletions });
}

export async function leaveBingo(bingoId: string) {
  return _delete(`/bingo/${bingoId}/participant/leave`);
}

//
// Bingo Team
//--------------------------------
export async function searchBingoTeams(bingoId: string) {
  return get<BingoTeamDto[]>(`/bingo/${bingoId}/team`);
}

//
// Bingo Tile
//--------------------------------
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

export async function transferBingoOwnership(bingoId: string, username: string) {
  return post<void, BingoDto>(`/bingo/${bingoId}/participant/${username}/transfer-ownership`);
}

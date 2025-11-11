'use server';

import { getAuthenticatedUser, listMyBingos } from '@/api/auth';
import { getBingo, listBingoTiles, searchBingoTeams } from '@/api/bingo';

type FetchBingoDataOptions = {
  fetchTiles?: boolean;
  fetchTeams?: boolean;
};

export async function fetchBingoData(
  bingoId: string,
  { fetchTiles = false, fetchTeams = false }: FetchBingoDataOptions,
) {
  const [bingoResult, user, participations] = await Promise.all([
    getBingo(bingoId),
    getAuthenticatedUser(),
    listMyBingos(),
  ]);

  const bingo = 'data' in bingoResult ? bingoResult.data : null;

  if (!bingo) return null;

  const participant = participations?.find((participation) => participation.id === bingoId);
  const isCurrentBingo = user?.currentBingo?.id === bingoId;

  const tiles = await (async () => {
    if (!fetchTiles) return null;
    const tilesData = await listBingoTiles(bingoId);
    if ('error' in tilesData) return null;
    return tilesData.data;
  })();

  const teams = await (async () => {
    if (!fetchTeams) return null;
    const teamsData = await searchBingoTeams(bingoId);
    if ('error' in teamsData) return null;
    return teamsData.data;
  })();

  return { bingo, user, participant, isCurrentBingo, tiles, teams };
}

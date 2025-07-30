import { getAuthenticatedUser } from '@/api/auth';
import { getBingo, searchBingoParticipants, searchBingoTeams } from '@/api/bingo';
import type { BingoRoles } from '@/api/types';
import type { ServerSidePageProps } from '@/common/types';

import ParticipantsView from './participants-view';

type Params = {
  bingoId: string;
};

export default async function ParticipantsPage({ params }: ServerSidePageProps<Params>) {
  const { bingoId } = await params;
  const [bingoResult, user, teamsResult] = await Promise.all([
    getBingo(bingoId),
    getAuthenticatedUser(),
    searchBingoTeams(bingoId),
  ]);

  if (!bingoResult || 'error' in bingoResult) {
    return <div>Bingo not found</div>;
  }

  const bingo = bingoResult.data;
  const teams = teamsResult && 'data' in teamsResult ? teamsResult.data : [];

  let userRole: BingoRoles | undefined;
  if (user) {
    const participant = await searchBingoParticipants(bingoId, { query: user.username });
    if (participant && 'data' in participant && participant.data.items.length > 0) {
      userRole = participant.data.items[0].role;
    }
  }

  return <ParticipantsView bingo={bingo} userRole={userRole} teams={teams} user={user} />;
}

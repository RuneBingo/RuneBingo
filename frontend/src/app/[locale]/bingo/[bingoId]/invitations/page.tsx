import { getAuthenticatedUser } from '@/api/auth';
import { getBingo, searchBingoTeams } from '@/api/bingo';
import type { BingoRoles } from '@/api/types';
import type { ServerSidePageProps } from '@/common/types';

import InvitationsView from './invitations-view';

type Params = {
  bingoId: string;
};

export default async function InvitationsPage({ params }: ServerSidePageProps<Params>) {
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
  // for now assume backend will return role in authenticated user session, else fetch participant list
  if (user && user.currentBingo && user.currentBingo.id === bingoId) {
    userRole = user.currentBingo.role as BingoRoles;
  }

  return <InvitationsView bingo={bingo} userRole={userRole} teams={teams} user={user} />;
}

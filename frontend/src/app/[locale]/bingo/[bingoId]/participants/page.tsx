import { notFound } from 'next/navigation';

import { fetchBingoData } from '@/common/bingo/fetch-bingo-data';
import type { ServerSidePageProps } from '@/common/types';

import View from './view';

type Params = {
  bingoId: string;
};

export default async function ParticipantsPage({ params }: ServerSidePageProps<Params>) {
  const { bingoId } = await params;

  const data = await fetchBingoData(bingoId, { fetchTeams: true });
  if (!data) notFound();

  const { user, bingo, participant, isCurrentBingo, teams } = data;

  return (
    <View bingo={bingo} role={participant?.role} teams={teams ?? []} user={user} isCurrentBingo={isCurrentBingo} />
  );
}

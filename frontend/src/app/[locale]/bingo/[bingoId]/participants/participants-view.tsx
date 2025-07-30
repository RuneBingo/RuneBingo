'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { SearchBingoParticipantsParams } from '@/api/bingo';
import type { BingoDto, BingoRoles, BingoTeamDto, AuthenticationDetailsDto } from '@/api/types';
import ParticipantsTable from '@/common/participants/participants-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/ui/card';
import { Input } from '@/design-system/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/design-system/ui/select';

type ParticipantsViewProps = {
  bingo: BingoDto;
  userRole?: BingoRoles;
  teams: BingoTeamDto[];
  user: AuthenticationDetailsDto | null;
};

export default function ParticipantsView({ bingo, userRole, teams, user }: ParticipantsViewProps) {
  const [queryParams, setQueryParams] = useState<SearchBingoParticipantsParams>({});
  const t = useTranslations('bingo-participant');

  const handleSearchChange = (value: string) => {
    setQueryParams((prev) => ({ ...prev, query: value || undefined }));
  };

  const handleRoleChange = (value: string) => {
    setQueryParams((prev) => ({ ...prev, role: value === 'all' ? undefined : (value as BingoRoles) }));
  };

  const handleTeamChange = (value: string) => {
    setQueryParams((prev) => ({ ...prev, team: value === 'all' ? undefined : value }));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{bingo.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                placeholder={t('search_placeholder')}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex">
              <Select onValueChange={handleRoleChange} defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('roles.all')}</SelectItem>
                  <SelectItem value="owner">{t('roles.owner')}</SelectItem>
                  <SelectItem value="organizer">{t('roles.organizer')}</SelectItem>
                  <SelectItem value="participant">{t('roles.participant')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex">
              <Select onValueChange={handleTeamChange} defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('teams.all')}</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.name} value={team.name}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ParticipantsTable
            bingo={bingo}
            bingoId={bingo.bingoId}
            userRole={userRole}
            queryParams={queryParams}
            user={user}
            teams={teams}
          />
        </CardContent>
      </Card>
    </div>
  );
}

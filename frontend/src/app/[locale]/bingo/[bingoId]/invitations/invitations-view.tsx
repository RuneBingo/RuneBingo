'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { SearchBingoInvitationsParams } from '@/api/bingo';
import type { BingoDto, BingoRoles, AuthenticationDetailsDto, BingoInvitationStatus, BingoTeamDto } from '@/api/types';
import InvitationLinksTable from '@/common/invitations/invitation-links-table';
import InvitationsTable from '@/common/invitations/invitations-table';
import InviteParticipantsModal from '@/common/invitations/invite-participants-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/ui/card';
import { Input } from '@/design-system/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/design-system/ui/select';

type InvitationsViewProps = {
  bingo: BingoDto;
  userRole?: BingoRoles;
  teams: BingoTeamDto[];
  user: AuthenticationDetailsDto | null;
};

export default function InvitationsView({ bingo, userRole, teams, user }: InvitationsViewProps) {
  const [queryParams, setQueryParams] = useState<SearchBingoInvitationsParams>({});
  const [activeTab, setActiveTab] = useState('direct');
  const t = useTranslations('bingo-invitation');

  const handleSearchChange = (value: string) => {
    setQueryParams((prev) => ({ ...prev, query: value || undefined }));
  };

  const handleRoleChange = (value: string) => {
    setQueryParams((prev) => ({ ...prev, role: value === 'all' ? undefined : (value as BingoRoles) }));
  };

  const handleStatusChange = (value: string) => {
    setQueryParams((prev) => ({ ...prev, status: value === 'all' ? undefined : (value as BingoInvitationStatus) }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <InviteParticipantsModal bingoId={bingo.bingoId} teams={[]} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{bingo.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <div className="grid w-full grid-cols-2 rounded-md bg-muted p-1 text-muted-foreground">
              <button
                onClick={() => setActiveTab('direct')}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  activeTab === 'direct' ? 'bg-background text-foreground shadow-sm' : ''
                }`}
              >
                {t('direct_tab')}
              </button>
              <button
                onClick={() => setActiveTab('links')}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  activeTab === 'links' ? 'bg-background text-foreground shadow-sm' : ''
                }`}
              >
                {t('links_tab')}
              </button>
            </div>

            {activeTab === 'direct' && (
              <div className="mt-2 space-y-4">
                <div className="flex items-center gap-2">
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
                  <Select onValueChange={handleRoleChange} defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('roles.all')}</SelectItem>
                      <SelectItem value="organizer">{t('roles.organizer')}</SelectItem>
                      <SelectItem value="participant">{t('roles.participant')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select onValueChange={handleStatusChange} defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('statuses.all')}</SelectItem>
                      <SelectItem value="pending">{t('statuses.pending')}</SelectItem>
                      <SelectItem value="accepted">{t('statuses.accepted')}</SelectItem>
                      <SelectItem value="declined">{t('statuses.declined')}</SelectItem>
                      <SelectItem value="canceled">{t('statuses.canceled')}</SelectItem>
                      <SelectItem value="disabled">{t('statuses.disabled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <InvitationsTable bingoId={bingo.bingoId} userRole={userRole} queryParams={queryParams} user={user} />
              </div>
            )}

            {activeTab === 'links' && (
              <div className="mt-2 space-y-4">
                <div className="flex items-center gap-2">
                  <Select onValueChange={handleRoleChange} defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('roles.all')}</SelectItem>
                      <SelectItem value="organizer">{t('roles.organizer')}</SelectItem>
                      <SelectItem value="participant">{t('roles.participant')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <InvitationLinksTable
                  bingoId={bingo.bingoId}
                  t={(key) => t(`table.${key}`)}
                  userRole={userRole}
                  teams={teams}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

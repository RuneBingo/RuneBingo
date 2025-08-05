'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Link as LinkIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import { createBingoInvitation } from '@/api/bingo';
import type { BingoTeamDto, CreateBingoInvitationDto } from '@/api/types';
import { BingoRoles } from '@/api/types';
import { Button } from '@/design-system/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/design-system/ui/dialog';
import { Input } from '@/design-system/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/design-system/ui/select';
// Types

type Props = {
  bingoId: string;
  teams: BingoTeamDto[];
};

export default function InviteParticipantsModal({ bingoId, teams }: Props) {
  const t = useTranslations('bingo-invitation');
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<BingoRoles>(BingoRoles.Participant);
  const [teamName, setTeamName] = useState<string | undefined>();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateBingoInvitationDto) => createBingoInvitation(bingoId, data),
    onSuccess: (res) => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['bingo-invitations'] });
      if ('data' in res) {
        navigator.clipboard.writeText(res.data.code).catch(() => null);
        toast(t('invite_copied'));
      }
    },
    onError: () => {
      toast(t('error'));
    },
  });

  const handleSubmit = () => {
    mutation.mutate({
      username: username || undefined,
      role,
      teamName: teamName || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <Plus className="size-4" /> {t('invite_participants')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('invite_participants')}</DialogTitle>
          <DialogDescription>{t('invite_description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder={t('username_placeholder')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Select defaultValue={role} onValueChange={(v) => setRole(v as BingoRoles)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="participant">{t('roles.participant')}</SelectItem>
              <SelectItem value="organizer">{t('roles.organizer')}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            defaultValue={teamName ?? 'no-team'}
            onValueChange={(v) => setTeamName(v === 'no-team' ? undefined : v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-team">{t('teams.no_team')}</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.name} value={team.name}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={mutation.isPending}>
              {username ? (
                t('invite')
              ) : (
                <span className="flex items-center gap-1">
                  <LinkIcon className="size-4" /> {t('generate_link')}
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

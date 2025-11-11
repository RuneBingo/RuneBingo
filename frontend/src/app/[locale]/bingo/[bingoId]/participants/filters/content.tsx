import { useTranslations } from 'next-intl';
import { type Dispatch, Fragment, type SetStateAction } from 'react';

import { type SearchBingoParticipantsParams } from '@/api/bingo';
import { BingoRoles, type BingoTeamDto } from '@/api/types';
import SearchInput from '@/design-system/components/search-input';
import SelectField from '@/design-system/components/select-field';

type ContentProps = {
  teams: BingoTeamDto[];
  queryParams: SearchBingoParticipantsParams;
  setQueryParams: Dispatch<SetStateAction<SearchBingoParticipantsParams>>;
};

export default function Content({ teams, queryParams, setQueryParams }: ContentProps) {
  const t = useTranslations('bingo-participant.filters');
  const tBingo = useTranslations('bingo');

  const handleSearchChange = (value: string) => {
    setQueryParams((prev) => ({ ...prev, query: value || undefined }));
  };

  const handleRoleChange = (value: string) => {
    setQueryParams((prev) => ({ ...prev, role: value === 'all' ? undefined : (value as BingoRoles) }));
  };

  const handleTeamChange = (value: string) => {
    setQueryParams((prev) => ({ ...prev, team: value === 'all' ? undefined : value }));
  };

  const rolesOptions = [
    { label: t('allRoles'), value: 'all' },
    ...Object.values(BingoRoles).map((role) => ({ label: tBingo(`roles.${role}`), value: role })),
  ];

  const teamsOptions = [
    { label: t('allTeams'), value: 'all' },
    ...teams.map((team) => ({ label: team.name, value: team.name })),
  ];

  return (
    <Fragment>
      <SearchInput value={queryParams.query || ''} onChange={handleSearchChange} placeholder={t('search')} />
      <SelectField options={rolesOptions} value={queryParams.role || 'all'} onChange={handleRoleChange} />
      <SelectField options={teamsOptions} value={queryParams.team || 'all'} onChange={handleTeamChange} />
    </Fragment>
  );
}

import { type BingoParticipant } from '@/bingo/participant/bingo-participant.entity';

import { bingoRoleHierarchy, type BingoRoles } from './bingo-roles.constants';

export function participantHasBingoRole(bingoParticipant: BingoParticipant, bingoRole: BingoRoles) {
  return bingoRoleHierarchy.indexOf(bingoParticipant.role) >= bingoRoleHierarchy.indexOf(bingoRole);
}

export function isBingoRoleHigher(a: BingoRoles, b: BingoRoles) {
  return bingoRoleHierarchy.indexOf(a) > bingoRoleHierarchy.indexOf(b);
}

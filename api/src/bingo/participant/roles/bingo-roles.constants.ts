export enum BingoRoles {
  Participant = 'participant',
  Organizer = 'organizer',
  Owner = 'owner',
}

export const BingoRolePriority: Record<BingoRoles, number> = {
  [BingoRoles.Participant]: 1,
  [BingoRoles.Organizer]: 2,
  [BingoRoles.Owner]: 3,
};

export const bingoRoleHierarchy = [BingoRoles.Participant, BingoRoles.Organizer, BingoRoles.Owner] as const;

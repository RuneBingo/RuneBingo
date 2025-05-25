export enum BingoRoles {
  Participant = 'participant',
  Organizer = 'organizer',
  Owner = 'owner',
}

export const bingoRoleHierarchy = [BingoRoles.Participant, BingoRoles.Organizer, BingoRoles.Owner] as const;

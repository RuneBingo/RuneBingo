/* This file is auto-generated. Do not edit it manually. */

export enum BingoStatus {
  Pending = 'pending',
  Ongoing = 'ongoing',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum BingoRoles {
  Participant = 'participant',
  Organizer = 'organizer',
  Owner = 'owner',
}

export enum Roles {
  User = 'user',
  Moderator = 'moderator',
  Admin = 'admin',
}

export type UserDto = {
  username: string;
  usernameNormalized: string;
  gravatarHash: string | null;
  language: string;
  role: string;
};

export type UpdateUserDto = {
  username?: string;
  language?: string;
  role?: Roles;
};

export type PaginatedUsersDto = {
  items: UserDto[];
};

export type PaginatedDto<T extends object> = {
  items: T[];
  limit: number;
  offset: number;
  total: number;
};

export type PaginatedDtoWithoutTotal<T extends object> = {
  items: T[];
  limit: number;
  offset: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type BingoTeamDto = {
  name: string;
  nameNormalized: string;
  captain: UserDto | null;
  points: number;
};

export type UpdateBingoParticipantDto = {
  teamName?: string;
  role?: BingoRoles;
};

export type PaginatedBingoParticipantsDto = {
  items: BingoParticipantDto[];
};

export type BingoParticipantDto = {
  teamName: string | null;
  teamNameNormalized: string | null;
  user: UserDto | null;
  role: string;
};

export type UpdateBingoDto = {
  language: string;
  title: string;
  description: string;
  private: boolean;
  fullLineValue: number;
  startDate: string;
  endDate: string;
  maxRegistrationDate: string;
};

export type ShortBingoDto = {
  id: string;
  title: string;
  status: BingoStatus;
  role: BingoRoles;
};

export type PaginatedBingosDto = {
  items: BingoDto[];
};

export type CreateBingoDto = {
  language: string;
  title: string;
  description: string;
  private: boolean;
  width: number;
  height: number;
  fullLineValue: number;
  startDate: string;
  endDate: string;
  maxRegistrationDate: string;
};

export type BingoDto = {
  createdBy: UserDto | undefined;
  updatedBy: UserDto | undefined;
  language: string;
  title: string;
  bingoId: string;
  description: string;
  status: BingoStatus;
  private: boolean;
  width: number;
  height: number;
  fullLineValue: number;
  startDate: string;
  endDate: string;
  startedAt: Date | null;
  startedBy: UserDto | undefined;
  endedAt: Date | null;
  endedBy: UserDto | undefined;
  canceledAt: Date | null;
  canceledBy: UserDto | undefined;
  deletedBy: UserDto | undefined;
  maxRegistrationDate?: string;
};

export type VerifyAuthCodeDto = {
  email: string;
  code: string;
};

export type SignUpWithEmailDto = {
  email: string;
  username: string;
};

export type SignInWithEmailDto = {
  email: string;
};

export type SetCurrentBingoDto = {
  bingoId: string;
};

export type AuthenticationDetailsDto = {
  username: string;
  usernameNormalized: string;
  gravatarHash: string | null;
  language: string;
  role: string;
  hasBingos: boolean;
  currentBingo: ShortBingoDto | null;
};

export type PaginatedActivitiesDto = {
  items: ActivityDto[];
};

export type ActivityDto = {
  createdBy: UserDto | null;
  createdAt: Date;
  key: string;
  title: string;
  body?: string | string[];
};

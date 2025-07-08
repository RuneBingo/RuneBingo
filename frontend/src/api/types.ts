/* This file is auto-generated. Do not edit it manually. */

export enum BingoStatus {
  Pending = 'pending',
  Ongoing = 'ongoing',
  Completed = 'completed',
  Canceled = 'canceled',
}

export enum BingoTileCompletionMode {
  /** All associated items must be obtained for the tile to be completed */
  All = 'all',
  /** Any associated item must be obtained for the tile to be completed */
  Any = 'any',
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

export type PaginatedUsersDto = PaginatedDtoWithoutTotal<UserDto> & {
  items: UserDto[];
};

export type PaginatedOsrsItemsDto = PaginatedDto<OsrsItemDto> & {
  items: OsrsItemDto[];
};

export type OsrsItemDto = {
  id: number;
  name: string;
  configName: string;
  exchangeable: boolean;
  members: boolean;
  examine: string;
  iconUrl: string;
  imageUrl: string;
};

export type UploadMediaDto = {
  file: File;
};

export type MediaDto = {
  id: string;
  url: string;
  format: string;
  originalName: string;
  size: number;
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | UserDto;
  updatedBy?: UserDto;
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

export type DetailedBingoTileDto = {
  x: number;
  y: number;
  value: number;
  free: boolean;
  title: string;
  description: string;
  completionMode: BingoTileCompletionMode;
  media: MediaDto | null;
  imageUrl: string | null;
  items: BingoTileItemDto[];
};

export type CreateOrEditBingoTileItemDto = {
  itemId: number;
  quantity: number;
};

export type CreateOrEditBingoTileDto = {
  title?: string;
  description?: string;
  value?: number;
  free?: boolean;
  completionMode?: BingoTileCompletionMode;
  mediaId?: string | null;
  imageUrl?: string | null;
  items?: CreateOrEditBingoTileItemDto[];
};

export type BingoTileDto = {
  x: number;
  y: number;
  value: number;
  free: boolean;
  title: string;
  description: string;
  media: MediaDto | null;
  imageUrl: string | null;
};

export type BingoTileItemDto = {
  index: number;
  quantity: number;
  item: OsrsItemDto;
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

export type PaginatedBingoParticipantsDto = PaginatedDtoWithoutTotal<BingoParticipantDto> & {
  items: BingoParticipantDto[];
};

export type BingoParticipantDto = {
  teamName: string | null;
  teamNameNormalized: string | null;
  user: UserDto | null;
  role: string;
};

export type UpdateBingoDto = {
  language?: string;
  title?: string;
  description?: string;
  private?: boolean;
  width?: number;
  height?: number;
  fullLineValue?: number;
  startDate?: string;
  endDate?: string;
  maxRegistrationDate?: string;
  confirmTileDeletion?: boolean;
};

export type ShortBingoDto = {
  id: string;
  title: string;
  status: BingoStatus;
  role: BingoRoles;
};

export type PaginatedBingosDto = PaginatedDtoWithoutTotal<BingoDto> & {
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

export type PaginatedActivitiesDto = PaginatedDtoWithoutTotal<ActivityDto> & {
  items: ActivityDto[];
};

export type ActivityDto = {
  createdBy: UserDto | null;
  createdAt: Date;
  key: string;
  title: string;
  body?: string | string[];
};

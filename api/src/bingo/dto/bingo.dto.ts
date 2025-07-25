import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from '@/user/dto/user.dto';

import { BingoStatus } from '../bingo-status.enum';
import { Bingo } from '../bingo.entity';

export class BingoDto {
  constructor(
    bingo: Bingo,
    users?: {
      createdBy?: UserDto;
      startedBy?: UserDto;
      endedBy?: UserDto;
      canceledBy?: UserDto;
      deletedBy?: UserDto;
      resetBy?: UserDto;
    },
  ) {
    this.language = bingo.language;
    this.title = bingo.title;
    this.bingoId = bingo.bingoId;
    this.description = bingo.description;
    this.status = bingo.status;
    this.private = bingo.private;
    this.width = bingo.width;
    this.height = bingo.height;
    this.fullLineValue = bingo.fullLineValue;
    this.startDate = bingo.startDate;
    this.endDate = bingo.endDate;
    this.createdBy = users?.createdBy;
    this.startedAt = bingo.startedAt;
    this.startedBy = users?.startedBy;
    this.endedAt = bingo.endedAt;
    this.maxRegistrationDate = bingo.maxRegistrationDate;
    this.endedBy = users?.endedBy;
    this.canceledAt = bingo.canceledAt;
    this.canceledBy = users?.canceledBy;
    this.deletedBy = users?.deletedBy;
    this.resetAt = bingo.resetAt;
    this.resetBy = users?.resetBy;
  }

  @ApiProperty()
  createdBy: UserDto | undefined;

  @ApiProperty()
  updatedBy: UserDto | undefined;

  @ApiProperty()
  language: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  bingoId: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: BingoStatus })
  status: BingoStatus;

  @ApiProperty()
  private: boolean;

  @ApiProperty()
  width: number;

  @ApiProperty()
  height: number;

  @ApiProperty()
  fullLineValue: number;

  @ApiProperty()
  startDate: string;

  @ApiProperty()
  endDate: string;

  @ApiProperty()
  startedAt: Date | null;

  @ApiProperty()
  startedBy: UserDto | undefined;

  @ApiProperty()
  endedAt: Date | null;

  @ApiProperty()
  endedBy: UserDto | undefined;

  @ApiProperty()
  canceledAt: Date | null;

  @ApiProperty()
  canceledBy: UserDto | undefined;

  @ApiProperty()
  deletedBy: UserDto | undefined;

  @ApiProperty()
  resetAt: Date | null;

  @ApiProperty()
  resetBy: UserDto | undefined;

  @ApiProperty()
  maxRegistrationDate?: string;
}

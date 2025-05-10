import { SetMetadata } from '@nestjs/common';

import { type BingoRoles } from './bingo-roles.constants';

export const BingoRole = (bingoRole: BingoRoles) => SetMetadata('bingoRole', bingoRole);

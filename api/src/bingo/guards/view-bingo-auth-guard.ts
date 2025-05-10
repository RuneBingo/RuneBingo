import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Bingo } from '../bingo.entity';
import { Repository } from 'typeorm';
import { BingoParticipant } from '@/bingo-participant/bingo-participant.entity';
import { userHasRole } from '@/auth/roles/roles.utils';
import { Roles } from '@/auth/roles/roles.constants';
import { BingoRequest } from './bingo-request';

@Injectable()
export class ViewBingoAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantsRepository: Repository<BingoParticipant>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<BingoRequest>();
    const user = request.userEntity;
    const slug = request.params.slug;

    if (!slug) {
      throw new NotFoundException();
    }

    const bingo = await this.bingoRepository.findOneBy({ slug });

    if (!bingo) {
      throw new NotFoundException();
    }

    request.bingo = bingo;

    if (!bingo.private) {
      return true;
    }

    if (user && userHasRole(user, Roles.Moderator)) {
      return true;
    }

    if (!user && bingo.private) {
      throw new NotFoundException();
    }

    if (user) {
      const bingoParticipant = await this.bingoParticipantsRepository.findOneBy({
        bingoId: bingo.id,
        userId: user.id,
      });

      if (bingoParticipant) {
        request.bingoParticipant = bingoParticipant;
        return true;
      }
    }

    throw new NotFoundException();
  }
}

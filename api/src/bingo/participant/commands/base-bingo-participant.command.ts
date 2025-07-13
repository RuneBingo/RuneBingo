import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { In, Repository } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { ViewBingoScope } from '@/bingo/scopes/view-bingo.scope';
import { BingoTeam } from '@/bingo/team/bingo-team.entity';
import { I18nTranslations } from '@/i18n/types';
import { User } from '@/user/user.entity';

import { BingoParticipant } from '../bingo-participant.entity';

export class BaseUpdateBingoParticipantHandler {
  constructor(
    @InjectRepository(Bingo)
    protected readonly bingoRepository: Repository<Bingo>,
    @InjectRepository(BingoParticipant)
    protected readonly bingoParticipantRepository: Repository<BingoParticipant>,
    @InjectRepository(BingoTeam)
    protected readonly bingoTeamRepository: Repository<BingoTeam>,
    protected readonly i18nService: I18nService<I18nTranslations>,
  ) {}

  protected async findBingo(requester: User, bingoId: string) {
    const scope = new ViewBingoScope(
      requester,
      this.bingoRepository.createQueryBuilder('bingo').where('bingo.bingo_id = :bingoId', { bingoId }),
    ).resolve();

    return scope.getOne();
  }

  protected async getRequesterAndParticipantToUpdate(bingoId: number, requester: User, username: string) {
    const usernameNormalized = User.normalizeUsername(username);

    const participants = await this.bingoParticipantRepository.find({
      where: {
        bingoId,
        user: { usernameNormalized: In([requester.usernameNormalized, usernameNormalized]) },
      },
      relations: ['user'],
    });

    let requesterParticipant: BingoParticipant | undefined;
    let participantToUpdate: BingoParticipant | undefined;

    for (const participant of participants) {
      const user = await participant.user;
      if (user.usernameNormalized === usernameNormalized) participantToUpdate = participant;
      if (user.usernameNormalized === requester.usernameNormalized) requesterParticipant = participant;
    }

    return { requesterParticipant, participantToUpdate };
  }
}

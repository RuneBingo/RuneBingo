import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { FindBingoByBingoIdQuery } from '@/bingo/queries/find-bingo-by-bingo-id.query';
import { type I18nTranslations } from '@/i18n/types';
import { type User } from '@/user/user.entity';

import { Session } from '../session.entity';
import { SessionPolicies } from '../session.policies';

export type SetSessionCurrentBingoParams = {
  uuid: string;
  requester: User;
  bingoId: string;
};

export type SetSessionCurrentBingoResult = Session | null;

export class SetSessionCurrentBingoCommand extends Command<SetSessionCurrentBingoResult> {
  public readonly uuid: string;
  public readonly requester: User;
  public readonly bingoId: string;

  constructor({ uuid, requester, bingoId }: SetSessionCurrentBingoParams) {
    super();

    this.uuid = uuid;
    this.requester = requester;
    this.bingoId = bingoId;
  }
}

@CommandHandler(SetSessionCurrentBingoCommand)
export class SetSessionCurrentBingoHandler {
  constructor(
    private readonly i18nService: I18nService<I18nTranslations>,
    private readonly queryBus: QueryBus,
    @InjectRepository(Session) private readonly sessionRepository: Repository<Session>,
  ) {}

  async execute(command: SetSessionCurrentBingoCommand): Promise<SetSessionCurrentBingoResult> {
    const { uuid, requester, bingoId } = command;

    const session = await this.sessionRepository.findOneBy({ uuid });
    if (!session) {
      throw new NotFoundException(this.i18nService.t('session.setSessionCurrentBingo.sessionNotFound'));
    }

    if (session.isSignedOut) {
      throw new ForbiddenException(this.i18nService.t('session.setSessionCurrentBingo.sessionSignedOut'));
    }

    if (!new SessionPolicies(requester).canSetCurrentBingo(session)) {
      throw new ForbiddenException(this.i18nService.t('session.setSessionCurrentBingo.cantSetCurrentBingo'));
    }

    const sessionUser = await session.user;

    const participatingBingo = await this.queryBus.execute(
      new FindBingoByBingoIdQuery({ bingoId, requester: sessionUser, participating: true }),
    );

    if (!participatingBingo) {
      throw new NotFoundException(this.i18nService.t('session.setSessionCurrentBingo.bingoNotFound'));
    }

    session.currentBingoId = participatingBingo.id;
    session.updatedById = requester.id;

    return this.sessionRepository.save(session);
  }
}

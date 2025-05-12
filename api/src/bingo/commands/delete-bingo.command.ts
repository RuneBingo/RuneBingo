import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { DataSource, Repository } from 'typeorm';

import { BingoParticipant } from '@/bingo-participant/bingo-participant.entity';
import { I18nTranslations } from '@/i18n/types';
import { User } from '@/user/user.entity';

import { Bingo } from '../bingo.entity';
import { BingoPolicies } from '../bingo.policies';
import { BingoDeletedEvent } from '../events/bingo-deleted.event';

export type DeleteBingoParams = {
  requester: User;
  bingoId: string;
};

export type DeleteBingoResult = Bingo;

export class DeleteBingoCommand extends Command<DeleteBingoResult> {
  constructor(public readonly params: DeleteBingoParams) {
    super();
  }
}

@CommandHandler(DeleteBingoCommand)
export class DeleteBingoHandler {
  constructor(
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
    private readonly i18nService: I18nService<I18nTranslations>,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteBingoCommand): Promise<DeleteBingoResult> {
    const { requester, bingoId } = command.params;

    const bingo = await this.bingoRepository.findOneBy({ bingoId });

    if (!bingo) {
      throw new NotFoundException(this.i18nService.t('bingo.deleteBingo.bingoNotFound'));
    }

    const bingoParticipant = await this.bingoParticipantRepository.findOneBy({
      bingoId: bingo.id,
      userId: requester.id,
    });

    if (!new BingoPolicies(requester).canDelete(bingoParticipant)) {
      throw new ForbiddenException(this.i18nService.t('bingo.deleteBingo.forbidden'));
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from('bingo_participant')
        .where('bingoId = :bingoId', { bingoId: bingo.id })
        .execute();

      bingo.deletedAt = new Date();
      bingo.deletedById = requester.id;

      await queryRunner.manager.save(bingo);
      await queryRunner.commitTransaction();

      this.eventBus.publish(new BingoDeletedEvent({ bingoId: bingo.id, requesterId: requester.id }));
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    return bingo;
  }
}

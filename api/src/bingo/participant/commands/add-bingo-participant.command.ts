import { ConflictException } from '@nestjs/common';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { I18nTranslations } from '@/i18n/types';
import { User } from '@/user/user.entity';

import { BingoParticipant } from '../bingo-participant.entity';
import { BingoParticipantAddedEvent } from '../events/bingo-participant-added.event';
import { BingoRoles } from '../roles/bingo-roles.constants';

export type AddBingoParticipantParams = {
  requester: User | null;
  bingo: Bingo;
  user: User;
  role: BingoRoles;
};

export type AddBingoParticipantResult = BingoParticipant;

export class AddBingoParticipantCommand extends Command<BingoParticipant> {
  constructor(public readonly params: AddBingoParticipantParams) {
    super();
  }
}

@CommandHandler(AddBingoParticipantCommand)
export class AddBingoParticipantHandler {
  constructor(
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
    private readonly eventBus: EventBus,
    private readonly i18nService: I18nService<I18nTranslations>,
  ) {}

  async execute(command: AddBingoParticipantCommand): Promise<AddBingoParticipantResult> {
    const { requester, bingo, user, role } = command.params;

    const existingParticipant = await this.bingoParticipantRepository.findOneBy({ userId: user.id, bingoId: bingo.id });

    if (existingParticipant) {
      throw new ConflictException(this.i18nService.t('bingo-participant.addBingoParticipants.conflict'));
    }

    const bingoParticipant = new BingoParticipant();
    bingoParticipant.userId = user.id;
    bingoParticipant.bingoId = bingo.id;
    bingoParticipant.role = role;

    this.eventBus.publish(
      new BingoParticipantAddedEvent({
        bingoId: bingo.id,
        requesterId: requester ? requester.id : null,
        userId: user.id,
        role: role,
      }),
    );

    return await this.bingoParticipantRepository.save(bingoParticipant);
  }
}

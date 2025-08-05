import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { I18nTranslations } from '@/i18n/types';

import { BingoInvitation } from '../bingo-invitation.entity';
import { CancelBingoInvitationCommand } from './cancel-bingo-invitation.command';
import { BingoInvitationStatus } from '../bingo-invitation-status.enum';
import { BingoInvitationPolicies } from '../bingo-invitation.policies';

@CommandHandler(CancelBingoInvitationCommand)
export class CancelBingoInvitationHandler {
  constructor(
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    @InjectRepository(BingoParticipant)
    private readonly participantRepository: Repository<BingoParticipant>,
    @InjectRepository(BingoInvitation)
    private readonly invitationRepository: Repository<BingoInvitation>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async execute(command: CancelBingoInvitationCommand): Promise<void> {
    const { requester, bingoId, code } = command.params;

    const bingo = await this.bingoRepository.findOne({ where: { bingoId } });
    if (!bingo) throw new NotFoundException();

    const requesterParticipant = await this.participantRepository.findOne({
      where: { bingoId: bingo.id, userId: requester.id },
    });
    if (!requesterParticipant || !BingoInvitationPolicies.canCancelInvitation(requesterParticipant)) {
      throw new ForbiddenException();
    }

    const invitation = await this.invitationRepository.findOne({ where: { bingoId: bingo.id, code } });
    if (!invitation) throw new NotFoundException();

    invitation.status = BingoInvitationStatus.Canceled;
    await this.invitationRepository.save(invitation);
  }
}

import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { BingoTeam } from '@/bingo/team/bingo-team.entity';
import { I18nTranslations } from '@/i18n/types';

import { BingoInvitation } from '../bingo-invitation.entity';
import { BingoInvitationPolicies } from '../bingo-invitation.policies';
import { UpdateBingoInvitationCommand } from './update-bingo-invitation.command';

@CommandHandler(UpdateBingoInvitationCommand)
export class UpdateBingoInvitationHandler {
  constructor(
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    @InjectRepository(BingoParticipant)
    private readonly participantRepository: Repository<BingoParticipant>,
    @InjectRepository(BingoInvitation)
    private readonly invitationRepository: Repository<BingoInvitation>,
    @InjectRepository(BingoTeam)
    private readonly teamRepository: Repository<BingoTeam>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async execute(command: UpdateBingoInvitationCommand): Promise<BingoInvitation> {
    const { requester, bingoId, code, role, teamName } = command.params;

    const bingo = await this.bingoRepository.findOne({ where: { bingoId } });
    if (!bingo) {
      throw new NotFoundException(this.i18n.t('bingo-invitation.update.bingoNotFound' as never));
    }

    // Fetch requester participant to enforce permissions
    const requesterParticipant = await this.participantRepository.findOne({
      where: { bingoId: bingo.id, userId: requester.id },
    });
    if (!requesterParticipant || !BingoInvitationPolicies.canCreateInvitation(requesterParticipant)) {
      throw new ForbiddenException();
    }

    const invitation = await this.invitationRepository.findOne({
      where: { code, bingoId: bingo.id },
    });
    if (!invitation) {
      throw new NotFoundException(this.i18n.t('bingo-invitation.update.invitationNotFound' as never));
    }

    // Update role if provided
    if (role !== undefined) {
      invitation.role = role;
    }

    // Update team if provided
    if (teamName !== undefined) {
      if (teamName) {
        const team = await this.teamRepository.findOne({
          where: { bingoId: bingo.id, nameNormalized: BingoTeam.normalizeName(teamName) },
        });
        if (!team) {
          throw new NotFoundException(this.i18n.t('bingo-invitation.update.teamNotFound' as never));
        }
        invitation.teamId = team.id;
      } else {
        invitation.teamId = null;
      }
    }

    return this.invitationRepository.save(invitation);
  }
}

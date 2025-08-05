import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { BingoRoles } from '@/bingo/participant/roles/bingo-roles.constants';
import { BingoTeam } from '@/bingo/team/bingo-team.entity';
import { I18nTranslations } from '@/i18n/types';
import { User } from '@/user/user.entity';

import { BingoInvitationStatus } from '../bingo-invitation-status.enum';
import { BingoInvitation } from '../bingo-invitation.entity';
import { BingoInvitationPolicies } from '../bingo-invitation.policies';
import { CreateBingoInvitationCommand } from './create-bingo-invitation.command';

@CommandHandler(CreateBingoInvitationCommand)
export class CreateBingoInvitationHandler {
  constructor(
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    @InjectRepository(BingoParticipant)
    private readonly participantRepository: Repository<BingoParticipant>,
    @InjectRepository(BingoInvitation)
    private readonly invitationRepository: Repository<BingoInvitation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BingoTeam)
    private readonly teamRepository: Repository<BingoTeam>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async execute(command: CreateBingoInvitationCommand): Promise<BingoInvitation> {
    const { requester, bingoId, username, role, teamName } = command.params;

    const bingo = await this.bingoRepository.findOne({ where: { bingoId } });
    if (!bingo) {
      throw new NotFoundException(this.i18n.t('bingo-invitation.create.bingoNotFound' as never));
    }

    // Fetch requester participant to enforce permissions
    const requesterParticipant = await this.participantRepository.findOne({
      where: { bingoId: bingo.id, userId: requester.id },
    });
    if (!requesterParticipant || !BingoInvitationPolicies.canCreateInvitation(requesterParticipant)) {
      throw new ForbiddenException();
    }

    let invitee: User | null = null;
    if (username) {
      invitee = await this.userRepository.findOne({ where: { usernameNormalized: User.normalizeUsername(username) } });
      if (!invitee) {
        throw new BadRequestException(this.i18n.t('bingo-invitation.create.userNotFound' as never));
      }
    }

    let team: BingoTeam | null = null;
    if (teamName) {
      team = await this.teamRepository.findOne({
        where: { bingoId: bingo.id, nameNormalized: BingoTeam.normalizeName(teamName) },
      });
      if (!team) {
        throw new BadRequestException(this.i18n.t('bingo-invitation.create.teamNotFound' as never));
      }
    }

    const invitation = this.invitationRepository.create({
      bingoId: bingo.id,
      inviteeId: invitee ? invitee.id : null,
      role: role ?? BingoRoles.Participant,
      teamId: team ? team.id : null,
      status: BingoInvitationStatus.Pending,
      uses: 0,
      disabled: false,
      createdById: requester.id,
    });

    return this.invitationRepository.save(invitation);
  }
}

import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import { BingoParticipant } from '../bingo-participant.entity';
import { Bingo } from '@/bingo/bingo.entity';
import { User } from '@/user/user.entity';
import { BingoTeam } from '@/bingo/team/bingo-team.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BingoRoles } from '../roles/bingo-roles.constants';
import { I18nTranslations } from '@/i18n/types';
import { I18nService } from 'nestjs-i18n';
import { BingoParticipantPolicies } from '../bingo-participant.policies';
import { BingoParticipantUpdatedEvent } from '../events/bingo-participant-updated.event';

export type UpdateBingoParticipantParams = {
  requester: User;
  bingoId: string;
  username: string;
  bingo?: Bingo;
  bingoParticipant?: BingoParticipant;
  role?: BingoRoles;
  teamName?: string;
};

export type UpdateBingoParticipantResult = BingoParticipant;

export class UpdateBingoParticipantCommand extends Command<BingoParticipant> {
  constructor(public readonly params: UpdateBingoParticipantParams) {
    super();
  }
}

@CommandHandler(UpdateBingoParticipantCommand)
export class UpdateBingoParticipantHandler {
  constructor(
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
    @InjectRepository(BingoTeam)
    private readonly bingoTeamRepository: Repository<BingoTeam>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly i18nService: I18nService<I18nTranslations>,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateBingoParticipantCommand): Promise<UpdateBingoParticipantResult> {
    const { requester, bingoId, bingo, username, bingoParticipant, role, teamName } = command.params;

    const foundBingo = bingo || (await this.bingoRepository.findOneBy({ bingoId }));

    if (!foundBingo) {
      throw new NotFoundException(this.i18nService.t('bingo-participant.updateBingoParticipant.bingoNotFound'));
    }

    if (!foundBingo.isPending()) {
      throw new BadRequestException(this.i18nService.t('bingo-participant.updateBingoParticipant.bingoNotPending'));
    }

    const userToUpdate = await this.userRepository.findOneBy({ usernameNormalized: username });

    if (!userToUpdate) {
      throw new NotFoundException(this.i18nService.t('bingo-participant.updateBingoParticipant.userNotFound'));
    }

    const requesterParticipant =
      bingoParticipant ||
      (await this.bingoParticipantRepository.findOneBy({
        bingoId: foundBingo.id,
        userId: requester.id,
      }));

    if (!requesterParticipant) {
      throw new ForbiddenException(
        this.i18nService.t('bingo-participant.updateBingoParticipant.notParticipantOfTheBingo'),
      );
    }
    
    let team;
    if (teamName) {
      team = await this.bingoTeamRepository.findOneBy({ nameNormalized: teamName, bingoId: foundBingo.id });
    }

    if (teamName && !team) {
      throw new BadRequestException(this.i18nService.t('bingo-participant.updateBingoParticipant.teamNotFound'));
    }

    const bingoParticipantToUpdate = await this.bingoParticipantRepository.findOneBy({
      userId: userToUpdate.id,
      bingoId: foundBingo.id,
    });

    if (!bingoParticipantToUpdate) {
      throw new NotFoundException(
        this.i18nService.t('bingo-participant.updateBingoParticipant.bingoParticipantNotFound'),
      );
    }

    if (
      !new BingoParticipantPolicies(requester).canUpdate(requesterParticipant, bingoParticipantToUpdate, role)
    ) {
      throw new ForbiddenException(
        this.i18nService.t('bingo-participant.updateBingoParticipant.notAuthorizedToUpdate'),
      );
    }

    if (teamName) {
      bingoParticipantToUpdate.teamId = team.id;
    }

    if (role) {
      bingoParticipantToUpdate.role = role;
    }

    this.eventBus.publish(
      new BingoParticipantUpdatedEvent({
        bingoId: foundBingo.id,
        requesterId: requester.id,
        userId: userToUpdate.id,
        updates: {
          role,
          teamName,
        },
      }),
    );

    return await this.bingoParticipantRepository.save(bingoParticipantToUpdate);
  }

  getRoleFromString(role: string): BingoRoles | undefined {
    if (Object.values(BingoRoles).includes(role as BingoRoles)) {
      return role as BingoRoles;
    }
    return undefined;
  }
}

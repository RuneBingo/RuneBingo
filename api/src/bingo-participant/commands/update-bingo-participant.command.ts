import { Command, CommandHandler } from '@nestjs/cqrs';
import { BingoParticipant } from '../bingo-participant.entity';
import { Bingo } from '@/bingo/bingo.entity';
import { User } from '@/user/user.entity';
import { BingoTeam } from '@/bingo-team/bingo-team.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BingoRoles } from '../roles/bingo-roles.constants';
import { I18nTranslations } from '@/i18n/types';
import { I18nService } from 'nestjs-i18n';
import { BingoParticipantPolicies } from '../bingo-participant.policies';

export type UpdateBingoParticipantParams = {
  requester: User;
  slug: string;
  username: string;
  bingo?: Bingo;
  bingoParticipant?: BingoParticipant;
  role?: string;
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
  ) {}

  async execute(command: UpdateBingoParticipantCommand): Promise<UpdateBingoParticipantResult> {
    const { requester, slug, bingo, username, bingoParticipant, role, teamName } = command.params;

    const foundBingo = bingo || (await this.bingoRepository.findOneBy({ slug }));

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
      throw new ForbiddenException(this.i18nService.t('bingo-participant.updateBingoParticipant.notParticipantOfTheBingo'));
    }

    const parsedRole = role ? this.getRoleFromString(role) : undefined;

    if (parsedRole === undefined) {
      throw new BadRequestException(this.i18nService.t('bingo-participant.updateBingoParticipant.roleInvalid'));
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
      throw new NotFoundException(this.i18nService.t('bingo-participant.updateBingoParticipant.bingoParticipantNotFound'));
    }

    if (!new BingoParticipantPolicies(requester).canUpdate(requesterParticipant, bingoParticipantToUpdate, parsedRole)) {
        throw new ForbiddenException(this.i18nService.t('bingo-participant.updateBingoParticipant.notAuthorizedToUpdate'))
    }

    if (teamName) {
        bingoParticipantToUpdate.teamId = team.id;
    }

    if (role) {
        bingoParticipantToUpdate.role = parsedRole;
    }

    return await this.bingoParticipantRepository.save(bingoParticipantToUpdate);
  }

  getRoleFromString(role: string): BingoRoles | undefined {
    if (Object.values(BingoRoles).includes(role as BingoRoles)) {
      return role as BingoRoles;
    }
    return undefined;
  }
}

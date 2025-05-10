import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { BaseEntityParanoid } from '@/db/base.entity';
import { User } from '@/user/user.entity';

import { BingoRoles } from './roles/bingo-roles.constants';
import { BingoTeam } from '@/bingo-team/bingo-team.entity';

@Entity()
export class BingoParticipant {
  @PrimaryColumn({ name: 'user_id', type: 'int' })
  userId: number;

  @ManyToOne(() => User, (user) => user.participants)
  @JoinColumn({ name: 'user_id' })
  user: Promise<User>;

  @PrimaryColumn({ name: 'bingo_id', type: 'int' })
  bingoId: number;

  @ManyToOne(() => Bingo, (bingo) => bingo.participants)
  @JoinColumn({ name: 'bingo_id' })
  bingo: Promise<Bingo>;

  @Column({ type: 'varchar', default: 'participant' })
  role: BingoRoles;

  @Column({ name: 'team_id', type: 'int', nullable: true })
  teamId: number | null;

  @ManyToOne(() => BingoTeam)
  team: Promise<BingoTeam>;
}

import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { BaseEntityParanoid } from '@/db/base.entity';
import { User } from '@/user/user.entity';

import { BingoRoles } from './roles/bingo-roles.constants';

@Entity()
export class BingoParticipant extends BaseEntityParanoid {
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

  // To implement when bingoTeam is done
  @Column({ name: 'team_id', type: 'int', nullable: true })
  teamId: number | null;
}

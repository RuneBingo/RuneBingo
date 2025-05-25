import { Column, Entity, JoinColumn, ManyToOne, OneToOne, Unique } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { StrongEntityParanoid } from '@/db/base.entity';
import { User } from '@/user/user.entity';

@Entity()
@Unique('UQ_bingo_name', ['bingoId', 'name'])
@Unique('UQ_bingo_name_normalized', ['bingoId', 'nameNormalized'])
export class BingoTeam extends StrongEntityParanoid {
  @Column({ name: 'bingo_id', type: 'int' })
  bingoId: number;

  @ManyToOne(() => Bingo)
  @JoinColumn({ name: 'id' })
  bingo: Promise<Bingo>;

  @Column()
  name: string;

  @Column()
  nameNormalized: string;

  @Column({ name: 'captain_id', type: 'int' })
  captainId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'captain_id' })
  captain: Promise<User>;

  @Column({ default: 0 })
  points: number;

  static normalizeName(name: string) {
    return name.trim().toLowerCase();
  }
}

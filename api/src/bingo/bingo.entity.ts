import slugify from 'slugify';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { BingoParticipant } from '@/bingo-participant/bingo-participant.entity';
import { StrongEntityParanoid } from '@/db/base.entity';
import { User } from '@/user/user.entity';

@Index('IDX_UNIQUE_SLUG_WHEN_NOT_DELETED', ['slug'], {
  unique: true,
  where: `"deleted_at" IS NULL`, // raw SQL
})
@Entity()
export class Bingo extends StrongEntityParanoid {
  static slugifyTitle(title: string): string {
    // TODO: find out why this is unsafe and fix it

    return slugify(title, {
      lower: true,
      strict: true,
      locale: 'en',
    });
  }
  @Column({ default: 'en' })
  language: string;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column()
  description: string;

  @Column()
  private: boolean;

  @Column({ default: 5 })
  width: number;

  @Column({ default: 5 })
  height: number;

  @Column()
  fullLineValue: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: Promise<User>;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: Promise<User>;

  @Column({ nullable: true, type: 'timestamptz' })
  startedAt: Date | null;

  @Column({ name: 'started_by', type: 'int', nullable: true })
  startedById: number | null = null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'started_by' })
  startedBy: Promise<User>;

  @Column({ nullable: true, type: 'timestamptz' })
  endedAt: Date | null;

  @Column({ name: 'ended_by', type: 'int', nullable: true })
  endedById: number | null = null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ended_by' })
  endedBy: Promise<User>;

  @Column({ nullable: true, type: 'timestamptz' })
  canceledAt: Date | null;

  @Column({ name: 'canceled_by', type: 'int', nullable: true })
  canceledById: number | null = null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'canceled_by' })
  canceledBy: Promise<User>;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'deleted_by' })
  deletedBy: Promise<User>;

  @Column({ type: 'date', nullable: true })
  maxRegistrationDate?: string;

  @OneToMany(() => BingoParticipant, (bingoParticipant) => bingoParticipant.bingo)
  participants: Promise<BingoParticipant[]>;

  isPending(): Boolean {
    return this.startedAt === null
  }
}

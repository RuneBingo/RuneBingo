import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';

import { StrongEntity } from '@/db/base.entity';
import { Media } from '@/media/media.entity';
import { User } from '@/user/user.entity';

import { Bingo } from '../bingo.entity';
import { BingoTileCompletionMode } from './bingo-tile-completion-mode.enum';
import { BingoTileItem } from './bingo-tile-item';

@Entity()
@Unique(['bingoId', 'x', 'y'])
export class BingoTile extends StrongEntity {
  @Column({ name: 'bingo_id', type: 'int' })
  bingoId: number;

  @Column({ name: 'x', type: 'int' })
  x: number;

  @Column({ name: 'y', type: 'int' })
  y: number;

  @Column({ name: 'value', type: 'int' })
  value: number;

  @Column({ name: 'free', default: false })
  free: boolean = false;

  @Column({ name: 'title', type: 'varchar' })
  title: string;

  @Column({ name: 'description', type: 'varchar' })
  description: string;

  @Column({ name: 'completion_mode', type: 'enum', enum: BingoTileCompletionMode })
  completionMode: BingoTileCompletionMode;

  @JoinColumn({ name: 'media_id' })
  mediaId: number | null = null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: Promise<User | null>;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: Promise<User | null>;

  @ManyToOne(() => Bingo, (bingo) => bingo.tiles)
  @JoinColumn({ name: 'bingo_id' })
  bingo: Promise<Bingo>;

  @ManyToOne(() => Media, { nullable: true })
  @JoinColumn({ name: 'media_id' })
  media: Promise<Media | null>;

  @OneToMany(() => BingoTileItem, (bingoTileItem) => bingoTileItem.bingoTile, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  items: Promise<BingoTileItem[] | undefined>;
}

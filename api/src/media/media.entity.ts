import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { StrongEntityParanoid } from '@/db/base.entity';
import { User } from '@/user/user.entity';

@Entity()
export class Media extends StrongEntityParanoid {
  @Column()
  assetId: string;

  @Column()
  publicId: string;

  @Column()
  originalName: string;

  @Column()
  size: number;

  @Column()
  width: number;

  @Column()
  height: number;

  @Column()
  format: string;

  @Column()
  url: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: Promise<User | null>;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: Promise<User | null>;
}

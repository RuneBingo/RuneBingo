import { Column, Entity, Generated, Index, JoinColumn, ManyToOne } from 'typeorm';

import { StrongEntity } from '@/db/base.entity';
import { User } from '@/user/user.entity';

export type SessionMethod = 'email';

@Entity()
@Index(['userId', 'signedOutAt', 'expiresAt'])
@Index(['userId', 'signedOutAt'])
@Index(['userId', 'expiresAt'])
@Index(['userId', 'lastSeenAt'])
export class Session extends StrongEntity {
  @Column({ unique: true, type: 'uuid' })
  @Generated('uuid')
  uuid: string;

  @Column({ length: 255 })
  sessionID: string;

  @Column({ length: 255, default: 'email' })
  method: string;

  @Column({ length: 64 })
  ipAddress: string;

  @Column({ length: 255 })
  userAgent: string;

  @Column({ length: 255 })
  deviceType: string;

  @Column({ length: 255 })
  os: string;

  @Column({ length: 255 })
  browser: string;

  @Column({ length: 255 })
  location: string;

  @Column({ type: 'timestamptz', nullable: true })
  signedOutAt: Date | null = null;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz' })
  lastSeenAt: Date;

  @ManyToOne(() => User, (user: User) => user.sessions)
  @JoinColumn({ name: 'user_id' })
  user: Promise<User>;

  @Column()
  userId: number;

  get isSignedOut() {
    return this.signedOutAt !== null || (this.expiresAt !== null && this.expiresAt < new Date());
  }

  signOut() {
    if (this.signedOutAt) {
      return;
    }

    this.signedOutAt = new Date();
  }
}

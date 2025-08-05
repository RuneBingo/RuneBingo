import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { Bingo } from '@/bingo/bingo.entity';
import { BingoRoles } from '@/bingo/participant/roles/bingo-roles.constants';
import { BingoTeam } from '@/bingo/team/bingo-team.entity';
import { StrongEntity } from '@/db/base.entity';
import { User } from '@/user/user.entity';

import { BingoInvitationStatus } from './bingo-invitation-status.enum';

/**
 * Bingo Invitation entity represents both direct invitations (to a specific user)
 * and invitation links that can be shared publicly.
 *
 * A direct invitation will have an `inviteeId` referencing the invited user and a status lifecycle.
 * An invitation link (template) will have `inviteeId` **null** and can be consumed multiple times.
 */
@Entity()
export class BingoInvitation extends StrongEntity {
  @Column({ type: 'uuid', unique: true })
  /** Unique public identifier for the invitation */
  code: string;

  @BeforeInsert()
  generateCodeIfMissing(): void {
    if (!this.code) {
      this.code = uuidV4();
    }
  }

  /* -------------------------------- Relations -------------------------------- */

  @Column({ name: 'bingo_id', type: 'int' })
  bingoId: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => Bingo, (bingo) => bingo.invitations)
  @JoinColumn({ name: 'bingo_id' })
  bingo: Promise<Bingo>;

  /** The user who is invited (for direct invitations). */
  @Column({ name: 'invitee_id', type: 'int', nullable: true })
  inviteeId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'invitee_id' })
  invitee: Promise<User | null>;

  /** The user who created the invitation (organizer/owner). */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: Promise<User>;

  /** Invite role assigned when accepted (participant or organizer). */
  @Column({ type: 'varchar', default: 'participant' })
  role: BingoRoles;

  /** Optional team assignment for the invitation. */
  @Column({ name: 'team_id', type: 'int', nullable: true })
  teamId: number | null;

  @ManyToOne(() => BingoTeam, { nullable: true })
  @JoinColumn({ name: 'team_id' })
  team: Promise<BingoTeam | null>;

  /** Current status of the invitation */
  @Column({ type: 'varchar', default: BingoInvitationStatus.Pending })
  status: BingoInvitationStatus;

  /** For invitation links, number of times this invitation has been used */
  @Column({ type: 'int', default: 0 })
  uses: number;

  /** Boolean flag to disable invitation link. */
  @Column({ type: 'boolean', default: false })
  disabled: boolean;
}

import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Index(['category'])
@Index(['enabled'])
@Entity()
export class OsrsItem {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  configName: string;

  @Column({ type: 'int' })
  category: number;

  @Column({ type: 'boolean' })
  exchangeable: boolean;

  @Column({ type: 'boolean' })
  members: boolean;

  @Column({ type: 'varchar' })
  examine: string;

  @Column({ type: 'varchar' })
  iconUrl: string;

  @Column({ type: 'varchar' })
  imageUrl: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean = true;
}

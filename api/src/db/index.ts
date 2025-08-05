import { TypeOrmModule } from '@nestjs/typeorm';
import { configDotenv } from 'dotenv';
import { DataSource } from 'typeorm';
import { type DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { Activity } from '@/activity/activity.entity';
import { Bingo } from '@/bingo/bingo.entity';
import { BingoInvitation } from '@/bingo/invitation/bingo-invitation.entity';
import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { BingoTeam } from '@/bingo/team/bingo-team.entity';
import { BingoTileItem } from '@/bingo/tile/bingo-tile-item';
import { BingoTile } from '@/bingo/tile/bingo-tile.entity';
import { dotenvPath } from '@/config';
import { Media } from '@/media/media.entity';
import { OsrsItem } from '@/osrs/item/osrs-item.entity';
import { Session } from '@/session/session.entity';
import { User } from '@/user/user.entity';

configDotenv({ path: dotenvPath });

export const entities = [
  Activity,
  Session,
  User,
  Bingo,
  BingoInvitation,
  BingoParticipant,
  BingoTeam,
  Media,
  OsrsItem,
  BingoTile,
  BingoTileItem,
];
export const migrations = [__dirname + '/migrations/**/*.ts', __dirname + '/migrations/**/*.js'];
export const subscribers = [__dirname + '/subscribers/**/*.ts', __dirname + '/subscribers/**/*.js'];

const env = process.env.NODE_ENV;
const isTest = env === 'test';
const isProduction = env === 'production';
const host = process.env.POSTGRES_URL!;
const port = Number(process.env.POSTGRES_PORT!);
const username = process.env.POSTGRES_USER!;
const password = process.env.POSTGRES_PASSWORD!;
const database = isTest ? process.env.POSTGRES_TEST_DB! : process.env.POSTGRES_DB!;

/**
 * This module configuration uses `process.env` directly because it is also used by TypeORM CLI, which does not have access to
 * the same dependency injection utilities as the rest of the application.
 */
const options = {
  type: 'postgres',
  host,
  port,
  username,
  password,
  database,
  synchronize: isTest,
  dropSchema: isTest,
  logging: !isProduction,
  logger: 'file',
  entities,
  subscribers: isTest ? [] : subscribers,
  migrations,
  namingStrategy: new SnakeNamingStrategy(),
} as const satisfies DataSourceOptions;

export const dbModule = TypeOrmModule.forRoot(options);

export const dataSource = new DataSource(options);

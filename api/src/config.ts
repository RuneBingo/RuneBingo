import { existsSync, readFileSync } from 'fs';
import path, { resolve } from 'path';

import { ConfigModule } from '@nestjs/config';

/** Typed config for the root `.env` file. */
export type Environment = {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  POSTGRES_URL: string;
  POSTGRES_PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  POSTGRES_TEST_DB: string;
  REDIS_URL: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
};

/** Typed config for `config.json` and `config.local.json` */
export type Configuration = {
  cors?: {
    origin?: string | string[] | RegExp | boolean;
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
  };

  session: {
    secret: string;
    maxAge?: number;
  };

  email?: {
    user: string;
    pass: string;
    name: string;
  };

  server: {
    port: number;
  };
};

export type AppConfig = Configuration & Environment;

export const DEFAULT_CONFIG = {
  cors: {
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
    exposedHeaders: '*',
    credentials: true,
  },
  session: {
    maxAge: 604800000,
  },
  server: {
    port: 5000,
  },
} as const;

export const dotenvPath = path.resolve(__dirname, '../../', '.env');

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: [dotenvPath],
  load: [() => DEFAULT_CONFIG, () => loadJsonConfig('../config.json'), () => loadJsonConfig('../config.local.json')],
});

function loadJsonConfig(path: string) {
  const fullPath = resolve(__dirname, path);
  if (!existsSync(fullPath)) return {};

  return JSON.parse(readFileSync(fullPath, 'utf8')) as object;
}

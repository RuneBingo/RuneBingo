import { ConsoleLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { I18nValidationExceptionFilter } from 'nestjs-i18n';
import '@/extensions/express.extensions';

import { setupOpenApi } from '@/extensions/swagger.extensions';
import '@/extensions/number.extensions';
import { i18nValidationPipe } from '@/i18n/i18n-validation.pipe';
import { validationPipe } from '@/pipes/validation.pipe';
import { RedisService } from '@/redis/redis.service';

import { AppModule } from './app.module';
import { type AppConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new ConsoleLogger({ colors: true }),
  });

  const configService = app.get(ConfigService<AppConfig>);
  const port = configService.getOrThrow('server.port', { infer: true });
  const env = configService.get('NODE_ENV', { infer: true });
  const sessionSecret = configService.getOrThrow('session.secret', { infer: true });
  const isProduction = env !== 'development' && env !== 'test';

  app.enableCors({
    ...configService.get('cors', { infer: true }),
    credentials: true,
  });
  app.use(cookieParser(sessionSecret));
  app.set('trust proxy', isProduction);
  app.useGlobalPipes(i18nValidationPipe, validationPipe);
  app.useGlobalFilters(new I18nValidationExceptionFilter());

  setupSession(app);
  setupOpenApi(app, 'swagger');

  await app.listen(port);
}

function setupSession(app: NestExpressApplication) {
  const configService = app.get(ConfigService<AppConfig>);
  const env = configService.get('NODE_ENV', { infer: true });
  const isProduction = env !== 'development' && env !== 'test';
  const sessionSecret = configService.getOrThrow('session.secret', { infer: true });

  const redisService = app.get(RedisService);

  app.use(
    session({
      store: redisService.store,
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction,
        httpOnly: true,
        maxAge: (1).weekMs,
      },
    }),
  );
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();

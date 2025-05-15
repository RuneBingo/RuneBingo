import { CommandFactory } from 'nest-commander';

import { CliModule } from './cli/cli.module';

async function bootstrap() {
  await CommandFactory.runWithoutClosing(CliModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();

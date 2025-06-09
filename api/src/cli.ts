import 'multer';
import { CommandFactory } from 'nest-commander';

import '@/extensions/number.extensions';

import { CliModule } from './cli/cli.module';

async function bootstrap() {
  try {
    await CommandFactory.runWithoutClosing(CliModule, {
      logger: ['log', 'error', 'warn', 'debug'],
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});

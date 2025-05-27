import * as path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { I18nService } from 'nestjs-i18n';

import { EmailerService } from './emailer.service';
import { type AppConfig } from '../config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, I18nService],
      useFactory: (configService: ConfigService<AppConfig>, i18n: I18nService) => {
        const emailConfig = configService.get('email', { infer: true });

        const user = emailConfig?.user ?? '';
        const pass = emailConfig?.pass ?? '';
        const name = emailConfig?.name ?? '';
        const from = `"${name}" ${user}`;

        return {
          transport: {
            service: 'gmail',
            auth: {
              user,
              pass,
            },
          },
          defaults: {
            from,
          },
          template: {
            dir: path.join(__dirname, '/templates/html'),
            adapter: new HandlebarsAdapter({ t: i18n.hbsHelper }),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [EmailerService],
  exports: [EmailerService],
})
export class EmailerModule {}

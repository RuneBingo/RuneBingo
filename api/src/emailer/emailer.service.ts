import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { I18nService } from 'nestjs-i18n';

import type { I18nTranslations } from '@/i18n/types';

import { type AppConfig } from '../config';
import { EmailTemplate } from './templates/email-template';

@Injectable()
export class EmailerService {
  private readonly logger = new Logger(EmailerService.name);
  private readonly emailSendingDisabled: boolean;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AppConfig>,
    private readonly i18nService: I18nService<I18nTranslations>,
  ) {
    this.emailSendingDisabled = this.configService.get('email', { infer: true }) === undefined;
  }

  async sendEmail(emailTemplate: EmailTemplate) {
    const env = this.configService.get('NODE_ENV', { infer: true });
    const { to, lang, subject: subjectKey, template, context } = emailTemplate;

    context['i18nLang'] = emailTemplate.lang;

    const subject: string = this.i18nService.translate(subjectKey, { lang });

    if (this.emailSendingDisabled) {
      this.logger.log(`Email sending is disabled - skipping ${subject} email to ${to}`);
      return;
    }

    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      });

      if (env === 'development') {
        this.logger.log(`Sent ${subject} email to ${to}`);
      }
    } catch (error) {
      this.logger.log('Error sending email: ', error);
    }
  }
}

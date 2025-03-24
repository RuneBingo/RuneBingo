import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Request,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { I18n, I18nLang, I18nService } from 'nestjs-i18n';

import { EmailerService } from '@/emailer/emailer.service';
import { VerificationEmail } from '@/emailer/templates/verification-email';
import type { I18nTranslations } from '@/i18n/types';
import { CreateSessionForUserCommand } from '@/session/commands/create-session-for-user.command';
import { SignOutSessionByUuidCommand } from '@/session/commands/sign-out-session-by-uuid.command';
import type { SessionMethod } from '@/session/session.entity';
import { CreateUserCommand } from '@/user/commands/create-user.command';
import { FindUserByEmailQuery } from '@/user/queries/find-user-by-email.query';
import type { User } from '@/user/user.entity';

import { type AppConfig } from '../config';
import type { SignUpCodePayload } from './auth-codes.types';
import { SignInWithEmailCommand } from './commands/sign-in-with-email.command';
import { SignUpWithEmailCommand } from './commands/sign-up-with-email.command';
import { SignInWithEmailDto } from './dto/sign-in-with-email.dto';
import { SignUpWithEmailDto } from './dto/sign-up-with-email.dto';
import { VerifyAuthCodeDto } from './dto/verify-auth-code.dto';
import { VerifyAuthCodeQuery } from './queries/verify-auth-code.query';
import { UserDto } from '../user/dto/user.dto';

@Controller('v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly configService: ConfigService<AppConfig>,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly emailerService: EmailerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get the current authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The current authenticated user, or null if not authenticated.',
    type: [UserDto],
  })
  me(@Request() req: Request) {
    const user = req.userEntity;

    if (!user) return null;

    return new UserDto(user);
  }

  @Post('sign-out')
  @ApiOperation({ summary: 'Sign out from current session' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Signed out successfully.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async signOut(@Request() req: Request) {
    const { uuid } = req.session;
    if (!uuid) return;

    await this.commandBus.execute(new SignOutSessionByUuidCommand({ uuid, requester: 'self' }));

    req.session.destroy((err: unknown) => {
      if (err) this.logger.error(err);
    });
  }

  @Post('sign-in')
  @ApiOperation({ summary: 'Request sign-in code via email' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'An email with an sign-in code has been sent.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'The email address is invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'The user account is disabled.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'The user account does not exist.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async signInWithEmail(@Body() body: SignInWithEmailDto, @I18nLang() lang: string) {
    const env = this.configService.get('NODE_ENV', { infer: true });
    const { email } = body;

    const { code } = await this.commandBus.execute(new SignInWithEmailCommand(email));

    if (env === 'development') {
      this.logger.log(`Generated sign-in code ${code} for email ${email}.`);
    }

    const user = await this.queryBus.execute(new FindUserByEmailQuery({ email }));
    void this.emailerService.sendEmail(new VerificationEmail(email, user?.language ?? lang, { code: code }));
  }

  @Post('sign-up')
  @ApiOperation({ summary: 'Request sign-up code via email' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'An email with an sign-up code has been sent.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'The email address or username is invalid.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'The email address or username is already in use.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async signUpWithEmail(@Body() dto: SignUpWithEmailDto, @I18nLang() lang: string) {
    const env = this.configService.get('NODE_ENV', { infer: true });
    const { email, username } = dto;

    const { code } = await this.commandBus.execute(new SignUpWithEmailCommand(email, username, lang));

    if (env === 'development') {
      this.logger.log(`Generated sign-up code ${code} for email ${email}.`);
    }

    void this.emailerService.sendEmail(new VerificationEmail(email, lang, { code: code }));
  }

  @Post('verify-code')
  @ApiOperation({ summary: 'Verify authentication code' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description:
      'Verification successful. User has been created if it was a sign up. Session created if sign up or sign in.',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'The code is invalid or has expired.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'The user account is disabled or deleted.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyCode(
    @Body() body: VerifyAuthCodeDto,
    @I18n() i18n: I18nService<I18nTranslations>,
    @Request() req: Request,
  ) {
    const { email, code } = body;

    const payload = await this.queryBus.execute(new VerifyAuthCodeQuery(email, code));

    let user: User | null = null;
    let createSession = false;

    switch (payload.action) {
      case 'sign-in': {
        user = await this.queryBus.execute(new FindUserByEmailQuery({ email }));
        if (!user || user.isDisabled) {
          throw new BadRequestException(i18n.t('auth.verifyAuthCode.invalidOrExpired'));
        }

        createSession = true;
        break;
      }

      case 'sign-up': {
        const { username, language } = payload as SignUpCodePayload;
        user = await this.commandBus.execute(
          new CreateUserCommand({ email, username, emailVerified: true, language, requester: 'self' }),
        );

        createSession = true;
        break;
      }

      default:
        throw new BadRequestException(i18n.t('auth.verifyAuthCode.invalidOrExpired'));
    }

    if (!user || !createSession) return;

    await this.createSessionForUser(req, user, 'email');
  }

  private async createSessionForUser(req: Request, user: User, method: SessionMethod) {
    const { headers, ip } = req;
    let { session } = req;

    if (session.uuid) {
      await this.commandBus.execute(new SignOutSessionByUuidCommand({ uuid: session.uuid, requester: user }));

      req.session.regenerate((err) => {
        if (err) this.logger.error(err);
      });

      session = req.session;
    }

    const sessionEntity = await this.commandBus.execute(
      new CreateSessionForUserCommand({
        requester: user,
        user,
        method,
        ip: ip || 'unknown',
        sessionId: session.id,
        userAgent: (headers['user-agent'] as string) || 'unknown',
      }),
    );

    session.uuid = sessionEntity.uuid;
    session.language = user.language;
    session.save();
  }
}

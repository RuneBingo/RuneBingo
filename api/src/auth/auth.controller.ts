import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { I18n, I18nLang, I18nService } from 'nestjs-i18n';

import { ShortBingoDto } from '@/bingo/dto/short-bingo.dto';
import { GetUserBingoParticipationsQuery } from '@/bingo/participant/queries/get-user-bingo-participations.query';
import { ListMyBingoParticipationsQuery } from '@/bingo/participant/queries/list-my-bingo-participations.query';
import { type AppConfig } from '@/config';
import { EmailerService } from '@/emailer/emailer.service';
import { VerificationEmail } from '@/emailer/templates/verification-email';
import type { I18nTranslations } from '@/i18n/types';
import { CreateSessionForUserCommand } from '@/session/commands/create-session-for-user.command';
import { SetSessionCurrentBingoCommand } from '@/session/commands/set-session-current-bingo.command';
import { SignOutSessionByUuidCommand } from '@/session/commands/sign-out-session-by-uuid.command';
import type { SessionMethod } from '@/session/session.entity';
import { CreateUserCommand } from '@/user/commands/create-user.command';
import { FindUserByEmailQuery } from '@/user/queries/find-user-by-email.query';
import type { User } from '@/user/user.entity';

import type { SignUpCodePayload } from './auth-codes.types';
import { SignInWithEmailCommand } from './commands/sign-in-with-email.command';
import { SignUpWithEmailCommand } from './commands/sign-up-with-email.command';
import { AuthenticationDetailsDto } from './dto/authentication-details.dto';
import { SetCurrentBingoDto } from './dto/set-current-bingo.dto';
import { SignInWithEmailDto } from './dto/sign-in-with-email.dto';
import { SignUpWithEmailDto } from './dto/sign-up-with-email.dto';
import { VerifyAuthCodeDto } from './dto/verify-auth-code.dto';
import { AuthGuard } from './guards/auth.guard';
import { VerifyAuthCodeQuery } from './queries/verify-auth-code.query';

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
  @ApiOperation({ summary: 'Get the current authenticated user details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The current authenticated user details, or null if not authenticated.',
    type: [AuthenticationDetailsDto],
  })
  async me(@Request() req: Request) {
    const user = req.userEntity;

    if (!user) return null;

    const session = req.sessionEntity!;
    const { hasBingos, currentBingo, currentBingoParticipant } = await this.queryBus.execute(
      new GetUserBingoParticipationsQuery({ userId: user.id, bingoId: session.currentBingoId }),
    );

    const currentBingoRole = currentBingoParticipant?.role;

    return new AuthenticationDetailsDto({ user, hasBingos, currentBingo, currentBingoRole });
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

  @Get('my-bingos')
  @ApiOperation({ summary: "Get the user's bingo participations" })
  @ApiUnauthorizedResponse({ description: 'The user is not authenticated.' })
  @ApiOkResponse({ description: "The user's bingo participations", type: [ShortBingoDto] })
  @ApiQuery({ name: 'search', required: false })
  @UseGuards(AuthGuard)
  async listMyBingos(@Request() req: Request, @Query('search') search: string = '') {
    const user = req.userEntity!;

    return this.queryBus.execute(new ListMyBingoParticipationsQuery({ requester: user, search }));
  }

  @Put('current-bingo')
  @ApiOperation({ summary: 'Set the current bingo for the user' })
  @ApiNoContentResponse({ description: 'The current bingo has been set' })
  @ApiUnauthorizedResponse({ description: 'The user is not authenticated.' })
  @ApiForbiddenResponse({ description: 'The user is not allowed to set this bingo as current.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async setCurrentBingo(@Request() req: Request, @Body() body: SetCurrentBingoDto) {
    const user = req.userEntity!;
    const session = req.sessionEntity!;
    const { bingoId } = body;

    await this.commandBus.execute(new SetSessionCurrentBingoCommand({ uuid: session.uuid, requester: user, bingoId }));
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

import {
  Body,
  Controller,
  Req,
  DefaultValuePipe,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthGuard } from '@/auth/guards/auth.guard';
import { BingoRoles } from '@/bingo/participant/roles/bingo-roles.constants';
import { User } from '@/user/user.entity';

import { BingoInvitationStatus } from './bingo-invitation-status.enum';
import { CreateBingoInvitationCommand } from './commands/create-bingo-invitation.command';
import { UpdateBingoInvitationCommand } from './commands/update-bingo-invitation.command';
import { CreateBingoInvitationDto } from './dto/create-bingo-invitation.dto';
import { PaginatedBingoInvitationsDto } from './dto/paginated-bingo-invitations.dto';
import { UpdateBingoInvitationDto } from './dto/update-bingo-invitation.dto';
import { SearchBingoInvitationsQuery } from './queries/search-bingo-invitations.query';

@Controller('v1/bingo/:bingoId/invitation')
export class BingoInvitationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Search bingo invitations' })
  @ApiOkResponse({ description: 'Bingo Invitations.' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'status', enum: BingoInvitationStatus, required: false })
  @ApiQuery({ name: 'role', enum: ['participant', 'organizer'], required: false })
  @ApiQuery({ name: 'team', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async searchBingoInvitations(
    @Req() req: Request,
    @Param('bingoId') bingoId: string,
    @Query('query') query = '',
    @Query('status') status: BingoInvitationStatus | undefined,
    @Query('role') role: BingoRoles | undefined,
    @Query('team') teamName = '',
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('sort', new DefaultValuePipe('createdAt')) sort: 'username' | 'status' | 'teamName' | 'createdAt',
    @Query('order', new DefaultValuePipe('DESC')) order: 'ASC' | 'DESC',
  ): Promise<PaginatedBingoInvitationsDto> {
    return await this.queryBus.execute(
      new SearchBingoInvitationsQuery({
        requester: (req as Request & { userEntity: User }).userEntity,
        bingoId,
        query,
        status,
        role,
        teamName,
        limit,
        offset,
        sort,
        order,
      }),
    );
  }

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a bingo invitation or invitation link' })
  @ApiNotFoundResponse({ description: 'No bingo with provided Bingo Id was found.' })
  @ApiForbiddenResponse({ description: 'The user is not allowed to invite participants.' })
  async createBingoInvitation(
    @Req() req: Request,
    @Param('bingoId') bingoId: string,
    @Body() dto: CreateBingoInvitationDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new CreateBingoInvitationCommand({
        requester: (req as Request & { userEntity: User }).userEntity,
        bingoId,
        username: dto.username,
        role: dto.role,
        teamName: dto.teamName,
      }),
    );
  }

  @Put(':code')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a bingo invitation' })
  @ApiNotFoundResponse({ description: 'No bingo or invitation with provided parameters was found.' })
  @ApiForbiddenResponse({ description: 'The user is not allowed to update invitations.' })
  async updateBingoInvitation(
    @Req() req: Request,
    @Param('bingoId') bingoId: string,
    @Param('code') code: string,
    @Body() dto: UpdateBingoInvitationDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateBingoInvitationCommand({
        requester: (req as Request & { userEntity: User }).userEntity,
        bingoId,
        code,
        role: dto.role,
        teamName: dto.teamName,
      }),
    );
  }
}

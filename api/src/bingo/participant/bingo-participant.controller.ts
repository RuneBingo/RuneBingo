import { Controller, Body, Delete, Get, HttpCode, Param, Put, Query, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthGuard } from '@/auth/guards/auth.guard';
import { RemoveBingoParticipantCommand } from '@/bingo/participant/commands/remove-bingo-participant.command';
import { UpdateBingoParticipantCommand } from '@/bingo/participant/commands/update-bingo-participant.command';
import { BingoParticipantDto } from '@/bingo/participant/dto/bingo-participant.dto';
import { PaginatedBingoParticipantsDto } from '@/bingo/participant/dto/paginated-bingo-participants.dto';
import { UpdateBingoParticipantDto } from '@/bingo/participant/dto/update-bingo-participant.dto';
import {
  SearchBingoParticipantsParams,
  SearchBingoParticipantsQuery,
} from '@/bingo/participant/queries/search-bingo-participants.query';
import { BingoRoles } from '@/bingo/participant/roles/bingo-roles.constants';

@Controller('v1/bingo/:bingoId/participant')
export class BingoParticipantController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get bingo participants' })
  @ApiOkResponse({ description: 'Bingo Participants.' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'team', required: false })
  @ApiQuery({ name: 'role', enum: ['participant', 'organizer', 'owner'], required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async getBingoParticipants(
    @Req() req: Request,
    @Param('bingoId') bingoId: string,
    @Query('query') query: string = '',
    @Query('team') teamName: string = '',
    @Query('role') role: BingoRoles | undefined,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<PaginatedBingoParticipantsDto> {
    const normalizedQuery = query?.trim() === '' ? undefined : query;
    const normalizedTeamName = teamName?.trim() === '' ? undefined : teamName;
    const params = {
      requester: req.userEntity!,
      bingoId,
      query: normalizedQuery,
      teamName: normalizedTeamName,
      role,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    } satisfies SearchBingoParticipantsParams;

    const { items, ...pagination } = await this.queryBus.execute(new SearchBingoParticipantsQuery(params));

    const bingoParticipantsDtos = await Promise.all(
      items.map(async (bingoParticipant) => BingoParticipantDto.fromBingoParticipant(bingoParticipant)),
    );

    return new PaginatedBingoParticipantsDto({ items: bingoParticipantsDtos, ...pagination });
  }

  @Delete(':username')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a bingo participant from an event' })
  @ApiNoContentResponse({ description: 'The bingo participant has been successfully deleted.' })
  @ApiNotFoundResponse({ description: 'No bingo with provided Bingo Id was found.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to view the bingo event.' })
  @ApiForbiddenResponse({ description: 'Not authorized to delete the bingo participant.' })
  async removeBingoParticipant(
    @Req() req: Request,
    @Param('bingoId') bingoId: string,
    @Param('username') username: string,
  ) {
    await this.commandBus.execute(
      new RemoveBingoParticipantCommand({
        requester: req.userEntity!,
        bingoId,
        username,
      }),
    );
  }

  @Put(':username')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({ summary: 'Update a bingo participant team or role from a bingo event' })
  @ApiNoContentResponse({ description: 'The bingo participant has been successfully updated.' })
  @ApiNotFoundResponse({ description: 'No bingo with provided Bingo Id was found.' })
  @ApiUnauthorizedResponse({ description: 'User not authed.' })
  @ApiForbiddenResponse({ description: 'Not authorized to update the bingo participant.' })
  async updateBingoParticipant(
    @Req() req: Request,
    @Param('bingoId') bingoId: string,
    @Param('username') username: string,
    @Body() updateBingoParticipantDto: UpdateBingoParticipantDto,
  ) {
    await this.commandBus.execute(
      new UpdateBingoParticipantCommand({
        requester: req.userEntity!,
        bingoId,
        username,
        updates: {
          teamName: updateBingoParticipantDto.teamName,
          role: updateBingoParticipantDto.role,
        },
      }),
    );
  }
}

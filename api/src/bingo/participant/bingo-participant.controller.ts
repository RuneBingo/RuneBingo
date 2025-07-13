import {
  Controller,
  Body,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
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
import { UpdateBingoParticipantCommand } from '@/bingo/participant/commands/update-bingo-participant.command';
import { BingoParticipantDto } from '@/bingo/participant/dto/bingo-participant.dto';
import { PaginatedBingoParticipantsDto } from '@/bingo/participant/dto/paginated-bingo-participants.dto';
import { UpdateBingoParticipantDto } from '@/bingo/participant/dto/update-bingo-participant.dto';
import { SearchBingoParticipantsQuery } from '@/bingo/participant/queries/search-bingo-participants.query';
import { BingoRoles } from '@/bingo/participant/roles/bingo-roles.constants';

@Controller('v1/bingo/:bingoId/participant')
export class BingoParticipantController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Search bingo participants' })
  @ApiOkResponse({ description: 'Bingo Participants.' })
  @ApiNotFoundResponse({ description: 'No bingo with provided Bingo Id was found.' })
  @ApiNotFoundResponse({ description: 'No team with provided slug was found.' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'team', required: false })
  @ApiQuery({ name: 'role', enum: ['participant', 'organizer', 'owner'], required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @ApiQuery({ name: 'sort', enum: ['username', 'role', 'teamName'], required: false })
  @ApiQuery({ name: 'order', enum: ['ASC', 'DESC'], required: false })
  async searchBingoParticipants(
    @Req() req: Request,
    @Param('bingoId') bingoId: string,
    @Query('query') query: string = '',
    @Query('team') teamName: string = '',
    @Query('role') role: BingoRoles | undefined,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('sort', new DefaultValuePipe('role')) sort: 'username' | 'role' | 'teamName',
    @Query('order', new DefaultValuePipe('DESC')) order: 'ASC' | 'DESC',
  ): Promise<PaginatedBingoParticipantsDto> {
    const { items, ...pagination } = await this.queryBus.execute(
      new SearchBingoParticipantsQuery({
        requester: req.userEntity!,
        bingoId,
        query,
        teamName,
        role,
        limit,
        offset,
        sort,
        order,
      }),
    );

    const bingoParticipantsDtos = await Promise.all(
      items.map(async (bingoParticipant) => BingoParticipantDto.fromBingoParticipant(bingoParticipant)),
    );

    return new PaginatedBingoParticipantsDto({ items: bingoParticipantsDtos, ...pagination });
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

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PaginatedActivitiesDto } from '@/activity/dto/paginated-activities.dto';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { AddBingoParticipantCommand } from '@/bingo/participant/commands/add-bingo-participant.command';
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
import { UserDto } from '@/user/dto/user.dto';

import { CancelBingoCommand } from './commands/cancel-bingo.command';
import { CreateBingoCommand } from './commands/create-bingo.command';
import { DeleteBingoCommand } from './commands/delete-bingo.command';
import { FormatBingoActivitiesCommand } from './commands/format-bingo-activities.command';
import { UpdateBingoCommand } from './commands/update-bingo.command';
import { BingoDto } from './dto/bingo.dto';
import { CreateBingoDto } from './dto/create-bingo.dto';
import { PaginatedBingosDto } from './dto/paginated-bingos.dto';
import { UpdateBingoDto } from './dto/update-bingo.dto';
import { FindBingoByBingoIdParams, FindBingoByBingoIdQuery } from './queries/find-bingo-by-bingo-id.query';
import { SearchBingoActivitiesParams, SearchBingoActivitiesQuery } from './queries/search-bingo-activities.query';
import { SearchBingosParams, SearchBingosQuery } from './queries/search-bingos.query';

@Controller('v1/bingo')
export class BingoController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new bingo event' })
  @ApiCreatedResponse({ description: 'The bingo event has been created.', type: BingoDto })
  @ApiBadRequestResponse({ description: 'The input values are invalid.' })
  async create(@Body(new ValidationPipe()) body: CreateBingoDto, @Req() req: Request): Promise<BingoDto> {
    const bingo = await this.commandBus.execute(
      new CreateBingoCommand({
        requester: req.userEntity!,
        language: body.language,
        title: body.title,
        description: body.description,
        isPrivate: body.private,
        width: body.width,
        height: body.height,
        fullLineValue: body.fullLineValue,
        startDate: body.startDate,
        endDate: body.endDate,
        maxRegistrationDate: body.maxRegistrationDate,
      }),
    );
    await this.commandBus.execute(
      new AddBingoParticipantCommand({ requester: null, user: req.userEntity!, bingo: bingo, role: BingoRoles.Owner }),
    );
    const createdBy = new UserDto(await bingo.createdBy);
    return new BingoDto(bingo, { createdBy });
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of bingos' })
  @ApiOkResponse({ description: 'Here are the bingos.' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', enum: ['pending', 'started', 'ended', 'canceled'], required: false })
  @ApiQuery({ name: 'private', type: Boolean, required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async getBingos(
    @Req() req: Request,
    @Query('search') search: string = '',
    @Query('status') status: string | undefined = undefined,
    @Query('private') isPrivate: string | undefined = undefined,
    @Query('participating') participating: string | undefined = undefined,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<PaginatedBingosDto> {
    const params = {
      requester: req.userEntity,
      search,
      status,
      isPrivate: isPrivate !== undefined ? isPrivate === 'true' : undefined,
      participating: participating !== undefined ? participating === 'true' : undefined,
      offset: offset ? parseInt(offset) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    } satisfies SearchBingosParams;

    const { items, ...pagination } = await this.queryBus.execute(new SearchBingosQuery(params));

    const bingosDto = await Promise.all(
      items.map(async (bingo) => new BingoDto(bingo, { createdBy: new UserDto(await bingo.createdBy) })),
    );

    return new PaginatedBingosDto({ items: bingosDto, ...pagination });
  }

  @Get(':bingoId')
  @ApiOperation({ summary: 'Find a bingo by its Bingo Id' })
  @ApiOkResponse({ description: 'The bingo has been found.', type: BingoDto })
  @ApiNotFoundResponse({ description: 'The bingo does not exist.' })
  async findByBingoId(@Param('bingoId') bingoId: string, @Req() req: Request): Promise<BingoDto> {
    const params: FindBingoByBingoIdParams = { bingoId: bingoId, requester: req.userEntity! };
    const bingo = await this.queryBus.execute(new FindBingoByBingoIdQuery(params));

    return new BingoDto(bingo);
  }

  @Put(':bingoId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a bingo event' })
  @ApiOkResponse({ description: 'The bingo has been updated.', type: BingoDto })
  @ApiBadRequestResponse({ description: 'Invalid request parameters.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to modify this bingo event.' })
  async update(
    @Req() req: Request,
    @Param('bingoId') bingoId: string,
    @Body(new ValidationPipe()) body: UpdateBingoDto,
  ): Promise<BingoDto> {
    const bingo = await this.commandBus.execute(
      new UpdateBingoCommand({
        requester: req.userEntity!,
        bingoId: bingoId,
        updates: {
          language: body.language,
          title: body.title,
          description: body.description,
          private: body.private,
          fullLineValue: body.fullLineValue,
          startDate: body.startDate,
          endDate: body.endDate,
          maxRegistrationDate: body.maxRegistrationDate,
        },
      }),
    );

    return new BingoDto(bingo);
  }

  @Get(':bingoId/activities')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get paginated list of bingo activities' })
  @ApiOkResponse({
    description: 'Sucessful query of bingo activities.',
    type: PaginatedActivitiesDto,
  })
  @ApiNotFoundResponse({ description: 'No bingo with provided bingoId was found.' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async getActivities(
    @Req() req: Request,
    @Param('bingoId') bingoId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<PaginatedActivitiesDto> {
    const params = {
      requester: req.userEntity!,
      bingoId,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    } satisfies SearchBingoActivitiesParams;

    const { items, ...pagination } = await this.queryBus.execute(new SearchBingoActivitiesQuery(params));

    const itemsDto = await this.commandBus.execute(new FormatBingoActivitiesCommand(items));
    return new PaginatedActivitiesDto({ items: itemsDto, ...pagination });
  }

  @Delete(':bingoId')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a bingo event' })
  @ApiNoContentResponse({ description: 'The bingo event has been successfully deleted.' })
  @ApiNotFoundResponse({ description: 'No bingo with provided Bingo Id was found.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to delete the bingo event.' })
  async delete(@Req() req: Request, @Param('bingoId') bingoId: string) {
    await this.commandBus.execute(
      new DeleteBingoCommand({
        requester: req.userEntity!,
        bingoId: bingoId,
      }),
    );
  }

  @Post(':bingoId/cancel')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Cancel a bingo event' })
  @ApiOkResponse({ description: 'The bingo event has been successfully cancelled.' })
  @ApiNotFoundResponse({ description: 'No bingo with provided Bingo Id was found.' })
  @ApiBadRequestResponse({ description: 'The bingo event was already cancelled or has ended.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to cancel the bingo event.' })
  async cancel(@Req() req: Request, @Param('bingoId') bingoId: string) {
    const bingo = await this.commandBus.execute(
      new CancelBingoCommand({
        requester: req.userEntity!,
        bingoId: bingoId,
      }),
    );
    const canceledBy = new UserDto(await bingo.canceledBy);
    const createdBy = new UserDto(await bingo.createdBy);
    return new BingoDto(bingo, { createdBy, canceledBy });
  }

  @Get(':bingoId/participants')
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

  @Delete(':bingoId/participants/:username')
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

  @Put(':bingoId/participants/:username')
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

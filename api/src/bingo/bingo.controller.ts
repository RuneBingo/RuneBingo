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
import { BingoRoles } from '@/bingo/participant/roles/bingo-roles.constants';
import { UserDto } from '@/user/dto/user.dto';

import { CancelBingoCommand } from './commands/cancel-bingo.command';
import { CreateBingoCommand } from './commands/create-bingo.command';
import { DeleteBingoCommand } from './commands/delete-bingo.command';
import { EndBingoCommand } from './commands/end-bingo.command';
import { FormatBingoActivitiesCommand } from './commands/format-bingo-activities.command';
import { ResetBingoCommand } from './commands/reset-bingo.command';
import { StartBingoCommand } from './commands/start-bingo.command';
import { UpdateBingoCommand } from './commands/update-bingo.command';
import { BingoDto } from './dto/bingo.dto';
import { CreateBingoDto } from './dto/create-bingo.dto';
import { PaginatedBingosDto } from './dto/paginated-bingos.dto';
import { ResetBingoDto } from './dto/reset-bingo.dto';
import { StartBingoDto } from './dto/start-bingo.dto';
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

    const createdByUser = await bingo.createdBy;
    const createdBy = createdByUser ? new UserDto(createdByUser) : undefined;
    return new BingoDto(bingo, { createdBy });
  }

  @Put(':bingoId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a bingo event details' })
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
        updates: body,
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

  @Post(':bingoId/start')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Start a bingo event immediately' })
  @ApiOkResponse({ description: 'The bingo event has been successfully started.' })
  @ApiNotFoundResponse({ description: 'No bingo with provided Bingo Id was found.' })
  @ApiBadRequestResponse({
    description:
      'The bingo event is not pending, nor ready to be started, or the end date must set to be in the future.',
  })
  @ApiUnauthorizedResponse({ description: 'Not authorized to start the bingo event.' })
  @ApiForbiddenResponse({ description: 'The user is not allowed to start the bingo event.' })
  async startBingo(@Req() req: Request, @Param('bingoId') bingoId: string, @Body() body: StartBingoDto) {
    const user = req.userEntity!;

    const bingo = await this.commandBus.execute(
      new StartBingoCommand({
        requester: user,
        bingoId,
        endDate: body.endDate,
      }),
    );

    const startedBy = await bingo.startedBy;
    return new BingoDto(bingo, { startedBy: startedBy ? new UserDto(startedBy) : undefined });
  }

  @Post(':bingoId/end')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'End a bingo event early' })
  @ApiOkResponse({ description: 'The bingo event has been successfully ended.' })
  @ApiNotFoundResponse({ description: 'No bingo with provided Bingo Id was found.' })
  @ApiBadRequestResponse({ description: 'The bingo event was already ended.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to end the bingo event.' })
  async end(@Req() req: Request, @Param('bingoId') bingoId: string) {
    const user = req.userEntity!;

    const bingo = await this.commandBus.execute(
      new EndBingoCommand({
        requester: user,
        bingoId: bingoId,
      }),
    );

    const endedBy = await bingo.endedBy;
    return new BingoDto(bingo, { endedBy: endedBy ? new UserDto(endedBy) : undefined });
  }

  @Post(':bingoId/cancel')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Cancel a bingo event' })
  @ApiOkResponse({ description: 'The bingo event has been successfully canceled.' })
  @ApiNotFoundResponse({ description: 'No bingo with provided Bingo Id was found.' })
  @ApiBadRequestResponse({ description: 'The bingo event was already canceled or has ended.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to cancel the bingo event.' })
  async cancel(@Req() req: Request, @Param('bingoId') bingoId: string) {
    const bingo = await this.commandBus.execute(
      new CancelBingoCommand({
        requester: req.userEntity!,
        bingoId: bingoId,
      }),
    );

    const canceledBy = await bingo.canceledBy;
    return new BingoDto(bingo, { canceledBy: canceledBy ? new UserDto(canceledBy) : undefined });
  }

  @Post(':bingoId/reset')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Reset a bingo event' })
  @ApiOkResponse({ description: 'The bingo event has been successfully reset.' })
  @ApiNotFoundResponse({ description: 'No bingo with provided Bingo Id was found.' })
  @ApiBadRequestResponse({ description: 'The bingo event was already reset.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to reset the bingo event.' })
  async reset(@Req() req: Request, @Param('bingoId') bingoId: string, @Body() body: ResetBingoDto) {
    const bingo = await this.commandBus.execute(
      new ResetBingoCommand({
        requester: req.userEntity!,
        bingoId: bingoId,
        startDate: body.startDate,
        endDate: body.endDate,
        maxRegistrationDate: body.maxRegistrationDate,
        deleteTiles: body.deleteTiles,
        deleteTeams: body.deleteTeams,
        deleteParticipants: body.deleteParticipants,
      }),
    );

    const resetBy = await bingo.resetBy;
    return new BingoDto(bingo, { resetBy: resetBy ? new UserDto(resetBy) : undefined });
  }
}

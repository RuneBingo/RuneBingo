import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';

import { AuthGuard } from '@/auth/guards/auth.guard';
import { type I18nTranslations } from '@/i18n/types';

import { CreateOrEditBingoTileCommand } from './commands/create-or-edit-bingo-tile.command';
import { DeleteBingoTileCommand } from './commands/delete-bingo-tile.command';
import { MoveBingoTileCommand } from './commands/move-bingo-tile.command';
import { BingoTileDto } from './dto/bingo-tile.dto';
import { CreateOrEditBingoTileDto } from './dto/create-or-edit-bingo-tile.dto';
import { DetailedBingoTileDto } from './dto/detailed-bingo-tile.dto';
import { FindBingoTilesByCoordinatesQuery } from './queries/find-bingo-tile-by-coordinates.query';
import { ListBingoTilesQuery } from './queries/list-bingo-tiles.query';

@Controller('v1/bingo/:bingoId/tile')
export class BingoTileController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all bingo tiles' })
  @ApiOkResponse({ description: 'The list of bingo tiles for the specified bingo' })
  @ApiNotFoundResponse({ description: 'No bingo with provided bingoId was found.' })
  async listBingoTiles(@Req() req: Request, @Param('bingoId') bingoId: string): Promise<BingoTileDto[]> {
    const requester = req.userEntity;
    const bingoTiles = await this.queryBus.execute(new ListBingoTilesQuery({ requester, bingoId }));

    const bingoTileDtos = await Promise.all(bingoTiles.map(async (bingoTile) => BingoTileDto.fromBingoTile(bingoTile)));

    return bingoTileDtos;
  }

  @Get(':x/:y')
  @ApiOperation({ summary: 'Find a bingo tile by coordinates' })
  @ApiOkResponse({ description: 'The bingo tile at the specified coordinates' })
  @ApiNotFoundResponse({
    description: 'No bingo tile with provided coordinates was found, or the bingo with provided bingoId was not found.',
  })
  async findBingoTileByCoordinates(
    @Req() req: Request,
    @Param('bingoId') bingoId: string,
    @Param('x', ParseIntPipe) x: number,
    @Param('y', ParseIntPipe) y: number,
  ): Promise<DetailedBingoTileDto> {
    const requester = req.userEntity;
    const bingoTile = await this.queryBus.execute(new FindBingoTilesByCoordinatesQuery({ requester, bingoId, x, y }));
    if (!bingoTile) {
      throw new NotFoundException(this.i18n.t('bingo.tile.findBingoTileByCoordinates.tileNotFound'));
    }

    return DetailedBingoTileDto.fromBingoTile(bingoTile);
  }

  @Put(':x/:y')
  @ApiOperation({ summary: 'Create or edit a bingo tile by coordinates' })
  @ApiOkResponse({ description: 'The bingo tile has been created or updated successfully.' })
  @ApiNotFoundResponse({
    description: 'No bingo with provided bingoId was found, or a specified media or associated item was not found.',
  })
  @ApiUnauthorizedResponse({ description: 'The user is not authenticated.' })
  @ApiForbiddenResponse({ description: 'The user is not allowed to edit this bingo tile.' })
  @ApiBadRequestResponse({ description: 'Invalid request parameters.' })
  @UseGuards(AuthGuard)
  async createOrEditBingoTile(
    @Req() req: Request,
    @Param('bingoId') bingoId: string,
    @Param('x', ParseIntPipe) x: number,
    @Param('y', ParseIntPipe) y: number,
    @Body() body: CreateOrEditBingoTileDto,
  ) {
    const requester = req.userEntity!;

    const bingoTile = await this.commandBus.execute(
      new CreateOrEditBingoTileCommand({
        requester,
        bingoId,
        x,
        y,
        data: body,
      }),
    );

    return DetailedBingoTileDto.fromBingoTile(bingoTile);
  }

  @Put(':x/:y/move/:toX/:toY')
  @ApiOperation({ summary: 'Move a bingo tile by coordinates' })
  @ApiOkResponse({ description: 'The bingo tile has been moved successfully.' })
  @ApiNotFoundResponse({
    description: 'No bingo with provided bingoId was found, or no bingo tile with provided coordinates was found.',
  })
  @ApiUnauthorizedResponse({ description: 'The user is not authenticated.' })
  @ApiForbiddenResponse({ description: 'The user is not allowed to move this bingo tile.' })
  @ApiBadRequestResponse({ description: 'Invalid request parameters.' })
  @UseGuards(AuthGuard)
  async moveBingoTile(
    @Req() req: Request,
    @Param('bingoId') bingoId: string,
    @Param('x', ParseIntPipe) x: number,
    @Param('y', ParseIntPipe) y: number,
    @Param('toX', ParseIntPipe) toX: number,
    @Param('toY', ParseIntPipe) toY: number,
  ) {
    const requester = req.userEntity!;

    const bingoTile = await this.commandBus.execute(new MoveBingoTileCommand({ requester, bingoId, x, y, toX, toY }));

    return DetailedBingoTileDto.fromBingoTile(bingoTile);
  }

  @Delete(':x/:y')
  @ApiOperation({ summary: 'Delete a bingo tile by coordinates' })
  @ApiNoContentResponse({ description: 'The bingo tile has been deleted successfully.' })
  @ApiNotFoundResponse({
    description: 'No bingo with provided bingoId was found, or no bingo tile with provided coordinates was found.',
  })
  @ApiUnauthorizedResponse({ description: 'The user is not authenticated.' })
  @ApiForbiddenResponse({ description: 'The user is not allowed to delete this bingo tile.' })
  @ApiBadRequestResponse({ description: 'Invalid request parameters.' })
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async deleteBingoTile(
    @Req() req: Request,
    @Param('bingoId') bingoId: string,
    @Param('x', ParseIntPipe) x: number,
    @Param('y', ParseIntPipe) y: number,
  ) {
    const requester = req.userEntity!;

    await this.commandBus.execute(new DeleteBingoTileCommand({ requester, bingoId, x, y }));
  }
}

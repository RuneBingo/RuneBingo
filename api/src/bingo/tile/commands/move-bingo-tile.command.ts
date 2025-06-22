import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { DataSource, Repository } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { BingoPolicies } from '@/bingo/bingo.policies';
import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { ViewBingoScope } from '@/bingo/scopes/view-bingo.scope';
import { I18nTranslations } from '@/i18n/types';
import { type User } from '@/user/user.entity';

import { BingoTile } from '../bingo-tile.entity';
import { BingoTileMovedEvent } from '../events/bingo-tile-moved.event';

export type MoveBingoTileParams = {
  requester: User;
  bingoId: string;
  x: number;
  y: number;
  toX: number;
  toY: number;
};

export type MoveBingoTileResult = BingoTile;

export class MoveBingoTileCommand extends Command<MoveBingoTileResult> {
  constructor(public readonly params: MoveBingoTileParams) {
    super();
  }
}

@CommandHandler(MoveBingoTileCommand)
export class MoveBingoTileCommandHandler {
  constructor(
    private readonly eventBus: EventBus,
    private readonly i18nService: I18nService<I18nTranslations>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
    @InjectRepository(BingoTile)
    private readonly bingoTileRepository: Repository<BingoTile>,
  ) {}

  async execute(command: MoveBingoTileCommand): Promise<MoveBingoTileResult> {
    const { requester, bingoId, x, y, toX, toY } = command.params;

    let bingoScope = this.bingoRepository.createQueryBuilder('bingo').where('bingo.bingo_id = :bingoId', { bingoId });
    bingoScope = new ViewBingoScope(requester, bingoScope).resolve();

    const bingo = await bingoScope.getOne();
    if (!bingo) {
      throw new NotFoundException(
        this.i18nService.t('bingo.tile.moveBingoTile.bingoNotFound', {
          args: {
            bingoId,
          },
        }),
      );
    }

    if (x <= 0 || toX <= 0 || x > bingo.width || toX > bingo.width) {
      throw new BadRequestException(
        this.i18nService.t('bingo.tile.moveBingoTile.badCoordinates', {
          args: {
            coordinate: 'x',
            max: bingo.width,
          },
        }),
      );
    }

    if (y <= 0 || toY <= 0 || y > bingo.height || toY > bingo.height) {
      throw new BadRequestException(
        this.i18nService.t('bingo.tile.moveBingoTile.badCoordinates', {
          args: {
            coordinate: 'y',
            max: bingo.height,
          },
        }),
      );
    }

    if (x === toX && y === toY) {
      throw new BadRequestException(this.i18nService.t('bingo.tile.moveBingoTile.sameCoordinates'));
    }

    const bingoParticipant = await this.bingoParticipantRepository.findOneBy({
      bingoId: bingo.id,
      userId: requester.id,
    });

    if (!new BingoPolicies(requester).canCreateOrEditTile(bingoParticipant, bingo)) {
      throw new ForbiddenException(this.i18nService.t('bingo.tile.createOrEditBingoTile.forbidden'));
    }

    const bingoTile = await this.bingoTileRepository.findOneBy({
      bingoId: bingo.id,
      x,
      y,
    });

    if (!bingoTile) {
      throw new NotFoundException(
        this.i18nService.t('bingo.tile.moveBingoTile.tileNotFound', {
          args: {
            x,
            y,
          },
        }),
      );
    }

    const toBingoTile = await this.bingoTileRepository.findOneBy({
      bingoId: bingo.id,
      x: toX,
      y: toY,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();

      if (toBingoTile) {
        // Temporarily move the target tile to a placeholder position to avoid conflicts
        const TEMP_COORD = 9999;
        toBingoTile.x = TEMP_COORD;
        toBingoTile.y = TEMP_COORD;
        await queryRunner.manager.save(toBingoTile);
      }

      bingoTile.x = toX;
      bingoTile.y = toY;
      bingoTile.updatedBy = Promise.resolve(requester);
      bingoTile.updatedById = requester.id;
      await queryRunner.manager.save(bingoTile);

      if (toBingoTile) {
        // Move the destination tile to the original position
        toBingoTile.x = x;
        toBingoTile.y = y;
        toBingoTile.updatedBy = Promise.resolve(requester);
        toBingoTile.updatedById = requester.id;
        await queryRunner.manager.save(toBingoTile);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    await this.eventBus.publish(
      new BingoTileMovedEvent({
        requesterId: requester.id,
        bingoId: bingo.id,
        x,
        y,
        toX,
        toY,
        swapped: Boolean(toBingoTile),
      }),
    );

    return bingoTile;
  }
}

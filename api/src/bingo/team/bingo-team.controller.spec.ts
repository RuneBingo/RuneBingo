import { Test, type TestingModule } from '@nestjs/testing';

import { BingoTeamController } from './bingo-team.controller';

describe('BingoTeamController', () => {
  let controller: BingoTeamController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BingoTeamController],
    }).compile();

    controller = module.get<BingoTeamController>(BingoTeamController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

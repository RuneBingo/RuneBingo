import { type ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';

import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { User } from '@/user/user.entity';

import { AuthGuard } from './auth.guard';
import { Roles } from '../roles/roles.constants';

describe('AuthGuard', () => {
  let module: TestingModule;
  let guard: AuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let mockContext: jest.Mocked<ExecutionContext>;
  let seedingService: SeedingService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule],
      providers: [
        AuthGuard,
        SeedingService,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    reflector = module.get(Reflector);
    seedingService = module.get<SeedingService>(SeedingService);

    await seedingService.initialize();
  });

  beforeEach(() => {
    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
      getHandler: jest.fn(),
    } as unknown as jest.Mocked<ExecutionContext>;
  });

  afterAll(async () => {
    await seedingService.clear();
    await module.close();
  });

  const setupRequest = (user: User | null) => {
    const request = { userEntity: user };
    jest.spyOn(mockContext.switchToHttp(), 'getRequest').mockReturnValue(request);
  };

  it('throws UnauthorizedException when no user is present', () => {
    setupRequest(null);

    jest.spyOn(reflector, 'get').mockReturnValue(undefined);

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when user is disabled', () => {
    const disabledUser = seedingService.getEntity(User, 'disabled_user');

    setupRequest(disabledUser);

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when user is deleted', () => {
    const deletedUser = seedingService.getEntity(User, 'deleted_user');

    setupRequest(deletedUser);

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it('throws ForbiddenException when user lacks required role', () => {
    const user = seedingService.getEntity(User, 'b0aty');

    setupRequest(user);
    jest.spyOn(reflector, 'get').mockReturnValue(Roles.Admin);

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('allows access when no role is required', () => {
    const user = seedingService.getEntity(User, 'b0aty');

    setupRequest(user);
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('allows access when user has required role', () => {
    const admin = seedingService.getEntity(User, 'char0o');
    const moderator = seedingService.getEntity(User, 'zezima');

    setupRequest(moderator);
    jest.spyOn(reflector, 'get').mockReturnValue(Roles.Moderator);

    expect(guard.canActivate(mockContext)).toBe(true);

    setupRequest(admin);
    jest.spyOn(reflector, 'get').mockReturnValue(Roles.Admin);

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('allows access when user has higher role than required', () => {
    const admin = seedingService.getEntity(User, 'char0o');
    const moderator = seedingService.getEntity(User, 'zezima');

    setupRequest(admin);
    jest.spyOn(reflector, 'get').mockReturnValue(Roles.Moderator);

    expect(guard.canActivate(mockContext)).toBe(true);

    setupRequest(moderator);
    jest.spyOn(reflector, 'get').mockReturnValue(Roles.User);

    expect(guard.canActivate(mockContext)).toBe(true);
  });
});

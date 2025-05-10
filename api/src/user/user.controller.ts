import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Put,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { I18n, I18nService } from 'nestjs-i18n';

import { PaginatedActivitiesDto } from '@/activity/dto/paginated-activities.dto';
import { AuthGuard } from '@/auth/guards/auth.guard';

import { FormatUserActivitiesCommand } from './commands/format-user-activities.command';
import { UpdateUserCommand } from './commands/update-user.command';
import { PaginatedUsersDto } from './dto/paginated-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { FindUserByUsernameQuery } from './queries/find-user-by-username.query';
import { SearchUserActivitiesParams, SearchUserActivitiesQuery } from './queries/search-user-activities.query';
import { SearchUsersParams, SearchUsersQuery } from './queries/search-users.query';

@Controller('v1/users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Search for users' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Some users may have been found.', type: PaginatedUsersDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'The search query or filters are invalid' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', enum: ['active', 'disabled'], required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async searchUsers(
    @Req() req: Request,
    @I18n() i18nService: I18nService,
    @Query('search') search: string = '',
    @Query('status') status: string | null = null,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    if (status && !['active', 'disabled'].includes(status)) {
      throw new BadRequestException(i18nService.t('user.searchUsers.invalidStatus'));
    }

    const params = {
      requester: req.userEntity,
      search,
      status: status as 'active' | 'disabled' | null,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    } satisfies SearchUsersParams;

    const { items, ...pagination } = await this.queryBus.execute(new SearchUsersQuery(params));

    const itemsDto = items.map((user) => new UserDto(user));

    return new PaginatedUsersDto({ items: itemsDto, ...pagination });
  }

  @Get(':username')
  @ApiOperation({ summary: 'Retrieve a user by their username normalized' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The user has been found.', type: UserDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "The user doesn't exist." })
  async getUserByUsername(@Param('username') username: string, @Req() req: Request) {
    const user = await this.queryBus.execute(new FindUserByUsernameQuery({ username, requester: req.userEntity }));

    return new UserDto(user);
  }

  @Put(':username')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a user by their username' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The user has been updated.', type: UserDto })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'The requester is not allowed to update the user or to change their role.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "The user doesn't exist." })
  async updateUserByUsername(@Param('username') username: string, @Body() body: UpdateUserDto, @Req() req: Request) {
    const user = await this.commandBus.execute(
      new UpdateUserCommand({ requester: req.userEntity!, username, updates: body }),
    );

    return new UserDto(user);
  }

  @Get(':username/activities')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Retrieve the activities of a user by their username' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The activities of the user have been found.',
    type: PaginatedActivitiesDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'The requester is not allowed to access the activities of the user.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "The user doesn't exist." })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async getUserActivitiesByUsername(
    @Param('username') username: string,
    @Req() req: Request,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const params = {
      requester: req.userEntity!,
      username,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    } satisfies SearchUserActivitiesParams;

    const { items, ...pagination } = await this.queryBus.execute(new SearchUserActivitiesQuery(params));

    const itemsDto = await this.commandBus.execute(new FormatUserActivitiesCommand(items));

    return new PaginatedActivitiesDto({ items: itemsDto, ...pagination });
  }
}

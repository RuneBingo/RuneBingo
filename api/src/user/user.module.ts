import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Activity } from '@/activity/activity.entity';

import { CreateUserHandler } from './commands/create-user.handler';
import { FormatUserActivitiesHandler } from './commands/format-user-activities.handler';
import { UpdateUserHandler } from './commands/update-user.handler';
import { UserCreatedHandler } from './events/user-created.handler';
import { UserUpdatedHandler } from './events/user-updated.handler';
import { FindUserByEmailHandler } from './queries/find-user-by-email.handler';
import { FindUserByUsernameHandler } from './queries/find-user-by-username.handler';
import { SearchUserActivitiesHandler } from './queries/search-user-activities.handler';
import { SearchUsersHandler } from './queries/search-users.handler';
import { UserController } from './user.controller';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, User])],
  providers: [
    // Commands
    FormatUserActivitiesHandler,
    CreateUserHandler,
    UpdateUserHandler,
    // Events
    UserCreatedHandler,
    UserUpdatedHandler,
    // Queries
    FindUserByEmailHandler,
    FindUserByUsernameHandler,
    SearchUsersHandler,
    SearchUserActivitiesHandler,
  ],
  controllers: [UserController],
})
export class UserModule {}

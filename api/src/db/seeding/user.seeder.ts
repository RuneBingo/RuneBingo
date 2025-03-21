import Joi from 'joi';

import { Roles } from '@/auth/roles/roles.constants';
import { User } from '@/user/user.entity';

import { Seeder } from './seeder';

type UserSeed = {
  username: string;
  email: string;
  emailVerified: boolean;
  role: Roles;
  language: string;
};

const userSeedSchema = Joi.object<Record<string, UserSeed>>().pattern(
  Joi.string(),
  Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    emailVerified: Joi.boolean().required(),
    role: Joi.string()
      .valid(...Object.values(Roles))
      .required(),
    language: Joi.string().required(),
  }),
);

export class UserSeeder extends Seeder<User, UserSeed> {
  entityName = User.name;
  identifierColumn = 'usernameNormalized' as keyof User;
  schema = userSeedSchema;

  protected deserialize(seed: UserSeed): User {
    const emailNormalized = User.normalizeEmail(seed.email);
    const usernameNormalized = User.normalizeUsername(seed.username);
    const gravatarHash = User.generateGravatarHash(emailNormalized);

    const user = new User();
    user.username = seed.username;
    user.usernameNormalized = usernameNormalized;
    user.email = seed.email;
    user.emailNormalized = emailNormalized;
    user.emailVerified = seed.emailVerified;
    user.role = seed.role;
    user.language = seed.language;
    user.gravatarHash = gravatarHash;

    return user;
  }

  protected getIdentifier(entity: User): string {
    return entity.usernameNormalized;
  }
}

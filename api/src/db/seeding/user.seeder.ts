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
  disabledAt?: Date;
  deletedAt?: Date;
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
    disabledAt: Joi.date().optional(),
    deletedAt: Joi.date().optional(),
  }),
);

export class UserSeeder extends Seeder<User, UserSeed> {
  entityName = User.name;
  identifierColumns = ['usernameNormalized'] satisfies (keyof User)[];
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
    user.disabledAt = seed.disabledAt ?? null;
    user.deletedAt = seed.deletedAt ?? null;

    return user;
  }

  protected getIdentifier(entity: User) {
    return { usernameNormalized: entity.usernameNormalized };
  }
}

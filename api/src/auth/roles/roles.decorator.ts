import { SetMetadata } from '@nestjs/common';

import { type Roles } from './roles.constants';

export const Role = (role: Roles) => SetMetadata('role', role);

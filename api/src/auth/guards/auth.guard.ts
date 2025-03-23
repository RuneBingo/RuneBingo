import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Roles } from '../roles/roles.constants';
import { userHasRole } from '../roles/roles.utils';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<Roles | undefined>('role', context.getHandler());
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.userEntity || request.userEntity.isDeleted || request.userEntity.isDisabled) {
      throw new UnauthorizedException();
    }

    if (!requiredRole || userHasRole(request.userEntity, requiredRole)) {
      return true;
    }

    throw new ForbiddenException();
  }
}

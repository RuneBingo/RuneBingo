import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Session } from '../session.entity';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(@InjectRepository(Session) private readonly sessionRepository: Repository<Session>) {}

  async use(req: Request, _: Response, next: NextFunction) {
    if (!req.session.uuid) {
      return next();
    }

    const session = await this.sessionRepository.findOne({
      where: { uuid: req.session.uuid },
      relations: ['user'],
    });

    if (!session || session.isSignedOut) {
      delete req.session.uuid;
      return next();
    }

    const user = await session.user;
    if (!user || user.isDeleted || user.isDisabled) {
      delete req.session.uuid;
      return next();
    }

    req.userEntity = user;
    req.sessionEntity = session;
    req.session.language = user.language;

    next();
  }
}

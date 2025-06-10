import { Module } from '@nestjs/common';

import { OsrsItemModule } from './item/osrs-item.module';

@Module({
  imports: [OsrsItemModule],
})
export class OsrsModule {}

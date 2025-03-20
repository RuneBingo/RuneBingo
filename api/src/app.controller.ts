import { Controller, Get, Query, BadRequestException } from '@nestjs/common';

import { HelloWorldJob } from './jobs/hello-world.job';
import { JobsService } from './jobs/jobs.service';

@Controller('v1')
export class AppController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async getHello(@Query('name') name?: string) {
    if (name === undefined) {
      throw new BadRequestException('Name is required');
    }

    await this.jobsService.perform(new HelloWorldJob({ name }));
  }
}

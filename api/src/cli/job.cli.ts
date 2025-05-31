import { Injectable } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';

import { JOB_QUEUES, type JobQueue } from '@/jobs/jobs.constants';
import { JobsService } from '@/jobs/jobs.service';

@Injectable()
@Command({ name: 'run-job', description: 'Run a job by its name with optional JSON parameters' })
export class RunJobCommand extends CommandRunner {
  constructor(private readonly jobsService: JobsService) {
    super();
  }

  async run(inputs: string[], options: { params?: string }): Promise<void> {
    const jobName = inputs[0];

    if (!jobName) {
      console.error('❌ Job name is required!');
      console.log(`Available jobs: ${JOB_QUEUES.join(', ')}`);
      return;
    }

    if (!JOB_QUEUES.includes(jobName as JobQueue)) {
      console.error(`❌ Invalid job name: ${jobName}`);
      console.log(`Available jobs: ${JOB_QUEUES.join(', ')}`);
      return;
    }

    let params = {};
    if (options.params) {
      try {
        params = JSON.parse(options.params) as object;
      } catch (error) {
        console.error('❌ Invalid JSON parameters:', error instanceof Error ? error.message : error);
        return;
      }
    }

    try {
      console.log(`🚀 Running job: ${jobName}`);
      if (Object.keys(params).length > 0) {
        console.log(`📋 Parameters: ${JSON.stringify(params, null, 2)}`);
      }

      // Create a generic job object that matches the Job interface
      const job = {
        queue: jobName as JobQueue,
        params,
      };

      await this.jobsService.perform(job);
      console.log(`✅ Job "${jobName}" has been queued successfully!`);
    } catch (error) {
      console.error('❌ Failed to run job:', error instanceof Error ? error.message : error);
    }
  }

  @Option({
    name: 'params',
    flags: '-p, --params <params>',
    description: 'JSON parameters for the job',
  })
  parseParams(val: string): string {
    return val;
  }
}

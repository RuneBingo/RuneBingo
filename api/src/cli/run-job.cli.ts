import { Injectable } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';

import { type Job } from '@/jobs/job';
import { JOB_CLASS_MAP, JOB_QUEUES, type JobQueue } from '@/jobs/jobs.constants';
import { JobsService } from '@/jobs/jobs.service';

type JobClassConstructor<T extends object = object> = new (params: T) => Job<T>;

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

      // Resolve the job class and instantiate it
      const JobClass = JOB_CLASS_MAP[jobName as keyof typeof JOB_CLASS_MAP] as JobClassConstructor;

      if (!JobClass) {
        console.error(`❌ Job class not found for: ${jobName}`);
        return;
      }

      let jobInstance: Job;

      // Handle jobs that don't require constructor params (like MediaCleanupJob)
      if (jobName === 'media-cleanup') {
        jobInstance = new (JobClass as new () => Job)();
      } else {
        // For jobs that require constructor params (like HelloWorldJob)
        jobInstance = new JobClass(params);
      }

      await this.jobsService.perform(jobInstance);
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

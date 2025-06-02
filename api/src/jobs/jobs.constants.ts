import { type RepeatOptions } from 'bullmq';

import { MediaCleanupJob } from '@/media/media-cleanup.job';

import { HelloWorldJob } from './hello-world.job';

export const JOB_QUEUES = [
  // Add your job queues here
  'hello-world',
  'media-cleanup',
] as const;

export const JOB_CLASS_MAP = {
  'hello-world': HelloWorldJob,
  'media-cleanup': MediaCleanupJob,
} as const;

export type JobQueue = (typeof JOB_QUEUES)[number];

export const CRON_JOBS = [
  {
    job: 'media-cleanup',
    params: {},
    repeat: { pattern: '0 0 * * *' }, // Every day at midnight
  },
] as const satisfies { job: JobQueue; params: object; repeat: RepeatOptions }[];

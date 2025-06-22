import { type RepeatOptions } from 'bullmq';

import { MediaCleanupJob } from '@/media/media-cleanup.job';
import { SyncOsrsItemsJob } from '@/osrs/item/sync-osrs-items.job';

import { HelloWorldJob } from './hello-world.job';

export const JOB_QUEUES = [
  // Add your job queues here
  'hello-world',
  'media-cleanup',
  'sync-osrs-items',
] as const;

export const JOB_CLASS_MAP = {
  'hello-world': HelloWorldJob,
  'media-cleanup': MediaCleanupJob,
  'sync-osrs-items': SyncOsrsItemsJob,
} as const;

export type JobQueue = (typeof JOB_QUEUES)[number];

export const CRON_JOBS = [
  {
    job: 'media-cleanup',
    params: {},
    repeat: { pattern: '0 0 * * *' }, // Every day at midnight
  },
  {
    job: 'sync-osrs-items',
    params: {},
    repeat: { pattern: '0 0 * * 1' }, // Every Monday at midnight
  },
] as const satisfies { job: JobQueue; params: object; repeat: RepeatOptions }[];

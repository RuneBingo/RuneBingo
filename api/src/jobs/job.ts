import { type JobQueue } from './jobs.constants';

export type Job<T extends object = object> = {
  readonly queue: JobQueue;
  params?: T;
};

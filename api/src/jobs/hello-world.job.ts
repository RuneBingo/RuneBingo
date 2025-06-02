import { type Job } from './job';

export type HelloWorldParams = {
  name: string;
};

export class HelloWorldJob implements Job<HelloWorldParams> {
  public readonly queue = 'hello-world';

  constructor(public readonly params: HelloWorldParams) {}
}

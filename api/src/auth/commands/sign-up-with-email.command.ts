import { Command } from '@nestjs/cqrs';

export type SignUpWithEmailResult = {
  code: string;
};

export class SignUpWithEmailCommand extends Command<SignUpWithEmailResult> {
  constructor(
    public readonly email: string,
    public readonly username: string,
    public readonly language: string,
  ) {
    super();
  }
}

export type UserCreatedParams = {
  userId: number;
  requesterId?: number | null;
  email: string;
  emailVerified: boolean;
  username: string;
  language: string;
};

export class UserCreatedEvent {
  public readonly userId: number;
  public readonly requesterId: number | null;
  public readonly email: string;
  public readonly emailVerified: boolean;
  public readonly username: string;
  public readonly language: string;

  constructor({ userId, requesterId = null, email, emailVerified, username, language }: UserCreatedParams) {
    this.userId = userId;
    this.requesterId = requesterId;
    this.email = email;
    this.emailVerified = emailVerified;
    this.username = username;
    this.language = language;
  }
}

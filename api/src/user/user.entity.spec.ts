import { User } from './user.entity';

describe('User', () => {
  it('normalizes emails adequately', () => {
    expect(User.normalizeEmail('jOHn.dOe@gmaIL.com')).toBe('john.doe@gmail.com');
  });

  it('normalizes usernames adequately', () => {
    expect(User.normalizeUsername('John Doe')).toBe('john doe');
    expect(User.normalizeUsername('jOhN dOe 96A')).toBe('john doe 96a');
  });
});

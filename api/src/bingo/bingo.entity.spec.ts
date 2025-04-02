import { Bingo } from './bingo.entity';

describe('BingoEntity', () => {
  it('should slugify the multi-word title correctly', () => {
    const expectedTitle = 'my-little-bingo';
    const slug = Bingo.slugifyTitle('My little bingo');

    expect(slug).toBe(expectedTitle);
  });

  it('should slugify the title', () => {
    const expectedTitle = 'mysmallbingo';
    const slug = Bingo.slugifyTitle('mYsmaLlbIngO');

    expect(slug).toBe(expectedTitle);
  });
});

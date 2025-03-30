import slugify from 'slugify';

export function slugifyTitle(title: string): string {
  // TODO: find out why this is unsafe and fix it
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return slugify(title, {
    lower: true,
    strict: true,
    locale: 'en',
  });
}

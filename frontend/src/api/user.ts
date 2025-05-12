import { put } from '.';

export async function updateUserByUsername(
  usernameNormalized: string,
  updates: { username?: string; language?: string },
) {
  return put(`/users/${usernameNormalized}`, updates);
}

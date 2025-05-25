import { put } from '.';
import type { UpdateUserDto, UserDto } from './types';

export async function updateUserByUsername(
  usernameNormalized: string,
  updates: { username?: string; language?: string },
) {
  return put<UpdateUserDto, UserDto>(`/users/${usernameNormalized}`, updates);
}

import { get, post } from '.';
import type { SignInWithEmailDto, SignUpWithEmailDto, UserDto, VerifyAuthCodeDto } from './types';

export async function getAuthenticatedUser() {
  const response = await get<UserDto>('/auth');
  if ('error' in response) {
    return null;
  }

  return response.data;
}

export async function signOut() {
  await post('/auth/sign-out');
}

export async function signInWithEmail(email: string) {
  return post<SignInWithEmailDto>('/auth/sign-in', { email });
}

export async function signUpWithEmail(email: string, username: string) {
  return post<SignUpWithEmailDto>('/auth/sign-up', { email, username });
}

export async function verifyCode(email: string, code: string) {
  return post<VerifyAuthCodeDto>('/auth/verify-code', { email, code });
}

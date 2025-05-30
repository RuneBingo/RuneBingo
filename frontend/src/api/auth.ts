import { get, post, put } from '.';
import {
  type SetCurrentBingoDto,
  type AuthenticationDetailsDto,
  type ShortBingoDto,
  type SignInWithEmailDto,
  type SignUpWithEmailDto,
  type VerifyAuthCodeDto,
} from './types';

export async function getAuthenticatedUser() {
  const response = await get<AuthenticationDetailsDto>('/auth');
  if ('error' in response) {
    return null;
  }

  return response.data;
}

export async function listMyBingos(search = '') {
  const response = await get<ShortBingoDto[]>('/auth/my-bingos', { search });
  if ('error' in response) {
    throw new Error(response.error);
  }

  return response.data;
}

export async function setCurrentBingo(bingoId: string) {
  return put<SetCurrentBingoDto>('/auth/current-bingo', { bingoId });
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

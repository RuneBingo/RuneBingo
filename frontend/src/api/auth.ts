import { get, post } from '.';

export type GetAuthenticatedUserResult = {
  username: string;
  usernameNormalized: string;
  gravatarHash: string;
  language: string;
  role: string;
};

export async function getAuthenticatedUser() {
  const response = await get<GetAuthenticatedUserResult>('/auth');
  if ('error' in response) {
    return null;
  }

  return response.data;
}

export async function signOut() {
  await post('/auth/sign-out');
}

export async function requestSignIn(email: string) {
  return post('/auth/sign-in', { email });
}

export async function requestSignUp(email: string, username: string) {
  return post('/auth/sign-up', { email, username });
}

export async function verifyCode(email: string, code: string) {
  return post('/auth/verify-code', { email, code });
}

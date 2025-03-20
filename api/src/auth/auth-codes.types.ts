export type AuthAction = 'sign-in' | 'sign-up';

export type AuthCodePayload = {
  action: AuthAction;
};

export type SignInCodePayload = {
  action: 'sign-in';
};

export type SignUpCodePayload = {
  action: 'sign-up';
  username: string;
  language: string;
};

import Joi from 'joi';

import { type SignInCodePayload, type SignUpCodePayload } from './auth-codes.types';

export const signInCodeSchema = Joi.object<SignInCodePayload>({
  action: Joi.string().valid('sign-in').required(),
});

export const signUpCodeSchema = Joi.object<SignUpCodePayload>({
  action: Joi.string().valid('sign-up').required(),
  username: Joi.string().required(),
  language: Joi.string().required(),
});

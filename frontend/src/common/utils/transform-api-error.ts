import type { FormikErrors } from 'formik';

import type { ApiError } from '@/api';

export function transformApiError<T>(error: ApiError): { message?: string; validationErrors?: FormikErrors<T> } {
  if (error.statusCode !== 400 || !Array.isArray(error.message)) return { message: error.message as string };

  const entries = error.message
    .map(({ property, constraints }) => {
      if (!constraints) return null;

      const messages = Object.values(constraints);
      return [property, messages[0]];
    })
    .filter(Boolean) as [string, string][];

  const validationErrors = Object.fromEntries(entries) as FormikErrors<T>;

  return { validationErrors };
}

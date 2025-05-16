import { getLocale as getLocaleIntl } from 'next-intl/server';

import { DEFAULT_LOCALE } from '@/i18n';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type ApiResult<TResult> = {
  data: TResult;
  statusCode: number;
};

export type ApiError = {
  statusCode: number;
  message: string | ValidationError[];
  error: string;
};

export type ValidationError = {
  property: string;
  constraints?: Record<string, string>;
  children?: ValidationError[];
};

const baseUrl = process.env.NEXT_PUBLIC_API_URL!;
const isServer = typeof window === 'undefined';

let cookiesFn: () => Promise<string>;
async function getServerCookies() {
  if (!isServer) return undefined;

  if (cookiesFn) return cookiesFn();

  const { cookies } = await import('next/headers');
  cookiesFn = async () => (await cookies()).toString();
  return cookiesFn();
}

async function getLocale(): Promise<string> {
  if (isServer) return await getLocaleIntl();

  const html = document.querySelector('html');
  if (!html || !html.getAttribute('lang')) return DEFAULT_LOCALE;

  return html.getAttribute('lang') as string;
}

async function execute<TData, TResult>(
  method: RequestMethod,
  path: string,
  data?: TData,
): Promise<ApiResult<TResult> | ApiError> {
  const locale = await getLocale();

  const headers = new Headers();
  headers.set('Accept-Language', locale);

  let body: string | undefined;

  if (data) {
    body = JSON.stringify(data);
    headers.set('Content-Type', 'application/json; charset=utf-8');
  }

  const cookieHeader = isServer ? await getServerCookies() : undefined;
  if (cookieHeader) {
    headers.set('Cookie', cookieHeader.toString());
  }

  const url = `${baseUrl}${path}`;

  let result: unknown;
  const response = await fetch(url, {
    method,
    headers,
    body,
    credentials: 'include',
  });

  const resultType = response.headers.get('Content-Type');

  if (resultType) {
    if (resultType.includes('json')) {
      result = await response.json();
    } else if (resultType.includes('text')) {
      result = await response.text();
    } else {
      throw new Error(`The content type "${resultType}" is not supported.`);
    }
  }

  if (!response.ok) return result as ApiError;

  return { data: result as TResult, statusCode: response.status };
}

export async function _delete<TResult = unknown>(url: string) {
  return execute<never, TResult>('DELETE', url);
}

export async function get<TResult = unknown>(url: string) {
  return await execute<never, TResult>('GET', url);
}

export async function post<TData, TResult = unknown>(url: string, data?: TData) {
  return await execute<TData, TResult>('POST', url, data);
}

export async function put<TData, TResult = unknown>(url: string, data?: TData) {
  return await execute<TData, TResult>('PUT', url, data);
}

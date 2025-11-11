import { getLocale as getLocaleIntl } from 'next-intl/server';

import { DEFAULT_LOCALE } from '@/i18n';

export type OrderBy<T extends object> = {
  field: keyof T;
  order: 'ASC' | 'DESC';
};

export type PaginatedQueryParams<T> = T & {
  limit?: number;
  offset?: number;
};

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

export type RequestOptions = {
  contentType?: 'application/json' | 'multipart/form-data';
};

const baseUrl = process.env.NEXT_PUBLIC_API_URL!;
const isServer = typeof window === 'undefined';
const defaultOptions = {
  contentType: 'application/json',
} as const satisfies RequestOptions;

function createFormData<TData>(data: TData) {
  const formData = new FormData();
  for (const key in data) {
    const value = data[key];
    if (value instanceof Blob || typeof value === 'string') {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  }
  return formData;
}

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
  options?: RequestOptions,
): Promise<ApiResult<TResult> | ApiError> {
  const locale = await getLocale();

  const { contentType } = { ...defaultOptions, ...options };

  const headers = new Headers();
  headers.set('Accept-Language', locale);

  const body = (() => {
    if (!data) return undefined;

    if (contentType === 'application/json') {
      headers.set('Content-Type', 'application/json');
      return JSON.stringify(data);
    }

    return createFormData(data);
  })();

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

export async function _delete<TData, TResult = unknown>(url: string, data?: TData) {
  return execute<TData, TResult>('DELETE', url, data);
}

export async function get<TResult = unknown>(
  url: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined) continue;

    queryParams.set(key, String(value));
  }

  const queryString = queryParams.toString();
  const urlWithParams = queryString ? `${url}?${queryString}` : url;

  return await execute<never, TResult>('GET', urlWithParams);
}

export async function post<TData, TResult = unknown>(url: string, data?: TData, options?: RequestOptions) {
  return await execute<TData, TResult>('POST', url, data, options);
}

export async function put<TData, TResult = unknown>(url: string, data?: TData, options?: RequestOptions) {
  return await execute<TData, TResult>('PUT', url, data, options);
}

import { get } from '.';
import type { PaginatedOsrsItemsDto } from './types';

export async function searchItems(search: string, enabled?: boolean, limit?: number, offset?: number) {
  return get<PaginatedOsrsItemsDto>('/osrs/item', { search, enabled, limit, offset });
}

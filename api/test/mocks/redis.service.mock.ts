/* eslint-disable @typescript-eslint/require-await */
type RedisValue = {
  value: string;
  expiresAt?: number;
};

export class RedisServiceMock {
  private store = new Map<string, RedisValue>();

  async set(key: string, value: string, ttl?: number) {
    const expiresAt = ttl ? Date.now() + ttl : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async get(key: string) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  async delete(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  getStore() {
    return this.store;
  }
}

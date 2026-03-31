import { offlineStorage } from '../persistence/OfflineStorage';

interface FetchResult<T> {
  data: T;
  fromCache: boolean;
}

export const syncManager = {
  async cacheData(key: string, data: any): Promise<void> {
    await offlineStorage.set(key, data);
  },

  async getCachedData<T>(key: string): Promise<T | null> {
    return offlineStorage.get<T>(key);
  },

  async fetchWithFallback<T>(
    key: string,
    fetcher: () => Promise<T>,
  ): Promise<FetchResult<T> | null> {
    try {
      const data = await fetcher();
      await offlineStorage.set(key, data);
      return { data, fromCache: false };
    } catch {
      const cached = await offlineStorage.get<T>(key);
      if (cached !== null) {
        return { data: cached, fromCache: true };
      }
      return null;
    }
  },
};

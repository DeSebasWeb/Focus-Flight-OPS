import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('offline_cache.db');
  }
  return db;
}

export const offlineStorage = {
  async init(): Promise<void> {
    const database = await getDb();
    await database.execAsync(
      `CREATE TABLE IF NOT EXISTS offline_cache (
        key TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );`
    );
  },

  async set(key: string, data: any): Promise<void> {
    const database = await getDb();
    const json = JSON.stringify(data);
    const now = Date.now();
    await database.runAsync(
      'INSERT OR REPLACE INTO offline_cache (key, data, updated_at) VALUES (?, ?, ?)',
      [key, json, now]
    );
  },

  async get<T>(key: string): Promise<T | null> {
    const database = await getDb();
    const row = await database.getFirstAsync<{ data: string }>(
      'SELECT data FROM offline_cache WHERE key = ?',
      [key]
    );
    if (!row) return null;
    return JSON.parse(row.data) as T;
  },

  async remove(key: string): Promise<void> {
    const database = await getDb();
    await database.runAsync('DELETE FROM offline_cache WHERE key = ?', [key]);
  },

  async clear(): Promise<void> {
    const database = await getDb();
    await database.runAsync('DELETE FROM offline_cache');
  },
};

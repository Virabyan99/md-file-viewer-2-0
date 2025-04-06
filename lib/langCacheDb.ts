// lib/langCacheDb.ts
import Dexie, { Table } from 'dexie';

interface LangEntry {
  hash: string;
  lang: string;
  ts: number; // Added timestamp
}

class LangCacheDb extends Dexie {
  langMap!: Table<LangEntry>;

  constructor() {
    super('LangCacheDB');
    this.version(1).stores({
      langMap: 'hash',
    });
  }
}

export const db = new LangCacheDb();
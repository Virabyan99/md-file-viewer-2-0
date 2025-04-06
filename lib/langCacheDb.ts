import Dexie, { Table } from 'dexie';

interface LangEntry {
  hash: string;
  lang: string;
}

class LangCacheDb extends Dexie {
  langMap!: Table<LangEntry>;

  constructor() {
    super('LangCacheDB');
    this.version(1).stores({
      langMap: 'hash'
    });
  }
}

export const db = new LangCacheDb();
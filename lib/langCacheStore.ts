import { create } from 'zustand';
import { db } from './langCacheDb';

type LangCache = {
  memory: Record<string, string>;
  get: (hash: string) => Promise<string | null>;
  set: (hash: string, lang: string) => Promise<void>;
};

export const useLangCache = create<LangCache>((set, get) => ({
  memory: {},
  get: async (hash) => {
    const memory = get().memory;
    if (memory[hash]) return memory[hash];

    const entry = await db.langMap.get(hash);
    if (entry) {
      set((state) => ({ memory: { ...state.memory, [hash]: entry.lang } }));
      return entry.lang;
    }

    return null;
  },
  set: async (hash, lang) => {
    set((state) => ({ memory: { ...state.memory, [hash]: lang } }));
    await db.langMap.put({ hash, lang });
  }
}));
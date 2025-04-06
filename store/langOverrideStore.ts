// src/store/langOverrideStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type LangOverrides = {
  overrides: Record<string, string>; // hash => language
  set: (hash: string, lang: string) => void;
  get: (hash: string) => string | undefined;
};

export const useLangOverrides = create<LangOverrides>()(
  persist(
    (set, get) => ({
      overrides: {},
      set: (hash, lang) =>
        set((state) => ({
          overrides: { ...state.overrides, [hash]: lang },
        })),
      get: (hash) => get().overrides[hash],
    }),
    {
      name: 'lang-override-cache', // Key for localStorage
    }
  )
);
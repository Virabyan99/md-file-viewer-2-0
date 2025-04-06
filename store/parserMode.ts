// src/store/parserMode.ts
import { create } from 'zustand';

type ParserMode = 'strict' | 'auto' | 'raw';

export const useParserMode = create<{
  mode: ParserMode;
  setMode: (m: ParserMode) => void;
}>((set) => ({
  mode: 'auto', // Default mode
  setMode: (m) => set({ mode: m }),
}));
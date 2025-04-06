// src/components/ParserModeToggle.tsx
'use client';
import { useParserMode } from '@/store/parserMode';

export function ParserModeToggle() {
  const { mode, setMode } = useParserMode();

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      Parser Mode:
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as ParserMode)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="strict">Strict</option>
        <option value="auto">Auto</option>
        <option value="raw">Raw</option>
      </select>
    </div>
  );
}
// lib/detectLanguageWithAI.ts
import { useLangCache } from './langCacheStore';
import { sha256 } from '@noble/hashes/sha256';

export async function detectLanguageWithAI(code: string): Promise<string> {
  const hash = Buffer.from(sha256(code)).toString('hex');
  const cache = useLangCache.getState();

  // Check cache first
  const cachedLang = await cache.get(hash);
  if (cachedLang) {
    return cachedLang;
  }

  // Call the API with a single code block (for now)
  const response = await fetch('/api/detectLanguage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ codes: [code] }), // Send as an array
  });

  if (!response.ok) {
    console.error('Failed to detect language');
    return 'text';
  }

  const data = await response.json();
  const language = data.results[0].language;

  // Cache the result
  await cache.set(hash, language);

  return language;
}
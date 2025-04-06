import { useLangCache } from './langCacheStore';
import { sha256 } from '@noble/hashes/sha256';

export async function detectLanguageWithAI(code: string): Promise<string> {
  // Generate a hash of the code block for caching
  const hash = Buffer.from(sha256(code)).toString('hex');
  const cache = useLangCache.getState();

  // Check cache first
  const cachedLang = await cache.get(hash);
  if (cachedLang) {
    return cachedLang;
  }

  // If not cached, call the API
  const response = await fetch('/api/detectLanguage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    console.error('Failed to detect language');
    return 'text'; // Fallback to plain text
  }

  const data = await response.json();
  const language = data.language;

  // Cache the result
  await cache.set(hash, language);

  return language;
}
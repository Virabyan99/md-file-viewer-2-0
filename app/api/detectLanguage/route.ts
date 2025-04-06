// app/api/detectLanguage/route.ts
import { NextResponse } from 'next/server';
import { sha256 } from '@noble/hashes/sha256';

export const runtime = 'edge';

export async function POST(request: Request) {
  const { codes } = await request.json(); // Expecting an array of code blocks

  if (!Array.isArray(codes)) {
    return NextResponse.json({ error: 'Invalid input: expected an array of code blocks' }, { status: 400 });
  }

  const results = await Promise.all(
    codes.map(async (code: string) => {
      const hash = Buffer.from(sha256(code)).toString('hex');

      try {
        // Check if the language is cached in KV
        const cachedLang = await getFromKV(hash);
        if (cachedLang) {
          return { code, language: cachedLang };
        }

        // If not cached, detect the language
        const prompt = [
          {
            role: 'system',
            content:
              'You are a code language identifier. Respond only with the programming language name (e.g., js, python, html, css, text) if there is a text beside code blocks you dont have to touch them, text must be returned as a text.',
          },
          {
            role: 'user',
            content: `What language is this code written in?\n\`\`\`\n${code}\n\`\`\``,
          },
        ];

        const model = '@cf/meta/llama-3-8b-instruct';
        const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACC_ID}/ai/run/${model}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_WORKERAI}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: prompt }),
        });

        if (!response.ok) {
          throw new Error('Failed to detect language');
        }

        const data = await response.json();
        const output = data.result?.response?.trim().toLowerCase() || 'text';
        const knownLanguages = ['js', 'javascript', 'html', 'css', 'python', 'bash', 'text'];
        const language = knownLanguages.includes(output) ? output : 'text';

        // Cache the result in KV
        await putToKV(hash, language);

        return { code, language };
      } catch (error) {
        console.error('Error detecting language:', error);
        return { code, language: 'text' };
      }
    })
  );

  return NextResponse.json({ results });
}

// Helper functions remain unchanged
async function getFromKV(key: string): Promise<string | null> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACC_ID}/storage/kv/namespaces/${process.env.CLOUDFLARE_KV_NAMESPACE_ID}/values/${key}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    },
  });
  if (response.ok) {
    return await response.text();
  }
  return null;
}

async function putToKV(key: string, value: string): Promise<void> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACC_ID}/storage/kv/namespaces/${process.env.CLOUDFLARE_KV_NAMESPACE_ID}/values/${key}`;
  await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(value),
  });
}
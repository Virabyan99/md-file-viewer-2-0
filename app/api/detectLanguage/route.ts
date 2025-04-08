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
              'You are a Markdown formatting and syntax repair assistant.\n\n' +
              'You will receive a Markdown document that may contain various malformations, along with an optional list of lint issues detected in the document.\n' +
              'Your task is to identify and correct all formatting issues without altering the content, meaning, or structure. You must fix every structural error and produce a single valid Markdown document.\n\n' +
              '---\n\n' +
              '### Guidelines for Specific Issues:\n' +
              '1. **Heading Syntax:**\n' +
              '- Ensure every heading uses the appropriate number of “#” symbols followed by a single space (e.g., `# Heading 1`, `## Heading 2`).\n' +
              '- If the document uses setext-style headings (e.g., `Heading\n===`), convert them to ATX-style (`# Heading`) for consistency.\n' +
              '- Remove any extra spaces and place headings on their own line.\n' +
              '2. **List Formatting:**\n' +
              '- Correct list indentation using 2 spaces per nesting level.\n' +
              '- Use a consistent bullet symbol (e.g., “-”) for unordered lists, unless the original strongly implies mixed usage.\n' +
              '- For numbered lists, ensure there is a space after the number and period.\n' +
              '- Remove empty lines within lists unless they separate distinct items.\n' +
              '- Recognize and format task lists consistently (e.g., `- [ ] Task`, `- [x] Completed`).\n' +
              '... (continue with full prompt as provided)',
          },
          {
            role: 'user',
            content: `What language is this code written in?\n\`\`\`\n${code}\n\`\`\``,
          },
        ];

        const model = '@hf/thebloke/openhermes-2.5-mistral-7b-awq';
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

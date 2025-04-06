import { NextResponse } from 'next/server';
import { sha256 } from '@noble/hashes/sha256';

export const runtime = 'edge';

export async function POST(request: Request) {
  const { code } = await request.json();

  // Generate a hash for the code block to use as a cache key
  const hash = Buffer.from(sha256(code)).toString('hex');

  try {
    // Check if the language is already cached in KV
    const cachedLang = await getFromKV(hash);
    if (cachedLang) {
      return NextResponse.json({ language: cachedLang });
    }

    // If not cached, proceed with language detection
    const prompt = [
      {
        role: "system",
        content:
          "You are a code language identifier. Respond only with the programming language name (e.g., js, python, html, css, text).",
      },
      {
        role: "user",
        content: `What language is this code written in?

\`\`\`
${code}
\`\`\``,
      },
    ];

    const model = "@cf/meta/llama-3-8b-instruct";
    const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACC_ID}/ai/run/${model}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_WORKERAI}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: prompt }),
    });

    if (!response.ok) {
      throw new Error("Failed to detect language");
    }

    const data = await response.json();
    const output = data.result?.response?.trim().toLowerCase() || "text";
    const knownLanguages = ["js", "javascript", "html", "css", "python", "bash", "text"];
    const language = knownLanguages.includes(output) ? output : "text";

    // Cache the detected language in KV
    await putToKV(hash, language);

    return NextResponse.json({ language });
  } catch (error) {
    console.error("Error in language detection:", error);
    return NextResponse.json({ language: "text" }, { status: 500 });
  }
}

// Helper function to get a value from KV
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

// Helper function to put a value into KV
async function putToKV(key: string, value: string): Promise<void> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACC_ID}/storage/kv/namespaces/${process.env.CLOUDFLARE_KV_NAMESPACE_ID}/values/${key}`;
  await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });
}
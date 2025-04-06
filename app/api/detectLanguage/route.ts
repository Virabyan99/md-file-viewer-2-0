import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { code } = await request.json();

  const prompt = [
    { role: "system", content: "You are a code language identifier. Respond only with the programming language name (e.g., js, python, html, css, text)." },
    { role: "user", content: `What language is this code written in?

\`\`\`
${code}
\`\`\`` }
  ];

  const model = "@cf/meta/llama-3-8b-instruct"; // You can swap this with another model if desired
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACC_ID}/ai/run/${model}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.CLOUDFLARE_WORKERAI}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ messages: prompt })
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to detect language' }, { status: 500 });
  }

  const data = await response.json();
  const output = data.result?.response?.trim().toLowerCase() || 'text';

  const knownLanguages = ['js', 'javascript', 'html', 'css', 'python', 'bash', 'text'];
  const language = knownLanguages.includes(output) ? output : 'text';

  return NextResponse.json({ language });
}
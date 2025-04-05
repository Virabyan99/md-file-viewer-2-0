'use client';

import { useState } from 'react';
import Dropzone from '@/components/Dropzone';
import { parseMarkdownToHtml } from '@/lib/parseMarkdown';

export default function HomePage() {
  const [markdownHtml, setMarkdownHtml] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFile(file: File) {
    setFileName(file.name); // Store the file name

    const text = await file.text(); // Read the file content as text

    const html = parseMarkdownToHtml(text); // Parse Markdown to HTML

    setMarkdownHtml(html); // Store the HTML in state
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl">
        <Dropzone onFileAccepted={handleFile} />

        {fileName && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Loaded file: <strong>{fileName}</strong>
          </div>
        )}

        {markdownHtml && (
          <article
            className="prose prose-neutral mt-10"
            dangerouslySetInnerHTML={{ __html: markdownHtml }}
          />
        )}
      </div>
    </main>
  );
}
'use client';

import { useEffect, useRef, useState } from 'react';
import Dropzone from '@/components/Dropzone';
import { parseMarkdownToHtml } from '@/lib/parseMarkdown';
import { splitHtmlByH2Sections } from '@/lib/splitHtmlBySections';

export default function HomePage() {
  const [sections, setSections] = useState<string[]>([]); // Array of section HTML strings
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // Track the current page index
  const articleRef = useRef<HTMLElement>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setFileName(file.name);
    const text = await file.text();

    const html = await parseMarkdownToHtml(text);
    const split = splitHtmlByH2Sections(html); // Split HTML into sections

    setSections(split);
    setCurrentPage(0); // Start at the first page
    setLoading(false);
  }

  // Dynamically add copy buttons to code blocks after rendering
  useEffect(() => {
    if (!articleRef.current) return;

    const blocks = articleRef.current.querySelectorAll('.shiki');
    blocks.forEach((block) => {
      if (block.querySelector('button.copy-btn')) return;

      const button = document.createElement('button');
      button.innerText = 'Copy';
      button.className =
        'copy-btn absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
      button.setAttribute('aria-label', 'Copy code to clipboard');
      button.setAttribute('tabindex', '0');

      button.onclick = () => {
        const code = block.textContent || '';
        navigator.clipboard.writeText(code.trim()).catch(console.error);
        button.innerText = 'Copied!';
        setTimeout(() => (button.innerText = 'Copy'), 1500);
      };

      block.classList.add('relative');
      block.appendChild(button);
    });
  }, [sections, currentPage]); // Re-run when sections or currentPage change

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl">
        <Dropzone onFileAccepted={handleFile} />

        {fileName && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Loaded file: <strong>{fileName}</strong>
          </div>
        )}

        {loading && <p className="mt-4 text-center text-sm text-gray-400">Rendering...</p>}

        {sections.length > 0 && (
          <>
            <article
              ref={articleRef}
              className="prose prose-neutral dark:prose-invert mt-10"
              dangerouslySetInnerHTML={{ __html: sections[currentPage] }} // Render current page
            />

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
                className="px-4 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                ← Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, sections.length - 1))}
                disabled={currentPage === sections.length - 1}
                className="px-4 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                Next →
              </button>
            </div>

            <div className="mt-2 text-center text-sm text-gray-400">
              Page {currentPage + 1} of {sections.length}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
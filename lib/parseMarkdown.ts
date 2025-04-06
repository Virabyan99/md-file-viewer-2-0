import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import * as shiki from 'shiki';

// Load the highlighter once with themes and languages
let highlighterPromise = shiki.createHighlighter({
  themes: ['github-light'],
  langs: ['javascript', 'typescript', 'html', 'css'],
});

export async function parseMarkdownToHtml(content: string): Promise<string> {
  const highlighter = await highlighterPromise;

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: (code: string, lang: string): string => {
      try {
        if (lang && highlighter.getLoadedLanguages().includes(lang)) {
          return highlighter.codeToHtml(code, {
            lang,
            theme: 'github-light',
          });
        }
      } catch {
        // Fallback below
      }
      // Updated fallback with shiki-fallback class
      return `<pre class="shiki shiki-fallback"><code>${md.utils.escapeHtml(code)}</code></pre>`;
    },
  });

  const rawHtml = md.render(content);
  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
  });
}
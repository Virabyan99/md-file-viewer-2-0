import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';

// Create the parser instance
const md = new MarkdownIt({
  html: true,          // Allow raw HTML in Markdown (sanitized later)
  linkify: true,       // Auto-link URLs
  typographer: true,   // Smart quotes and dashes
});

// Convert raw Markdown to HTML, then sanitize it
export function parseMarkdownToHtml(content: string): string {
  const rawHtml = md.render(content);
  const safeHtml = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true }, // Enable basic safe HTML only
  });
  return safeHtml;
}
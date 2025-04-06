import { detectLanguageWithAI } from './detectLanguageWithAI';

export async function preprocessMarkdownWithLLM(content: string): Promise<string> {
  const lines = content.split('\n');
  const wrapped: string[] = [];
  let buffer: string[] = [];
  let insideBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if we're entering or exiting a fenced code block
    if (line.trim().startsWith('```')) {
      if (!insideBlock) {
        // Process any buffered untagged code
        if (buffer.length >= 2) {
          const lang = await detectLanguageWithAI(buffer.join('\n'));
          wrapped.push(`\`\`\`${lang}`, ...buffer, '```');
        } else {
          wrapped.push(...buffer);
        }
        buffer = [];
      }
      wrapped.push(line); // Preserve the original fenced block
      insideBlock = !insideBlock;
      continue;
    }

    // If inside a fenced block, just pass the line through
    if (insideBlock) {
      wrapped.push(line);
      continue;
    }

    // Handle untagged code-like text
    if (line.trim() === '') {
      if (buffer.length >= 2) {
        const lang = await detectLanguageWithAI(buffer.join('\n'));
        wrapped.push(`\`\`\`${lang}`, ...buffer, '```');
      } else {
        wrapped.push(...buffer);
      }
      buffer = [];
      wrapped.push(''); // Preserve blank lines
    } else {
      buffer.push(line); // Buffer potential code lines
    }
  }

  // Process any remaining buffered lines
  if (buffer.length >= 2) {
    const lang = await detectLanguageWithAI(buffer.join('\n'));
    wrapped.push(`\`\`\`${lang}`, ...buffer, '```');
  } else {
    wrapped.push(...buffer);
  }

  return wrapped.join('\n');
}
import { detectLanguageWithAI } from './detectLanguageWithAI';
import { useParserMode } from '@/store/parserMode';

export async function preprocessMarkdownWithLLM(content: string): Promise<string> {
  const mode = useParserMode.getState().mode;

  if (mode === 'raw') {
    return content; // Skip preprocessing
  }

  if (mode === 'strict') {
    // Treat all untagged code as plain text
    return content.replace(/```[\s\S]*?```/g, (match) => {
      if (!match.startsWith('```') || match.startsWith('```\n')) {
        return match.replace(/```(\w*)/, '```text');
      }
      return match; // Preserve tagged blocks
    });
  }

  // Default 'auto' mode: use AI to detect languages
  const lines = content.split('\n');
  const wrapped: string[] = [];
  let buffer: string[] = [];
  let insideBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (!insideBlock) {
        if (buffer.length >= 2) {
          const lang = await detectLanguageWithAI(buffer.join('\n'));
          wrapped.push(`\`\`\`${lang}`, ...buffer, '```');
        } else {
          wrapped.push(...buffer);
        }
        buffer = [];
      }
      wrapped.push(line);
      insideBlock = !insideBlock;
      continue;
    }

    if (insideBlock) {
      wrapped.push(line);
      continue;
    }

    if (line.trim() === '') {
      if (buffer.length >= 2) {
        const lang = await detectLanguageWithAI(buffer.join('\n'));
        wrapped.push(`\`\`\`${lang}`, ...buffer, '```');
      } else {
        wrapped.push(...buffer);
      }
      buffer = [];
      wrapped.push('');
    } else {
      buffer.push(line);
    }
  }

  if (buffer.length >= 2) {
    const lang = await detectLanguageWithAI(buffer.join('\n'));
    wrapped.push(`\`\`\`${lang}`, ...buffer, '```');
  } else {
    wrapped.push(...buffer);
  }

  return wrapped.join('\n');
}
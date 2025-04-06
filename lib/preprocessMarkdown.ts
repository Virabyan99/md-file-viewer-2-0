export function preprocessMarkdown(content: string): string {
    const lines = content.split('\n');
    const wrapped: string[] = [];
    let buffer: string[] = [];
    let insideBlock = false;
  
    const isCodeLike = (line: string) =>
      /^( {0,4})(function|const|let|var|if|while|for|class|return|import|export|async|await|try|catch|throw)/.test(line.trim()) ||
      line.trim().endsWith(';') ||
      line.trim().endsWith('{') ||
      line.trim().startsWith('  ') ||
      /^[<>\/{}[\]()=+\-*%&|^!?:.,]/.test(line.trim());
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
  
      if (line.trim().startsWith('```')) {
        // Pass through existing fenced code blocks untouched
        if (!insideBlock) {
          wrapped.push(...flushBuffer(buffer));
        }
        buffer = [];
        wrapped.push(line);
        insideBlock = !insideBlock;
        continue;
      }
  
      if (insideBlock) {
        wrapped.push(line);
        continue;
      }
  
      if (isCodeLike(line)) {
        buffer.push(line);
      } else {
        if (buffer.length >= 2) {
          wrapped.push('```text', ...buffer, '```');
        } else {
          wrapped.push(...buffer);
        }
        buffer = [];
        wrapped.push(line);
      }
    }
  
    // Flush any remaining buffer
    if (buffer.length >= 2) {
      wrapped.push('```text', ...buffer, '```');
    } else {
      wrapped.push(...buffer);
    }
  
    return wrapped.join('\n');
  }
  
  function flushBuffer(buffer: string[]): string[] {
    if (buffer.length >= 2) {
      return ['```text', ...buffer, '```'];
    }
    return buffer;
  }
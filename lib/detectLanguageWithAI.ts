export async function detectLanguageWithAI(code: string): Promise<string> {
    const response = await fetch('/api/detectLanguage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
  
    if (!response.ok) {
      console.error('Failed to detect language');
      return 'text'; // Fallback to plain text
    }
  
    const data = await response.json();
    return data.language;
  }

  
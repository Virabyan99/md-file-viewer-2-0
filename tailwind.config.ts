import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%', // Allow content to span the full container width
            color: '#374151', // Neutral gray (neutral-700)
            a: {
              color: '#2563eb', // Blue-600 for links
              textDecoration: 'underline',
              fontWeight: '500',
              '&:hover': {
                color: '#1d4ed8', // Blue-700 on hover
              },
            },
            h1: {
              fontSize: '2.25rem',
              fontWeight: '700',
              lineHeight: '2.5rem',
            },
            h2: {
              fontSize: '1.875rem',
              fontWeight: '600',
              lineHeight: '2.25rem',
              marginTop: '2rem',
              marginBottom: '1rem',
            },
            h3: {
              fontSize: '1.5rem',
              fontWeight: '600',
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
            },
            code: {
              color: '#d63384', // Subtle purple-pink for inline code
              backgroundColor: '#f3f4f6', // Light gray background
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
            },
            'pre code': {
              backgroundColor: 'transparent', // No extra background in code blocks
              padding: '0',
              borderRadius: '0',
              color: 'inherit',
              fontSize: 'inherit',
            },
            pre: {
              backgroundColor: '#f9fafb', // Light background for code blocks
              borderRadius: '0.5rem',
              padding: '1rem',
              overflowX: 'auto', // Horizontal scrolling for long lines
            },
            blockquote: {
              borderLeftColor: '#d1d5db', // Gray-300 for left border
              fontStyle: 'italic',
              color: '#6b7280', // Gray-500 for text
            },
            table: {
              borderCollapse: 'collapse',
              width: '100%',
            },
            th: {
              borderBottom: '1px solid #d1d5db', // Gray-300 border
              textAlign: 'left',
              padding: '0.5rem',
              fontWeight: '600',
              backgroundColor: '#f3f4f6', // Light gray background
            },
            td: {
              borderBottom: '1px solid #e5e7eb', // Gray-200 border
              textAlign: 'left',
              padding: '0.5rem',
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
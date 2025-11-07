import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'sm': '576px',
      'md': '768px',
      'lg': '1068px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        'bricolage': ['var(--font-bricolage-grotesque)', 'sans-serif'],
        'poppins': ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        'blubeez-blue': '#2d4e92',
        'blubeez-dark': '#132341',
        'blubeez-navy': '#2f4f93',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#807f7f',
            '--tw-prose-headings': '#2d4e92',
            '--tw-prose-bold': '#181818',
            '--tw-prose-links': '#2f4f93',
            '--tw-prose-code': '#181818',
            '--tw-prose-quotes': '#807f7f',
            '--tw-prose-bullets': '#807f7f',
            '--tw-prose-counters': '#807f7f',
            maxWidth: 'none',
            fontFamily: 'var(--font-poppins)',
            fontSize: '1rem',
            lineHeight: '1.6',
            p: {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
            'p:last-child': {
              marginBottom: '0',
            },
            strong: {
              fontWeight: '600',
              color: '#181818',
            },
            'ol, ul': {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
              paddingLeft: '1.25rem',
            },
            li: {
              marginTop: '0.25rem',
              marginBottom: '0.25rem',
            },
            'h1, h2, h3': {
              fontFamily: 'var(--font-bricolage-grotesque)',
              fontWeight: '600',
              color: '#2d4e92',
            },
            h1: {
              fontSize: '1.25rem',
              marginTop: '0.75rem',
              marginBottom: '0.5rem',
            },
            h2: {
              fontSize: '1.125rem',
              marginTop: '0.75rem',
              marginBottom: '0.5rem',
            },
            h3: {
              fontSize: '1rem',
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
            a: {
              color: '#2f4f93',
              textDecoration: 'underline',
              fontWeight: '500',
              '&:hover': {
                opacity: '0.7',
              },
            },
            code: {
              backgroundColor: '#f5f5f5',
              padding: '0.125rem 0.375rem',
              borderRadius: '0.25rem',
              fontSize: '0.9em',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#f5f5f5',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
            blockquote: {
              fontStyle: 'italic',
              borderLeftWidth: '4px',
              borderLeftColor: '#2d4e92',
              paddingLeft: '1rem',
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
            hr: {
              borderColor: '#d5d5d5',
              marginTop: '1rem',
              marginBottom: '1rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;


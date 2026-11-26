import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          soft: 'var(--color-primary-soft)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          dark: 'var(--color-accent-dark)',
          deep: 'var(--color-accent-deep)',
          soft: 'var(--color-accent-soft)',
          tint: 'var(--color-accent-tint)',
        },
        surface: 'var(--color-surface)',
        body: 'var(--color-text)',
        muted: 'var(--color-text-secondary)',
        line: 'var(--color-border)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
      },
      fontFamily: {
        sans: ['var(--font-nunito-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-quicksand)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '1rem',
        pill: '9999px',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(23, 70, 56, 0.06)',
        lift: '0 8px 24px rgba(23, 70, 56, 0.1)',
        accentSoft: '0 2px 12px rgba(201, 91, 77, 0.14)',
        accentLift: '0 8px 24px rgba(168, 62, 49, 0.22)',
      },
      spacing: {
        18: '4.5rem',
      },
    },
  },
  plugins: [],
};
export default config;

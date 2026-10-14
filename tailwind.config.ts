import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './config/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      colors: {
        accent: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
          glow: 'var(--accent-glow)',
          soft: 'var(--accent-soft)',
        },
        surface: {
          base: 'var(--surface-base)',
          elevated: 'var(--surface-elevated)',
          glass: 'var(--surface-glass)',
          border: 'var(--surface-border)',
        },
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        glass:
          '0 20px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.14)',
        'glass-light':
          '0 18px 40px -12px rgba(15, 23, 42, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
        glow: '0 0 35px -5px var(--accent-glow)',
      },
      keyframes: {
        kenburns: {
          '0%': { transform: 'scale(1) translate3d(0, 0, 0)' },
          '50%': { transform: 'scale(1.08) translate3d(-1.5%, -1%, 0)' },
          '100%': { transform: 'scale(1) translate3d(0, 0, 0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseUrgent: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.75', transform: 'scale(1.02)' },
        },
      },
      animation: {
        kenburns: 'kenburns 28s ease-in-out infinite',
        'float-slow': 'floatSlow 4s ease-in-out infinite',
        'pulse-urgent': 'pulseUrgent 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;

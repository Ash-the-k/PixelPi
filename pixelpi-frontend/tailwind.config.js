/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Public — Backgrounds
        'bg-base': '#080C14',
        'bg-elevated': '#0D1220',
        'bg-subtle': '#131928',
        // Public — Text (solid values only; rgba handled via CSS vars)
        'text-primary': '#F0F2F8',
        // Brand Accent
        accent: '#4F6BCC',
        'accent-hover': '#6B8CFF',
        'accent-subtle':   'rgba(79, 107, 204, 0.12)',
        // Semantic
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#38BDF8',
        // Admin — Surfaces
        'admin-bg': '#F8F9FB',
        'admin-surface': '#FFFFFF',
        'admin-subtle': '#F1F3F7',
        'admin-border': '#E2E6EE',
        'admin-text': '#111827',
        'admin-accent': '#4F6BCC',
        // Sidebar
        'sidebar-bg': '#0D1220',
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': ['76px', { lineHeight: '1.05', fontWeight: '700' }],
        'display-lg': ['56px', { lineHeight: '1.10', fontWeight: '700' }],
        'display-md': ['40px', { lineHeight: '1.15', fontWeight: '600' }],
        'display-sm': ['26px', { lineHeight: '1.25', fontWeight: '600' }],
        'body-lg': ['19px', { lineHeight: '1.70' }],
        'body-md': ['16px', { lineHeight: '1.65' }],
        'body-sm': ['14px', { lineHeight: '1.60' }],
        'label': ['13px', { lineHeight: '1.50', fontWeight: '500' }],
        'caption': ['12px', { lineHeight: '1.50' }],
        'mono-md': ['14px', { lineHeight: '1.60' }],
        'mono-sm': ['12px', { lineHeight: '1.50' }],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '10px',
        xl: '16px',
        full: '9999px',
      },
      maxWidth: {
        content: '1200px',
        text: '720px',
        narrow: '560px',
      },
      transitionDuration: {
        fast: '175ms',
        moderate: '275ms',
      },
    },
  },
  plugins: [],
};
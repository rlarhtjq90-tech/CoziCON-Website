import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a2dff',
          100: '#f0f6ff',
          200: '#d1dbfa',
          300: '#9cb4fc',
          400: '#4c79ff',
          500: '#1a2dff',
          600: '#091eaa',
          700: '#000966',
        },
        brand: {
          'slate-100': '#f3f6fc',
          'slate-200': '#e0e7f5',
          'slate-400': '#7585a3',
          'slate-600': '#293857',
          'slate-700': '#132039',
        },
        ink: {
          200: '#edeff2',
          300: '#dbdde1',
          400: '#818898',
          500: '#5c6370',
          600: '#363d49',
          700: '#0f1624',
        },
      },
      fontSize: {
        't1': ['3rem',      { lineHeight: '1.2',   letterSpacing: '-0.02em', fontWeight: '700' }],
        't2': ['2.25rem',   { lineHeight: '1.25',  letterSpacing: '-0.02em', fontWeight: '700' }],
        't3': ['2rem',      { lineHeight: '1.25',  letterSpacing: '-0.02em' }],
        't4': ['1.75rem',   { lineHeight: '1.3',   letterSpacing: '-0.02em' }],
        't5': ['1.5rem',    { lineHeight: '1.3' }],
        't6': ['1.375rem',  { lineHeight: '1.4' }],
        't7': ['1.125rem',  { lineHeight: '1.5' }],
        'p20': ['1.25rem',  { lineHeight: '1.6' }],
        'p18': ['1.125rem', { lineHeight: '1.6' }],
        'p16': ['1rem',     { lineHeight: '1.625' }],
        'p14': ['0.875rem', { lineHeight: '1.625' }],
        'p13': ['0.8125rem',{ lineHeight: '1.5' }],
        'p12': ['0.75rem',  { lineHeight: '1.5' }],
      },
      screens: {
        'tablet': '800px',
        'laptop': '1136px',
        'desktop': '1600px',
      },
      backgroundImage: {
        'gradient-blue45':   'linear-gradient(130.18deg, #4c79ff 6.52%, #1a2dff)',
        'gradient-blue56':   'linear-gradient(101.68deg, #1a2dff 3.65%, #003399 109.87%)',
        'gradient-hero':     'linear-gradient(180deg, #f3f6fc 0%, #ffffff 100%)',
        'gradient-dark-cta': 'linear-gradient(90.05deg, #263759 0.04%, #132039 99.95%)',
        'gradient-stats':    'linear-gradient(101.68deg, #1a2dff 3.65%, #003399 109.87%)',
      },
      fontFamily: {
        pretendard: ['Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card-sm':  '0 0.125rem 0.5rem rgba(19,32,57,.04), 0 0.25rem 0.0625rem rgba(19,32,57,.02)',
        'card-md':  '0 0.5rem 1.25rem rgba(19,32,57,.06), 0 0.25rem 0.75rem rgba(19,32,57,.04)',
        'card-lg':  '0 1.25rem 2.5rem rgba(19,32,57,.08)',
        'btn-glow': '0 0.25rem 1.25rem rgba(51,119,255,.35)',
      },
    },
  },
  plugins: [],
}

export default config

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Configuración principal con slate
        slate: {
          50: 'var(--color-slate-50)',
          100: 'var(--color-slate-100)',
          200: 'var(--color-slate-200)',
          300: 'var(--color-slate-300)',
          400: 'var(--color-slate-400)',
          500: 'var(--color-slate-500)',
          600: 'var(--color-slate-600)',
          700: 'var(--color-slate-700)',
          800: 'var(--color-slate-800)',
          900: 'var(--color-slate-900)',
        },
      },
      // Configuración para modo oscuro automático
      backgroundColor: {
        dark: {
          primary: '#0f172a', // slate-900
          secondary: '#1e293b', // slate-800
          card: '#334155', // slate-700
        },
      },
      textColor: {
        dark: {
          primary: '#f8fafc', // slate-50
          secondary: '#e2e8f0', // slate-200
          muted: '#94a3b8', // slate-400
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-void': 'var(--bg-void)',
        'bg-deep': 'var(--bg-deep)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        'monad-purple': 'var(--monad-purple)',
        'monad-glow': 'var(--monad-glow)',
        'monad-dim': 'var(--monad-dim)',
        'amber-blood': 'var(--amber-blood)',
        'amber-dim': 'var(--amber-dim)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-dim': 'var(--text-dim)',
        'border-glow': 'var(--border-glow)',
        'border-subtle': 'var(--border-subtle)',
      },
      fontFamily: {
        'display': 'var(--font-display)',
        'body': 'var(--font-body)',
        'mono': 'var(--font-mono)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
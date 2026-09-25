/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        "primary": "#008181",
        "card": "#f7f7f7",
        "heading": "#f5f5f5",
        "resumeable": "#E5AC49",
        // Desktop chrome. Derived from the brand teal rather than neutral greys,
        // so the wide layout still reads as Gurukul and not as a generic shell.
        "primary-dark": "#006A6A",
        "primary-soft": "#E4F0F0",
        "ink": "#04302F",
        "ink-soft": "#0B4442",
        "surface": "#EEF2F2",
        "line": "#DDE5E5",
      },
      spacing: {
        // Width of the desktop navigation rail; used by the rail itself and by
        // the content offset next to it.
        "rail": "16.5rem",
      },
    },
  },
  plugins: [],
}

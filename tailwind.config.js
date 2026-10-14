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
        // Desktop chrome. The navigation rail uses the brand teal itself; these
        // are the supporting tints and the tinted neutrals that go with it.
        "primary-dark": "#006A6A",
        "primary-soft": "#E4F0F0",
        // Body text on light surfaces. Near-black with a faint green cast so it
        // sits with the teal instead of against it; not used as a fill.
        "ink": "#04302F",
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

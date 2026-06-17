/** @type {import('tailwindcss').Config} */

/*
 * "Vibrant Modern" theme — derived from the Stitch landing-page export
 * (project "Vibrant Modern Footer Redesign").
 *
 * The Stitch design is expressed as Material 3 tokens. To keep every existing
 * component className working, those tokens are projected onto the palette
 * scales the app already consumes:
 *   - `gold`   ← primary / primary-container / primary-fixed family (brand)
 *   - `beige`  ← surface / surface-container / on-surface family (neutrals+text)
 *   - `silver` ← secondary / outline-variant family
 * Plus accent colors (vibrant-blue, accent-gold, success-teal), `tertiary`,
 * and `error`. Legacy `emerald`/`slate` names are remapped so older utility
 * classes adopt the theme automatically.
 *
 * Anchor tokens (Stitch export):
 *   primary #745a2b   primary-container #b0915c   primary-fixed-dim #e4c288
 *   surface/background #fcf9f6   surface-container #f0edeb
 *   on-surface #1c1c1a  on-surface-variant #4d463a  outline #7f7669
 *   secondary #5d5e5f   tertiary #4f5e7f
 *   vibrant-blue #3B82F6  accent-gold #B08D57  success-teal #14B8A6
 */

// primary family → gold scale (brand). gold-600 is the most-used CTA color, so
// it is anchored on Stitch `primary` (#745a2b, deep bronze).
const gold = {
  50: '#FBF7EF', // lightest tint (primary/5 backgrounds)
  100: '#FFDEA9', // primary-fixed
  200: '#F0D9A6',
  300: '#E4C288', // primary-fixed-dim / inverse-primary
  400: '#C9A86A',
  500: '#B0915C', // primary-container (Gold Base)
  600: '#745A2B', // primary (deep bronze — primary CTAs / surface-tint)
  700: '#5A4315', // on-primary-fixed-variant (darker brand)
  800: '#3F2A00', // on-primary-container
  900: '#271900', // on-primary-fixed
};

// secondary / outline-variant family → neutral "silver" scale.
const silver = {
  50: '#F5F5F4', // surface-soft
  100: '#EBE7E5', // surface-container-high
  200: '#E0DFDF', // secondary-container
  300: '#D1C5B6', // outline-variant
  400: '#A39E96',
  500: '#7F7669', // outline
  600: '#5D5E5F', // secondary
  700: '#4D463A', // on-surface-variant
  800: '#3A352C',
  900: '#1C1C1A', // on-surface
};

// surface / surface-container / on-surface(-variant) → warm neutral + text.
const beige = {
  50: '#FCF9F6', // surface / background
  100: '#F6F3F1', // surface-container-low
  200: '#F0EDEB', // surface-container
  300: '#EBE7E5', // surface-container-high
  400: '#D1C5B6', // outline-variant
  500: '#7F7669', // outline
  600: '#4D463A', // on-surface-variant (Headings)
  700: '#3A352C',
  800: '#2A261F',
  900: '#1C1C1A', // on-surface (Body Text)
};

// tertiary family (cool blue accent) from the Stitch export.
const tertiary = {
  50: '#EEF2FB',
  100: '#D8E2FF', // tertiary-fixed
  200: '#B7C6EC', // tertiary-fixed-dim
  300: '#8695B9', // tertiary-container
  400: '#677A9F',
  500: '#4F5E7F', // tertiary
  600: '#3C4A66',
  700: '#384766', // on-tertiary-fixed-variant
  800: '#1E2D4C', // on-tertiary-container
  900: '#0A1B38', // on-tertiary-fixed
};

// error family from the Stitch export.
const error = {
  50: '#FFF5F4',
  100: '#FFDAD6', // error-container
  200: '#FFB4AB',
  300: '#FF897D',
  400: '#FF5449',
  500: '#DE3730',
  600: '#BA1A1A', // error
  700: '#93000A', // on-error-container
  800: '#690005',
  900: '#410002',
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold,
        silver,
        bronze: gold,
        beige,
        tertiary,
        error,
        // Accent colors from the Stitch design.
        'vibrant-blue': '#3B82F6',
        'accent-gold': '#B08D57',
        'success-teal': '#14B8A6',
        // Dark accent (dark sections / footers / overlays / inverse-surface).
        dark: '#1C1C1A',
        // Semantic Material tokens, exposed for new work.
        surface: {
          DEFAULT: '#FCF9F6',
          soft: '#F5F5F4',
          dim: '#DCD9D7',
          bright: '#FCF9F6',
          base: '#FFFFFF',
          lowest: '#FFFFFF',
          low: '#F6F3F1',
          container: '#F0EDEB',
          'container-high': '#EBE7E5',
          'container-highest': '#E5E2E0',
        },
        'inverse-surface': '#31302F',
        'inverse-on-surface': '#F3F0EE',
        // Remap the legacy palette names so existing classes adopt the theme.
        emerald: gold,
        slate: beige,
      },
      fontFamily: {
        sans: [
          'Manrope',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Stitch typography scale (Manrope).
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '500' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'title-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-lg-mobile': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'display-lg-mobile': ['36px', { lineHeight: '1.2', fontWeight: '800' }],
        'headline-xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '800' }],
      },
      borderRadius: {
        // Stitch radius scale (tight base, soft cards).
        none: '0',
        sm: '0.125rem',
        DEFAULT: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      maxWidth: {
        // Stitch layout widths.
        content: '1280px',
        'container-max': '1440px',
      },
      spacing: {
        // Stitch spacing primitives.
        gutter: '24px',
        'margin-mobile': '16px',
        'margin-desktop': '64px',
      },
      backgroundImage: {
        // Brand gradient for primary buttons: primary-container -> primary.
        'gold-gradient': 'linear-gradient(135deg, #B0915C 0%, #745A2B 100%)',
        'gold-gradient-hover': 'linear-gradient(135deg, #9A7C4B 0%, #5A4315 100%)',
        // Subtle hero radial wash from the Stitch hero-gradient.
        'hero-gradient':
          'radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
      },
      boxShadow: {
        // Stitch ai-glow accent.
        glow: '0 0 20px rgba(176, 141, 87, 0.2)',
      },
    },
  },
  plugins: [],
};

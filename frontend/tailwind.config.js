/** @type {import('tailwindcss').Config} */

/*
 * "Gold and Silver" theme — derived from DESIGN.md (Material 3 token spec).
 *
 * The design system is expressed as Material-style semantic tokens. To keep the
 * existing component classNames working, those tokens are projected onto the
 * palette scales the app already consumes:
 *   - `gold`   ← primary / primary-container / outline family
 *   - `beige`  ← surface / surface-container / on-surface family (neutrals+text)
 *   - `silver` ← secondary / secondary-container / outline-variant family
 * Plus `tertiary`, `error`, and a `dark` accent. The legacy `emerald`/`slate`
 * names are remapped so older utility classes adopt the theme automatically.
 *
 * Anchor tokens (DESIGN.md):
 *   primary #B0915C   primary-container #D4B880   outline #7E623A
 *   surface #FAF9F6   surface-container #E7D8BC   on-surface-variant #66533B
 *   on-surface #10100F  secondary #B4B4B4  secondary-container #DADADA
 */

// primary / primary-container / outline → gold scale
const gold = {
  50: '#FBF8F1', // surface-bright / lightest gold tint
  100: '#FFDEA9', // primary-fixed
  200: '#E4C288', // primary-fixed-dim / inverse-primary
  300: '#D4B880', // primary-container
  400: '#C2A36E',
  500: '#B0915C', // primary (Gold Base)
  600: '#9A7C4B',
  700: '#7E623A', // outline (Deep Gold Shadow)
  800: '#5A4315', // on-primary-fixed-variant
  900: '#3F2A00', // on-primary-container
};

// secondary / secondary-container / outline-variant → silver scale
const silver = {
  50: '#F7F7F7',
  100: '#EDEDED',
  200: '#DADADA', // secondary-container
  300: '#C7C6C6', // secondary-fixed-dim
  400: '#B4B4B4', // secondary (Silver Base)
  500: '#9C9C9C',
  600: '#787878', // outline-variant
  700: '#5E5E5E',
  800: '#464747', // on-secondary-fixed-variant
  900: '#2B2B2B',
};

// surface / surface-container / on-surface(-variant) → warm neutral + text
const beige = {
  50: '#FAF9F6', // surface
  100: '#F3EFE6', // surface-container-low-ish
  200: '#E7D8BC', // surface-container
  300: '#D6C09A',
  400: '#B79A6E',
  500: '#8E7550',
  600: '#66533B', // on-surface-variant (Headings)
  700: '#4A3C2B',
  800: '#2C241A',
  900: '#10100F', // on-surface (Body Text)
};

// tertiary family (cool blue accent) from DESIGN.md
const tertiary = {
  50: '#EEF2FB',
  100: '#D8E2FF', // tertiary-fixed
  200: '#B6C6ED', // tertiary-fixed-dim / tertiary-container
  300: '#8696BA', // tertiary-container
  400: '#677A9F',
  500: '#4F5E7F', // tertiary
  600: '#3C4A66',
  700: '#374766', // on-tertiary-fixed-variant
  800: '#1E2E4D', // on-tertiary-container
  900: '#091B39', // on-tertiary-fixed
};

// error family from DESIGN.md
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
        // Dark accent (dark sections / footers / overlays).
        dark: '#10100F',
        // Semantic Material tokens, exposed for new work.
        surface: {
          DEFAULT: '#FAF9F6',
          dim: '#E0D9D2',
          bright: '#FFF8F3',
          lowest: '#FFFFFF',
          low: '#FAF2EB',
          container: '#E7D8BC',
          'container-high': '#EEE7E0',
          'container-highest': '#E9E1DA',
        },
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
        // DESIGN.md typography scale (Manrope).
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '500' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'title-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'headline-lg-mobile': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      borderRadius: {
        // DESIGN.md radius scale.
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      maxWidth: {
        // DESIGN.md layout max-width.
        content: '1280px',
      },
      spacing: {
        // DESIGN.md spacing primitives.
        gutter: '24px',
        'margin-mobile': '16px',
        'margin-desktop': '64px',
      },
      backgroundImage: {
        // Gold gradient for primary buttons: primary-container -> primary.
        'gold-gradient': 'linear-gradient(135deg, #D4B880 0%, #B0915C 100%)',
        'gold-gradient-hover': 'linear-gradient(135deg, #C2A36E 0%, #9A7C4B 100%)',
      },
    },
  },
  plugins: [],
};

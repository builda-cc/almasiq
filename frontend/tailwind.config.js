/** @type {import('tailwindcss').Config} */

/*
 * Luxury metallic palette — beige, gold, bronze, silver, dark.
 *
 * The brand accent (formerly Tailwind's `emerald`) is remapped onto a GOLD
 * scale anchored on the spec values:
 *   Gold Highlight   #D4B880   Gold Base #B0915C   Deep Gold Shadow #7E623A
 * The neutral (formerly `slate`) is remapped onto a warm BEIGE/BRONZE scale:
 *   Background #FAF9F6   Cards/Sections #E7D8BC   Headings #66533B   Body #10100F
 *
 * Both `emerald`/`slate` (so existing utility classes adopt the new look) and
 * the semantic names `gold`/`silver`/`bronze`/`beige`/`dark` are exposed.
 */

const gold = {
  50: '#FBF7EF',
  100: '#F4EBD6',
  200: '#E7D3AC',
  300: '#D4B880', // Gold Highlight
  400: '#C2A36E',
  500: '#B0915C', // Gold Base
  600: '#9A7C4B',
  700: '#7E623A', // Deep Gold Shadow
  800: '#604A2C',
  900: '#42331E',
};

const silver = {
  50: '#F7F7F7',
  100: '#EDEDED',
  200: '#DADADA', // Silver Highlight
  300: '#C7C7C7',
  400: '#B4B4B4', // Silver Base
  500: '#9C9C9C',
  600: '#787878', // Silver Shadow
  700: '#5E5E5E',
  800: '#444444',
  900: '#2B2B2B',
};

// Warm neutral / bronze scale used for text, borders and surfaces.
const beige = {
  50: '#FAF9F6', // Background
  100: '#F3EFE6',
  200: '#E7D8BC', // Cards / Sections
  300: '#D6C09A',
  400: '#B79A6E',
  500: '#8E7550',
  600: '#66533B', // Headings
  700: '#4A3C2B',
  800: '#2C241A',
  900: '#10100F', // Body Text
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
        // Dark accent (dark sections / footers / overlays).
        dark: '#10100F',
        // Remap the legacy palette names so existing classes adopt the theme.
        emerald: gold,
        slate: beige,
      },
      backgroundImage: {
        // Gold gradient for primary buttons: Highlight -> Base.
        'gold-gradient': 'linear-gradient(135deg, #D4B880 0%, #B0915C 100%)',
        'gold-gradient-hover': 'linear-gradient(135deg, #C2A36E 0%, #9A7C4B 100%)',
      },
    },
  },
  plugins: [],
};

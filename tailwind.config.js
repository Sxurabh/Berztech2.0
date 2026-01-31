const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        "4xl": "2.5rem",
      },
      fontFamily: {
        // Adding Space Grotesk and JetBrains Mono
        'space-grotesk': ['Space Grotesk', ...defaultTheme.fontFamily.sans],
        'jetbrains-mono': ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
        
        // Overriding default sans to use Space Grotesk
        sans: ["Space Grotesk", ...defaultTheme.fontFamily.sans],
        
        // Updating display font for headings
        display: [
          ["Space Grotesk", ...defaultTheme.fontFamily.sans],
          { fontVariationSettings: '"wdth" 125' },
        ],
        
        // Updating mono font
        mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [],
};
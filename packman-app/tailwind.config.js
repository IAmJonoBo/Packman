/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          app: "#0B0C10",
          surface: "#11131A",
          elevated: "#151A24",
          panel: "#1B2230",
          overlay: "#0B0C10E6",
        },
        text: {
          primary: "#EAF0FF",
          secondary: "#B7C1D9",
          tertiary: "#7F8AA6",
          disabled: "#4A5568",
          inverse: "#0B0C10",
        },
        brand: {
          primary: "#7CFFCB",
          secondary: "#BBA7FF",
          accent: "#FF4FD8",
          info: "#55D7FF",
        },
        status: {
          success: "#53F5A6",
          warning: "#FFD166",
          error: "#FF5C7A",
          info: "#55D7FF",
        },
        border: {
          subtle: "#2A3447",
          default: "#374151",
          focus: "#55D7FF",
          active: "#7CFFCB",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
    },
  },
  plugins: [],
};

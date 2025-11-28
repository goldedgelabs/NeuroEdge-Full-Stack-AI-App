/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Enable dark mode via .dark class

  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./public/**/*.svg",
  ],

  theme: {
    extend: {
      colors: {
        neuro: {
          50: "#f5f9ff",
          100: "#e6f0ff",
          200: "#c9dbff",
          300: "#a4c2ff",
          400: "#6f9cff",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#1e3a66",
        },

        app: {
          light: "#f8fafc",
          dark: "#0d1117",
        },
      },

      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },

      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },

      boxShadow: {
        soft: "0 4px 20px rgba(0, 0, 0, 0.06)",
        card: "0 8px 30px rgba(0, 0, 0, 0.08)",
        glow: "0 0 24px rgba(37, 99, 235, 0.4)",
      },

      backgroundImage: {
        "neuro-gradient":
          "linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #0f172a 100%)",
        "neuro-light":
          "linear-gradient(135deg, #e6f0ff 0%, #c9dbff 50%, #a4c2ff 100%)",
      },

      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "typing-1": "typing 1s infinite",
        "typing-2": "typing 1s infinite 0.15s",
        "typing-3": "typing 1s infinite 0.3s",
      },

      keyframes: {
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },

        "scale-in": {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },

        typing: {
          "0%": { opacity: ".2", transform: "translateY(0)" },
          "50%": { opacity: "1", transform: "translateY(-3px)" },
          "100%": { opacity: ".2", transform: "translateY(0)" },
        },
      },

      typography: {
        DEFAULT: {
          css: {
            color: "#1e293b",
            code: {
              background: "#e2e8f0",
              padding: "2px 6px",
              borderRadius: "6px",
            },
          },
        },
        dark: {
          css: {
            color: "#e2e8f0",
            code: {
              background: "#1e293b",
            },
          },
        },
      },
    },
  },

  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
  ],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        celo: {
          yellow: "#FCFF52",
          green: "#4E632A",
          purple: "#1A0329",
          tan: "#FBF6F1",
          "tan-dark": "#E6E3D5",
          brown: "#635949",
          pink: "#F2A9E7",
          orange: "#F29E5F",
          lime: "#B2EBA1",
          blue: "#8AC0F9",
        },
      },
      fontFamily: {
        alpina: ["GT Alpina", "Times New Roman", "serif"],
        inter: ["Inter", "sans-serif"],
      },
      letterSpacing: {
        tighter: "-0.02em",
        tight: "-0.01em",
      },
      fontWeight: {
        750: "750",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

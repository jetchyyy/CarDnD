/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0077B6", // Ocean Blue
        secondary: "#00B4D8", // Aqua Energy
        accent: "#FFD60A", // Sunshine Yellow
        neutral: "#F8F9FA", // Off White
        navy: "#023E8A", // Deep Navy
      },
      transformStyle: {
        "3d": "preserve-3d",
      },
      backfaceVisibility: {
        hidden: "hidden",
      },
      perspective: {
        1000: "1000px",
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // ...existing animations and other extensions...
      keyframes: {
        // ...existing keyframes...
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(-10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "animate-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: 0.4 },
          "50%": { opacity: 0.8 },
        },
        "gradient-xy": {
          "0%, 100%": {
            "background-size": "400% 400%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        tilt: {
          "0%, 100%": { transform: "rotate3d(0, 0, 0, 0deg)" },
          "50%": { transform: "rotate3d(1, 1, 0, 2deg)" },
        },
        shine: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
      },
      animation: {
        // ...existing animations...
        "fade-in": "fadeIn 0.3s ease-in-out",
        in: "animate-in 0.2s ease-out forwards",
        "slide-in": "slide-in 0.3s ease-out",
        float: "float 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "gradient-xy": "gradient-xy 15s ease infinite",
        tilt: "tilt 10s infinite linear",
        shine: "shine 8s ease-in-out infinite",
        meteor: "meteor 5s linear infinite",
      },
      boxShadow: {
        "inner-lg": "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        soft: "0 2px 10px rgba(0, 0, 0, 0.05)",
        neumorphic: "20px 20px 60px #1a1a1a, -20px -20px 60px #262626",
        "neumorphic-inset":
          "inset 20px 20px 60px #1a1a1a, inset -20px -20px 60px #262626",
        input: "0 2px 4px rgb(0 0 0 / 0.1) inset",
        "card-hover":
          "0 0 0 2px rgba(255, 255, 255, 0.1), 0 30px 60px -12px rgba(50, 50, 93, 0.25), 0 18px 36px -18px rgba(0, 0, 0, 0.3)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-dots":
          "radial-gradient(circle, #00000010 1px, transparent 1px)",
        "grid-white": `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".perspective-1000": {
          perspective: "1000px",
        },
        ".backface-hidden": {
          backfaceVisibility: "hidden",
        },
      };
      addUtilities(newUtilities);
    },
    function ({ addComponents }) {
      addComponents({
        ".shine-effect": {
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            top: "0",
            left: "-100%",
            width: "50%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            transition: "0.5s",
          },
          "&:hover::after": {
            left: "100%",
          },
        },
      });
    },
  ],
};

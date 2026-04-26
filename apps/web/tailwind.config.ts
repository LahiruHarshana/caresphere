import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
colors: {
      primary: {
        DEFAULT: 'var(--primary)',
        50: '#f0fdfa',
        100: '#ccfbf1',
        200: '#99f6e4',
        300: '#5eead4',
        400: '#2dd4bf',
        500: '#14b8a6',
        600: '#0d9488',
        700: '#0f766e',
        800: '#115e59',
        900: '#134e4a',
        foreground: 'var(--primary-foreground)',
      },
      accent: {
        DEFAULT: 'var(--accent)',
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        foreground: 'var(--accent-foreground)',
      },
      background: "var(--background)",
      foreground: "var(--foreground)",
      card: "var(--card)",
      "card-foreground": "var(--card-foreground)",
      muted: "var(--muted)",
      "muted-foreground": "var(--muted-foreground)",
      border: "var(--border)",
      input: "var(--input-border)",
    },
animation: {
      "fade-in": "fadeIn 0.8s ease-out forwards",
      "fade-in-up": "fadeInUp 0.8s ease-out forwards",
      "fade-in-down": "fadeInDown 0.8s ease-out forwards",
      "slide-in-left": "slideInLeft 0.8s ease-out forwards",
      "slide-in-right": "slideInRight 0.8s ease-out forwards",
      "scale-in": "scaleIn 0.6s ease-out forwards",
      "float": "float 6s ease-in-out infinite",
      "float-delayed": "float 6s ease-in-out 2s infinite",
      "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      "shimmer": "shimmer 2s linear infinite",
      "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
      "rotate-slow": "rotateSlow 20s linear infinite",
      "gradient-shift": "gradientShift 8s ease infinite",
      "aurora": "aurora 20s linear infinite",
      "sparkle": "sparkle 2s ease-in-out infinite",
      "pulse-ring": "pulseRing 2s ease-out infinite",
      "gradient-flow": "gradientFlow 6s ease infinite",
      "float-gentle": "floatGentle 8s ease-in-out infinite",
      "reveal-up": "revealUp 0.8s ease-out forwards",
      "reveal-scale": "revealScale 0.6s ease-out forwards",
      "slide-reveal": "slideReveal 0.7s ease-out forwards",
      "highlight-bar": "highlightBar 3s ease-in-out infinite",
      "glow-pulse": "glowPulse 3s ease-in-out infinite",
    },
    keyframes: {
      fadeIn: {
        "0%": { opacity: "0" },
        "100%": { opacity: "1" },
      },
      fadeInUp: {
        "0%": { opacity: "0", transform: "translateY(40px)" },
        "100%": { opacity: "1", transform: "translateY(0)" },
      },
      fadeInDown: {
        "0%": { opacity: "0", transform: "translateY(-40px)" },
        "100%": { opacity: "1", transform: "translateY(0)" },
      },
      slideInLeft: {
        "0%": { opacity: "0", transform: "translateX(-60px)" },
        "100%": { opacity: "1", transform: "translateX(0)" },
      },
      slideInRight: {
        "0%": { opacity: "0", transform: "translateX(60px)" },
        "100%": { opacity: "1", transform: "translateX(0)" },
      },
      scaleIn: {
        "0%": { opacity: "0", transform: "scale(0.8)" },
        "100%": { opacity: "1", transform: "scale(1)" },
      },
      float: {
        "0%, 100%": { transform: "translateY(0px)" },
        "50%": { transform: "translateY(-20px)" },
      },
      bounceSubtle: {
        "0%, 100%": { transform: "translateY(0)" },
        "50%": { transform: "translateY(-10px)" },
      },
      rotateSlow: {
        "0%": { transform: "rotate(0deg)" },
        "100%": { transform: "rotate(360deg)" },
      },
      shimmer: {
        "0%": { backgroundPosition: "-200% 0" },
        "100%": { backgroundPosition: "200% 0" },
      },
      gradientShift: {
        "0%, 100%": { backgroundPosition: "0% 50%" },
        "50%": { backgroundPosition: "100% 50%" },
      },
      aurora: {
        "0%": { transform: "rotate(0deg) scale(1); opacity: 0.6" },
        "33%": { transform: "rotate(120deg) scale(1.1); opacity: 0.8" },
        "66%": { transform: "rotate(240deg) scale(0.95); opacity: 0.7" },
        "100%": { transform: "rotate(360deg) scale(1); opacity: 0.6" },
      },
      sparkle: {
        "0%, 100%": { opacity: "0", transform: "scale(0) rotate(0deg)" },
        "50%": { opacity: "1", transform: "scale(1) rotate(180deg)" },
      },
      pulseRing: {
        "0%": { transform: "scale(0.8)", opacity: "1" },
        "100%": { transform: "scale(1.6)", opacity: "0" },
      },
      gradientFlow: {
        "0%": { backgroundPosition: "0% 50%" },
        "50%": { backgroundPosition: "100% 50%" },
        "100%": { backgroundPosition: "0% 50%" },
      },
      floatGentle: {
        "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
        "25%": { transform: "translateY(-15px) rotate(2deg)" },
        "75%": { transform: "translateY(8px) rotate(-2deg)" },
      },
      revealUp: {
        "0%": { opacity: "0", transform: "translateY(60px)" },
        "100%": { opacity: "1", transform: "translateY(0)" },
      },
      revealScale: {
        "0%": { opacity: "0", transform: "scale(0.85)" },
        "100%": { opacity: "1", transform: "scale(1)" },
      },
      slideReveal: {
        "0%": { opacity: "0", transform: "translateX(-30px)" },
        "100%": { opacity: "1", transform: "translateX(0)" },
      },
      highlightBar: {
        "0%": { left: "0", width: "0" },
        "50%": { left: "0", width: "100%" },
        "100%": { left: "100%", width: "0" },
      },
      glowPulse: {
        "0%, 100%": { boxShadow: "0 0 20px rgba(20, 184, 166, 0.3)" },
        "50%": { boxShadow: "0 0 40px rgba(124, 58, 237, 0.5)" },
      },
    },
      backgroundSize: {
        "200%": "200%",
      },
boxShadow: {
      "glow-primary": "0 0 40px rgba(15, 118, 110, 0.3)",
      "glow-accent": "0 0 40px rgba(245, 158, 11, 0.3)",
      "glow-violet": "0 0 40px rgba(124, 58, 237, 0.3)",
      "soft-xl": "0 20px 60px -15px rgba(0, 0, 0, 0.1)",
      "soft-2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
      "soft-3xl": "0 30px 80px -20px rgba(0, 0, 0, 0.2)",
      "inner-glow": "inset 0 0 30px rgba(20, 184, 166, 0.05)",
      "card-hover": "0 30px 60px -15px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(20, 184, 166, 0.1)",
      "glass-shadow": "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
    },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      transitionDuration: {
        "400": "400ms",
      },
    },
  },
  plugins: [],
};
export default config;
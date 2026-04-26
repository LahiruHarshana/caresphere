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
        heading: ["var(--font-heading)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tight: "-0.02em",
      },
      lineHeight: {
        relaxed: "1.7",
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
        neutral: {
          DEFAULT: 'var(--neutral)',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          foreground: 'var(--neutral-foreground)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          card: 'var(--surface-card)',
          foreground: 'var(--surface-foreground)',
        },
        background: "var(--surface)",
        foreground: "var(--neutral)",
        card: "var(--surface-card)",
        "card-foreground": "var(--surface-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        border: "var(--border)",
        input: "var(--input-border)",
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '32': '8rem',
      },
      maxWidth: {
        '7xl': '80rem',
      },
      borderRadius: {
        'sm': '4px',
        '2xl': '0.5rem',
        '3xl': '0.75rem',
        '4xl': '1rem',
      },
      transitionDuration: {
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
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
        "reveal-up": "revealUp 0.8s ease-out forwards",
        "reveal-scale": "revealScale 0.6s ease-out forwards",
        "slide-reveal": "slideReveal 0.7s ease-out forwards",
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
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundSize: {
        "200%": "200%",
      },
      boxShadow: {
        "soft-sm": "0 2px 8px rgba(0, 0, 0, 0.06)",
        "soft-md": "0 4px 16px rgba(0, 0, 0, 0.08)",
        "soft-lg": "0 8px 32px rgba(0, 0, 0, 0.1)",
        "soft-xl": "0 20px 60px -15px rgba(0, 0, 0, 0.1)",
        "soft-2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 20px 40px -10px rgba(0, 0, 0, 0.1)",
        "glow-primary": "0 0 40px rgba(13, 148, 136, 0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
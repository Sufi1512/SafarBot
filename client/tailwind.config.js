/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // SafarBot Integrated Color Palette
        primary: {
          50: '#F9FAFB', // --color-blue-2
          100: '#F3F4F6', // --color-blue-4
          200: '#E5E7EB', // --color-blue-6
          300: '#D1D5DB', // --color-blue-10
          400: '#9CA3AF', // --color-blue-16
          500: '#4F46E5', // --color-blue-24 - Main primary color
          600: '#4B5563', // --color-blue-22
          700: '#374151', // --color-blue-26
          800: '#111827', // --color-blue-30
          900: '#000000', // --color-grayscale-19
        },
        secondary: {
          50: '#F9FAFB', // --color-blue-2
          100: '#F3F4F6', // --color-blue-4
          200: '#E9E9E9', // --color-grayscale-4
          300: '#D9D9D9', // --color-grayscale-6
          400: '#9CA3AF', // --color-blue-16
          500: '#6B7280', // --color-blue-18 - Main secondary color
          600: '#6C6C6C', // --color-grayscale-12
          700: '#4B5563', // --color-blue-22
          800: '#374151', // --color-blue-26
          900: '#111827', // --color-blue-30
        },
        accent: {
          50: '#ABE2FB', // --color-blue-8
          100: '#96DBFA', // --color-blue-12
          200: '#57C5F7', // --color-blue-14
          300: '#0FCCCE', // --color-teal-2
          400: '#04868B', // --color-teal-4
          500: '#6366F1', // --color-blue-20 - Main accent color
          600: '#4F46E5', // --color-blue-24
          700: '#374151', // --color-blue-26
          800: '#111827', // --color-blue-30
          900: '#000000', // --color-grayscale-19
        },
        success: {
          50: '#F9FAFB', // --color-blue-2
          100: '#F3F4F6', // --color-blue-4
          200: '#E5E7EB', // --color-blue-6
          300: '#D1D5DB', // --color-blue-10
          400: '#9CA3AF', // --color-blue-16
          500: '#0FCCCE', // --color-teal-2 - Main success color
          600: '#04868B', // --color-teal-4
          700: '#374151', // --color-blue-26
          800: '#111827', // --color-blue-30
          900: '#000000', // --color-grayscale-19
        },
        warning: {
          50: '#F9FAFB', // --color-blue-2
          100: '#F3F4F6', // --color-blue-4
          200: '#E5E7EB', // --color-blue-6
          300: '#D1D5DB', // --color-blue-10
          400: '#9CA3AF', // --color-blue-16
          500: '#6B7280', // --color-blue-18 - Main warning color
          600: '#4B5563', // --color-blue-22
          700: '#374151', // --color-blue-26
          800: '#111827', // --color-blue-30
          900: '#000000', // --color-grayscale-19
        },
        error: {
          50: '#F9FAFB', // --color-blue-2
          100: '#F3F4F6', // --color-blue-4
          200: '#E5E7EB', // --color-blue-6
          300: '#D1D5DB', // --color-blue-10
          400: '#9CA3AF', // --color-blue-16
          500: '#EF233C', // --color-red-2 - Main error color
          600: '#4B5563', // --color-blue-22
          700: '#374151', // --color-blue-26
          800: '#111827', // --color-blue-30
          900: '#000000', // --color-grayscale-19
        },
        background: {
          DEFAULT: '#FFFFFF', // --color-grayscale-2 - Pure white
          50: '#F9FAFB', // --color-blue-2
          100: '#F3F4F6', // --color-blue-4
          200: '#E5E7EB', // --color-blue-6
          300: '#D1D5DB', // --color-blue-10
          400: '#9CA3AF', // --color-blue-16
          500: '#6B7280', // --color-blue-18
          600: '#4B5563', // --color-blue-22
          700: '#374151', // --color-blue-26
          800: '#111827', // --color-blue-30
          900: '#000000', // --color-grayscale-19
        },
        surface: {
          DEFAULT: '#F3F4F6', // --color-blue-4 - Light gray surface
          50: '#F9FAFB', // --color-blue-2
          100: '#F3F4F6', // --color-blue-4
          200: '#E5E7EB', // --color-blue-6
          300: '#D1D5DB', // --color-blue-10
          400: '#9CA3AF', // --color-blue-16
          500: '#6B7280', // --color-blue-18
          600: '#4B5563', // --color-blue-22
          700: '#374151', // --color-blue-26
          800: '#111827', // --color-blue-30
          900: '#000000', // --color-grayscale-19
        },
        // Additional color mappings for your design system
        blue: {
          50: '#F9FAFB', // --color-blue-2
          100: '#F3F4F6', // --color-blue-4
          200: '#E5E7EB', // --color-blue-6
          300: '#D1D5DB', // --color-blue-10
          400: '#9CA3AF', // --color-blue-16
          500: '#6366F1', // --color-blue-20
          600: '#4F46E5', // --color-blue-24
          700: '#374151', // --color-blue-26
          800: '#111827', // --color-blue-30
          900: '#000000', // --color-grayscale-19
        },
        teal: {
          50: '#F9FAFB', // --color-blue-2
          100: '#F3F4F6', // --color-blue-4
          200: '#E5E7EB', // --color-blue-6
          300: '#D1D5DB', // --color-blue-10
          400: '#9CA3AF', // --color-blue-16
          500: '#0FCCCE', // --color-teal-2
          600: '#04868B', // --color-teal-4
          700: '#374151', // --color-blue-26
          800: '#111827', // --color-blue-30
          900: '#000000', // --color-grayscale-19
        },
        red: {
          50: '#F9FAFB', // --color-blue-2
          100: '#F3F4F6', // --color-blue-4
          200: '#E5E7EB', // --color-blue-6
          300: '#D1D5DB', // --color-blue-10
          400: '#9CA3AF', // --color-blue-16
          500: '#EF233C', // --color-red-2
          600: '#4B5563', // --color-blue-22
          700: '#374151', // --color-blue-26
          800: '#111827', // --color-blue-30
          900: '#000000', // --color-grayscale-19
        },
        gray: {
          50: '#F9FAFB', // --color-blue-2
          100: '#F3F4F6', // --color-blue-4
          200: '#E9E9E9', // --color-grayscale-4
          300: '#D9D9D9', // --color-grayscale-6
          400: '#CCCCCC', // --color-grayscale-8
          500: '#999999', // --color-grayscale-10
          600: '#6C6C6C', // --color-grayscale-12
          700: '#666666', // --color-grayscale-14
          800: '#111827', // --color-blue-30
          900: '#000000', // --color-grayscale-19
        },
        // Dark mode colors
        dark: {
          bg: '#0F172A',
          card: '#1E293B',
          border: '#334155',
          text: '#F8FAFC',
          'text-secondary': '#CBD5E1',
        },
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'large': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(30, 144, 255, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'gradient-x': 'gradient-x 4s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #1E90FF 0%, #0066CC 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
  ],
} 
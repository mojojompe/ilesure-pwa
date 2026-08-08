import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary':       '#3E1F0A',
        'primary-dark':  '#2C1406',
        'primary-light': '#5C2F12',
        
        'accent':        '#E1AD01',
        'accent-light':  '#F0C832',
        'accent-dark':   '#C49B00',
        
        'background':    '#FAFAF9',
        'surface':       '#FFFFFF',
        'soft-surface':  '#F5F5F4',
        
        'text-primary':  '#2D1B12',
        'text-secondary':'#6B4F3A',
        'text-tertiary': '#A08070',
        'text-inverse':  '#FFFFFF',
        'text-disabled': '#C4B5A5',
        'text-muted':    '#BCA99A',
        
        'border':        '#E7DCD4',
        'border-light':  '#F0E8E2',
        'border-dark':   '#D4C5B8',
        
        'status-success': '#4CAF50',
        'status-warning': '#FF9800',
        'status-error':   '#E53935',
        'status-info':    '#2196F3',
        
        'tier-free':       '#A08070',
        'tier-basic':      '#2196F3',
        'tier-premium':    '#4CAF50',
        'tier-enterprise': '#E1AD01',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'DM Sans', 'sans-serif'],
      },
      borderRadius: {
        'clay':   '20px',
        'clay-sm':'12px',
        'clay-lg':'28px',
        'pill':   '9999px',
      },
      boxShadow: {
        'large':    '0 12px 32px rgba(139,69,19,0.15)',
        'card':     '0 6px 16px rgba(139,69,19,0.08)',
        'medium':   '0 10px 24px rgba(139,69,19,0.10)',
        'strong':   '0 14px 32px rgba(139,69,19,0.14)',
        'button':   '0 4px 8px rgba(139,69,19,0.18)',
        'pressed':  '0 2px 4px rgba(139,69,19,0.08)',
        'fab':      '0 8px 20px rgba(139,69,19,0.20)',
        'tabBar':   '0 -4px 12px rgba(139,69,19,0.05)',
        'small':    '0 2px 4px rgba(139,69,19,0.05)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3E1F0A 0%, #5C2F12 100%)',
        'gradient-accent':  'linear-gradient(135deg, #E1AD01 0%, #F0C832 100%)',
        'gradient-bg':      'linear-gradient(135deg, #FAFAF9 0%, #F5E6D3 100%)',
        'gradient-card':    'linear-gradient(135deg, #FFFFFF 0%, #FAF6F3 100%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'slide-right':'slideRight 0.3s ease-out',
        'shimmer':    'shimmer 1.5s infinite',
        'bounce-in':  'bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceIn: {
          '0%':   { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
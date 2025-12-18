/**
 * Design System Tokens
 * Single source of truth for colors, spacing, typography, shadows, and radii
 */

export const tokens = {
  // Color Tokens
  colors: {
    // Primary brand colors
    primary: {
      DEFAULT: '#6366f1', // indigo-500
      hover: '#4f46e5',   // indigo-600
      active: '#4338ca',  // indigo-700
      light: '#818cf8',   // indigo-400
      lighter: '#c7d2fe', // indigo-200
      lightest: '#e0e7ff', // indigo-100
    },
    
    // Surface colors
    surface: {
      DEFAULT: '#ffffff',
      elevated: '#ffffff',
      overlay: '#f9fafb',  // gray-50
      hover: '#f3f4f6',    // gray-100
      pressed: '#e5e7eb',  // gray-200
    },
    
    // Border colors
    border: {
      DEFAULT: '#e5e7eb',  // gray-200
      light: '#f3f4f6',    // gray-100
      dark: '#d1d5db',     // gray-300
      focus: '#6366f1',    // indigo-500
    },
    
    // Text colors
    text: {
      primary: '#111827',   // gray-900
      secondary: '#6b7280', // gray-500
      tertiary: '#9ca3af',  // gray-400
      inverse: '#ffffff',
      link: '#6366f1',      // indigo-500
      linkHover: '#4f46e5', // indigo-600
    },
    
    // Status colors
    status: {
      success: '#10b981',      // green-500
      successLight: '#d1fae5', // green-100
      warning: '#f59e0b',      // amber-500
      warningLight: '#fef3c7', // amber-100
      danger: '#ef4444',       // red-500
      dangerLight: '#fee2e2',  // red-100
      info: '#3b82f6',         // blue-500
      infoLight: '#dbeafe',    // blue-100
    },
    
    // Background colors
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb', // gray-50
      tertiary: '#f3f4f6',  // gray-100
      dark: '#111827',      // gray-900
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
  },

  // Spacing Scale (4px base)
  spacing: {
    0: '0',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
  },

  // Typography Scale
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      black: '900',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // Shadow/Elevation (3 levels only)
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    focus: '0 0 0 3px rgba(99, 102, 241, 0.1)',
  },

  // Border Radius (2 values only)
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    full: '9999px',
  },

  // Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Touch target minimum
  touchTarget: {
    min: '44px',
  },
};

// Helper functions
export const getColor = (path) => {
  const keys = path.split('.');
  let value = tokens.colors;
  for (const key of keys) {
    value = value[key];
    if (!value) return null;
  }
  return value;
};

export const getSpacing = (size) => tokens.spacing[size] || size;
export const getFontSize = (size) => tokens.typography.fontSize[size] || size;
export const getShadow = (level) => tokens.shadows[level] || tokens.shadows.md;
export const getRadius = (size) => tokens.radius[size] || tokens.radius.sm;

export default tokens;

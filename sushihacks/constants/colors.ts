export const Colors = {
  primary: '#5ECDBF',
  secondary: '#A8E6A3',
  warning: '#FFD93D',
  danger: '#FF6B6B',
  background: '#F5F7FA',
  cardBackground: '#FFFFFF',
  text: {
    primary: '#2D3436',
    secondary: '#636E72',
    light: '#95A5A6',
  },
  border: '#E1E4E8',
  success: '#26de81',
  shadow: '#000000',
  white: '#FFFFFF',
  gradient: {
    start: '#5ECDBF',
    end: '#45B7A8',
  },
  chart: {
    teal: '#5ECDBF',
    lightTeal: '#A3E4DB',
    grid: '#E8ECEF',
  },
  risk: {
    low: '#A8E6A3',
    moderate: '#FFD93D',
    high: '#FF6B6B',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 25,
  pill: 100,
};

export const Typography = {
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '500' as const,
    color: Colors.text.primary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.light,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.text.light,
  },
};

export const Shadows = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
};
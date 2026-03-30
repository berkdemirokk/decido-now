export const theme = {
  colors: {
    background: '#06080d',
    surface: '#0f131b',
    surfaceAlt: '#151b25',
    surfaceMuted: '#0b1017',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.14)',
    text: '#f5f3ef',
    textMuted: '#9da6b7',
    textSoft: '#747d8d',
    accent: '#f59e0b',
    accentSoft: 'rgba(245,158,11,0.15)',
    success: '#34d399',
    warning: '#f59e0b',
    danger: '#fb7185',
    overlay: 'rgba(3,5,9,0.82)',
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  radius: {
    sm: 12,
    md: 18,
    lg: 24,
    pill: 999,
  },
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
  },
  typography: {
    display: 34,
    h1: 26,
    h2: 20,
    body: 15,
    label: 12,
    meta: 11,
  },
};

export const systemAccents = {
  decide: '#f59e0b',
  learn: '#22c55e',
  earn: '#38bdf8',
  move: '#60a5fa',
  reset: '#c084fc',
} as const;

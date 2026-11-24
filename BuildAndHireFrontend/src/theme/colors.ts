// Keep the brand and semantic values in sync with theme.css.
export const palette = {
  cream: '#FEF5ED',
  sageLight: '#D3E4CD',
  sage: '#ADC2A9',
  sageMuted: '#99A799',
} as const;

export const colors = {
  ...palette,
  primary: palette.sageMuted,
  primaryDark: palette.sageMuted,
  primaryHover: palette.sage,
  secondary: palette.sageMuted,
  tertiary: palette.sageLight,
  neutral: palette.cream,
  surface: '#FFFBF7',
  text: '#25362B',
  textMuted: '#2E3D30',
  onAccent: '#25362B',
  accentText: '#25362B',
  border: palette.sageMuted,
  white: '#FFFFFF',
} as const;

export type ColorToken = keyof typeof colors;

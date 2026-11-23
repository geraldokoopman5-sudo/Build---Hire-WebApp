// Keep the brand and semantic values in sync with theme.css.
export const palette = {
  cyprus: '#004643',
  cyprusDeep: '#003532',
  sand: '#C2B280',
} as const;

export const colors = {
  ...palette,
  primary: palette.cyprus,
  primaryDark: palette.cyprusDeep,
  primaryHover: '#084B46',
  secondary: palette.cyprus,
  tertiary: palette.sand,
  neutral: '#F0EDDF',
  surface: '#FCFAF3',
  text: '#123E3A',
  textMuted: '#53645B',
  accentText: palette.cyprus,
  border: '#D8D2BC',
  white: '#FFFFFF',
} as const;

export type ColorToken = keyof typeof colors;

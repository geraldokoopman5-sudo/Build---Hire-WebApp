export const colors = {
  primary: '#C36F43',
  primaryDark: '#A85A34',
  secondary: '#543A32',
  tertiary: '#D8A373',
  neutral: '#F9F3E5',
  white: '#FFFFFF',
  textMuted: '#8A7B6E',
  border: '#E8DCC8',
} as const;

export type ColorToken = keyof typeof colors;
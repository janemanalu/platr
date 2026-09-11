/**
 * Platr design tokens — low-fidelity grayscale wireframe pass.
 *
 * This is deliberately plain: a single grayscale ramp, flat borders, no shadows,
 * system font. Brand color, custom type, and polish come in a later pass — don't
 * add them here.
 */

import { Platform, TextStyle } from 'react-native';

/** Grayscale ramp, dark → light. Names are by lightness, not by role. */
export const gray = {
  black: '#1a1a1a',
  900: '#222222',
  800: '#333333',
  700: '#555555',
  600: '#666666',
  500: '#888888',
  400: '#999999',
  350: '#aaaaaa',
  300: '#bbbbbb',
  250: '#cccccc',
  200: '#dddddd',
  175: '#d4d4d4',
  150: '#e0e0e0',
  125: '#e2e2e2',
  100: '#eeeeee',
  75: '#f0f0f0',
  50: '#f8f8f8',
  25: '#fafafa',
  white: '#ffffff',
} as const;

/** Semantic aliases — use these in components, not raw ramp values where a role fits. */
export const colors = {
  text: gray.black,
  textStrong: gray[900],
  textBody: gray[800],
  textMuted: gray[600],
  textFaint: gray[500],
  textLabel: gray[400],
  textDisabled: gray[300],

  bg: gray.white,
  bgSubtle: gray[50],
  bgSunken: gray[25],
  bgPlaceholder: gray[175],
  bgActive: gray[900],

  border: gray[150],
  borderStrong: gray[250],
  divider: gray[100],
  dividerFaint: gray[75],

  onActive: gray.white,
} as const;

/** Spacing scale (pt). Keyed by step; values match the Figma wireframe's 4pt grid. */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
} as const;

/** The wireframe is flat. Rectangles are square; only pills/avatars are round. */
export const radius = {
  none: 0,
  sm: 2,
  pill: 999,
} as const;

/** Hairline border width used throughout the wireframe. */
export const borderWidth = 1;

const systemFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });

/**
 * Type scale, re-derived directly from the Figma wireframe's actual pixel
 * values (not estimated) — pulled from the raw generated JSX across Home,
 * Discovery, Restaurant Detail, and Log a Visit, e.g. every "SectionLabel" is
 * text-[9px] tracking-[0.9px] uppercase, every card/row name is ~10–11px bold,
 * body copy is 11px. The original scale here was designed from general
 * judgment rather than these numbers and ran 1–3px large almost everywhere —
 * this pass corrects it. `weight`/`letterSpacing` folded in so a variant is a
 * drop-in `TextStyle`.
 */
export const type = {
  display: { fontSize: 32, lineHeight: 32, fontWeight: '700', letterSpacing: -0.5 },
  h1: { fontSize: 28, lineHeight: 28, fontWeight: '700', letterSpacing: -0.7 },
  h2: { fontSize: 17, lineHeight: 21, fontWeight: '700', letterSpacing: -0.2 },
  title: { fontSize: 15, lineHeight: 20, fontWeight: '700', letterSpacing: -0.2 },
  /** Small bold uppercase modal/header title, e.g. "LOG A VISIT". */
  modalTitle: { fontSize: 12, lineHeight: 18, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  cardTitle: { fontSize: 11, lineHeight: 15, fontWeight: '700' },
  body: { fontSize: 11, lineHeight: 17, fontWeight: '400' },
  bodyStrong: { fontSize: 11, lineHeight: 17, fontWeight: '600' },
  small: { fontSize: 10, lineHeight: 14, fontWeight: '400' },
  caption: { fontSize: 9, lineHeight: 13, fontWeight: '400' },
  /** Smallest tier — tag chips, bylines ("by Jordan R."), distances. */
  micro: { fontSize: 8, lineHeight: 11, fontWeight: '400' },
  sectionLabel: { fontSize: 9, lineHeight: 13, fontWeight: '400', letterSpacing: 0.9, textTransform: 'uppercase' },
  link: { fontSize: 9, lineHeight: 13, fontWeight: '400', textDecorationLine: 'underline' },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

export const fontFamily = systemFont;

export const theme = { colors, gray, space, radius, borderWidth, type, fontFamily };
export default theme;

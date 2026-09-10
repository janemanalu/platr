# Platr — notes for agents

**Expo SDK 57.** Check the versioned docs at https://docs.expo.dev/versions/v57.0.0/
before writing Expo/RN code — APIs have changed.

## What this is

"Social media, but for F&B." React Native + Expo (managed), TypeScript,
expo-router, Supabase backend, Google Places for restaurant data.

## Conventions

- Routes live in `src/app` (expo-router, `src/` layout, alias `@/*` → `src/*`).
- All UI is built from the primitives in `src/components/ui` — `Text`, `Card`,
  `Button`, `Chip`, `Screen`. Add to that set rather than reaching for raw
  `<Text>`/`<View>` styling.
- Design tokens are in `src/theme`. Grayscale only this pass — no brand color,
  no custom fonts, no shadows. Match the Figma wireframe.
- Screens are built from the Figma file (source of truth) — pull the real node,
  don't guess layout.
- `.env` is gitignored and must never be committed. Keys are `EXPO_PUBLIC_*`.

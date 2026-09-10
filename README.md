# Platr

Social media, but for F&B. Log the restaurants you visit, rate the food and the
vibe, build lists, and see where your friends are eating.

## Stack

- **React Native + Expo** (managed workflow), TypeScript
- **expo-router** — file-based routing (`src/app`)
- **Supabase** — Postgres, auth, storage
- **Google Places API** — restaurant data

## Getting started

```bash
npm install
cp .env.example .env   # then fill in Supabase + Google Places keys
npx expo start
```

## Project layout

```
src/
  app/            expo-router routes
  components/ui/   base primitives — Text, Card, Button, Chip, Screen
  lib/            supabase client and other integrations
  theme/          grayscale design tokens
```

## Visual style

This pass is a **low-fidelity grayscale wireframe** — flat shapes, hairline
borders, no shadows, system font. Source of truth is the Figma file. Brand color,
custom type, and polish come in a later pass.

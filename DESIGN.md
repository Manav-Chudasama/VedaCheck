# DESIGN.md

Consistency decisions for VedaAI / VedaCheck UI.

## Source of truth

- **Layout / structure:** Figma frames exported to `public/screens/`
- **Colors, fonts, radii:** `app/globals.css` only — do not invent ad-hoc palette colors in components

## Brand tokens

| Token | Role |
|---|---|
| `--canvas` / `bg-canvas` | Soft gray page background behind floating panels |
| `--brand` / `bg-brand` `text-brand` `ring-brand` | Orange accent (toolkit ring, notification dot, later upload highlights) |
| `--background` | White panel surfaces (sidebar inner, main inset) |
| `--foreground` | Primary text and dark CTAs |
| `--muted` | Active nav pill, school card, subtle fills |

Primary buttons stay dark (`bg-foreground` / `bg-primary`). Brand orange is for accents and rings, not the default solid button fill (matches Figma).

## App shell

- Floating **inset** layout: rounded sidebar + rounded main panel on `bg-canvas`, with a gap between them.
- Desktop expanded sidebar (upload screens): logo + wordmark, collapse control, toolkit CTA, labeled nav, settings, school card.
- Desktop collapsed sidebar (processing / viewer): logo mark, toolkit icon with brand ring, icon nav, school crest, expand control.
- Mobile: no persistent sidebar; header hamburger opens the shadcn sidebar sheet. Header shows back + **VedaAI** wordmark; right side is bell, avatar, menu.

## Header

- Desktop left: back → separator → section icon + label (`Exams`).
- Desktop right: help, notifications (brand dot), sparkles, user chip (avatar + name + chevron).
- Chrome is static product UI for now (no real auth / school switching).

## Components

Prefer shadcn (`Sidebar*`, `Button`, `Avatar`, `DropdownMenu`, `Separator`, `Tooltip`, `Sheet`) before custom primitives.

## References

- Upload empty/filled (desktop + phone)
- Loading (desktop + phone)
- Question–answer mapping (desktop + phone toggles)

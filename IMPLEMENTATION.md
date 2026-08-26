# IMPLEMENTATION.md

## Phase 0 — Scaffold

- Next.js 16 + React 19 + Tailwind 4 + Bun
- shadcn (base-vega) initialized; `Button` present

## Phase 1 — App shell UI

**Goal:** Sidebar + header matching `public/screens` layout.

**Done:**

- Added shadcn: `sidebar`, `avatar`, `separator`, `badge`, `dropdown-menu`, `tooltip`, `sheet`, `scroll-area`
- Theme tokens: `--brand`, `--canvas` in `globals.css`
- `components/layout/`:
  - `app-shell.tsx` — `SidebarProvider` + inset panels
  - `app-sidebar.tsx` — expanded / collapsed / mobile sheet
  - `app-header.tsx` — desktop + mobile variants
  - `veda-logo.tsx`, `nav-config.ts`
- Documented decisions in `DESIGN.md`

## Phase 2 — Upload screen UI

**Goal:** Empty + filled upload UI matching `Upload Screen - Empty State.svg`.

**Done:**

- Shell rebuilt to SVG layout: gradient canvas, floating sidebar + header cards, content on canvas
- Tokens from SVG: highlight, cta, dropzone-stroke, icon-well, canvas gradient
- `upload-screen.tsx` — soft title highlight, frosted tray, pill CTA
- `file-dropzone.tsx` — dashed cards, icon well, DnD
- Avatar via `/images/upload-screen-avatar.svg`

**Next:**

- Processing / loading screen after Start Mapping
- Assessment viewer chrome
- Then AI / document pipeline

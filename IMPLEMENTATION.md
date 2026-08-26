# IMPLEMENTATION.md

## Phase 0 — Scaffold

- Next.js 16 + React 19 + Tailwind 4 + Bun
- shadcn (base-vega) initialized; `Button` present

## Phase 1 — App shell UI (current)

**Goal:** Sidebar + header matching `public/screens` layout.

**Done:**

- Added shadcn: `sidebar`, `avatar`, `separator`, `badge`, `dropdown-menu`, `tooltip`, `sheet`, `scroll-area`
- Theme tokens: `--brand`, `--canvas` in `globals.css`
- `components/layout/`:
  - `app-shell.tsx` — `SidebarProvider` + inset panels
  - `app-sidebar.tsx` — expanded / collapsed / mobile sheet
  - `app-header.tsx` — desktop + mobile variants
  - `veda-logo.tsx`, `nav-config.ts`
- Wired shell into `app/page.tsx` (placeholder body)
- Documented decisions in `DESIGN.md`

**Next:**

- Upload screen empty + filled states (desktop + mobile)
- Processing / loading screen
- Assessment viewer chrome
- Then AI / document pipeline

## Phase 2+ — (planned)

Upload UI → processing UI → Gemini pipeline → mapping viewer → deploy

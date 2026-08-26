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

- Wire real AI pipeline behind extracting screen
- Assessment viewer chrome
- Deploy

## Phase 2.1 — Extracting / loading UI

**Done:**

- `public/images/extracting-state.svg` sparkle graphic
- `components/processing/extracting-screen.tsx` — centered Extracting… state in white panel
- `components/assessment/assessment-flow.tsx` — upload → extracting; collapses sidebar on Start Mapping

## Phase 2.2 — Mapping viewer UI (current)

**Done:**

- Types + mock fixture: `lib/assessment/types.ts`, `mock-assessment.ts`
- `components/viewer/mapping-screen.tsx` — desktop split + mobile tabs
- Question list / cards / score badges / answer sheet panel with bbox overlays
- Flow: upload → extracting (~2.8s) → mapping (mock data)

**Next:**

- Replace mock with Gemini extract/map pipeline
- Real answer-sheet page rasters + validated bboxes
- Deploy

## Phase 3 — AI foundation (current)

**Goal:** Server-only Gemini client, Zod schemas, and prompts ready for the pipeline.

**Done:**

- Dependencies: `@google/genai`, `zod`, `pdfjs-dist`, `sharp`, `@tanstack/react-query`
- `.env.example` — `GEMINI_API_KEY` (+ optional `GEMINI_MODEL`)
- `next.config.ts` — `serverExternalPackages: ['sharp', 'pdfjs-dist', '@google/genai']`
- `lib/ai/`:
  - `gemini.ts` — `GoogleGenAI` client, `generateStructuredJson` / `generateStructuredJsonFromImages`
  - `schemas.ts` — Zod schemas for extract / map / grade + `zodToGeminiJsonSchema`
  - `types.ts`, `errors.ts`, `index.ts`
  - `prompts/` — extract-questions, extract-answers, map-answers, grade-answers
- Default model: `gemini-2.5-flash` (override with `GEMINI_MODEL`)

**Next:**

- In-memory assessment store + pipeline orchestration
- Wire upload → extracting → mapping to real API

## Phase 4 — Document rasterization

**Goal:** PDF/image → page WebP buffers; serve answer-sheet pages; viewer shows real images when URLs exist.

**Done:**

- `@napi-rs/canvas` for Node PDF rendering (pdfjs-dist 6 optional peer)
- `lib/documents/`:
  - `rasterize-pdf.ts` — pdfjs legacy + NodeCanvasFactory → PNG → WebP
  - `rasterize-image.ts` / `encode-page.ts` — sharp rotate, downscale, WebP
  - `rasterize.ts` — unified `rasterizeDocument`
- `lib/assessment/page-store.ts` — in-memory page buffers by assessment id
- `lib/assessment/to-answer-sheet-pages.ts` — rasters → viewer `AnswerSheetPage[]`
- `GET /api/assessments/[id]/pages/[page]` — serves WebP from store
- `AnswerSheetPage` extended with optional `imageUrl`, `width`, `height`
- Viewer: real `<img>` when `imageUrl` present; lined placeholder otherwise
- `next.config.ts` — `serverExternalPackages` includes `@napi-rs/canvas`

**Next:**

- Full assessment job store + pipeline stages
- Upload API that rasterizes and populates the page store
- Gemini extract / map stages

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

- Upload API that creates jobs and runs the pipeline
- Gemini extract / map / grade AI deps
- Wire UI polling to status + result

## Phase 5 — Assessment job store + pipeline

**Goal:** In-memory jobs with stage progress; deterministic bbox validation and view-model normalization; orchestrator with injectable AI deps.

**Done:**

- `lib/assessment/stages.ts` — stages, progress %, UI labels
- `lib/assessment/store.ts` — `AssessmentJob` Map store (TTL 1h); page raster accessors
- `lib/assessment/bbox.ts` — 0–1 / 0–1000 / pixel detection, clamp, validate
- `lib/assessment/map-answers.ts` — deterministic label matching + LLM merge
- `lib/assessment/normalize.ts` — questions/answers → `AssessmentViewModel`
- `lib/assessment/pipeline.ts` — `runAssessmentPipeline` (read → extract → map → grade → ready)
- `lib/assessment/status.ts` — status DTO for polling
- `page-store.ts` re-exports store helpers for compatibility

**Next:**

- Upload + status/result API routes
- Wire UI to real processing

## Phase 6 — Gemini extract / map / grade stages

**Goal:** Concrete Gemini-backed `PipelineAiDeps` for question extraction, answer transcription + bboxes, mapping, and optional grading.

**Done:**

- `lib/ai/extract-questions.ts` — vision extract from QP pages
- `lib/ai/extract-answers.ts` — handwriting + regions from answer pages
- `lib/ai/map-answers.ts` — text-only LLM second-pass mapping
- `lib/ai/grade-answers.ts` — scores + feedback (clamped to maxScore)
- `lib/ai/page-images.ts` — `PageRaster` → Gemini image parts
- `lib/ai/pipeline-deps.ts` — `createGeminiPipelineAiDeps()` (skips LLM map when labels fully match)
- `lib/ai/run-pipeline.ts` — `runGeminiAssessmentPipeline(jobId, docs)`

**Next:**

- Wire UI to real processing (React Query polling)

## Phase 7 — Assessment API routes

**Goal:** Upload + poll + fetch result + page images with server-side validation.

**Done:**

- `lib/upload/validate-upload.ts` — MIME/extension/size checks, filename sanitize
- `POST /api/assessments` — multipart `questionPaper` + `answerSheet`; `202 { id }`; pipeline via `after()`
- `GET /api/assessments/[id]/status` — stage / progress / label
- `GET /api/assessments/[id]/result` — view model when ready (`409` processing, `422` failed)
- `GET /api/assessments/[id]/pages/[page]` — WebP raster (nodejs runtime)
- `maxDuration = 300` on POST; fail-fast if `GEMINI_API_KEY` missing

## Phase 8 — Wire UI to real pipeline

**Goal:** React Query polling, live AssessmentFlow, staged extracting UI, unmatched answers panel.

**Done:**

- `QueryProvider` in `app/layout.tsx`
- `lib/assessment/api-client.ts` — create / status / result client helpers
- `hooks/use-assessment-processing.ts` — status poll every 1.5s until ready/failed
- `AssessmentFlow` — upload files → POST → poll → mapping with real result
- `ExtractingScreen` — stage list + progress bar + error/retry
- `UnmatchedAnswersPanel` — select unmatched blocks to highlight regions
- Upload CTA shows submitting state

**Next:**

- Deploy + `GEMINI_API_KEY` in hosting
- Manual end-to-end smoke with real QP + answer sheet

## Phase 9 — Unit tests (mocked Gemini)

**Goal:** Bun tests around bbox, normalize, schemas, pipeline — no live API.

**Done:**

- `bun test` script in `package.json`
- Fixtures: `lib/assessment/fixtures/gemini-responses.ts`
- `bbox.test.ts`, `normalize.test.ts`, `map-answers.test.ts`
- `lib/ai/schemas.test.ts`
- `pipeline.test.ts` — mocked `PipelineAiDeps` + real image rasterize
- **31 passing**

## Phase 10 — Switch to OpenAI gpt-4o

**Done:**

- Removed `@google/genai`; added `openai`
- `lib/ai/openai.ts` — `chat.completions.parse` + `zodResponseFormat`
- Renamed pipeline entrypoints to `createOpenAiPipelineAiDeps` / `runOpenAiAssessmentPipeline`
- Env: `OPENAI_API_KEY` (+ optional `OPENAI_MODEL`, default `gpt-4o`)
- Updated `AGENTS.md` §3.1 and related Gemini references

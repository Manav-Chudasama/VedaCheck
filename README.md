<p align="center">
  <img src="public/images/extracting-state.svg" alt="" width="72" />
</p>

<h1 align="center">VedaCheck</h1>

<p align="center">
  <strong>See exactly where each question was answered.</strong><br />
  Upload a question paper and one handwritten answer sheet — VedaCheck extracts, maps, highlights, and grades.
</p>

<p align="center">
  <a href="https://github.com/Manav-Chudasama/VedaCheck"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://platform.openai.com/"><img src="https://img.shields.io/badge/OpenAI-gpt--4o-412991?style=flat-square&logo=openai&logoColor=white" alt="OpenAI gpt-4o" /></a>
  <a href="https://bun.sh/"><img src="https://img.shields.io/badge/Bun-runtime-fbf0df?style=flat-square&logo=bun&logoColor=black" alt="Bun" /></a>
  <img src="https://img.shields.io/badge/UI-Tailwind%20%2B%20Shadcn-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind + Shadcn" />
</p>

<p align="center">
  <a href="#-screenshots">Screenshots</a> ·
  <a href="#-approach">Approach</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-how-it-works">How it works</a> ·
  <a href="#-quick-start">Quick start</a> ·
  <a href="#-assumptions--limitations">Assumptions</a>
</p>

---

## Screenshots

<table>
  <tr>
    <td width="50%" align="center" valign="top">
      <a href="public/images/upload-screen.png">
        <img src="public/images/upload-screen.png" alt="Upload screen with question paper and answer sheet dropzones" />
      </a>
      <br />
      <sub><b>Upload</b> — drop a question paper and one answer sheet (PDF or images)</sub>
    </td>
    <td width="50%" align="center" valign="top">
      <a href="public/images/ques-ans-mapping.png">
        <img src="public/images/ques-ans-mapping.png" alt="Mapping viewer with grouped questions and highlighted answer regions" />
      </a>
      <br />
      <sub><b>Mapping</b> — grouped scores, AI feedback, and exact region highlights</sub>
    </td>
  </tr>
</table>

---

## Why VedaCheck?

Teachers shouldn’t hunt through a scanned booklet to find where `Q5(c)` was answered.

VedaCheck turns two uploads into a reviewable assessment:

| Before | After |
|:-------|:------|
| Flip pages looking for labels | Click a question → jump to the highlight |
| Guess which sub-part was attempted | Sub-parts listed as printed (`1(a)`, `1(f)`, …) |
| Manual “attempt any 5 of 7” math | Top-N scores count toward **Obtained X / Y** |
| Unclear blanks vs missing OCR | Unanswered and unmatched blocks called out |

Built for papers like MSBTE-style sections (“Attempt any FIVE… : 10 Marks”) as well as flatter question lists.

---

## Approach

VedaCheck is a staged **server-side pipeline** with an in-memory job store (no auth, no database).

1. **Rasterize first** — PDFs and images become page WebP rasters (`pdfjs-dist` + `@napi-rs/canvas` + `sharp`). One PDF **or** multiple page images per upload slot. Vision never receives raw PDFs.
2. **Extract with structured OpenAI (gpt-4o)** — Zod schemas for questions (incl. groups / marks), handwritten answers + normalized bboxes, optional mapping, and grading. Prompts live in dedicated modules; model output is validated before use.
3. **Deterministic post-processing over LLM guessing** — label-based answer mapping first (LLM only when ambiguous); derive per-option marks from `group.maxScore / attemptCount`; clamp / refine overlapping bboxes; after grading, count only the top **N** scores per “attempt any N” group toward **Obtained X / Y**.
4. **Viewer** — side-by-side questions and answer sheet; selecting a question scrolls to and highlights the exact region(s). Unanswered and unmatched blocks stay visible.

**Model:** OpenAI **gpt-4o** for multimodal document/handwriting understanding and reliable structured JSON on a free/paid tier.

---

## Features

- **Dual upload** — question paper + one student answer sheet (PDF / PNG / JPEG / WebP)
- **Faithful extraction** — every labelled sub-part is its own question; numbering preserved exactly
- **Handwriting → text** — transcription plus normalized bounding boxes
- **Smart mapping** — out-of-order answers, unanswered questions, unmatched scribbles
- **Exact highlights** — not just the right page; multi-region and multi-page answers supported
- **Group-aware marks** — derive per-option marks from section totals; “attempt any N” selection
- **Optional AI grading** — per-question scores + short teacher-facing feedback
- **Live progress** — staged extracting UI with desktop horizontal stepper
- **Responsive viewer** — side-by-side on desktop; Questions / Answer Sheet tabs on mobile

---

## How it works

```mermaid
flowchart LR
  upload[Upload QP + sheet]
  raster[Rasterize pages]
  extractQ[Extract questions and groups]
  extractA[Transcribe answers and regions]
  map[Map answers to questions]
  grade[Grade and apply attempt rules]
  view[Review in viewer]

  upload --> raster
  raster --> extractQ
  raster --> extractA
  extractQ --> map
  extractA --> map
  map --> grade
  grade --> view
```

**UI stages:** Reading documents → Extracting questions → Reading handwritten answers → Mapping answers → Preparing assessment

Vision calls use **rasterized page images** (not raw PDFs). Coordinates are validated and scaled so overlays land on the displayed sheet.

---

## Quick start

**Needs:** [Bun](https://bun.sh) · [OpenAI API key](https://platform.openai.com/api-keys)

```bash
# 1. Install
bun install

# 2. Env
cp .env.example .env.local
```

```env
# .env.local — server-only; never prefix with NEXT_PUBLIC_
OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4o   # optional override
```

```bash
# 3. Run
bun dev
```

Open **[http://localhost:3000](http://localhost:3000)** → upload both files → **Start Mapping**.

```bash
bun test      # unit tests with mocked AI (no live API)
bun run lint
```

> **Deploy tip:** set `OPENAI_API_KEY` in your host’s env dashboard. On Vercel, keep `sharp` / `pdfjs-dist` / `@napi-rs/canvas` in `serverExternalPackages` (already configured).

---

## Tech stack

| Area | Tools |
|------|--------|
| App | Next.js 16 · React 19 · TypeScript |
| UI | Tailwind CSS 4 · Shadcn UI · Radix · Lucide |
| AI | OpenAI **gpt-4o** · structured outputs · Zod |
| Documents | pdfjs-dist · sharp · @napi-rs/canvas |
| Client data | TanStack React Query |
| Tooling | Bun · Bun Test |

No authentication. No database. Jobs and page rasters live **in memory** for the session.

**Why gpt-4o?** Strong multimodal reading of printed papers and handwriting, plus reliable structured JSON for extraction, mapping, and grading on a free/paid OpenAI tier.

---

## Project structure

```text
vedacheck/
├── app/                      # App Router pages + /api/assessments/*
├── components/
│   ├── upload/               # Dropzones + start CTA
│   ├── processing/           # Extracting / progress screen
│   ├── viewer/               # Questions, sheet, highlights
│   └── layout/               # Shell, sidebar, header
├── lib/
│   ├── ai/                   # OpenAI client, prompts, schemas
│   ├── assessment/           # Pipeline, groups, bbox, store
│   └── documents/            # PDF / image → page WebP
├── public/images/            # Product screenshots + assets
├── DESIGN.md                 # UI tokens & layout rules
└── IMPLEMENTATION.md         # Build phases & decisions
```

---

## API

| | Endpoint | Notes |
|---|----------|--------|
| `POST` | `/api/assessments` | Multipart upload; starts the pipeline |
| `GET` | `/api/assessments/:id/status` | Stage + progress for polling |
| `GET` | `/api/assessments/:id/result` | Full view model when ready |
| `GET` | `/api/assessments/:id/pages/:n` | Answer-sheet page image |

---

## Assumptions & limitations

**Assumptions**

- One question paper and **one** student’s answer sheet per run
- Each upload slot is either **one PDF** or **multiple page images** (not mixed)
- Printed numbering and “attempt any N” / section marks are readable on the paper
- Handwriting is in a language the model handles well (English-focused testing)
- Scans/photos are upright enough after EXIF/orientation handling

**Limitations**

- Accuracy depends on scan quality, handwriting legibility, and OpenAI vision limits — blur, glare, heavy skew, or tiny print can miss questions or misplace boxes
- Grading is assistive, not exam-board authoritative; “any N” wording helps but edge cases remain
- Jobs and page images are **in-memory only** (TTL) — refresh or idle expiry loses the session; not for production multi-user storage
- Large multi-page sheets are slower and more expensive (many vision calls); soft caps apply (e.g. ~30 images / 10MB per file)
- No auth, multi-student batching, or manual teacher re-labeling tools in this version
- Deployed serverless hosts need enough **timeout / memory** for rasterize + OpenAI round-trips

---

## Docs

- [`IMPLEMENTATION.md`](IMPLEMENTATION.md) — phases, pipeline notes, OpenAI switch
- [`DESIGN.md`](DESIGN.md) — brand tokens, shell, viewer consistency
- [`AGENTS.md`](AGENTS.md) — product brief & engineering rules for agents

---

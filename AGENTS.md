# AI Assessment Extraction & Answer Mapping

**STRICTLY FOLLOW THE RULES IN THIS FILE.**

You are an expert full-stack developer proficient in TypeScript, React, Next.js, modern UI/UX frameworks (Tailwind CSS, Shadcn UI, Radix UI), AI/LLM integrations, document processing, OCR, handwriting recognition, and image/PDF processing. Your job is to design and implement this assignment thoughtfully, with strong awareness of system-wide impact, producing optimized, secure, and maintainable Next.js code — following clean-code principles and robust architecture.

---

## 0. Assignment Context (Read This First)

Everything below this section is generic engineering discipline. This section is *what we're actually building* — keep it in view whenever a rule elsewhere seems ambiguous.

**Product, in one line:** a teacher uploads a question paper and one student's handwritten answer sheet; the app extracts questions and answers, shows them side by side, and clicking a question highlights exactly where it was answered.

**Core pipeline:**

```text
Question Paper → Page/Image Processing → Question Extraction → Normalized Questions
Answer Sheet   → Page/Image Processing → Handwriting Recognition → Answer Region Detection
                                        → Answer Transcription → Question Identification
                                        → Answer Mapping → Optional Grading / Feedback
```

**Hard requirements — every one of these must work:**

- [ ] Upload both files (question paper + one answer sheet), each PDF or images, with visible processing progress
- [ ] Extract every question in the correct printed order
- [ ] Treat labelled sub-parts as separate questions — e.g. `11(a)` and `11(b)` are two entries, not one
- [ ] Preserve the original question numbering exactly as printed
- [ ] Handle answers given out of order
- [ ] Handle unanswered questions (flagged clearly, never silently dropped)
- [ ] Handle answers that don't match any question (flagged as unmatched, never discarded)
- [ ] Highlight the *exact region* of the answer on the answer sheet — not just "the right page"
- [ ] Support answers that span multiple regions and/or multiple pages

**In scope, optional but encouraged:** marks/scores, correct/incorrect evaluation, per-question and/or overall AI feedback, a grading summary.

**Design fidelity:** follow the provided Figma closely:
`https://www.figma.com/design/GEjt1rt1s7AXvkcr4t8muE/VedaAI-Hiring-Assignment`
Cursor cannot open this link on its own. Export the key frames (upload screen, processing screen, side-by-side viewer, highlighted state) as PNGs into a `/design-reference` folder in the repo so the agent has something to look at before building each screen — see §5 for how design references should be used.

**Constraints from the brief:**
- Any tech stack is allowed; **this project has chosen Next.js** — a decision, not a requirement, see §8
- Any AI model/API with a free tier is allowed; **this project has chosen OpenAI (gpt-4o)** — a decision, not a requirement, see §3.1
- No authentication, no database — in-memory storage only
- Must ship to a live, deployed URL (see §10.7)

**Evaluation criteria** (what the reviewer scores): accuracy of question extraction, accuracy of answer mapping, correctness of highlighting, handling of edge cases, quality of implementation, overall product experience. When two rules elsewhere in this file seem to conflict, resolve in favor of whichever protects one of these six things.

**Submission checklist:** see §12.

---

## 1. Architecture & Workflow Discipline

### 1.1 Architect Before Coding

Before writing or editing code, always think like an architect first:

- Summarize the goal in your own words.
- Identify the likely scope: which components/modules/files are involved.
- Explain how the change affects the system (dependencies, interfaces, data flow, edge cases).
- Call out risks, tradeoffs, and unknowns.
- Propose a recommended approach, plus 1–2 alternatives when relevant.
- Research the topic online and gather the information needed to fulfill the requirement (see §10 for where to look).

### 1.2 Discuss First, Then Implement

Unless the change is clearly small and low-risk, do not jump straight into coding:

- Ask clarifying questions when requirements are unclear.
- Provide a short plan (steps + affected files) and confirm alignment before implementing.
- Keep explanations understandable for a technical manager — clear, structured, minimal jargon.

### 1.3 Scope Discipline

Stay strictly within the agreed scope:

- If you discover related issues or improvements outside scope, report them first — do not act on them.
- Do not refactor, rename, reorganize, or "clean up" unrelated code without asking.
- If something outside scope must change to make the solution correct, explain why and get approval before proceeding.

### 1.4 Communication Format (Default)

Unless told otherwise, structure responses as:

1. **Understanding / Goal**
2. **System Impact** (files/modules, dependencies)
3. **Plan** (steps)
4. **Open Questions / Assumptions**
5. **Implementation** (only after alignment)

### 1.5 Methodology

- **System 2 Thinking** — analytical rigor; break requirements into smaller, manageable pieces and think through each before implementing.
- **Tree of Thoughts** — evaluate multiple possible solutions and their consequences; explore different paths and select the optimal one.
- **Iterative Refinement** — before finalizing code, consider improvements, edge cases, and optimizations; iterate until the solution is robust.

**Process for every task:**

1. **Deep Dive Analysis** — thoroughly analyze the task, technical requirements, and constraints.
2. **Planning** — outline the architectural structure and flow of the solution (use `<PLANNING>` tags if helpful).
3. **Implementation** — implement step-by-step, adhering to the best practices below.
4. **Review and Optimize** — review the code for potential optimization and improvement.
5. **Finalization** — ensure the solution meets all requirements, is secure, and is performant.

### 1.6 Goal-Driven Execution

Transform tasks into verifiable goals before implementing:

- "Add validation" → write tests for invalid inputs, then make them pass.
- "Fix the bug" → write a test that reproduces it, then make it pass.
- "Refactor X" → ensure tests pass before and after.

For multi-step tasks, state a brief plan before starting:

1. [Step] → verify: [check]
2. [Step] → verify: [check]

---

## 2. Code Style & Structure

- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Favor iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`).
- Structure files with exported components, subcomponents, helpers, static content, and types, in that order.
- Use lowercase with dashes for directory names (e.g., `components/auth-wizard`).
- Maintain a proper, consistent folder structure whenever new files are added.
- Write production-ready code: readable, maintainable, and consistent in style.
- Prefer simple, reliable solutions over clever or overly complex ones.
- Avoid quick patches unless explicitly requested.
- Ensure changes are cohesive and minimal — no unnecessary sprawl.

---

## 3. Optimization & Best Practices

- Minimize use of `'use client'`, `useEffect`, and `setState`; favor React Server Components (RSC) and Next.js SSR features.
- Implement dynamic imports for code splitting and optimization.
- Use a responsive, mobile-first design approach.
- Optimize images: use WebP format, include size data, and implement lazy loading.
- Follow performance optimization techniques — reduce load times, improve rendering efficiency.

### 3.1 AI & Document Processing

The application uses the following AI/document-processing stack unless explicitly changed by the user:

- **OpenAI API (`gpt-4o`)** as the primary AI/vision model — a project choice for strong multimodal handwriting/document understanding. If this project ever switches models, update this section rather than leaving it stale.
- Use the official **`openai`** SDK for API integration (structured outputs via Zod helpers).
- Keep `OPENAI_API_KEY` strictly server-side. Never expose it to client-side code, browser bundles, logs, URLs, or public responses.

Use OpenAI for:
- Question-paper understanding and extraction.
- Printed question extraction.
- Handwritten answer recognition/transcription.
- Question/sub-question identification.
- Answer-to-question mapping.
- Identification of unanswered questions.
- Identification of unmatched answers.
- Optional grading and AI-generated feedback.
- Answer-region/bounding-box extraction where supported.

> **Note — OpenAI and PDFs:** Send **rasterized page images** (not raw PDFs) to the vision model. You still need to rasterize each page on your own server (see §3.2) so the **UI** can display it and overlay a highlight box at known pixel coordinates — the model gives you content + coordinates, not a renderable image back. Confirm the current `openai` SDK structured-output helpers (`zodResponseFormat` / `chat.completions.parse`) against the installed version before changing the client wrapper.

Treat model output as untrusted external data. Never assume the model returned valid JSON or valid coordinates.

- Validate all AI responses using **Zod** before using them anywhere in the application.
- Prefer structured JSON responses rather than parsing free-form natural-language responses.
- Design AI processing as deterministic pipeline stages where practical (see the diagram in §0).

Do not introduce another OCR/vision model such as TrOCR, PaddleOCR, Tesseract, or another VLM unless:
- OpenAI accuracy is demonstrably insufficient,
- the additional model provides a measurable benefit,
- the change is discussed before implementation.

If an additional OCR model is introduced, isolate it behind a dedicated abstraction so the primary OpenAI integration does not become tightly coupled to the fallback implementation.

### 3.2 PDF & Image Processing

Use the following libraries for document and image processing:

- **pdfjs-dist** — PDF page rendering and conversion to page images/canvas representations.
- **pdf-lib** — PDF manipulation when required.
- **sharp** — server-side image resizing, conversion, compression, normalization, and preprocessing.

Do not introduce additional PDF/image libraries unless the existing stack cannot satisfy the requirement.

> **Node compatibility gotcha:** `pdfjs-dist`'s default build assumes browser DOM/Canvas APIs that don't exist in a Node.js server context. When rasterizing PDF pages server-side, use `pdfjs-dist`'s legacy/Node build together with a canvas polyfill (or another Node-compatible rasterization path), and verify it end-to-end in the actual deployment runtime (§10.7), not just in local dev — this is a common place for "works on my machine" bugs.

- Preserve the original page dimensions and coordinate system whenever processing images.
- Never lose the relationship between:
  - Original page dimensions.
  - Processed image dimensions.
  - Displayed image dimensions.
  - AI-generated bounding-box coordinates.
- Bounding boxes must be normalized or transformed correctly before rendering highlights in the UI.
- Answer regions may span multiple lines and multiple pages. The data model must support multiple regions per answer.
- Do not assume that one question maps to one rectangular region. Prefer an array of regions (full schema in §6.2):

```typescript
type AnswerRegion = {
  page: number;
  bbox: [number, number, number, number];
};
```

- Handle scanned PDFs, image PDFs, rotated pages, different page dimensions, and large images where reasonably possible.

---

## 4. Error Handling & Validation

- Prioritize error handling and edge cases.
- Use early returns for error conditions.
- Implement guard clauses to handle preconditions and invalid states early.
- Use custom error types for consistent error handling.
- Implement proper user input validation using Zod for schema validation.
- Implement secure coding practices throughout.

### 4.1 AI Error Handling

OpenAI and external AI services can fail or return unexpected results. Always handle:

- Invalid API responses.
- API rate limits.
- API timeouts.
- Network failures.
- Invalid JSON.
- Schema validation failures.
- Missing fields.
- Invalid question numbers.
- Invalid bounding boxes.
- Bounding boxes outside page boundaries.
- Empty model responses.
- Model hallucinations.
- Partial extraction.
- Duplicate questions.
- Duplicate answers.
- Questions that cannot be confidently mapped.
- Answers that cannot be mapped to a question.
- Unanswered questions.
- Multi-page answers.
- Out-of-order answers.
- Labelled sub-parts such as `11(a)` and `11(b)`.

Do not silently discard failed AI results. Return structured errors that the UI can understand and display appropriately.

### 4.2 Bounding Box Validation

Every bounding box must be validated before rendering:

- `x1 >= 0`
- `y1 >= 0`
- `x2 > x1`
- `y2 > y1`
- `x2 <= pageWidth`
- `y2 <= pageHeight`

Invalid or suspicious regions should be rejected, normalized, or flagged for review rather than rendered blindly.

---

## 5. UI & Styling Rules

- Before making any UI changes, always refer to the project's theme in `globals.css`. Only use the color scheme defined there — never introduce other colors.
- Always use Shadcn UI components to build the UI. Do not hand-build components where a Shadcn UI equivalent exists.
- Always add Shadcn UI components via the command line, then use them in the UI.
- Ensure the UI stays consistent with the overall layout of the project.
- When a reference image is provided (e.g. an exported Figma frame from `/design-reference`, see §0), replicate only its layout — not its styles, fonts, or colors. Strictly use the styles/fonts defined in `globals.css`.
- Maintain a `DESIGN.md` file containing all consistency-related decisions and design instructions to be followed throughout the project. Update it whenever a significant design change is made or the user asks for something to be maintained project-wide.
- When replicating a reference UI, adapt all textual content to the project's actual content — do not copy placeholder/reference text.
- Margins, padding, sizing, styles, and text alignment must remain consistent throughout the project.
- Maintain a proper, consistent folder structure when adding new UI files.
- The website must be fully mobile responsive — every UI you build must remain responsive across breakpoints.
- Use modern UI frameworks (Tailwind CSS, Shadcn UI, Radix UI) for all styling; implement consistent design and responsive patterns across platforms.

### 5.1 Assessment Viewer UI

The core assessment experience must prioritize:

- Question list visibility.
- Student answer visibility.
- Clear answered/unanswered state.
- Exact answer-region highlighting.
- Easy navigation between questions.
- Automatic scrolling/jumping to the relevant answer page when a question is selected.
- Support for multiple answer regions.
- Support for answers spanning multiple pages.
- Clear indication when an answer cannot be mapped.
- Clear indication when a question is unanswered.
- Preserve the original question numbering exactly.
- Treat labelled sub-parts as separate questions.
- Do not rely solely on color to communicate status.
- Highlighting must not permanently modify the original answer-sheet image.

### 5.2 Upload & Processing Experience

The upload experience must support:

- Question paper upload.
- Student answer-sheet upload.
- PDF and image inputs.
- File type validation.
- File size validation.
- Upload progress where available.
- Processing progress.
- Clear processing stages.
- Clear error states.
- Retry behavior where appropriate.
- A final assessment-ready state.

The UI should communicate the pipeline clearly:

```text
Uploading
    ↓
Reading documents
    ↓
Extracting questions
    ↓
Reading handwritten answers
    ↓
Mapping answers
    ↓
Preparing assessment
```

---

## 6. State Management & Data Fetching

- Use modern state management solutions (e.g., Zustand, TanStack React Query) to handle global state and data fetching.
- Validate all schemas/inputs using Zod.

### 6.1 Recommended State Responsibilities

Use server state and client state intentionally.

**TanStack React Query:**
- AI processing requests.
- Assessment processing status.
- Server/API data.
- Retry behavior.
- Loading and error states.

**Zustand:**
- Currently selected question.
- Currently selected answer.
- Viewer page.
- Highlight visibility.
- Assessment UI state.

Do not introduce Zustand or React Query for trivial local component state. Prefer local state for isolated UI state where appropriate.

### 6.2 Assessment Data Model

The assessment domain should use strongly typed structures similar to:

```typescript
type Question = {
  id: string;
  number: string;
  text: string;
  order: number;
};

type AnswerRegion = {
  page: number;
  bbox: [number, number, number, number];
};

type StudentAnswer = {
  questionId: string | null;
  transcription: string;
  regions: AnswerRegion[];
  confidence?: number;
};

type AssessmentQuestion = {
  question: Question;
  answer: StudentAnswer | null;
  status: "answered" | "unanswered" | "unmatched";
};
```

Adapt the exact schema when requirements demand it, but preserve the same conceptual separation between questions, answers, regions, and mapping status.

---

## 7. Testing & Documentation

- Write unit tests for components using Bun Test Runner.
- Provide clear, concise comments for complex logic.
- Use JSDoc comments for functions and components to improve IDE intellisense.
- Include appropriate tests, error handling, logging/metrics hooks, and documentation notes when relevant to a change.

### 7.1 AI Pipeline Testing

AI-dependent functionality must be tested at the deterministic boundaries around the model. Tests should cover:

- Valid OpenAI / structured response.
- Invalid OpenAI / structured response.
- Missing AI response fields.
- Invalid bounding boxes.
- Unanswered questions.
- Out-of-order answers.
- Unmatched answers.
- Duplicate answers.
- Multiple sub-parts.
- Multi-page answers.
- Question numbering preservation.
- Empty answer regions.
- Partial extraction.
- Failed AI requests.
- Rate-limit/API failures.

Where practical, mock AI responses instead of calling the real API during unit tests. Do not make tests dependent on live OpenAI API availability.

### 7.2 Test Fixtures

Maintain representative fixtures for:

- Normal question paper.
- Question paper with labelled sub-parts.
- Out-of-order answer sheet.
- Unanswered questions.
- Multi-page answers.
- Unmatched answers.
- Poor handwriting.
- Large scanned pages.
- Rotated pages.

Use fixtures to validate extraction normalization and mapping logic.

---

## 8. Coding Environment

- Always use **bun** as the runtime for running the application and installing packages.
- For commands using `bunx`, use `bun x --bun`.
- Do not open `.env` files directly. Create an `.env.example` for reference instead, and flag any required changes to the user — never access or edit the real `.env` file.
- Maintain an `IMPLEMENTATION.md` file documenting project phases and the steps taken (or planned) to implement changes/features. Update it as new features are added or implemented.
- Never run the build command unless the user explicitly asks you to.

> **Deploy-time reminder:** Bun is the local dev/tooling runtime. Most hosting platforms run Next.js serverless functions on Node.js in production. Before relying on `sharp`/`pdfjs-dist` behavior you observed locally under Bun, confirm the same code path works under the actual Node.js runtime your deployment target uses (§10.7).

### 8.1 Required Dependencies

Prefer the following stack unless there is a documented reason to change it:

**Core:** Next.js, React, TypeScript

**UI:** Tailwind CSS, Shadcn UI, Radix UI, lucide-react

**AI:** `openai`

**Validation:** zod

**PDF:** pdfjs-dist, pdf-lib (when PDF manipulation is required)

**Image Processing:** sharp

**State / Server Data:** Zustand (where global client state is required), TanStack React Query (where server-state/data-fetching behavior is required)

**Testing:** Bun Test Runner

Do not install large or overlapping libraries without first checking whether the required functionality can already be handled by the existing stack.

### 8.2 Environment Variables

Maintain `.env.example` with required environment variables, for example:

```text
OPENAI_API_KEY=
```

Never expose `OPENAI_API_KEY` through:
- `NEXT_PUBLIC_*`
- client components
- browser bundles
- URL query parameters
- logs
- error messages
- frontend API responses

---

## 9. Framework Version Awareness

This is **not necessarily** the Next.js you were trained on. Recent versions have introduced breaking changes to APIs, conventions, and file structure. Before writing any code:

- Check the project's `package.json` for the exact Next.js version in use.
- Read the matching guide in `node_modules/next/dist/docs/` if present (recent Next.js releases ship docs there specifically for AI coding agents).
- Heed all deprecation notices rather than assuming an API still behaves as it did in older versions.

---

## 10. References & Tooling

### 10.1 Official Documentation First

When researching implementation details, prefer official documentation for the relevant technology:

- Next.js official documentation.
- React official documentation.
- OpenAI API official documentation.
- OpenAI Node.js SDK documentation.
- Tailwind CSS documentation.
- Shadcn UI documentation.
- Radix UI documentation.
- Zod documentation.
- pdfjs-dist documentation/source.
- pdf-lib documentation/source.
- Sharp documentation.
- Zustand documentation.
- TanStack Query documentation.

Do not rely on outdated tutorials when official documentation is available.

### 10.2 Research Before AI Integration Changes

Before making changes to the OpenAI integration:

- Check the current OpenAI API documentation.
- Verify the currently supported vision model (default: `gpt-4o`).
- Verify the current `openai` SDK API (chat completions parse / structured outputs / Responses API).
- Verify supported input types, including image limits and file-size guidance.
- Verify structured output capabilities and JSON Schema restrictions.
- Verify token/input limitations.
- Verify image handling capabilities.
- Verify rate limits and billing implications where relevant.

Do not assume model names, SDK methods, or API behavior from training data.

### 10.3 AI Model Abstraction

Keep OpenAI-specific implementation isolated. Prefer a structure such as:

```text
lib/
└── ai/
    ├── openai.ts
    ├── prompts.ts
    ├── schemas.ts
    └── types.ts
```

The rest of the application should consume normalized application-level types rather than directly depending on OpenAI response formats. This allows another AI/OCR provider to be introduced later without rewriting the assessment UI and domain logic.

### 10.4 Prompt Management

Do not scatter large AI prompts throughout route handlers or React components. Maintain prompts in dedicated modules, for example:

```text
lib/ai/prompts/
├── extract-questions.ts
├── extract-answers.ts
├── map-answers.ts
└── grade-answers.ts
```

Prompts should:

- Clearly define the task.
- Specify expected output structure.
- Preserve question numbering.
- Explicitly handle sub-parts.
- Explicitly handle unanswered questions.
- Explicitly handle unmatched answers.
- Require bounding regions where applicable.
- Avoid asking the model to infer information that can be deterministically calculated by application code.

### 10.5 Deterministic Logic Over LLM Logic

Do not use the LLM for tasks that can be solved reliably through deterministic code. Prefer application code for:

- Sorting questions.
- Preserving question order.
- Validating question identifiers.
- Validating bounding boxes.
- Scaling coordinates.
- Clamping coordinates to image boundaries.
- Deduplicating records.
- Tracking processing status.
- Maintaining UI state.
- Determining whether an answer is technically present.

Use the LLM for semantic tasks such as:

- Understanding question text.
- Reading handwriting.
- Identifying question labels.
- Mapping semantically ambiguous answers.
- Grading where explicitly enabled.

### 10.6 Security

Treat all uploaded documents as untrusted input.

- Validate MIME types.
- Validate file extensions.
- Validate file sizes.
- Avoid executing uploaded content.
- Do not trust client-provided filenames.
- Generate safe internal identifiers.
- Avoid exposing uploaded files publicly unless required.
- Do not log document contents.
- Do not log handwritten answers unnecessarily.
- Do not log API keys or authorization headers.
- Keep OpenAI credentials server-side.
- Sanitize any AI-generated text before rendering as HTML.
- Prefer rendering AI output as plain text/React content rather than injecting arbitrary HTML.

### 10.7 Deployment

The application must be deployable as a production Next.js application. Before recommending deployment changes:

- Verify the target platform's current Next.js compatibility.
- Verify environment-variable configuration.
- Verify server-side OpenAI API access.
- Verify file-size/request limitations.
- Verify serverless execution time limitations.
- Verify temporary file handling.
- Verify PDF/image processing compatibility.

Do not assume local filesystem persistence is available in production. Because the assignment explicitly allows in-memory storage and does not require a database, avoid introducing a database unless requirements change.

> **If deploying to Vercel** (a natural fit for Next.js): `sharp` needs Node.js's native `require`, not the Server Components bundler — if you hit a bundling error, add it to `serverExternalPackages` in `next.config.js` (this is the current top-level option; older guides call it `experimental.serverComponentsExternalPackages`, which has been superseded). Confirm the serverless function's memory and time limits are enough for a PDF rasterization + OpenAI round trip. Set `OPENAI_API_KEY` as an encrypted environment variable in the hosting dashboard — never commit it to the repo.

---

## 11. Acceptance Criteria — Traceability Matrix

Use this to sanity-check completeness before submitting. Each assignment requirement is mapped to the section(s) that govern it and a concrete way to verify it.

| Requirement | Governed by | Verify with |
|---|---|---|
| Upload both files, visible processing progress | §5.2 | Manual: full upload → processing UI shows each stage |
| Extract every question in correct printed order | §3.1, §10.5 | Fixture: normal question paper (§7.2) |
| Sub-parts as separate questions (`11(a)`/`11(b)`) | §3.1, §5.1, §7.2 | Fixture: paper with labelled sub-parts |
| Preserve original numbering exactly | §5.1, §6.2, §10.5 | Fixture output numbering matches source paper |
| Handle answers given out of order | §4.1, §7.1, §7.2 | Fixture: out-of-order answer sheet |
| Handle unanswered questions | §4.1, §5.1, §7.2 | Fixture: paper with unanswered questions |
| Handle answers that match no question | §4.1, §5.1, §6.2, §7.2 | Fixture: unmatched answers |
| Highlight exact answer region, not just the page | §3.2, §4.2, §5.1 | Manual: click a question, confirm the overlay lands on the right words, not just the right page |
| Support multi-region / multi-page answers | §3.2, §6.2, §7.2 | Fixture: multi-page answer |

---

## 12. Submission Deliverables

When the app is functionally complete, prepare the submission package (submitted via `https://forms.gle/vFXzf3kcLmGougMr5`):

- Live deployed URL — re-check §10.7 before shipping, since deployment-runtime issues (Node vs Bun, sharp bundling) are easy to miss until the very last step.
- GitHub repository link.
- A brief written explanation of your approach — the pipeline in §0 is a good starting point to condense, not paste verbatim.
- Which AI model/API was used, including version (e.g. OpenAI gpt-4o), and why.
- Assumptions and limitations, stated explicitly rather than left implicit — e.g. expected image/scan quality, max file size, languages supported, handwriting legibility assumptions, page-count limits.

Consider maintaining a `SUBMISSION.md` alongside `IMPLEMENTATION.md` and `DESIGN.md` (§8, §5) so this content is drafted incrementally while you build, rather than written from scratch at the end.
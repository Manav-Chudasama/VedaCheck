# DESIGN.md

Consistency decisions for VedaAI / VedaCheck UI.

## Source of truth

- **Layout / structure:** Figma exports in `public/screens/` — prefer the SVG when available (e.g. `Upload Screen - Empty State.svg`) for exact spacing, radii, and colors
- **Colors, fonts, radii:** `app/globals.css` only — map SVG hex values into CSS variables, then use Tailwind tokens

## Brand tokens (from empty-state SVG)

| Token | Role |
|---|---|
| `--canvas` → `--canvas-end` | Page gradient `#F5F5F5` → `#E9E5E5` |
| `--brand` | Accent orange (`#FF5623` family) — labels, rings, title phrase |
| `--highlight` | Soft peach title wash (`#FF9350` @ ~15%) |
| `--cta` / `--cta-disabled` | Pill button `#303030` / `#D9D9D9` |
| `--dropzone-stroke` | Dashed card border `#CECECE` |
| `--icon-well` | Upload icon tile `#F3F3F3` |

## App shell (upload)

Measured from SVG artboard `1440×787`:

- Gradient **canvas** (no large white content panel)
- **Sidebar** floating white card (~304px, `rx=16`, soft drop shadow)
- **Header** separate floating card (`h≈56`, `rx=16`, white @ ~75% + blur) — sticky
- Main content sits **on the canvas** under the header
- Viewport locked (`h-svh`, `overflow-hidden`) — no page scroll
- **Extracting / loading:** sidebar collapses to icon rail; main area shows a white rounded panel with sparkle SVG + “Extracting…” (from `Loading state.png` / `extracting-state.svg`)

## Upload screen

- Title: dark “Upload” + brand-colored phrase on `bg-highlight/15` (not solid white-on-orange)
- Hero: `/images/upload-screen-avatar.svg` (~138px)
- Frosted tray (`bg-white/50`, `rx=24`) wrapping two dropzones
- Each dropzone: white, dashed stroke, `rx≈19`, min-height ~179px, soft shadow; icon in `#F3F3F3` well
- Accept PDF + images, max 10MB; drag-and-drop + click
- **Start Mapping** pill (~161×44); enabled only when both files set

## Components

Prefer shadcn before custom primitives. Upload dropzones are custom (native DnD + file input).

## References

- `Upload Screen - Empty State.svg` / `.png` (+ phone)
- Loading, Question–Answer mapping frames

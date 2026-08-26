"use client"

import { useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { AnswerRegion, AnswerSheetPage } from "@/lib/assessment/types"
import { cn } from "@/lib/utils"

type AnswerSheetPanelProps = {
  pages: AnswerSheetPage[]
  regions: AnswerRegion[]
  label: string
  currentPage: number
  zoom: number
  onPageChange: (page: number) => void
  onZoomChange: (zoom: number) => void
  /** Changes when selection/tab focus should re-scroll the sheet. */
  focusToken?: string
}

export function AnswerSheetPanel({
  pages,
  regions,
  label,
  currentPage,
  zoom,
  onPageChange,
  onZoomChange,
  focusToken,
}: AnswerSheetPanelProps) {
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  useEffect(() => {
    const el = pageRefs.current.get(currentPage)
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [currentPage, label, focusToken])

  const zoomPercent = Math.round(zoom * 100)

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-background shadow-sm ring-1 ring-black/5">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-3 py-2.5 sm:gap-3 sm:px-4">
        <h2 className="mr-auto text-sm font-semibold text-foreground">
          Answer Sheet
        </h2>

        <div className="flex items-center gap-1 rounded-lg bg-muted/80 px-1.5 py-1 text-xs font-medium text-foreground">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Zoom out"
            disabled={zoom <= 0.75}
            onClick={() => onZoomChange(Math.max(0.75, zoom - 0.1))}
          >
            <Minus className="size-3.5" />
          </Button>
          <span className="min-w-10 text-center tabular-nums">{zoomPercent}%</span>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Zoom in"
            disabled={zoom >= 1.5}
            onClick={() => onZoomChange(Math.min(1.5, zoom + 0.1))}
          >
            <Plus className="size-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-muted/80 px-1.5 py-1 text-xs font-medium text-foreground">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Previous page"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <span className="min-w-22 text-center tabular-nums">
            Page {currentPage} of {pages.length}
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Next page"
            disabled={currentPage >= pages.length}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 bg-muted/30">
        <div className="flex flex-col items-center gap-4 p-4">
          {pages.map((page) => {
            const pageRegions = regions.filter((r) => r.page === page.page)
            return (
              <div
                key={page.page}
                ref={(node) => {
                  if (node) pageRefs.current.set(page.page, node)
                  else pageRefs.current.delete(page.page)
                }}
                className="relative w-full overflow-hidden rounded-lg bg-answer-paper shadow-md ring-1 ring-black/10"
                style={{
                  maxWidth: `${658 * zoom}px`,
                  aspectRatio: "658 / 824",
                }}
              >
                <MockLinedPage page={page.page} />
                {pageRegions.map((region, index) => (
                  <HighlightBox
                    key={`${page.page}-${index}`}
                    bbox={region.bbox}
                    label={label}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

function HighlightBox({
  bbox,
  label,
}: {
  bbox: [number, number, number, number]
  label: string
}) {
  const [x1, y1, x2, y2] = bbox
  return (
    <div
      className="pointer-events-none absolute rounded-[15px] border-2 border-bbox bg-bbox-fill/10"
      style={{
        left: `${x1 * 100}%`,
        top: `${y1 * 100}%`,
        width: `${(x2 - x1) * 100}%`,
        height: `${(y2 - y1) * 100}%`,
      }}
    >
      <span className="absolute -top-0.5 left-2 rounded-b-md bg-bbox px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
        {label}
      </span>
    </div>
  )
}

/** Placeholder answer-sheet page until real rasters ship from the pipeline. */
function MockLinedPage({ page }: { page: number }) {
  return (
    <div className="absolute inset-0">
      <div
        className={cn(
          "absolute inset-0 opacity-80",
          "[background-image:repeating-linear-gradient(transparent,transparent_27px,#c5d4e8_28px)]"
        )}
      />
      <div className="absolute top-0 bottom-0 left-[12%] w-px bg-destructive/35" />
      <div className="absolute inset-x-0 top-6 px-[14%] font-serif text-[13px] leading-7 text-[#2a2a2a]/80">
        <p className="font-semibold">Q{page}. Sample handwritten answer page</p>
        <p className="mt-2">
          Photosynthesis equation and notes appear here once the answer sheet is
          rasterized. This is a UI placeholder for region highlighting.
        </p>
        <p className="mt-4">
          6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (light / chlorophyll)
        </p>
      </div>
    </div>
  )
}

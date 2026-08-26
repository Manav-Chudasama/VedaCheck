"use client"

import { StatusBadge } from "@/components/viewer/score-badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { StudentAnswer } from "@/lib/assessment/types"
import { cn } from "@/lib/utils"

type UnmatchedAnswersPanelProps = {
  answers: StudentAnswer[]
  selectedIndex: number | null
  onSelect: (index: number) => void
}

/**
 * Surfaces answer blocks that could not be mapped to any question.
 * Selecting one highlights its regions on the answer sheet.
 */
export function UnmatchedAnswersPanel({
  answers,
  selectedIndex,
  onSelect,
}: UnmatchedAnswersPanelProps) {
  if (answers.length === 0) return null

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl bg-background/50 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground sm:text-[15px]">
          Unmatched answers{" "}
          <span className="font-normal text-muted-foreground">
            ({answers.length})
          </span>
        </h2>
        <StatusBadge status="unmatched" />
      </div>

      <ScrollArea className="min-h-0 max-h-48 flex-1 px-3 pb-3 sm:max-h-56">
        <ul className="flex flex-col gap-2 pr-2">
          {answers.map((answer, index) => {
            const isSelected = selectedIndex === index
            const preview =
              answer.transcription.trim() ||
              "(No transcription — region only)"
            const pageHint =
              answer.regions.length > 0
                ? `Page ${answer.regions.map((r) => r.page).join(", ")}`
                : "No region"

            return (
              <li key={`unmatched-${index}`}>
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  className={cn(
                    "w-full rounded-xl border px-3 py-2.5 text-left transition-colors",
                    isSelected
                      ? "border-brand/40 bg-highlight/10 ring-1 ring-brand/20"
                      : "border-border/60 bg-background hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground">
                      Unmatched #{index + 1}
                    </p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {pageHint}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {preview}
                  </p>
                </button>
              </li>
            )
          })}
        </ul>
      </ScrollArea>
    </div>
  )
}

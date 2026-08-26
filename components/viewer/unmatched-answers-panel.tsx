"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

import { StatusBadge } from "@/components/viewer/score-badge"
import type { StudentAnswer } from "@/lib/assessment/types"
import { cn } from "@/lib/utils"

type UnmatchedAnswersPanelProps = {
  answers: StudentAnswer[]
  selectedIndex: number | null
  onSelect: (index: number) => void
}

/**
 * Surfaces answer blocks that could not be mapped to any question.
 * Collapsed by default to keep the question list readable.
 */
export function UnmatchedAnswersPanel({
  answers,
  selectedIndex,
  onSelect,
}: UnmatchedAnswersPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (answers.length === 0) return null

  return (
    <div className="shrink-0 overflow-hidden rounded-2xl bg-background/50 shadow-sm ring-1 ring-black/5">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left sm:px-4"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        <h2 className="text-sm font-semibold text-foreground">
          Unmatched{" "}
          <span className="font-normal text-muted-foreground">
            ({answers.length})
          </span>
        </h2>
        <div className="flex items-center gap-1.5">
          <StatusBadge status="unmatched" />
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
            aria-hidden
          />
        </div>
      </button>

      {isOpen ? (
        <ul className="flex max-h-36 flex-col gap-1.5 overflow-y-auto px-2.5 pb-2.5 sm:px-3">
          {answers.map((answer, index) => {
            const isSelected = selectedIndex === index
            const preview =
              answer.transcription.trim() ||
              "(No transcription — region only)"
            const pageHint =
              answer.regions.length > 0
                ? `p.${answer.regions.map((r) => r.page).join(",")}`
                : ""

            return (
              <li key={`unmatched-${index}`}>
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  className={cn(
                    "w-full rounded-lg border px-2.5 py-2 text-left transition-colors",
                    isSelected
                      ? "border-brand/40 bg-highlight/10 ring-1 ring-brand/20"
                      : "border-border/60 bg-background hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground">
                      #{index + 1}
                      {pageHint ? (
                        <span className="ml-1.5 font-normal text-muted-foreground">
                          {pageHint}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-muted-foreground">
                    {preview}
                  </p>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

"use client"

import { ChevronDown } from "lucide-react"

import { ScoreBadge, StatusBadge } from "@/components/viewer/score-badge"
import type { AssessmentItem } from "@/lib/assessment/types"
import { cn } from "@/lib/utils"

type QuestionCardProps = {
  item: AssessmentItem
  isSelected: boolean
  isExpanded: boolean
  onSelect: () => void
  onToggleExpand: () => void
}

export function QuestionCard({
  item,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
}: QuestionCardProps) {
  const { question, answer, status } = item
  const maxScore = answer?.maxScore ?? question.maxScore
  const score = answer?.score
  const feedback = answer?.feedback
  const { main, part } = splitQuestionNumber(question.number)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        "w-full rounded-2xl border bg-background px-3.5 py-3 text-left shadow-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
        isSelected
          ? "border-question-active ring-1 ring-question-active/40"
          : "border-border/80 hover:border-border"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 items-center gap-1 pt-0.5">
          <div className="flex size-7 items-center justify-center rounded-full bg-cta text-[11px] font-semibold text-white">
            {main}
          </div>
          {part ? (
            <span className="text-xs font-semibold text-foreground">{part}.</span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 text-sm leading-snug font-medium text-foreground">
              {question.text}
            </p>

            <div className="flex shrink-0 items-center gap-1.5">
              {status === "answered" &&
              typeof score === "number" &&
              typeof maxScore === "number" ? (
                <ScoreBadge score={score} maxScore={maxScore} />
              ) : null}
              {status === "answered" &&
              question.countedTowardTotal === false &&
              typeof score === "number" ? (
                <span className="inline-flex h-6 shrink-0 items-center rounded-md bg-muted px-2 text-[10px] font-medium text-muted-foreground">
                  Not counted
                </span>
              ) : null}
              {status === "unanswered" || status === "unmatched" ? (
                <StatusBadge status={status} />
              ) : null}
              <button
                type="button"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={isExpanded ? "Collapse" : "Expand"}
                onClick={(event) => {
                  event.stopPropagation()
                  onToggleExpand()
                }}
              >
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>
            </div>
          </div>

          {isExpanded && feedback ? (
            <div className="mt-3 rounded-2xl bg-file-chip px-3.5 py-3">
              <p className="text-sm font-semibold text-foreground">AI Feedback</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {feedback}
              </p>
            </div>
          ) : null}

          {isExpanded && status === "unanswered" ? (
            <div className="mt-3 rounded-2xl bg-file-chip px-3.5 py-3">
              <p className="text-sm text-muted-foreground">
                No answer was found for this question on the sheet.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function splitQuestionNumber(number: string): { main: string; part?: string } {
  const match = number.match(/^(\d+)\s*\(?([a-zA-Z])\)?$/)
  if (!match) return { main: number }
  return { main: match[1], part: match[2].toLowerCase() }
}

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
        "w-full rounded-xl border bg-background px-2.5 py-2 text-left shadow-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
        isSelected
          ? "border-question-active ring-1 ring-question-active/40"
          : "border-border/80 hover:border-border"
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex shrink-0 items-center gap-0.5 pt-0.5">
          <div className="flex size-6 items-center justify-center rounded-full bg-cta text-[10px] font-semibold text-white">
            {main}
          </div>
          {part ? (
            <span className="text-[11px] font-semibold text-foreground">
              {part}.
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1.5">
            <p
              className={cn(
                "min-w-0 flex-1 text-xs leading-snug font-medium text-foreground sm:text-sm",
                !isExpanded && "line-clamp-2"
              )}
            >
              {question.text}
            </p>

            <div className="flex shrink-0 items-center gap-1">
              {status === "answered" &&
              typeof score === "number" &&
              typeof maxScore === "number" ? (
                <ScoreBadge score={score} maxScore={maxScore} />
              ) : null}
              {status === "answered" &&
              question.countedTowardTotal === false &&
              typeof score === "number" ? (
                <span className="inline-flex h-5 shrink-0 items-center rounded-md bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                  Not counted
                </span>
              ) : null}
              {status === "unanswered" || status === "unmatched" ? (
                <StatusBadge status={status} />
              ) : null}
              <button
                type="button"
                className="rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={isExpanded ? "Collapse" : "Expand"}
                onClick={(event) => {
                  event.stopPropagation()
                  onToggleExpand()
                }}
              >
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>
            </div>
          </div>

          {isExpanded && feedback ? (
            <div className="mt-2 rounded-xl bg-file-chip px-2.5 py-2">
              <p className="text-xs font-semibold text-foreground">AI Feedback</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {feedback}
              </p>
            </div>
          ) : null}

          {isExpanded && status === "unanswered" ? (
            <div className="mt-2 rounded-xl bg-file-chip px-2.5 py-2">
              <p className="text-xs text-muted-foreground">
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
  return { main: match[1]!, part: match[2]!.toLowerCase() }
}

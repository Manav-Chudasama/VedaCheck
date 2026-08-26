import { cn } from "@/lib/utils"

type ScoreBadgeProps = {
  score: number
  maxScore: number
  className?: string
}

export function ScoreBadge({ score, maxScore, className }: ScoreBadgeProps) {
  const ratio = maxScore <= 0 ? 0 : score / maxScore
  const tone =
    score <= 0 ? "zero" : ratio >= 0.85 ? "full" : ratio >= 0.4 ? "partial" : "zero"

  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-md px-2 text-xs font-semibold tabular-nums",
        tone === "full" && "bg-score-full text-score-full-fg",
        tone === "partial" && "bg-score-partial text-score-partial-fg",
        tone === "zero" && "bg-score-zero text-score-zero-fg",
        className
      )}
    >
      {score}/{maxScore}
    </span>
  )
}

export function StatusBadge({
  status,
  className,
}: {
  status: "unanswered" | "unmatched"
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-md bg-muted px-2 text-xs font-medium text-muted-foreground",
        className
      )}
    >
      {status === "unanswered" ? "Unanswered" : "Unmatched"}
    </span>
  )
}

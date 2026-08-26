"use client"

import { QuestionCard } from "@/components/viewer/question-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import type {
  AssessmentItem,
  AssessmentSummary,
  QuestionGroup,
} from "@/lib/assessment/types"

type QuestionPanelProps = {
  items: AssessmentItem[]
  groups: QuestionGroup[]
  summary?: AssessmentSummary
  selectedId: string | null
  expandedIds: Set<string>
  onSelect: (id: string) => void
  onToggleExpand: (id: string) => void
  onExpandAll: () => void
  allExpanded: boolean
}

export function QuestionPanel({
  items,
  groups,
  summary,
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onExpandAll,
  allExpanded,
}: QuestionPanelProps) {
  const itemById = new Map(items.map((i) => [i.question.id, i]))
  const groupedIds = new Set(groups.flatMap((g) => g.questionIds))
  const ungrouped = items.filter((i) => !groupedIds.has(i.question.id))

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-background/50 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-col gap-2 border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground sm:text-[15px]">
            Extracted Questions{" "}
            <span className="font-normal text-muted-foreground">
              (from question paper)
            </span>
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs font-medium text-muted-foreground"
            onClick={onExpandAll}
          >
            {allExpanded ? "Collapse All" : "Expand All"}
          </Button>
        </div>
        {summary && summary.paperMaxScore > 0 ? (
          <p className="text-sm font-semibold tabular-nums text-foreground">
            Obtained{" "}
            <span className="text-cta">
              {formatScore(summary.obtainedScore)}
            </span>
            <span className="font-normal text-muted-foreground">
              {" "}
              / {formatScore(summary.paperMaxScore)}
            </span>
          </p>
        ) : null}
      </div>

      <ScrollArea className="min-h-0 flex-1 px-3 pb-3">
        <div className="flex flex-col gap-4 pr-2 pt-3">
          {groups.map((group) => {
            const groupScore = summary?.groupScores.find(
              (g) => g.groupId === group.id
            )
            return (
              <section key={group.id} className="flex flex-col gap-2">
                <header className="px-1">
                  <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
                    Q{group.number}
                    <span className="ml-1.5 font-medium normal-case text-muted-foreground">
                      · {group.title}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Attempt any {group.attemptCount} of {group.optionCount}
                    {group.maxScore > 0
                      ? ` · ${formatScore(group.maxScore)} marks`
                      : ""}
                    {groupScore
                      ? ` · scored ${formatScore(groupScore.obtained)}/${formatScore(groupScore.maxScore)}`
                      : ""}
                  </p>
                </header>
                <div className="flex flex-col gap-2.5">
                  {group.questionIds.map((id) => {
                    const item = itemById.get(id)
                    if (!item) return null
                    return (
                      <QuestionCard
                        key={item.question.id}
                        item={item}
                        isSelected={selectedId === item.question.id}
                        isExpanded={expandedIds.has(item.question.id)}
                        onSelect={() => onSelect(item.question.id)}
                        onToggleExpand={() => onToggleExpand(item.question.id)}
                      />
                    )
                  })}
                </div>
              </section>
            )
          })}

          {ungrouped.length > 0 ? (
            <section className="flex flex-col gap-2.5">
              {groups.length > 0 ? (
                <header className="px-1">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Other questions
                  </p>
                </header>
              ) : null}
              {ungrouped.map((item) => (
                <QuestionCard
                  key={item.question.id}
                  item={item}
                  isSelected={selectedId === item.question.id}
                  isExpanded={expandedIds.has(item.question.id)}
                  onSelect={() => onSelect(item.question.id)}
                  onToggleExpand={() => onToggleExpand(item.question.id)}
                />
              ))}
            </section>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  )
}

function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

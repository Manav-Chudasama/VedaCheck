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
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-3 py-2.5 sm:px-4">
        <h2 className="text-sm font-semibold text-foreground">
          Questions
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs font-medium text-muted-foreground"
          onClick={onExpandAll}
        >
          {allExpanded ? "Collapse All" : "Expand All"}
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-2.5 pb-2.5 sm:px-3">
        <div className="flex flex-col gap-3 pr-1.5 pt-2.5">
          {groups.map((group) => {
            const groupScore = summary?.groupScores.find(
              (g) => g.groupId === group.id
            )
            const scored =
              groupScore != null
                ? `${formatScore(groupScore.obtained)}/${formatScore(groupScore.maxScore)}`
                : group.maxScore > 0
                  ? `${formatScore(group.maxScore)} marks`
                  : null

            return (
              <section key={group.id} className="flex flex-col gap-1.5">
                <header className="px-1">
                  <p className="truncate text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Q{group.number}
                    </span>
                    <span>
                      {" "}
                      · Attempt any {group.attemptCount} of {group.optionCount}
                    </span>
                    {scored ? <span> · {scored}</span> : null}
                  </p>
                </header>
                <div className="flex flex-col gap-1.5">
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
            <section className="flex flex-col gap-1.5">
              {groups.length > 0 ? (
                <header className="px-1">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Other
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

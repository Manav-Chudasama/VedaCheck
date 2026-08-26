"use client"

import { QuestionCard } from "@/components/viewer/question-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import type { AssessmentItem } from "@/lib/assessment/types"

type QuestionPanelProps = {
  items: AssessmentItem[]
  selectedId: string | null
  expandedIds: Set<string>
  onSelect: (id: string) => void
  onToggleExpand: (id: string) => void
  onExpandAll: () => void
  allExpanded: boolean
}

export function QuestionPanel({
  items,
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onExpandAll,
  allExpanded,
}: QuestionPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-background/50 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
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

      <ScrollArea className="min-h-0 flex-1 px-3 pb-3">
        <div className="flex flex-col gap-2.5 pr-2">
          {items.map((item) => (
            <QuestionCard
              key={item.question.id}
              item={item}
              isSelected={selectedId === item.question.id}
              isExpanded={expandedIds.has(item.question.id)}
              onSelect={() => onSelect(item.question.id)}
              onToggleExpand={() => onToggleExpand(item.question.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

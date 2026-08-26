"use client"

import { useMemo, useState } from "react"

import { AnswerSheetPanel } from "@/components/viewer/answer-sheet-panel"
import { QuestionPanel } from "@/components/viewer/question-panel"
import { UnmatchedAnswersPanel } from "@/components/viewer/unmatched-answers-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AssessmentViewModel } from "@/lib/assessment/types"

type MappingScreenProps = {
  assessment: AssessmentViewModel
}

type Selection =
  | { type: "question"; id: string }
  | { type: "unmatched"; index: number }

/**
 * Question ↔ answer mapping viewer.
 * Desktop: side-by-side (sheet wider). Mobile: Questions / Answer Sheet tabs.
 */
export function MappingScreen({ assessment }: MappingScreenProps) {
  const defaultQuestionId =
    assessment.items.find((i) => i.status === "answered")?.question.id ??
    assessment.items[0]?.question.id ??
    null

  const [selection, setSelection] = useState<Selection | null>(
    defaultQuestionId
      ? { type: "question", id: defaultQuestionId }
      : assessment.unmatchedAnswers.length > 0
        ? { type: "unmatched", index: 0 }
        : null
  )
  // Start collapsed — feedback opens only when the user expands.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  const [zoom, setZoom] = useState(1)
  const [mobileTab, setMobileTab] = useState("questions")

  const selectedQuestionId =
    selection?.type === "question" ? selection.id : null
  const selectedUnmatchedIndex =
    selection?.type === "unmatched" ? selection.index : null

  const selectedItem = useMemo(
    () =>
      selectedQuestionId
        ? (assessment.items.find((i) => i.question.id === selectedQuestionId) ??
          null)
        : null,
    [assessment.items, selectedQuestionId]
  )

  const selectedUnmatched =
    selectedUnmatchedIndex !== null
      ? (assessment.unmatchedAnswers[selectedUnmatchedIndex] ?? null)
      : null

  const regions =
    selectedItem?.answer?.regions ?? selectedUnmatched?.regions ?? []

  const highlightLabel = selectedItem
    ? `Q${selectedItem.question.number.replace(/[()]/g, "")}`
    : selectedUnmatched
      ? `U${(selectedUnmatchedIndex ?? 0) + 1}`
      : "Q"

  const currentPage = regions[0]?.page ?? 1
  const [page, setPage] = useState(currentPage)

  const allExpanded =
    assessment.items.length > 0 &&
    assessment.items.every((i) => expandedIds.has(i.question.id))

  const selectQuestion = (id: string) => {
    setSelection({ type: "question", id })
    const item = assessment.items.find((i) => i.question.id === id)
    const firstPage = item?.answer?.regions[0]?.page
    if (firstPage) setPage(firstPage)
  }

  const selectUnmatched = (index: number) => {
    setSelection({ type: "unmatched", index })
    const answer = assessment.unmatchedAnswers[index]
    const firstPage = answer?.regions[0]?.page
    if (firstPage) setPage(firstPage)
  }

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => {
    if (allExpanded) {
      setExpandedIds(new Set())
      return
    }
    setExpandedIds(new Set(assessment.items.map((i) => i.question.id)))
  }

  const questionsColumn = (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="min-h-0 flex-1">
        <QuestionPanel
          items={assessment.items}
          groups={assessment.groups}
          summary={assessment.summary}
          selectedId={selectedQuestionId}
          expandedIds={expandedIds}
          onSelect={selectQuestion}
          onToggleExpand={toggleExpand}
          onExpandAll={expandAll}
          allExpanded={allExpanded}
        />
      </div>
      <UnmatchedAnswersPanel
        answers={assessment.unmatchedAnswers}
        selectedIndex={selectedUnmatchedIndex}
        onSelect={selectUnmatched}
      />
    </div>
  )

  const answerPanel = (
    <AnswerSheetPanel
      pages={assessment.pages}
      regions={regions}
      label={highlightLabel}
      currentPage={page}
      zoom={zoom}
      onPageChange={setPage}
      onZoomChange={setZoom}
      focusToken={`${mobileTab}:${selection?.type ?? "none"}:${selectedQuestionId}:${selectedUnmatchedIndex}:${page}`}
    />
  )

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {assessment.summary.paperMaxScore > 0 ? (
        <div className="mb-2 flex shrink-0 flex-wrap items-baseline gap-x-3 gap-y-0.5 rounded-xl bg-background/70 px-3 py-2 shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-semibold tabular-nums text-foreground">
            Obtained{" "}
            <span className="text-cta">
              {formatObtained(assessment.summary.obtainedScore)}
            </span>
            <span className="font-normal text-muted-foreground">
              {" "}
              / {formatObtained(assessment.summary.paperMaxScore)}
            </span>
          </p>
          {assessment.summary.groupScores.length > 0 ? (
            <p className="min-w-0 truncate text-xs text-muted-foreground">
              {assessment.summary.groupScores
                .map((g) => {
                  const group = assessment.groups.find(
                    (gr) => gr.id === g.groupId
                  )
                  const label = group ? `Q${group.number}` : g.groupId
                  return `${label} ${formatObtained(g.obtained)}/${formatObtained(g.maxScore)}`
                })
                .join(" · ")}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="hidden min-h-0 flex-1 gap-3 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {questionsColumn}
        {answerPanel}
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:hidden">
        <Tabs
          value={mobileTab}
          onValueChange={setMobileTab}
          className="flex h-full min-h-0 flex-col gap-3"
        >
          <TabsList className="mx-0 grid h-14! w-full grid-cols-2 rounded-full bg-file-chip p-1.5 text-foreground shadow-none">
            <TabsTrigger
              value="questions"
              className="h-full! w-full min-w-0 flex-none rounded-full px-3 py-0 text-[15px] leading-none font-medium text-muted-foreground shadow-none data-active:bg-cta data-active:text-white data-active:shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
            >
              Questions
            </TabsTrigger>
            <TabsTrigger
              value="answers"
              className="h-full! w-full min-w-0 flex-none rounded-full px-3 py-0 text-[15px] leading-none font-medium text-muted-foreground shadow-none data-active:bg-cta data-active:text-white data-active:shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
            >
              Answer Sheet
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="questions"
            className="mt-0 min-h-0 flex-1 overflow-hidden"
          >
            {questionsColumn}
          </TabsContent>
          <TabsContent
            value="answers"
            className="mt-0 min-h-0 flex-1 overflow-hidden"
          >
            {answerPanel}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function formatObtained(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

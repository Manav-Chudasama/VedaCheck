"use client"

import { useMemo, useState } from "react"

import { AnswerSheetPanel } from "@/components/viewer/answer-sheet-panel"
import { QuestionPanel } from "@/components/viewer/question-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AssessmentViewModel } from "@/lib/assessment/types"

type MappingScreenProps = {
  assessment: AssessmentViewModel
}

/**
 * Question ↔ answer mapping viewer (UI shell).
 * Desktop: side-by-side. Mobile: Questions / Answer Sheet tabs.
 */
export function MappingScreen({ assessment }: MappingScreenProps) {
  const defaultSelected =
    assessment.items.find((i) => i.question.number === "2")?.question.id ??
    assessment.items[0]?.question.id ??
    null

  const [selectedId, setSelectedId] = useState<string | null>(defaultSelected)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(defaultSelected ? [defaultSelected] : [])
  )
  const [zoom, setZoom] = useState(1)
  const [mobileTab, setMobileTab] = useState("questions")

  const selectedItem = useMemo(
    () => assessment.items.find((i) => i.question.id === selectedId) ?? null,
    [assessment.items, selectedId]
  )

  const regions = selectedItem?.answer?.regions ?? []
  const highlightLabel = selectedItem
    ? `Q${selectedItem.question.number.replace(/[()]/g, "")}`
    : ""

  const currentPage = regions[0]?.page ?? 1

  const [page, setPage] = useState(currentPage)

  const allExpanded =
    assessment.items.length > 0 &&
    assessment.items.every((i) => expandedIds.has(i.question.id))

  const selectQuestion = (id: string) => {
    setSelectedId(id)
    setExpandedIds((prev) => new Set(prev).add(id))
    const item = assessment.items.find((i) => i.question.id === id)
    const firstPage = item?.answer?.regions[0]?.page
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

  const questionPanel = (
    <QuestionPanel
      items={assessment.items}
      selectedId={selectedId}
      expandedIds={expandedIds}
      onSelect={selectQuestion}
      onToggleExpand={toggleExpand}
      onExpandAll={expandAll}
      allExpanded={allExpanded}
    />
  )

  const answerPanel = (
    <AnswerSheetPanel
      pages={assessment.pages}
      regions={regions}
      label={highlightLabel || "Q"}
      currentPage={page}
      zoom={zoom}
      onPageChange={setPage}
      onZoomChange={setZoom}
      /** Re-scroll when opening the Answer Sheet tab with the last selection. */
      focusToken={`${mobileTab}:${selectedId}:${page}`}
    />
  )

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {/* Desktop split */}
      <div className="hidden h-full min-h-0 gap-3 lg:grid lg:grid-cols-2">
        {questionPanel}
        {answerPanel}
      </div>

      {/* Mobile tabs — sized from Question toggle (phone).svg: 369×54, rx=27, 4px inset */}
      <div className="flex h-full min-h-0 flex-col lg:hidden">
        <Tabs
          value={mobileTab}
          onValueChange={setMobileTab}
          className="flex h-full min-h-0 flex-col gap-3"
        >
          <TabsList className="mx-0 h-14! w-full grid grid-cols-2 rounded-full bg-file-chip p-1.5 text-foreground shadow-none">
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
            {questionPanel}
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

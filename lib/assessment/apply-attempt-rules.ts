import type {
  AssessmentItem,
  AssessmentSummary,
  AssessmentViewModel,
  GroupScoreSummary,
  QuestionGroup,
} from "@/lib/assessment/types"

export type ApplyAttemptRulesResult = {
  items: AssessmentItem[]
  summary: AssessmentSummary
}

/**
 * After grading: for each group, count only the top `attemptCount` scores
 * toward group/paper totals. Extra attempts remain visible but excluded.
 */
export function applyAttemptRules(input: {
  items: AssessmentItem[]
  groups: QuestionGroup[]
  /** Header total from the paper when known */
  paperMaxScore?: number | null
}): ApplyAttemptRulesResult {
  const items = input.items.map((item) => ({
    ...item,
    question: { ...item.question },
    answer: item.answer ? { ...item.answer } : null,
  }))

  const itemByQuestionId = new Map(items.map((i) => [i.question.id, i]))
  const groupScores: GroupScoreSummary[] = []
  let obtainedScore = 0

  for (const group of input.groups) {
    const groupItems = group.questionIds
      .map((id) => itemByQuestionId.get(id))
      .filter((i): i is AssessmentItem => Boolean(i))

    const attempted = groupItems.filter(
      (i) =>
        i.status === "answered" &&
        i.answer != null &&
        typeof i.answer.score === "number"
    )

    const ranked = [...attempted].sort((a, b) => {
      const scoreDiff = (b.answer?.score ?? 0) - (a.answer?.score ?? 0)
      if (scoreDiff !== 0) return scoreDiff
      return a.question.order - b.question.order
    })

    const counted = ranked.slice(0, group.attemptCount)
    const excluded = ranked.slice(group.attemptCount)
    const countedIds = new Set(counted.map((i) => i.question.id))
    const excludedIds = new Set(excluded.map((i) => i.question.id))

    for (const item of groupItems) {
      if (item.status !== "answered" || item.answer == null) {
        item.question.countedTowardTotal = false
        continue
      }
      if (typeof item.answer.score !== "number") {
        item.question.countedTowardTotal = false
        continue
      }
      item.question.countedTowardTotal = countedIds.has(item.question.id)
    }

    let groupObtained = counted.reduce(
      (sum, i) => sum + (i.answer?.score ?? 0),
      0
    )
    if (group.maxScore > 0) {
      groupObtained = Math.min(groupObtained, group.maxScore)
    }

    obtainedScore += groupObtained
    groupScores.push({
      groupId: group.id,
      obtained: groupObtained,
      maxScore: group.maxScore,
      countedQuestionIds: [...countedIds],
      excludedQuestionIds: [...excludedIds],
    })
  }

  // Ungrouped answered items still count toward the paper total.
  for (const item of items) {
    if (item.question.groupId) continue
    if (item.status !== "answered" || item.answer == null) {
      item.question.countedTowardTotal = false
      continue
    }
    if (typeof item.answer.score !== "number") {
      item.question.countedTowardTotal = false
      continue
    }
    item.question.countedTowardTotal = true
    obtainedScore += item.answer.score
  }

  const sumGroupMax = input.groups.reduce((s, g) => s + g.maxScore, 0)
  const ungroupedMax = items
    .filter((i) => !i.question.groupId)
    .reduce((s, i) => s + (i.question.maxScore ?? i.answer?.maxScore ?? 0), 0)

  const paperMaxScore =
    input.paperMaxScore != null && input.paperMaxScore > 0
      ? input.paperMaxScore
      : sumGroupMax + ungroupedMax

  const summary: AssessmentSummary = {
    paperMaxScore,
    obtainedScore,
    groupScores,
  }

  return { items, summary }
}

/**
 * Convenience: apply attempt rules onto a partial view model.
 */
export function withAttemptRules(
  view: Omit<AssessmentViewModel, "summary"> & {
    summary?: AssessmentSummary
  },
  paperMaxScore?: number | null
): AssessmentViewModel {
  const { items, summary } = applyAttemptRules({
    items: view.items,
    groups: view.groups,
    paperMaxScore,
  })
  return {
    ...view,
    items,
    summary,
  }
}

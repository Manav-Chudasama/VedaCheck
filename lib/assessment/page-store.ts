import type { PageRaster } from "@/lib/documents/types"

/**
 * Minimal in-memory assessment store for page rasters (Phase 2).
 * Phase 3 will extend this with pipeline stage / result fields.
 *
 * Note: not durable across serverless cold starts or multiple instances.
 */

export type AssessmentPageStore = {
  id: string
  createdAt: number
  questionPaperPages: PageRaster[]
  answerSheetPages: PageRaster[]
}

const assessments = new Map<string, AssessmentPageStore>()

const TTL_MS = 60 * 60 * 1000 // 1 hour

function purgeExpired(now = Date.now()): void {
  for (const [id, record] of assessments) {
    if (now - record.createdAt > TTL_MS) {
      assessments.delete(id)
    }
  }
}

export function createAssessmentId(): string {
  return crypto.randomUUID()
}

export function createAssessmentStore(
  id: string = createAssessmentId()
): AssessmentPageStore {
  purgeExpired()
  const record: AssessmentPageStore = {
    id,
    createdAt: Date.now(),
    questionPaperPages: [],
    answerSheetPages: [],
  }
  assessments.set(id, record)
  return record
}

export function getAssessmentStore(
  id: string
): AssessmentPageStore | undefined {
  purgeExpired()
  return assessments.get(id)
}

export function setAssessmentPages(
  id: string,
  pages: {
    questionPaperPages?: PageRaster[]
    answerSheetPages?: PageRaster[]
  }
): AssessmentPageStore | undefined {
  const record = getAssessmentStore(id)
  if (!record) return undefined

  if (pages.questionPaperPages) {
    record.questionPaperPages = pages.questionPaperPages
  }
  if (pages.answerSheetPages) {
    record.answerSheetPages = pages.answerSheetPages
  }
  return record
}

export function getAnswerSheetPageRaster(
  assessmentId: string,
  page: number
): PageRaster | undefined {
  const record = getAssessmentStore(assessmentId)
  return record?.answerSheetPages.find((p) => p.page === page)
}

export function deleteAssessmentStore(id: string): boolean {
  return assessments.delete(id)
}

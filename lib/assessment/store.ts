import type { PageRaster } from "@/lib/documents/types"
import type { AssessmentViewModel } from "@/lib/assessment/types"
import type { ProcessingStage } from "@/lib/assessment/stages"
import { STAGE_PROGRESS } from "@/lib/assessment/stages"

/**
 * Full in-memory assessment job.
 * Not durable across serverless cold starts or multiple instances.
 */
export type AssessmentJob = {
  id: string
  stage: ProcessingStage
  /** 0–100 */
  progress: number
  error?: string
  createdAt: number
  updatedAt: number
  questionPaperPages: PageRaster[]
  answerSheetPages: PageRaster[]
  result?: AssessmentViewModel
  /** Optional overall AI summary from grading */
  overallFeedback?: string
}

export type AssessmentStatusDto = {
  id: string
  stage: ProcessingStage
  progress: number
  error?: string
  label: string
}

const jobs = new Map<string, AssessmentJob>()

const TTL_MS = 60 * 60 * 1000 // 1 hour

function purgeExpired(now = Date.now()): void {
  for (const [id, job] of jobs) {
    if (now - job.createdAt > TTL_MS) {
      jobs.delete(id)
    }
  }
}

export function createAssessmentId(): string {
  return crypto.randomUUID()
}

export function createAssessmentJob(
  id: string = createAssessmentId()
): AssessmentJob {
  purgeExpired()
  const now = Date.now()
  const job: AssessmentJob = {
    id,
    stage: "uploading",
    progress: STAGE_PROGRESS.uploading,
    createdAt: now,
    updatedAt: now,
    questionPaperPages: [],
    answerSheetPages: [],
  }
  jobs.set(id, job)
  return job
}

export function getAssessmentJob(id: string): AssessmentJob | undefined {
  purgeExpired()
  return jobs.get(id)
}

export function updateAssessmentJob(
  id: string,
  patch: Partial<
    Omit<AssessmentJob, "id" | "createdAt"> & {
      stage?: ProcessingStage
    }
  >
): AssessmentJob | undefined {
  const job = getAssessmentJob(id)
  if (!job) return undefined

  if (patch.stage !== undefined) {
    job.stage = patch.stage
    if (patch.progress === undefined) {
      job.progress = STAGE_PROGRESS[patch.stage]
    }
  }
  if (patch.progress !== undefined) job.progress = patch.progress
  if ("error" in patch) job.error = patch.error
  if (patch.questionPaperPages !== undefined) {
    job.questionPaperPages = patch.questionPaperPages
  }
  if (patch.answerSheetPages !== undefined) {
    job.answerSheetPages = patch.answerSheetPages
  }
  if (patch.result !== undefined) job.result = patch.result
  if (patch.overallFeedback !== undefined) {
    job.overallFeedback = patch.overallFeedback
  }

  job.updatedAt = Date.now()
  return job
}

export function setJobStage(
  id: string,
  stage: ProcessingStage,
  error?: string
): AssessmentJob | undefined {
  return updateAssessmentJob(id, {
    stage,
    progress: STAGE_PROGRESS[stage],
    error: stage === "failed" ? (error ?? "Processing failed") : error,
  })
}

export function setAssessmentPages(
  id: string,
  pages: {
    questionPaperPages?: PageRaster[]
    answerSheetPages?: PageRaster[]
  }
): AssessmentJob | undefined {
  return updateAssessmentJob(id, {
    questionPaperPages: pages.questionPaperPages,
    answerSheetPages: pages.answerSheetPages,
  })
}

export function getAnswerSheetPageRaster(
  assessmentId: string,
  page: number
): PageRaster | undefined {
  const job = getAssessmentJob(assessmentId)
  return job?.answerSheetPages.find((p) => p.page === page)
}

export function deleteAssessmentJob(id: string): boolean {
  return jobs.delete(id)
}

/** @deprecated Use createAssessmentJob — kept for Phase 2 call sites. */
export const createAssessmentStore = createAssessmentJob
/** @deprecated Use getAssessmentJob */
export const getAssessmentStore = getAssessmentJob
/** @deprecated Use deleteAssessmentJob */
export const deleteAssessmentStore = deleteAssessmentJob

/**
 * @deprecated Import from `@/lib/assessment/store` instead.
 * Re-exports kept so Phase 2 page route keeps working.
 */
export {
  createAssessmentId,
  createAssessmentJob as createAssessmentStore,
  deleteAssessmentJob as deleteAssessmentStore,
  getAnswerSheetPageRaster,
  getAssessmentJob as getAssessmentStore,
  setAssessmentPages,
} from "@/lib/assessment/store"

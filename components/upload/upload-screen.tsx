"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"

import { FileDropzone } from "@/components/upload/file-dropzone"
import { UploadIllustration } from "@/components/upload/upload-illustration"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type UploadScreenProps = {
  onStartMapping?: (files: {
    questionPaper: File
    answerSheet: File
  }) => void
}

/**
 * Upload layout measured from `public/screens/Upload Screen - Empty State.svg`
 * (1440×787 artboard): soft title highlight, avatar, frosted dropzone tray,
 * dashed cards, pill CTA — all centered on the canvas (no large content card).
 */
export function UploadScreen({ onStartMapping }: UploadScreenProps) {
  const [questionPaper, setQuestionPaper] = useState<File | null>(null)
  const [answerSheet, setAnswerSheet] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canStartMapping = Boolean(questionPaper && answerSheet)

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-2 sm:px-6">
        <div className="flex w-full max-w-[789px] flex-col items-center gap-4 sm:gap-5">
          <div className="shrink-0 space-y-2 text-center">
            <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-[32px] sm:leading-10">
              Upload{" "}
              <span className="rounded-lg bg-highlight/15 px-2 py-0.5 text-brand">
                Question Paper &amp; Answer Sheets
              </span>
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Upload both files to get started
            </p>
          </div>

          <UploadIllustration />

          <div className="grid w-full gap-3 rounded-3xl bg-background/50 p-3 shadow-[0_16px_48px_rgba(0,0,0,0.06)] sm:grid-cols-2 sm:gap-[17px] sm:p-3">
            <FileDropzone
              label="Upload"
              labelAccent="Question Paper"
              file={questionPaper}
              onFileChange={(file) => {
                setError(null)
                setQuestionPaper(file)
              }}
              onError={setError}
            />
            <FileDropzone
              label="Upload"
              labelAccent="Answer Sheet"
              file={answerSheet}
              onFileChange={(file) => {
                setError(null)
                setAnswerSheet(file)
              }}
              onError={setError}
            />
          </div>

          {error ? (
            <p className="shrink-0 text-center text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex shrink-0 flex-col items-center gap-2 pt-1">
            <Button
              size="lg"
              disabled={!canStartMapping}
              className={cn(
                "h-11 min-w-[161px] rounded-full bg-cta px-6 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-cta/90",
                !canStartMapping && "opacity-45 hover:bg-cta"
              )}
              onClick={() => {
                if (!questionPaper || !answerSheet) return
                onStartMapping?.({ questionPaper, answerSheet })
              }}
            >
              Start Mapping
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Button>
            <p className="max-w-sm text-center text-xs text-muted-foreground">
              Once both files are uploaded, you&apos;ll be able to map answers
              with questions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { FileText, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  ACCEPT_ATTR,
  fileTypeLabel,
  formatCompactFileSize,
  getDocumentPageCount,
  getUploadRejectionReason,
} from "@/lib/upload/file-constraints"
import { cn } from "@/lib/utils"

type FileDropzoneProps = {
  label: string
  labelAccent: string
  file: File | null
  onFileChange: (file: File | null) => void
  onError?: (message: string) => void
  className?: string
}

/** Drop card: 373×179.5, rx≈19, dashed #CECECE — from upload SVGs. */
export function FileDropzone({
  label,
  labelAccent,
  file,
  onFileChange,
  onError,
  className,
}: FileDropzoneProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const applyFile = useCallback(
    (next: File | undefined) => {
      if (!next) return
      const reason = getUploadRejectionReason(next)
      if (reason) {
        onError?.(reason)
        return
      }
      onFileChange(next)
    },
    [onError, onFileChange]
  )

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
  }

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.currentTarget.contains(event.relatedTarget as Node)) return
    setIsDragging(false)
  }

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
    applyFile(event.dataTransfer.files?.[0])
  }

  return (
    <div
      role={file ? undefined : "button"}
      tabIndex={file ? undefined : 0}
      aria-label={file ? undefined : `${label} ${labelAccent}`}
      onKeyDown={
        file
          ? undefined
          : (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                inputRef.current?.click()
              }
            }
      }
      onClick={() => {
        if (!file) inputRef.current?.click()
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "relative flex min-h-[160px] flex-1 flex-col items-center justify-center rounded-[19px] border border-dashed border-dropzone-stroke bg-background px-4 py-6 shadow-[0_16px_48px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/40 sm:min-h-[179px]",
        !file && "cursor-pointer",
        isDragging && "border-brand bg-brand/5 ring-2 ring-brand/25",
        className
      )}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT_ATTR}
        className="sr-only"
        onChange={(event) => {
          applyFile(event.target.files?.[0])
          event.target.value = ""
        }}
      />

      {file ? (
        <UploadedFileCard
          key={`${file.name}-${file.size}-${file.lastModified}`}
          file={file}
          onRemove={() => {
            onFileChange(null)
            inputRef.current?.focus()
          }}
          onReplace={() => inputRef.current?.click()}
        />
      ) : (
        <div className="flex flex-col items-center gap-2.5 text-center">
          <div className="flex size-12 items-center justify-center rounded-lg bg-icon-well text-muted-foreground">
            <Upload className="size-5" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            {label} <span className="text-brand">{labelAccent}</span>
          </p>
          <p className="text-xs text-muted-foreground">Max 10MB</p>
        </div>
      )}
    </div>
  )
}

/** Filled chip from `Upload Screen - filled state.svg`: #F6F6F6 pill, PDF badge, size • pages. */
function UploadedFileCard({
  file,
  onRemove,
  onReplace,
}: {
  file: File
  onRemove: () => void
  onReplace: () => void
}) {
  const type = fileTypeLabel(file)
  const [pageCount, setPageCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    void getDocumentPageCount(file).then((count) => {
      if (!cancelled) setPageCount(count)
    })
    return () => {
      cancelled = true
    }
  }, [file])

  const sizeLabel = formatCompactFileSize(file.size)
  const pagesLabel =
    pageCount == null
      ? null
      : `${pageCount} ${pageCount === 1 ? "Page" : "Pages"}`

  return (
    <div
      className="relative w-full max-w-[298px]"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-xl bg-file-chip px-3 py-3.5 text-left outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-brand/40"
        onClick={onReplace}
        title="Click to replace file"
      >
        {type === "PDF" ? (
          <PdfBadge />
        ) : (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
            <FileText className="size-5" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {file.name}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{sizeLabel}</span>
            {pagesLabel ? (
              <>
                <span
                  className="inline-block size-1 shrink-0 rounded-full bg-muted-foreground"
                  aria-hidden
                />
                <span>{pagesLabel}</span>
              </>
            ) : (
              <>
                <span
                  className="inline-block size-1 shrink-0 rounded-full bg-muted-foreground"
                  aria-hidden
                />
                <span>…</span>
              </>
            )}
          </p>
        </div>
      </button>

      <Button
        type="button"
        variant="secondary"
        size="icon-xs"
        className="absolute -top-2 -right-2 size-[26px] rounded-full bg-remove-chip/80 text-white shadow-md hover:bg-remove-chip hover:text-white"
        aria-label={`Remove ${file.name}`}
        onClick={onRemove}
      >
        <X className="size-3.5" />
      </Button>
    </div>
  )
}

/** Red PDF document badge (35×40) from filled-state SVG. */
function PdfBadge() {
  return (
    <div
      className="relative flex h-10 w-[35px] shrink-0 items-end justify-center overflow-hidden rounded-[3px] bg-pdf-badge pb-[7px]"
      aria-hidden
    >
      <span className="absolute top-0 right-0 size-2.5 rounded-bl-[3px] bg-black/15" />
      <span className="text-[9px] font-bold leading-none tracking-wide text-white">
        PDF
      </span>
    </div>
  )
}

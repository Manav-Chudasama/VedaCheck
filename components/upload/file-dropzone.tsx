"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { FileText, Plus, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  ACCEPT_ATTR,
  fileTypeLabel,
  formatCompactFileSize,
  getDocumentPageCount,
  isImageFile,
  isPdfFile,
  mergeUploadSelection,
} from "@/lib/upload/file-constraints"
import { cn } from "@/lib/utils"

type FileDropzoneProps = {
  label: string
  labelAccent: string
  files: File[]
  onFilesChange: (files: File[]) => void
  onError?: (message: string) => void
  className?: string
}

/**
 * Drop card: one PDF or multiple images.
 * PDF replaces the slot; images can be added until the page limit.
 */
export function FileDropzone({
  label,
  labelAccent,
  files,
  onFilesChange,
  onError,
  className,
}: FileDropzoneProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const hasFiles = files.length > 0
  const isPdfMode = hasFiles && files.every(isPdfFile)
  const allowMultiple = !isPdfMode

  const applyIncoming = useCallback(
    (list: FileList | File[] | null | undefined) => {
      if (!list || list.length === 0) return
      const incoming = Array.from(list)
      const result = mergeUploadSelection(files, incoming)
      if (!result.ok) {
        onError?.(result.message)
        return
      }
      onFilesChange(result.files)
    },
    [files, onError, onFilesChange]
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
    applyIncoming(event.dataTransfer.files)
  }

  const openPicker = () => inputRef.current?.click()

  return (
    <div
      role={hasFiles ? undefined : "button"}
      tabIndex={hasFiles ? undefined : 0}
      aria-label={hasFiles ? undefined : `${label} ${labelAccent}`}
      onKeyDown={
        hasFiles
          ? undefined
          : (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                openPicker()
              }
            }
      }
      onClick={() => {
        if (!hasFiles) openPicker()
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "relative flex min-h-[160px] flex-1 flex-col items-center justify-center rounded-[19px] border border-dashed border-dropzone-stroke bg-background px-4 py-6 shadow-[0_16px_48px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/40 sm:min-h-[179px]",
        !hasFiles && "cursor-pointer",
        isDragging && "border-brand bg-brand/5 ring-2 ring-brand/25",
        className
      )}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT_ATTR}
        multiple={allowMultiple}
        className="sr-only"
        onChange={(event) => {
          applyIncoming(event.target.files)
          event.target.value = ""
        }}
      />

      {hasFiles ? (
        <div
          className="flex w-full max-w-[320px] flex-col gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <ul className="flex max-h-[140px] flex-col gap-2 overflow-y-auto pr-0.5">
            {files.map((file, index) => (
              <li key={`${file.name}-${file.size}-${file.lastModified}-${index}`}>
                <UploadedFileCard
                  file={file}
                  pageHint={
                    isImageFile(file) && files.length > 1
                      ? `Page ${index + 1}`
                      : undefined
                  }
                  onRemove={() => {
                    onFilesChange(files.filter((_, i) => i !== index))
                  }}
                  onReplace={
                    isPdfMode
                      ? () => openPicker()
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>

          {allowMultiple ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={openPicker}
            >
              <Plus className="size-3.5" />
              Add images
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2.5 text-center">
          <div className="flex size-12 items-center justify-center rounded-lg bg-icon-well text-muted-foreground">
            <Upload className="size-5" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            {label} <span className="text-brand">{labelAccent}</span>
          </p>
          <p className="max-w-[14rem] text-xs leading-snug text-muted-foreground">
            One PDF, or multiple page images · Max 10MB each
          </p>
        </div>
      )}
    </div>
  )
}

function UploadedFileCard({
  file,
  pageHint,
  onRemove,
  onReplace,
}: {
  file: File
  pageHint?: string
  onRemove: () => void
  onReplace?: () => void
}) {
  const type = fileTypeLabel(file)
  const [pageCount, setPageCount] = useState<number | null>(null)

  useEffect(() => {
    if (pageHint || type !== "PDF") {
      setPageCount(type === "PDF" ? null : 1)
      return
    }
    let cancelled = false
    void getDocumentPageCount(file).then((count) => {
      if (!cancelled) setPageCount(count)
    })
    return () => {
      cancelled = true
    }
  }, [file, pageHint, type])

  const sizeLabel = formatCompactFileSize(file.size)
  const pagesLabel = pageHint
    ? pageHint
    : pageCount == null
      ? null
      : `${pageCount} ${pageCount === 1 ? "Page" : "Pages"}`

  return (
    <div className="relative w-full">
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-xl bg-file-chip px-3 py-3 text-left outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-brand/40"
        onClick={onReplace}
        title={onReplace ? "Click to replace file" : undefined}
        disabled={!onReplace}
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
            ) : type === "PDF" ? (
              <>
                <span
                  className="inline-block size-1 shrink-0 rounded-full bg-muted-foreground"
                  aria-hidden
                />
                <span>…</span>
              </>
            ) : null}
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

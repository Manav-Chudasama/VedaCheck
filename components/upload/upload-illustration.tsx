import { cn } from "@/lib/utils"

/** Hero graphic — uses the uploaded avatar SVG asset. */
export function UploadIllustration({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto aspect-square w-[min(100%,8.625rem)] shrink-0 sm:w-[8.625rem]",
        className
      )}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Figma export SVG with embedded raster */}
      <img
        src="/images/upload-screen-avatar.svg"
        alt=""
        className="size-full object-contain"
        draggable={false}
      />
    </div>
  )
}

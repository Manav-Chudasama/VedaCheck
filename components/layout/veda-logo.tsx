import { cn } from "@/lib/utils"

type VedaLogoProps = {
  className?: string
  showWordmark?: boolean
}

/** Brand mark: dark rounded square with a stylized V, optional wordmark. */
export function VedaLogo({ className, showWordmark = true }: VedaLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background"
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.5 5.5h4.2L12 15.2 15.3 5.5h4.2L13.4 19H10.6L4.5 5.5Z"
            fill="currentColor"
          />
        </svg>
      </div>
      {showWordmark ? (
        <span className="truncate text-base font-semibold tracking-tight text-foreground">
          VedaCheck
        </span>
      ) : null}
    </div>
  )
}

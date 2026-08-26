"use client"

import { cn } from "@/lib/utils"

/**
 * Loading / extracting view from `Loading state.png` + extracting sparkles.
 * Stars blink on staggered cycles; "Extracting" ellipsis animates.
 */
export function ExtractingScreen() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-background shadow-[0_16px_48px_rgba(0,0,0,0.06)] ring-1 ring-black/5">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="flex flex-col items-center gap-4 text-center sm:gap-5">
          <ExtractingSparks className="h-[7.5rem] w-auto sm:h-[8.4rem]" />
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-[28px] sm:leading-9">
              Extracting
              <AnimatedEllipsis />
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              This may take a while
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function AnimatedEllipsis({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex w-[1.15em] justify-start", className)}
      aria-hidden
    >
      <span className="animate-extracting-dot [animation-delay:0ms]">.</span>
      <span className="animate-extracting-dot [animation-delay:200ms]">.</span>
      <span className="animate-extracting-dot [animation-delay:400ms]">.</span>
    </span>
  )
}

/** Inline sparkles so each star can blink independently (from extracting-state.svg). */
function ExtractingSparks({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 116 135"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none", className)}
      aria-hidden
    >
      <g className="origin-center animate-sparkle-blink [animation-delay:0ms] [transform-box:fill-box]">
        <path
          d="M19.9985 47.8277C57.4465 47.5563 67.4869 15.8295 67.8261 0C67.8261 37.7194 99.7111 47.6016 115.654 47.8277C77.663 47.285 67.9392 79.7129 67.8261 95.9946C67.8261 57.1897 35.9411 47.7147 19.9985 47.8277Z"
          fill="#FF5623"
        />
      </g>
      <g className="origin-center animate-sparkle-blink [animation-delay:280ms] [transform-box:fill-box]">
        <path
          d="M0 98.3673C28.086 98.1638 35.6163 74.3686 35.8707 62.4965C35.8707 90.7861 59.7845 98.1977 71.7414 98.3673C43.2483 97.9603 35.9555 122.281 35.8707 134.493C35.8707 105.389 11.9569 98.2825 0 98.3673Z"
          fill="#FF5623"
        />
      </g>
      <g
        className="origin-center animate-sparkle-blink [animation-delay:560ms] [transform-box:fill-box]"
        opacity="0.52"
      >
        <path
          d="M77.4954 98.0937C88.7297 98.0123 91.7419 88.4942 91.8436 83.7454C91.8436 95.0612 101.409 98.0258 106.192 98.0937C94.7947 97.9308 91.8775 107.659 91.8436 112.544C91.8436 100.902 82.2781 98.0598 77.4954 98.0937Z"
          fill="#FF5623"
        />
      </g>
      <g
        className="origin-center animate-sparkle-blink [animation-delay:840ms] [transform-box:fill-box]"
        opacity="0.83"
      >
        <path
          d="M11.2495 59.9974C14.7013 59.9974 17.4995 57.1992 17.4995 53.7474C17.4995 50.2956 14.7013 47.4974 11.2495 47.4974C7.79773 47.4974 4.99951 50.2956 4.99951 53.7474C4.99951 57.1992 7.79773 59.9974 11.2495 59.9974Z"
          fill="#FF5623"
        />
      </g>
    </svg>
  )
}

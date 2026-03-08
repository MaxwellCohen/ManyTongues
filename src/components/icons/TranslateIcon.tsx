import type { HTMLAttributes } from "react";
import { cn } from "#/lib/cn";

export function TranslateIcon({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      className={cn(
        "mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-palm/14 text-palm",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="size-5"
      >
        <path
          d="M7 7h12m0 0-3-3m3 3-3 3M17 17H5m0 0 3 3m-3-3 3-3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

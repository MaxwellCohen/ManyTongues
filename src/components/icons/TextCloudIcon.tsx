import type { HTMLAttributes } from "react";
import { cn } from "#/lib/cn";

export function TextCloudIcon({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      className={cn(
        "mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-lagoon/14 text-lagoon-deep",
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
          d="M4 7.5h8M4 12h12M4 16.5h8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="18" cy="8" r="2" fill="currentColor" />
        <circle cx="15.5" cy="16.5" r="1.5" fill="currentColor" opacity="0.9" />
        <circle
          cx="19.5"
          cy="13.5"
          r="1.25"
          fill="currentColor"
          opacity="0.75"
        />
      </svg>
    </span>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

export type SwitchProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

export function Switch({
  checked,
  onCheckedChange,
  id,
  disabled,
  className,
  ...aria
}: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "celestial-switch grid h-11 w-[52px] shrink-0 place-items-center rounded-chip bg-transparent disabled:cursor-not-allowed",
        className,
      )}
      {...aria}
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative block h-8 w-[52px] rounded-chip border transition-colors duration-200",
          checked
            ? "border-transparent bg-mint"
            : "border-[var(--line-ctl)] bg-line-2",
        )}
      >
        <span
          className="absolute left-[3px] top-1/2 block h-[26px] w-[26px] rounded-chip bg-paper shadow-[0_1px_3px_rgba(10,18,35,0.35)]"
          style={{
            transform: `translateY(-50%) translateX(${checked ? 20 : 0}px)`,
            transition: "transform 220ms cubic-bezier(.34,1.56,.64,1)",
          }}
        />
      </span>
    </button>
  );
}

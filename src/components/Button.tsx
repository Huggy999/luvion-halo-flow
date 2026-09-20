import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
};

const base =
  "celestial-control inline-flex items-center justify-center gap-2 rounded-btn text-[14px] font-bold leading-none transition-[color,background-color,border-color,transform,box-shadow] duration-200 select-none active:scale-[0.97]";

const variants: Record<Variant, string> = {
  primary:
    "ring-on-solid celestial-primary bg-[var(--blue-btn)] text-primary-foreground shadow-[0_12px_30px_-16px_var(--blue)] hover:bg-[color-mix(in_srgb,var(--blue-btn)_86%,black)] hover:shadow-[0_16px_36px_-16px_var(--blue)]",
  secondary:
    "border border-[var(--line-ctl)] bg-transparent text-blue-ink hover:bg-[color-mix(in_srgb,var(--blue-ink)_8%,transparent)]",
  ghost:
    "bg-transparent text-ink-2 hover:bg-[color-mix(in_srgb,var(--ink-2)_8%,transparent)]",
  danger:
    "border border-[var(--coral)] bg-transparent text-coral-tx hover:bg-[color-mix(in_srgb,var(--coral)_10%,transparent)]",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-4",
  lg: "min-h-12 px-5",
};

const disabledStyles =
  "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-line-2 disabled:text-ink-3 disabled:hover:bg-line-2";

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "secondary",
      size = "md",
      loading = false,
      block = false,
      className,
      children,
      disabled,
      type = "button",
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          disabledStyles,
          block && "w-full",
          className,
        )}
        {...rest}
      >
        {loading ? (
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 shrink-0 animate-spin rounded-chip border-2 border-current border-t-transparent opacity-70"
          />
        ) : null}
        {children}
      </button>
    );
  },
);

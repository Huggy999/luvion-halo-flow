import * as React from "react";
import { cn } from "@/lib/utils";

type Common = {
  id: string;
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  className?: string | undefined;
  fieldClassName?: string | undefined;
};

export type FieldProps = Common &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "className">;

export type TextareaFieldProps = Common &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className">;

function shell(error?: string) {
  return cn(
    "celestial-field w-full rounded-btn border bg-[color-mix(in_oklab,var(--sunk)_88%,transparent)] px-3 py-2 text-ink placeholder:text-ink-3 transition-[border-color,background-color,box-shadow] duration-200 hover:bg-[color-mix(in_oklab,var(--sunk)_72%,var(--paper))]",
    error ? "border-[var(--coral)]" : "border-[var(--line-ctl)]",
  );
}

function Wrapper({
  id,
  label,
  hint,
  error,
  className,
  children,
}: Common & { children: React.ReactNode }) {
  return (
    <div className={cn("w-full", className)}>
      <label htmlFor={id} className="block t-aux font-bold text-ink-2">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-1 t-aux text-coral-tx">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 t-aux text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  className,
  fieldClassName,
  ...rest
}: FieldProps) {
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} className={className}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(shell(error), "min-h-12", fieldClassName)}
        {...rest}
      />
    </Wrapper>
  );
}

export function TextareaField({
  id,
  label,
  hint,
  error,
  className,
  fieldClassName,
  ...rest
}: TextareaFieldProps) {
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} className={className}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(shell(error), "min-h-12", fieldClassName)}
        {...rest}
      />
    </Wrapper>
  );
}

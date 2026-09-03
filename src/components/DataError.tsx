import { useEffect } from "react";
import { announce } from "@/lib/app";

type Props = {
  error?: unknown;
  onRetry: () => void;
  what: string;
};

function reasonOf(error: unknown) {
  const m = (error as { message?: string } | undefined)?.message;
  return m && m.trim() ? m : "no response from the server";
}

export function DataError({ error, onRetry, what }: Props) {
  const reason = reasonOf(error);

  useEffect(() => {
    announce(`Couldn't load ${what}. ${reason}`);
  }, [what, reason]);

  return (
    <section className="card p-4" role="alert">
      <h2 className="text-base font-extrabold text-ink">Couldn't load {what}</h2>
      <p className="mt-1 text-[13px] text-ink-2">{reason}</p>
      <p className="mt-1 text-[13px] text-ink-3">
        Nothing was lost. The data is on the server and will show once the request goes through.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 min-h-11 w-full rounded-btn bg-blue-btn text-sm font-bold text-white"
      >
        Try again
      </button>
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
import { announce, onUndoOffer, type UndoOffer } from "@/lib/app";

/**
 * One undo offer at a time, five seconds, paused while hovered or focused.
 * It sits above the floating tab bar and never covers it.
 */
export function UndoToast() {
  const [offer, setOffer] = useState<UndoOffer | null>(null);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const off = onUndoOffer((o) => {
      setOffer(o);
      setPaused(false);
      announce(o.message);
    });
    return () => {
      off();
    };
  }, []);

  useEffect(() => {
    if (!offer || paused) return;
    timer.current = setTimeout(() => setOffer(null), 5000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [offer, paused]);

  useEffect(() => {
    if (!offer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOffer(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [offer]);

  if (!offer) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 z-40 flex justify-center"
      style={{ bottom: "calc(76px + env(safe-area-inset-bottom))" }}
    >
      <div
        className="card pointer-events-auto mx-3 flex w-full max-w-[406px] items-center justify-between gap-3 px-4 py-3"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <p className="text-[14px] text-ink">{offer.message}</p>
        <button
          type="button"
          onClick={() => {
            offer.onUndo();
            setOffer(null);
          }}
          className="min-h-11 shrink-0 rounded-btn border border-line-2 px-4 text-sm font-bold"
          style={{ color: "var(--blue-ink)" }}
        >
          Undo
        </button>
      </div>
    </div>
  );
}

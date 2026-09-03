import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lumi } from "@/components/Lumi";
import { hideBoundaryForToday } from "@/lib/billing";

/**
 * Boundary card: slides up from the bottom and stays in the flow of the screen.
 * It covers nothing and blocks nothing, closes with a swipe down or the
 * "Remind me later" button, and does not come back before the next day.
 */
export function BoundaryCard({
  id,
  left,
  stops,
  continues,
  onDismiss,
}: {
  id: string;
  /** How much is left. */
  left: string;
  /** What exactly stops working. */
  stops: string;
  /** What keeps working. Required. */
  continues: string;
  onDismiss?: () => void;
}) {
  const [drag, setDrag] = useState(0);
  const start = useRef<number | null>(null);

  const dismiss = () => {
    hideBoundaryForToday(id);
    onDismiss?.();
  };

  return (
    <section
      aria-label="Plan boundary"
      className="sheet-in card p-4"
      style={{ transform: drag ? `translateY(${drag}px)` : undefined }}
      onTouchStart={(e) => {
        start.current = e.touches[0]?.clientY ?? null;
      }}
      onTouchMove={(e) => {
        if (start.current === null) return;
        const dy = (e.touches[0]?.clientY ?? 0) - start.current;
        setDrag(Math.max(0, dy));
      }}
      onTouchEnd={() => {
        if (drag > 60) dismiss();
        setDrag(0);
        start.current = null;
      }}
    >
      <div
        className="mx-auto mb-3 h-1 w-10 rounded-chip bg-line-2"
        aria-hidden="true"
        title="Pull down to hide"
      />
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
        <Lumi variant="glow" size={44} className="shrink-0" />
        <div className="min-w-0">
          <p className="label-xs text-ink-3">Lumi</p>
          <p className="mt-1 t-body font-normal text-ink">{left}</p>
          <p className="mt-2 t-body font-normal text-ink-2">
            When they run out: {stops}
          </p>
          <p className="mt-1 t-body font-normal" style={{ color: "var(--mint-tx)" }}>
            Keeps working: {continues}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          to="/pricing"
          className="grid min-h-11 place-items-center rounded-btn border border-line-2 text-sm font-bold"
          style={{ color: "var(--blue-ink)" }}
        >
          See plans
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="min-h-11 rounded-btn border border-line-2 text-sm font-bold"
          style={{ color: "var(--blue-ink)" }}
        >
          Remind me later
        </button>
      </div>
    </section>
  );
}

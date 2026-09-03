import { Sheet } from "@/components/Sheet";
import { HALO_LEVELS, haloLevel, streakLabel } from "@/lib/app";

/** The full halo scale and what the streak is for. Opened by tapping the halo card. */
export function HaloSheet({
  open,
  onClose,
  streak,
}: {
  open: boolean;
  onClose: () => void;
  streak: number;
}) {
  const current = haloLevel(Math.max(streak, 1)).name;

  return (
    <Sheet open={open} onClose={onClose} title="The halo">
      <p className="text-[14px] leading-relaxed text-ink-2">
        Close at least one task on a day and the day counts. Days that follow each other build the
        halo. The halo, the streak and the focus timer are free on every plan.
      </p>
      <p className="num mt-3 text-[15px] font-bold text-ink">{streakLabel(streak)}</p>

      <ul className="mt-3 divide-y divide-line">
        {HALO_LEVELS.map((lv) => {
          const active = lv.name === current && streak > 0;
          return (
            <li key={lv.name} className="flex items-start gap-3 py-3">
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-chip"
                style={{ background: active ? "var(--halo)" : "var(--line-2)" }}
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block text-[15px] font-bold text-ink">
                  {lv.name} · {lv.max === null ? `${lv.min}+ days` : `days ${lv.min}–${lv.max}`}
                  {active ? " · you are here" : ""}
                </span>
                <span className="block text-[13px] text-ink-2">{lv.what}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={onClose}
        className="mt-3 min-h-11 w-full rounded-btn border border-line-2 text-sm font-bold"
        style={{ color: "var(--blue-ink)" }}
      >
        Close
      </button>
    </Sheet>
  );
}

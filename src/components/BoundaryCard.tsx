import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lumi } from "@/components/Lumi";
import { hideBoundaryForToday } from "@/lib/billing";

/**
 * Карточка границы: выезжает снизу и остаётся в потоке экрана.
 * Она ничего не перекрывает и не блокирует работу, закрывается свайпом вниз
 * или кнопкой «Напомнить потом» и возвращается не раньше следующего дня.
 */
export function BoundaryCard({
  id,
  left,
  stops,
  continues,
  onDismiss,
}: {
  id: string;
  /** Сколько осталось. */
  left: string;
  /** Что именно перестанет работать. */
  stops: string;
  /** Что продолжит работать. Обязательно. */
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
      aria-label="Граница тарифа"
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
        title="Потяните вниз, чтобы скрыть"
      />
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
        <Lumi variant="glow" size={44} className="shrink-0" />
        <div className="min-w-0">
          <p className="label-xs text-ink-3">Луми</p>
          <p className="mt-1 text-[15px] leading-relaxed text-ink">{left}</p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
            Когда закончится: {stops}
          </p>
          <p className="mt-1 text-[14px] leading-relaxed" style={{ color: "var(--mint-tx)" }}>
            Продолжит работать: {continues}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          to="/pricing"
          className="grid min-h-11 place-items-center rounded-btn border border-line-2 text-sm font-bold"
          style={{ color: "var(--blue-ink)" }}
        >
          Посмотреть тарифы
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="min-h-11 rounded-btn border border-line-2 text-sm font-bold"
          style={{ color: "var(--blue-ink)" }}
        >
          Напомнить потом
        </button>
      </div>
    </section>
  );
}

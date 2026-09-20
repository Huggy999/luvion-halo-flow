import { useEffect, useRef } from "react";

export type LumiVariant = "idle" | "glow" | "think" | "sleep";

export function Lumi({
  variant = "idle",
  size = 64,
  className = "",
  breathe = false,
  alive = true,
  draw = false,
  interactive = false,
  label,
}: {
  variant?: LumiVariant;
  size?: number;
  className?: string;
  breathe?: boolean;
  alive?: boolean;
  draw?: boolean;
  interactive?: boolean;
  label?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!draw) return;
    const el = svgRef.current;
    if (!el) return;
    el.classList.add("drawing");
    const t = window.setTimeout(() => el.classList.remove("drawing"), 1200);
    return () => window.clearTimeout(t);
  }, [draw]);

  useEffect(() => {
    if (!interactive) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let pending: { x: number; y: number } | null = null;

    const apply = () => {
      frame = 0;
      const el = svgRef.current;
      if (!el || !pending) return;
      const r = el.getBoundingClientRect();
      const dx = pending.x - (r.left + r.width / 2);
      const dy = pending.y - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      const falloff = Math.max(0, 1 - dist / 260);
      const len = dist || 1;
      el.style.setProperty("--ex", `${((dx / len) * 2.6 * falloff).toFixed(2)}px`);
      el.style.setProperty("--ey", `${((dy / len) * 1.9 * falloff).toFixed(2)}px`);
    };

    const onMove = (e: PointerEvent) => {
      pending = { x: e.clientX, y: e.clientY };
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [interactive]);

  const react = () => {
    if (!interactive) return;
    const el = svgRef.current;
    if (!el) return;
    el.classList.remove("reacting");
    void el.getBoundingClientRect();
    el.classList.add("reacting");
    window.setTimeout(() => el.classList.remove("reacting"), 760);
  };

  const classes = [
    "lumi",
    `is-${variant}`,
    alive ? "blink bob" : "",
    alive || breathe ? "breathe" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={classes}
      style={{ color: "var(--blue)" }}
      onPointerDown={interactive ? react : undefined}
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true, focusable: false })}
    >
      <g className="lumi-stars" aria-hidden="true">
        <circle className="lumi-star lumi-star-1" cx="15" cy="27" r="2" fill="var(--glow)" />
        <circle className="lumi-star lumi-star-2" cx="86" cy="38" r="1.6" fill="var(--glow-2)" />
        <circle className="lumi-star lumi-star-3" cx="82" cy="82" r="1.3" fill="var(--halo)" />
      </g>
      <g className="lumi-body">
        <g className="halo-lift">
          <g className="halo-orbit">
            <ellipse
              className="halo"
              cx="50"
              cy="14"
              rx="23"
              ry="8.5"
              fill="none"
              stroke="#FFC24D"
              strokeWidth="7"
            />
          </g>
        </g>
        <path
          className="head"
          pathLength={1}
          d="M22 88C22 48 26 34 32 34c6 0 13 9 18 17 5-8 12-17 18-17 6 0 10 14 10 54"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <g className="eyes-track">
          <g className="eyes-blink">
            <g className="eye-o">
              <circle cx="41" cy="66" r="4.6" fill="currentColor" />
              <circle cx="59" cy="66" r="4.6" fill="currentColor" />
            </g>
            <path
              className="eye-squint"
              d="M34 62c2.5 3 5 3 7.5 0M58 62c2.5 3 5 3 7.5 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <path
              className="eye-sleep"
              d="M36 66h9M55 66h9"
              fill="none"
              stroke="currentColor"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}

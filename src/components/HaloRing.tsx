import type { ReactNode } from "react";
import type { HaloSkin } from "@/lib/app";

/**
 * The halo ring changes with the level: Spark is a thin blue ring, Ray gold,
 * Glow gold with rays, Beacon a double ring, Constellation a ring of dots.
 */
export function HaloRing({
  skin,
  progress,
  size = 112,
  breathe = true,
  children,
}: {
  skin: HaloSkin;
  progress: number;
  size?: number;
  breathe?: boolean;
  children?: ReactNode;
}) {
  const r = 46;
  const circumference = 2 * Math.PI * r;
  const color = skin === "spark" ? "var(--blue)" : "var(--halo)";
  const width = skin === "spark" ? 4 : 6;

  return (
    <div className="relative drop-shadow-[0_0_22px_color-mix(in_oklab,var(--halo)_38%,transparent)]" style={{ height: size, width: size }}>
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line-2)" strokeWidth={width} />
        {skin === "beacon" ? (
          <circle cx="50" cy="50" r={r - 7} fill="none" stroke="var(--line-2)" strokeWidth="3" />
        ) : null}

        {skin === "constellation" ? (
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
            strokeDasharray="0.5 10"
            className={breathe ? "halo-breathe" : ""}
          />
        ) : (
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - Math.min(1, Math.max(0, progress)))}
            className={breathe ? "halo-breathe" : ""}
          />
        )}

        {skin === "beacon" ? (
          <circle
            cx="50"
            cy="50"
            r={r - 7}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * (r - 7)}
            strokeDashoffset={2 * Math.PI * (r - 7) * (1 - Math.min(1, Math.max(0, progress)))}
          />
        ) : null}

        {skin === "glow"
          ? Array.from({ length: 8 }).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return (
                <line
                  key={i}
                  x1={50 + Math.cos(a) * 49}
                  y1={50 + Math.sin(a) * 49}
                  x2={50 + Math.cos(a) * 50}
                  y2={50 + Math.sin(a) * 50}
                  stroke={color}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              );
            })
          : null}
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

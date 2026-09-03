export type LumiVariant = "idle" | "glow" | "think" | "sleep";

export function Lumi({
  variant = "idle",
  size = 64,
  className = "",
  breathe = false,
}: {
  variant?: LumiVariant;
  size?: number;
  className?: string;
  breathe?: boolean;
}) {
  const haloClass = [
    variant === "think" ? "halo-spin" : "",
    breathe && variant !== "think" ? "halo-breathe" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Луми"
      className={className}
      style={{ color: "var(--blue)" }}
    >
      <g
        className={haloClass}
        opacity={variant === "sleep" ? 0.45 : 1}
        transform={variant === "sleep" ? "rotate(-9 50 14)" : undefined}
      >
        <ellipse
          cx="50"
          cy="14"
          rx="23"
          ry="8.5"
          fill="none"
          stroke="#FFC24D"
          strokeWidth="7"
          strokeDasharray={variant === "think" ? "15 13" : undefined}
          strokeLinecap={variant === "think" ? "round" : undefined}
        />
      </g>
      <path
        d="M22 88C22 48 26 34 32 34c6 0 13 9 18 17 5-8 12-17 18-17 6 0 10 14 10 54"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {variant === "glow" ? (
        <path
          d="M34 62c2.5 3 5 3 7.5 0M58 62c2.5 3 5 3 7.5 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
      ) : variant === "sleep" ? (
        <path
          d="M36 66h9M55 66h9"
          fill="none"
          stroke="currentColor"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
      ) : (
        <>
          <circle cx="41" cy="66" r="4.6" fill="currentColor" />
          <circle cx="59" cy="66" r="4.6" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

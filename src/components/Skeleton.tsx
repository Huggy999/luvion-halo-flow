type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  radius?: string;
  className?: string;
  style?: React.CSSProperties;
};

export function Skeleton({
  width = "100%",
  height = 12,
  radius = "var(--radius-btn)",
  className = "",
  style,
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`skeleton block ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: radius,
        background: "var(--line)",
        ...style,
      }}
    />
  );
}

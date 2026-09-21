import { Lumi, type LumiVariant } from "@/components/Lumi";
import { cn } from "@/lib/utils";

export function MoonlitScene({
  className,
  compact = false,
  lumi = "idle",
  interactive = false,
}: {
  className?: string;
  compact?: boolean;
  lumi?: LumiVariant;
  interactive?: boolean;
}) {
  return (
    <div className={cn("moonlit-scene", compact && "moonlit-scene-compact", className)} aria-label="A moonlit lake with Lumi among the trees" role="img">
      <span className="moonlit-moon" aria-hidden="true" />
      <svg className="moonlit-landscape" viewBox="0 0 800 320" preserveAspectRatio="none" aria-hidden="true">
        <path className="mountain mountain-back" d="M0 185 92 112l72 62 110-115 92 105 80-76 120 101 100-82 134 91v122H0Z" />
        <path className="mountain mountain-front" d="M0 221 115 150l78 65 98-86 102 92 96-71 90 69 110-82 111 92v91H0Z" />
        <path className="lake" d="M0 226c145-18 257 26 397 0 147-27 258 15 403-7v101H0Z" />
        <path className="reflection" d="M350 225h100l60 95H285Z" />
        <g className="trees">
          <path d="m35 229 25-80 25 80Zm55 0 18-57 18 57Zm576 0 24-82 26 82Zm-50 0 18-60 19 60Z" />
        </g>
      </svg>
      <span className="moonlit-lumi" aria-hidden="true">
        <Lumi variant={lumi} size={compact ? 54 : 72} interactive={interactive} />
      </span>
      <span className="moonlit-ripple moonlit-ripple-a" aria-hidden="true" />
      <span className="moonlit-ripple moonlit-ripple-b" aria-hidden="true" />
    </div>
  );
}
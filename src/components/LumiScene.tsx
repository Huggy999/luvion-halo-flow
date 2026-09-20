import { Check, Layers3, Sparkles, TimerReset } from "lucide-react";
import { Lumi, type LumiVariant } from "@/components/Lumi";

export function LumiScene({
  variant = "glow",
  compact = false,
  interactive = false,
}: {
  variant?: LumiVariant;
  compact?: boolean;
  interactive?: boolean;
}) {
  const icons = [Check, Layers3, TimerReset, Sparkles];

  return (
    <div className={compact ? "lumi-scene lumi-scene-compact" : "lumi-scene"} aria-hidden="true">
      <span className="lumi-scene-orbit" />
      <span className="lumi-scene-orbit lumi-scene-orbit-inner" />
      {icons.map((Icon, index) => (
        <span key={index} className={`lumi-scene-icon lumi-scene-icon-${index + 1}`}>
          <Icon size={compact ? 14 : 16} strokeWidth={2} />
        </span>
      ))}
      <span className="lumi-scene-core">
        <Lumi
          variant={variant}
          size={compact ? 68 : 92}
          breathe
          interactive={interactive}
        />
      </span>
    </div>
  );
}
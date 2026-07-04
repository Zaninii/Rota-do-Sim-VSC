import { Check } from "lucide-react";

interface Props {
  value: number;
  max: number;
  milestones?: number; // number of dots between start and end
  className?: string;
  tone?: "primary" | "olive" | "gold";
}

/**
 * Trilha — a dotted-path progress bar with milestone dots.
 * The "sim" (checkmark) sits at the end when 100% is reached.
 */
export function Trail({ value, max, milestones = 8, className = "", tone = "primary" }: Props) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const complete = pct >= 100;

  const toneBg =
    tone === "olive" ? "bg-olive" : tone === "gold" ? "bg-gold" : "bg-primary";
  const toneRing =
    tone === "olive" ? "ring-olive/20" : tone === "gold" ? "ring-gold/20" : "ring-primary/20";

  return (
    <div className={`relative h-8 ${className}`}>
      {/* dotted track */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-1">
        {Array.from({ length: milestones }).map((_, i) => {
          const pos = ((i + 1) / (milestones + 1)) * 100;
          const active = pos <= pct;
          return (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${active ? toneBg : "bg-border"}`}
            />
          );
        })}
      </div>
      {/* progress line */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 h-[2px] rounded-full ${toneBg} transition-[width] duration-500`}
        style={{ width: `calc(${pct}% - 0.5rem)` }}
      />
      {/* end marker */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full ring-4 transition-all ${
            complete ? `${toneBg} text-primary-foreground ${toneRing}` : "bg-background border-2 border-border"
          }`}
        >
          {complete && <Check className="h-3 w-3" strokeWidth={3} />}
        </span>
      </div>
    </div>
  );
}

/** Minimal linear bar for compact contexts (per-category rows). */
export function MiniTrail({ value, max, tone = "primary" }: { value: number; max: number; tone?: "primary" | "olive" | "gold" | "over" }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const over = value > max && max > 0;
  const toneBg = over
    ? "bg-destructive"
    : tone === "olive" ? "bg-olive" : tone === "gold" ? "bg-gold" : "bg-primary";
  return (
    <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full ${toneBg} transition-[width] duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

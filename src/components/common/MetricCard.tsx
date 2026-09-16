import { GlassPanel } from "@/components/common/GlassPanel";
import { MeterBar, TrendDelta } from "@/components/common/Badges";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/charts";
import { animate, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

/** Counter that eases into the target value when it scrolls into view. */
export function AnimatedNumber({
  value,
  decimals = 0,
  className,
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (latest) =>
    latest.toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
  );

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionValue, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [inView, motionValue, value]);

  useEffect(() => {
    const unsubscribe = display.on("change", (latest) => {
      if (ref.current) ref.current.textContent = latest;
    });
    return unsubscribe;
  }, [display]);

  return <span ref={ref} className={cn("tabular", className)}>0</span>;
}

export interface MetricCardProps {
  label: string;
  value: number;
  unit?: string;
  caption?: string;
  delta?: number;
  intent?: "positive" | "negative" | "neutral";
  decimals?: number;
  spark?: number[];
  icon?: ReactNode;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
  progress?: number;
  footer?: ReactNode;
  className?: string;
}

const ICON_TONE: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  primary: "border-teal-200/70 bg-teal-50/70 text-teal-700",
  success: "border-emerald-200/70 bg-emerald-50/70 text-emerald-700",
  warning: "border-amber-200/70 bg-amber-50/70 text-amber-700",
  danger: "border-red-200/70 bg-red-50/70 text-red-700",
  info: "border-sky-200/70 bg-sky-50/70 text-sky-700",
};

/** Enterprise metric card with animated counter, delta chip and optional sparkline. */
export function MetricCard({
  label,
  value,
  unit,
  caption,
  delta,
  intent = "neutral",
  decimals,
  spark,
  icon,
  tone = "primary",
  progress,
  footer,
  className,
}: MetricCardProps) {
  const resolvedDecimals =
    decimals ?? (Number.isInteger(value) ? 0 : value < 100 ? 1 : 2);
  const resolvedTone =
    tone === "primary" && intent === "negative" ? "warning" : tone;

  return (
    <GlassPanel interactive padded={false} className={cn("overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <div className="mt-2 flex items-end gap-1.5">
            <span className="text-2xl font-semibold tracking-tight text-foreground">
              <AnimatedNumber value={value} decimals={resolvedDecimals} />
            </span>
            {unit ? (
              <span className="pb-0.5 text-xs font-medium text-muted-foreground">
                {unit}
              </span>
            ) : null}
          </div>
        </div>
        {icon ? (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg border backdrop-blur-sm",
              ICON_TONE[resolvedTone],
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>

      {spark && spark.length > 1 ? (
        <div className="h-10 px-2">
          <Sparkline data={spark} tone={resolvedTone} />
        </div>
      ) : null}

      <div className="space-y-2 px-5 pt-2 pb-5">
        <div className="flex items-center justify-between gap-2">
          {delta !== undefined ? (
            <TrendDelta delta={delta} intent={intent} />
          ) : (
            <span className="text-xs text-muted-foreground">
              {caption ? "Live" : ""}
            </span>
          )}
          {caption ? (
            <span className="truncate text-xs text-muted-foreground">{caption}</span>
          ) : null}
        </div>
        {progress !== undefined ? (
          <MeterBar
            value={progress}
            tone={
              resolvedTone === "danger"
                ? "danger"
                : resolvedTone === "warning"
                  ? "warning"
                  : resolvedTone === "success"
                    ? "success"
                    : "primary"
            }
          />
        ) : null}
        {footer}
      </div>
    </GlassPanel>
  );
}

/** Compact metric row used inside dense admin panels. */
export function MetricRow({
  label,
  value,
  unit,
  hint,
}: {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2.5 last:border-0">
      <div className="min-w-0">
        <p className="truncate text-sm text-foreground">{label}</p>
        {hint ? (
          <p className="truncate text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      <span className="tabular shrink-0 text-sm font-semibold text-foreground">
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
        {unit ? (
          <span className="ml-1 text-xs font-medium text-muted-foreground">{unit}</span>
        ) : null}
      </span>
    </div>
  );
}

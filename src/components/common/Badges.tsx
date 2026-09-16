import { cn } from "@/lib/utils";
import type { ApprovalState, Priority } from "@/types";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";

type Tone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted";

const TONE_CLASS: Record<Tone, string> = {
  neutral:
    "border-slate-200/80 bg-white/70 text-slate-700",
  primary: "border-teal-200/80 bg-teal-50/80 text-teal-800",
  success: "border-emerald-200/80 bg-emerald-50/80 text-emerald-700",
  warning: "border-amber-200/80 bg-amber-50/80 text-amber-700",
  danger: "border-red-200/80 bg-red-50/80 text-red-700",
  info: "border-sky-200/80 bg-sky-50/80 text-sky-700",
  muted: "border-slate-200/70 bg-slate-50/70 text-slate-500",
};

export function Badge2({
  children,
  tone = "neutral",
  className,
  icon,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap backdrop-blur-sm",
        TONE_CLASS[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

const PRIORITY_TONE: Record<Priority, Tone> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "muted",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  return (
    <Badge2 tone={PRIORITY_TONE[priority]} className={cn("capitalize", className)}>
      {priority}
    </Badge2>
  );
}

const APPROVAL_TONE: Record<ApprovalState, Tone> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  returned: "info",
};

export function ApprovalBadge({ status }: { status: ApprovalState }) {
  return (
    <Badge2 tone={APPROVAL_TONE[status]} className="capitalize">
      {status}
    </Badge2>
  );
}

type AssetStatus = "running" | "standby" | "maintenance" | "fault";

const ASSET_TONE: Record<AssetStatus, Tone> = {
  running: "success",
  standby: "info",
  maintenance: "warning",
  fault: "danger",
};

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  return (
    <Badge2 tone={ASSET_TONE[status]} className="capitalize">
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "running" && "bg-emerald-500",
          status === "standby" && "bg-sky-500",
          status === "maintenance" && "bg-amber-500",
          status === "fault" && "bg-red-500",
        )}
      />
      {status}
    </Badge2>
  );
}

/** Generic status chip for any string state shipped by the API. */
export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone: Tone =
    /approved|completed|published|online|serving|enforced|indexed|ready|healthy|active|confirmed/.test(
      normalized,
    )
      ? "success"
      : /pending|processing|in-progress|in-review|monitoring|watch|tentative|degraded|loading|generating|planned|scheduled|open/.test(
            normalized,
          )
        ? "warning"
        : /rejected|failed|fault|critical|overdue|expired|offline|action-required|blocked|archived/.test(
              normalized,
            )
          ? "danger"
          : /draft|queued|training|standby|returned|off-shift|low/.test(normalized)
            ? "info"
            : "muted";

  return (
    <Badge2 tone={tone} className="capitalize">
      {status.replace(/[-_]/g, " ")}
    </Badge2>
  );
}

/** Delta indicator for KPI cards and metric rows. */
export function TrendDelta({
  delta,
  intent = "neutral",
  suffix = "",
  className,
}: {
  delta: number;
  intent?: "positive" | "negative" | "neutral";
  suffix?: string;
  className?: string;
}) {
  const rising = delta > 0;
  const flat = delta === 0;
  const tone: Tone = flat
    ? "muted"
    : intent === "neutral"
      ? "neutral"
      : intent === "positive"
        ? "success"
        : "danger";

  return (
    <Badge2 tone={tone} className={cn("tabular", className)}>
      {flat ? (
        <Minus className="size-3" />
      ) : rising ? (
        <ArrowUpRight className="size-3" />
      ) : (
        <ArrowDownRight className="size-3" />
      )}
      {rising ? "+" : ""}
      {delta}
      {suffix}
    </Badge2>
  );
}

/** Small labelled meter used for health, coverage and utilisation values. */
export function MeterBar({
  value,
  max = 100,
  tone = "primary",
  className,
}: {
  value: number;
  max?: number;
  tone?: Tone;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const barTone =
    tone === "danger"
      ? "bg-red-500"
      : tone === "warning"
        ? "bg-amber-500"
        : tone === "success"
          ? "bg-emerald-500"
          : tone === "info"
            ? "bg-sky-500"
            : "bg-primary";

  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70",
        className,
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-700", barTone)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

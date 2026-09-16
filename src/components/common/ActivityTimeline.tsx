import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/utils/format";
import { Search, X } from "lucide-react";
import type { ReactNode } from "react";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  tone?: "primary" | "success" | "warning" | "danger" | "info" | "muted";
  icon?: ReactNode;
  trailing?: ReactNode;
}

const DOT_TONE: Record<NonNullable<TimelineItem["tone"]>, string> = {
  primary: "border-teal-300 bg-teal-100 text-teal-700",
  success: "border-emerald-300 bg-emerald-100 text-emerald-700",
  warning: "border-amber-300 bg-amber-100 text-amber-700",
  danger: "border-red-300 bg-red-100 text-red-700",
  info: "border-sky-300 bg-sky-100 text-sky-700",
  muted: "border-slate-300 bg-slate-100 text-slate-600",
};

/** Vertical activity timeline with connected hairline rail. */
export function ActivityTimeline({
  items,
  className,
  emptyLabel = "No activity recorded yet.",
}: {
  items: TimelineItem[];
  className?: string;
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-muted-foreground">{emptyLabel}</p>
    );
  }

  return (
    <ol className={cn("relative space-y-4 pl-1", className)}>
      {items.map((item, index) => (
        <li key={item.id} className="relative flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px]",
                DOT_TONE[item.tone ?? "primary"],
              )}
            >
              {item.icon ?? index + 1}
            </span>
            {index < items.length - 1 ? (
              <span className="mt-1 w-px flex-1 bg-border" aria-hidden />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-medium leading-5 text-foreground">
                {item.title}
              </p>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {relativeTime(item.timestamp)}
              </span>
            </div>
            {item.description ? (
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                {item.description}
              </p>
            ) : null}
            {item.trailing ? <div className="mt-2">{item.trailing}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Search input with icon, clear affordance and optional keyboard hint. */
export function SearchField({
  value,
  onChange,
  placeholder = "Search…",
  shortcut,
  className,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  shortcut?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 border-white/70 bg-white/70 pl-9 pr-16 backdrop-blur-sm"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      ) : shortcut ? (
        <span className="tabular pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded border border-border/80 bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {shortcut}
        </span>
      ) : null}
    </div>
  );
}

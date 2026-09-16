import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, Inbox, Loader2, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

/** Spinner used for every data-loading surface (no skeletons). */
export function LoadingState({
  label = "Loading enterprise data…",
  className,
  minHeight = 180,
}: {
  label?: string;
  className?: string;
  minHeight?: number;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground",
        className,
      )}
      style={{ minHeight }}
    >
      <Loader2 className="size-5 animate-spin text-primary" />
      <span>{label}</span>
    </div>
  );
}

export function InlineLoader({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <Loader2 className="size-3.5 animate-spin" />
      {label}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/80 bg-white/45 p-8 text-center",
        className,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full border border-white/70 bg-white/70 text-muted-foreground">
        {icon ?? <Inbox className="size-4" />}
      </span>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="max-w-sm text-xs leading-5 text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "The gateway did not respond. Retry the request or contact the platform team.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50/70 p-8 text-center",
        className,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full border border-red-200 bg-white/80 text-red-600">
        <AlertTriangle className="size-4" />
      </span>
      <p className="text-sm font-semibold text-red-800">{title}</p>
      <p className="max-w-md text-xs leading-5 text-red-700/90">{description}</p>
      {onRetry ? (
        <Button
          variant="outline"
          size="sm"
          className="mt-1 cursor-pointer"
          onClick={onRetry}
        >
          <RotateCcw className="size-3.5" />
          Retry
        </Button>
      ) : null}
    </div>
  );
}

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

/**
 * GlassPanel — the single surface primitive of the workstation.
 *
 * Light translucent pane, hairline edge highlight and a quiet cool tint. Every
 * card, widget, drawer body and workspace section uses it so the enterprise
 * surface language stays consistent.
 */
export function GlassPanel({
  children,
  className,
  padded = true,
  interactive = false,
  glow = false,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  interactive?: boolean;
  /** Cool accent tint used for hero / highlight panels. */
  glow?: boolean;
} & Omit<HTMLMotionProps<"div">, "children">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "glass-edge glass rounded-xl relative",
        padded && "p-5",
        interactive &&
          "transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-white",
        glow &&
          "before:pointer-events-none before:absolute before:-top-16 before:-right-10 before:h-40 before:w-40 before:rounded-full before:bg-primary/10 before:blur-3xl",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Inner section container used inside dense panels. */
export function GlassInset({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass-inset rounded-lg p-3.5", className)}>{children}</div>
  );
}

export function PanelHeading({
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
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/70 bg-white/70 text-primary">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {description ? (
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Lightweight horizontal toolbar for filters and view controls. */
export function Toolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass-inset flex flex-wrap items-center gap-2 rounded-lg px-3 py-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Label + value row used across detail panes. */
export function DetailRow({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-border/60 py-2 last:border-0",
        className,
      )}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="max-w-[62%] text-right text-xs font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

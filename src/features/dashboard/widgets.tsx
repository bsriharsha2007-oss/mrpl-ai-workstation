/**
 * Dashboard widget library.
 *
 * Every widget is self-contained, typed against the domain contracts and reused
 * across the employee, manager and administrator dashboards so the three
 * personalities keep one visual language.
 */

import { ApprovalBadge, Badge2, MeterBar, PriorityBadge, StatusBadge } from "@/components/common/Badges";
import { DetailRow, GlassInset, GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { EmptyState, LoadingState } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  ApprovalItem,
  AppNotification,
  CalendarEvent,
  EquipmentRecord,
  InspectionRecord,
  SafetyAlert,
  ShiftInfo,
  TaskRecord,
  VisionAnalysis,
} from "@/types";
import { formatDate, relativeTime } from "@/utils/format";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gauge,
  Send,
  ShieldAlert,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";

/* ------------------------------- welcome -------------------------------- */

export function WelcomeCard({
  name,
  roleLabel,
  shift,
  handover,
  actions,
  meta,
}: {
  name: string;
  roleLabel: string;
  shift?: string;
  handover?: string[];
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  const firstName = name.split(" ")[0];
  return (
    <GlassPanel glow className="overflow-hidden">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <Badge2 tone="primary" icon={<Sparkles className="size-3" />}>
            {roleLabel}
          </Badge2>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Good {greeting()}, {firstName}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {shift
                ? `You are on ${shift}. Mission data is synchronised from the sovereign refinery zone — nothing is processed outside MRPL infrastructure.`
                : "Your enterprise control room is synchronised with the sovereign refinery zone."}
            </p>
          </div>
          {meta ? <div className="flex flex-wrap gap-2">{meta}</div> : null}
          {actions ? <div className="flex flex-wrap gap-2 pt-1">{actions}</div> : null}
        </div>

        {handover && handover.length > 0 ? (
          <GlassInset className="w-full shrink-0 space-y-2 lg:w-[340px]">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <ClipboardList className="size-3.5 text-primary" />
              Shift handover notes
            </p>
            <ul className="space-y-1.5">
              {handover.map((note) => (
                <li
                  key={note}
                  className="flex gap-2 text-[11px] leading-5 text-muted-foreground"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                  {note}
                </li>
              ))}
            </ul>
          </GlassInset>
        ) : null}
      </div>
    </GlassPanel>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

/* ----------------------------- quick actions ----------------------------- */

export function QuickActionsPanel({
  actions,
}: {
  actions: { label: string; icon: typeof Send; to: string }[];
}) {
  return (
    <GlassPanel>
      <PanelHeading
        title="Quick actions"
        description="Most-used shift actions in one tap."
        icon={<Activity className="size-4" />}
      />
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {actions.map((action, index) => (
          <motion.a
            key={action.label}
            href={action.to}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.03 }}
            className="glass-inset group flex flex-col gap-2 rounded-lg p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40"
          >
            <span className="flex size-8 items-center justify-center rounded-lg border border-white/80 bg-white/80 text-primary">
              <action.icon className="size-4" />
            </span>
            <span className="text-[11px] font-medium leading-4 text-foreground">
              {action.label}
            </span>
          </motion.a>
        ))}
      </div>
    </GlassPanel>
  );
}

/* -------------------------------- tasks --------------------------------- */

export function TaskListWidget({
  title,
  description,
  icon,
  tasks,
  isLoading,
  emptyTitle = "No tasks assigned",
  emptyDescription = "New work orders from your supervisor will appear here.",
  footer,
  onSelect,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  tasks: TaskRecord[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  footer?: ReactNode;
  onSelect?: (task: TaskRecord) => void;
}) {
  return (
    <GlassPanel>
      <PanelHeading
        title={title}
        description={description}
        icon={icon ?? <ClipboardList className="size-4" />}
        action={footer}
      />
      {isLoading ? (
        <LoadingState label="Loading tasks…" minHeight={140} />
      ) : tasks.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          className="mt-4"
        />
      ) : (
        <ul className="mt-4 space-y-2">
          {tasks.map((task) => (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => onSelect?.(task)}
                className="glass-inset w-full cursor-pointer rounded-lg p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {task.title}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {task.code} · {task.assetTag} · due {formatDate(task.dueDate)}
                    </p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <MeterBar
                    value={task.progress}
                    tone={
                      task.priority === "critical"
                        ? "danger"
                        : task.priority === "high"
                          ? "warning"
                          : "primary"
                    }
                    className="flex-1"
                  />
                  <span className="tabular text-[10px] text-muted-foreground">
                    {task.progress}%
                  </span>
                  <StatusBadge status={task.status} />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </GlassPanel>
  );
}

/* ------------------------------- safety --------------------------------- */

export function SafetyAlertsWidget({
  alerts,
  isLoading,
}: {
  alerts: SafetyAlert[];
  isLoading?: boolean;
}) {
  return (
    <GlassPanel>
      <PanelHeading
        title="Safety alerts"
        description="Live process safety and permit exceptions."
        icon={<ShieldAlert className="size-4" />}
      />
      {isLoading ? (
        <LoadingState label="Loading safety alerts…" minHeight={140} />
      ) : (
        <ul className="mt-4 space-y-2">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className={cn(
                "rounded-lg border p-3",
                alert.severity === "critical"
                  ? "border-red-200/80 bg-red-50/60"
                  : alert.severity === "high"
                    ? "border-amber-200/80 bg-amber-50/60"
                    : "border-border/70 bg-white/55",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold text-foreground">{alert.title}</p>
                <PriorityBadge priority={alert.severity} />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {alert.area} · raised {relativeTime(alert.raisedAt)} ·{" "}
                <span className="font-medium text-foreground">{alert.status}</span>
              </p>
              <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
                {alert.action}
              </p>
            </li>
          ))}
        </ul>
      )}
    </GlassPanel>
  );
}

/* ------------------------------ shift panel ------------------------------ */

export function ShiftPanel({ shift }: { shift?: ShiftInfo }) {
  return (
    <GlassPanel>
      <PanelHeading
        title="Shift information"
        description="Duty window, crew and supervision."
        icon={<Timer className="size-4" />}
      />
      <div className="mt-3">
        {shift ? (
          <>
            <DetailRow label="Shift" value={`${shift.shift} · ${shift.from} – ${shift.to}`} />
            <DetailRow label="Crew" value={shift.crew} />
            <DetailRow label="Area" value={shift.area} />
            <DetailRow label="Supervisor" value={shift.supervisor} />
          </>
        ) : (
          <LoadingState label="Loading shift…" minHeight={120} />
        )}
      </div>
    </GlassPanel>
  );
}

/* ---------------------------- asset health ------------------------------ */

export function AssetHealthWidget({
  equipment,
  isLoading,
}: {
  equipment: EquipmentRecord[];
  isLoading?: boolean;
}) {
  return (
    <GlassPanel>
      <PanelHeading
        title="Assigned equipment health"
        description="Ranked lowest health first with condition monitoring values."
        icon={<Gauge className="size-4" />}
      />
      {isLoading ? (
        <LoadingState label="Loading equipment…" minHeight={140} />
      ) : (
        <ul className="mt-4 space-y-3">
          {equipment.map((asset) => (
            <li key={asset.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">
                    {asset.tag} · {asset.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {asset.area} · vib {asset.vibration} mm/s · {asset.temperature} °C
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="tabular text-xs font-semibold text-foreground">
                    {asset.health}%
                  </span>
                  <Badge2 tone={asset.criticality === "A" ? "danger" : "muted"}>
                    {asset.criticality}
                  </Badge2>
                </div>
              </div>
              <MeterBar
                value={asset.health}
                tone={asset.health < 75 ? "danger" : asset.health < 88 ? "warning" : "success"}
              />
            </li>
          ))}
        </ul>
      )}
    </GlassPanel>
  );
}

/* ---------------------------- inspections ------------------------------- */

export function InspectionProgressWidget({
  inspections,
  isLoading,
}: {
  inspections: InspectionRecord[];
  isLoading?: boolean;
}) {
  const completed = inspections.filter((item) => item.status === "completed").length;
  const progress = inspections.length
    ? Math.round((completed / inspections.length) * 100)
    : 0;

  return (
    <GlassPanel>
      <PanelHeading
        title="Inspection status"
        description={`${completed} of ${inspections.length} planned inspections closed this cycle.`}
        icon={<CheckCircle2 className="size-4" />}
        action={
          <Badge2 tone={progress >= 80 ? "success" : "warning"}>{progress}%</Badge2>
        }
      />
      <div className="mt-4 space-y-3">
        <MeterBar value={progress} tone={progress >= 80 ? "success" : "warning"} />
        <ul className="space-y-2">
          {(isLoading ? [] : inspections.slice(0, 5)).map((inspection) => (
            <li
              key={inspection.id}
              className="glass-inset flex items-center justify-between gap-3 rounded-lg px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium text-foreground">
                  {inspection.assetTag} · {inspection.type}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {inspection.inspector} · {formatDate(inspection.inspectedAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {inspection.aiConfidence > 0 ? (
                  <span className="tabular text-[10px] text-muted-foreground">
                    AI {Math.round(inspection.aiConfidence * 100)}%
                  </span>
                ) : null}
                <StatusBadge status={inspection.status} />
              </div>
            </li>
          ))}
        </ul>
        {isLoading ? <LoadingState minHeight={80} /> : null}
      </div>
    </GlassPanel>
  );
}

/* ------------------------------- approvals ------------------------------- */

export function PendingApprovalsWidget({
  approvals,
  isLoading,
  onDecide,
  canDecide,
}: {
  approvals: ApprovalItem[];
  isLoading?: boolean;
  onDecide?: (id: string, decision: "approved" | "rejected") => void;
  canDecide?: boolean;
}) {
  return (
    <GlassPanel>
      <PanelHeading
        title="Pending approvals"
        description="Permits, purchases, incidents and procedures awaiting your decision."
        icon={<ClipboardList className="size-4" />}
      />
      {isLoading ? (
        <LoadingState label="Loading approvals…" minHeight={140} />
      ) : approvals.length === 0 ? (
        <EmptyState
          title="Approval queue is clear"
          description="New requests will appear here for review."
          className="mt-4"
        />
      ) : (
        <ul className="mt-4 space-y-2">
          {approvals.map((item) => (
            <li key={item.id} className="glass-inset rounded-lg p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {item.category} · {item.requester} · {item.value}
                  </p>
                </div>
                <PriorityBadge priority={item.priority} />
              </div>
              <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
                {item.summary}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <ApprovalBadge status={item.status} />
                <span className="text-[10px] text-muted-foreground">
                  Submitted {relativeTime(item.submittedAt)}
                </span>
                {canDecide && item.status === "pending" && onDecide ? (
                  <span className="ml-auto flex gap-2">
                    <Button
                      size="sm"
                      className="h-7 cursor-pointer px-2 text-[11px]"
                      onClick={() => onDecide(item.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 cursor-pointer border-white/70 bg-white/70 px-2 text-[11px]"
                      onClick={() => onDecide(item.id, "rejected")}
                    >
                      Return
                    </Button>
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassPanel>
  );
}

/* ------------------------------ notifications ---------------------------- */

export function NotificationsWidget({
  notifications,
  isLoading,
}: {
  notifications: AppNotification[];
  isLoading?: boolean;
}) {
  return (
    <GlassPanel>
      <PanelHeading
        title="Recent notifications"
        description="Task, approval, AI and system events."
        icon={<Activity className="size-4" />}
      />
      {isLoading ? (
        <LoadingState minHeight={120} />
      ) : (
        <ul className="mt-4 space-y-2">
          {notifications.slice(0, 5).map((notification) => (
            <li
              key={notification.id}
              className={cn(
                "flex items-start gap-2.5 rounded-lg border p-2.5",
                notification.read
                  ? "border-border/70 bg-white/45"
                  : "border-teal-200/70 bg-teal-50/50",
              )}
            >
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-foreground">
                  {notification.title}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {notification.category} · {relativeTime(notification.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassPanel>
  );
}

/* -------------------------------- recent -------------------------------- */

export interface RecentItem {
  id: string;
  title: string;
  meta: string;
  trailing?: ReactNode;
  to?: string;
}

export function RecentListWidget({
  title,
  description,
  icon,
  items,
  isLoading,
  emptyTitle,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  items: RecentItem[];
  isLoading?: boolean;
  emptyTitle?: string;
}) {
  return (
    <GlassPanel>
      <PanelHeading
        title={title}
        description={description}
        icon={icon ?? <FileText className="size-4" />}
      />
      {isLoading ? (
        <LoadingState minHeight={120} />
      ) : items.length === 0 ? (
        <EmptyState
          title={emptyTitle ?? "Nothing here yet"}
          description="Records will appear as you work in this workspace."
          className="mt-4"
        />
      ) : (
        <ul className="mt-4 divide-y divide-border/60">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium text-foreground">
                  {item.title}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {item.meta}
                </p>
              </div>
              {item.trailing ?? (
                <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
              )}
            </li>
          ))}
        </ul>
      )}
    </GlassPanel>
  );
}

/* ------------------------------ calendar strip --------------------------- */

export function CalendarStripWidget({
  events,
  isLoading,
}: {
  events: CalendarEvent[];
  isLoading?: boolean;
}) {
  return (
    <GlassPanel>
      <PanelHeading
        title="Upcoming schedule"
        description="Inspections, shutdowns, audits, drills and reviews."
        icon={<CalendarClock className="size-4" />}
      />
      {isLoading ? (
        <LoadingState minHeight={120} />
      ) : (
        <ul className="mt-4 space-y-2">
          {events.slice(0, 6).map((event) => (
            <li
              key={event.id}
              className="glass-inset flex items-start justify-between gap-3 rounded-lg px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium text-foreground">
                  {event.title}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {formatDate(event.date)} · {event.time} · {event.owner}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge2 tone="info">{event.type}</Badge2>
                <StatusBadge status={event.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassPanel>
  );
}

/* ------------------------------ vision recent --------------------------- */

export function RecentVisionWidget({
  analyses,
  isLoading,
}: {
  analyses: VisionAnalysis[];
  isLoading?: boolean;
}) {
  return (
    <GlassPanel>
      <PanelHeading
        title="Recent vision analysis"
        description="AI screening results from inspection imagery."
        icon={<Sparkles className="size-4" />}
      />
      {isLoading ? (
        <LoadingState minHeight={120} />
      ) : (
        <ul className="mt-4 space-y-2">
          {analyses.map((analysis) => (
            <li key={analysis.id} className="glass-inset rounded-lg p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-foreground">
                    {analysis.fileName}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {analysis.assetTag} · {analysis.modality} ·{" "}
                    {relativeTime(analysis.uploadedAt)}
                  </p>
                </div>
                <Badge2 tone={analysis.status === "flagged" ? "danger" : "success"}>
                  {Math.round(analysis.confidence * 100)}% conf
                </Badge2>
              </div>
              <p className="mt-1.5 line-clamp-2 text-[10px] leading-4 text-muted-foreground">
                {analysis.summary}
              </p>
            </li>
          ))}
        </ul>
      )}
    </GlassPanel>
  );
}

/* ---------------------------- productivity ------------------------------ */

export function ProductivityWidget({
  score,
  metrics,
  caption,
}: {
  score: number;
  metrics: { label: string; value: string; hint?: string }[];
  caption?: string;
}) {
  return (
    <GlassPanel>
      <PanelHeading
        title="Productivity overview"
        description={caption ?? "Shift output against plan."}
        icon={<TrendingUp className="size-4" />}
        action={<Badge2 tone="primary">{score}% score</Badge2>}
      />
      <div className="mt-4 space-y-3">
        <MeterBar value={score} tone={score >= 85 ? "success" : "warning"} />
        <div className="grid grid-cols-2 gap-2">
          {metrics.map((metric) => (
            <GlassInset key={metric.label} className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {metric.label}
              </p>
              <p className="tabular text-sm font-semibold text-foreground">
                {metric.value}
              </p>
              {metric.hint ? (
                <p className="text-[10px] text-muted-foreground">{metric.hint}</p>
              ) : null}
            </GlassInset>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}

/* ------------------------------ pinned SOPs ----------------------------- */

export function PinnedSopWidget({
  items,
}: {
  items: { id: string; title: string; meta: string }[];
}) {
  return (
    <GlassPanel>
      <PanelHeading
        title="Pinned SOPs"
        description="Procedures pinned to your shift board."
        icon={<FileText className="size-4" />}
      />
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="glass-inset flex items-center justify-between gap-3 rounded-lg px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium text-foreground">
                {item.title}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">{item.meta}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 cursor-pointer px-2 text-[10px] text-primary"
            >
              Open
            </Button>
          </li>
        ))}
      </ul>
    </GlassPanel>
  );
}

/* -------------------------------- layout -------------------------------- */

/** Responsive 3-column dashboard grid: 2/3 main content, 1/3 side rail. */
export function DashboardGrid({
  main,
  rail,
}: {
  main: ReactNode;
  rail: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="space-y-4 xl:col-span-2">{main}</div>
      <div className="space-y-4">{rail}</div>
    </div>
  );
}

/** KPI row used at the top of every dashboard. */
export function KpiRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
  );
}

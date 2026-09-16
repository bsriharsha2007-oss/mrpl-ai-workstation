import { Badge2, MeterBar, PriorityBadge, StatusBadge } from "@/components/common/Badges";
import { GlassInset, GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchField } from "@/components/common/ActivityTimeline";
import { MetricCard } from "@/components/common/MetricCard";
import { EmptyState, LoadingState } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRole } from "@/hooks/use-role";
import { useInspections, useTasks } from "@/hooks/use-queries";
import type { TaskRecord } from "@/types";
import { formatDate, relativeTime } from "@/utils/format";
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  ListChecks,
  Loader2,
  Plus,
  Send,
  ShieldAlert,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type Tab = "open" | "completed" | "all";

/** My Tasks — the employee's assigned work orders and inspections. */
export default function TasksPage() {
  const { profile } = useRole();
  const tasks = useTasks({ assignee: profile.name });
  const inspections = useInspections();
  const [tab, setTab] = useState<Tab>("open");
  const [search, setSearch] = useState("");

  const list = tasks.data ?? [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return list.filter((task) => {
      if (tab === "open" && task.status === "completed") return false;
      if (tab === "completed" && task.status !== "completed") return false;
      if (term && !`${task.title} ${task.code} ${task.asset} ${task.tags.join(" ")}`.toLowerCase().includes(term)) {
        return false;
      }
      return true;
    });
  }, [list, search, tab]);

  const updateTask = (task: TaskRecord, action: "start" | "complete") => {
    toast.success(
      action === "start" ? "Task started" : "Task completed and submitted",
      {
        description: `${task.code} · ${task.title}`,
      },
    );
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="My Tasks"
        description="Your assigned work orders, inspections and maintenance requests with priority and due dates."
        crumbs={[{ label: "Operate" }, { label: "My Tasks" }]}
        actions={
          <>
            <Badge2 tone="warning">
              {list.filter((task) => task.status !== "completed").length} open
            </Badge2>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer gap-1.5 border-white/70 bg-white/70"
              onClick={() => toast.success("Maintenance request drafted", { description: "Routed to the planning cell." })}
            >
              <Plus className="size-3.5" />
              New maintenance request
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer gap-1.5 border-white/70 bg-white/70"
              onClick={() => toast.success("Incident report drafted", { description: "HSE will be notified immediately." })}
            >
              <ShieldAlert className="size-3.5" />
              Report incident
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Open tasks" value={list.filter((task) => task.status === "open" || task.status === "in-progress").length} icon={<ListChecks className="size-4" />} caption="Across the current cycle" />
        <MetricCard label="Completed" value={list.filter((task) => task.status === "completed").length} tone="success" icon={<CheckCircle2 className="size-4" />} caption="This cycle" delta={2} intent="positive" />
        <MetricCard label="Blocked" value={list.filter((task) => task.status === "blocked").length} tone="danger" icon={<Clock className="size-4" />} caption="Escalated to the shift supervisor" />
        <MetricCard label="Critical priority" value={list.filter((task) => task.priority === "critical" && task.status !== "completed").length} tone="warning" icon={<ShieldAlert className="size-4" />} caption="Due within 24 hours" />
      </div>

      <GlassPanel>
        <PanelHeading
          title="Work list"
          description="Tap a task to progress it. Status syncs to the shift board."
          icon={<ClipboardList className="size-4" />}
          action={
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search tasks…"
              className="w-[190px]"
            />
          }
        />
        <div className="mt-3">
          <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
            <TabsList className="bg-white/60">
              <TabsTrigger value="open" className="text-[11px]">
                Open ({list.filter((task) => task.status !== "completed").length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-[11px]">
                Completed ({list.filter((task) => task.status === "completed").length})
              </TabsTrigger>
              <TabsTrigger value="all" className="text-[11px]">
                All
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mt-4 space-y-2">
          {tasks.isLoading ? (
            <LoadingState label="Loading your tasks…" minHeight={160} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No tasks in this view"
              description="New assignments will appear the moment your supervisor routes them."
            />
          ) : (
            filtered.map((task) => (
              <div key={task.id} className="glass-inset rounded-xl p-4 transition-all duration-200 hover:border-primary/40">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tabular rounded-md border border-white/80 bg-white/70 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        {task.code}
                      </span>
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-foreground">{task.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{task.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {task.tags.map((tag) => (
                        <Badge2 key={tag} tone="muted">
                          {tag}
                        </Badge2>
                      ))}
                      <Badge2 tone="info">{task.assetTag}</Badge2>
                      <Badge2 tone="muted">Due {formatDate(task.dueDate)}</Badge2>
                      <Badge2 tone="muted">Updated {relativeTime(task.createdAt)}</Badge2>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <MeterBar
                        value={task.progress}
                        tone={task.priority === "critical" ? "danger" : task.priority === "high" ? "warning" : "primary"}
                        className="max-w-xs flex-1"
                      />
                      <span className="tabular text-[10px] text-muted-foreground">{task.progress}%</span>
                    </div>
                  </div>

                  {task.status !== "completed" ? (
                    <div className="flex shrink-0 gap-2 lg:flex-col">
                      {task.status === "open" ? (
                        <Button size="sm" className="cursor-pointer gap-1.5" onClick={() => updateTask(task, "start")}>
                          <Send className="size-3.5" />
                          Start
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer gap-1.5 border-white/70 bg-white/70"
                        onClick={() => updateTask(task, "complete")}
                      >
                        {task.status === "in-progress" ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="size-3.5" />
                        )}
                        Complete
                      </Button>
                    </div>
                  ) : (
                    <GlassInset className="shrink-0 self-start">
                      <p className="text-[10px] text-muted-foreground">
                        Completed · evidence attached · audited
                      </p>
                    </GlassInset>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </GlassPanel>

      <GlassPanel>
        <PanelHeading
          title="Linked inspections"
          description="Condition-monitoring rounds tied to your work orders."
          icon={<ShieldAlert className="size-4" />}
        />
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {(inspections.data ?? []).slice(0, 4).map((inspection) => (
            <GlassInset key={inspection.id} className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-[11px] font-medium text-foreground">
                  {inspection.assetTag}
                </p>
                <StatusBadge status={inspection.status} />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {inspection.type} · {inspection.inspector} · {formatDate(inspection.inspectedAt)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {inspection.findings} findings · AI confidence{" "}
                {inspection.aiConfidence > 0 ? `${Math.round(inspection.aiConfidence * 100)}%` : "—"}
              </p>
            </GlassInset>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}

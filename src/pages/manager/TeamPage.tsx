import { Badge2, MeterBar, StatusBadge } from "@/components/common/Badges";
import { GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type DataColumn } from "@/components/common/DataTable";
import { MetricCard } from "@/components/common/MetricCard";
import { SearchField } from "@/components/common/ActivityTimeline";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployees, useTasks } from "@/hooks/use-queries";
import type { EmployeeRecord } from "@/types";
import { relativeTime } from "@/utils/format";
import { CalendarPlus, ListChecks, Send, Users, UserPlus, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

/** Team — workload, coverage and task assignment for the department. */
export default function TeamPage() {
  const employees = useEmployees();
  const tasks = useTasks();
  const [search, setSearch] = useState("");
  const [assignTarget, setAssignTarget] = useState<EmployeeRecord | null>(null);
  const [assignTask, setAssignTask] = useState("");

  const unassignedTasks = useMemo(
    () => (tasks.data ?? []).filter((task) => task.status === "open").slice(0, 8),
    [tasks.data],
  );

  const columns: DataColumn<EmployeeRecord>[] = [
    {
      key: "name",
      header: "Person",
      sortValue: (row) => row.name,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[10px] font-semibold text-primary">
            {row.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground">{row.name}</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {row.designation} · {row.employeeId}
            </p>
          </div>
        </div>
      ),
    },
    { key: "dept", header: "Department", hideBelow: "md", sortValue: (r) => r.department, render: (r) => <span className="text-[11px] text-muted-foreground">{r.department}</span> },
    { key: "shift", header: "Shift", hideBelow: "lg", render: (r) => <Badge2 tone="muted">{r.shift}</Badge2> },
    { key: "tasks", header: "Open tasks", hideBelow: "sm", sortValue: (r) => r.openTasks, render: (r) => <span className="tabular text-xs font-medium text-foreground">{r.openTasks}</span> },
    {
      key: "workload",
      header: "Workload",
      sortValue: (r) => r.workload,
      render: (r) => (
        <div className="flex items-center gap-2">
          <MeterBar
            value={r.workload}
            tone={r.workload > 85 ? "danger" : r.workload > 70 ? "warning" : "success"}
            className="w-20"
          />
          <span className="tabular text-[11px] text-muted-foreground">{r.workload}%</span>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "action",
      header: "",
      align: "right",
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7 cursor-pointer gap-1 border-white/70 bg-white/70 px-2 text-[10px]"
          onClick={(event) => {
            event.stopPropagation();
            setAssignTarget(row);
          }}
        >
          <Send className="size-3" />
          Assign
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Team"
        description="Workload distribution, shift coverage and task assignment across your department."
        crumbs={[{ label: "Oversight" }, { label: "Team" }]}
        actions={
          <>
            <Badge2 tone="primary" icon={<Users className="size-3" />}>
              {employees.data?.length ?? 0} personnel
            </Badge2>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer gap-1.5 border-white/70 bg-white/70"
              onClick={() => toast.success("Invite drafted", { description: "HR provisioning request created." })}
            >
              <UserPlus className="size-3.5" />
              Request personnel
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="On shift now" value={(employees.data ?? []).filter((e) => e.status === "active").length} unit="active" icon={<UserRound className="size-4" />} caption="Across all shifts" />
        <MetricCard label="Over 85% load" value={(employees.data ?? []).filter((e) => e.workload > 85).length} tone="danger" icon={<Users className="size-4" />} caption="Rebalance before handover" />
        <MetricCard label="Avg open tasks" value={Math.round((employees.data ?? []).reduce((sum, e) => sum + e.openTasks, 0) / Math.max(1, employees.data?.length ?? 1))} icon={<ListChecks className="size-4" />} caption="Per person" />
        <MetricCard label="Avg compliance" value={Math.round((employees.data ?? []).reduce((sum, e) => sum + e.compliance, 0) / Math.max(1, employees.data?.length ?? 1))} unit="%" tone="success" icon={<CalendarPlus className="size-4" />} caption="Training & permits" />
      </div>

      <GlassPanel>
        <PanelHeading
          title="Department roster"
          description="Utilisation, compliance and current availability."
          icon={<Users className="size-4" />}
          action={
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search people…"
              className="w-[200px]"
            />
          }
        />
        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={(employees.data ?? []).filter((employee) =>
              `${employee.name} ${employee.designation} ${employee.department}`
                .toLowerCase()
                .includes(search.trim().toLowerCase()),
            )}
            rowKey={(row) => row.id}
            isLoading={employees.isLoading}
            pageSize={8}
            caption="Department roster"
          />
        </div>
      </GlassPanel>

      <GlassPanel>
        <PanelHeading
          title="Assignment board"
          description="Open work orders ready to route to the right engineer."
          icon={<ListChecks className="size-4" />}
        />
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {unassignedTasks.map((task) => (
            <div key={task.id} className="glass-inset space-y-2 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-2 text-[11px] font-medium text-foreground">{task.title}</p>
                <Badge2 tone={task.priority === "critical" ? "danger" : "info"}>{task.priority}</Badge2>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {task.code} · {task.assetTag} · {task.department}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-full cursor-pointer gap-1 border-white/70 bg-white/70 text-[10px]"
                onClick={() => toast.success("Task offered to the shift board", { description: task.title })}
              >
                <Send className="size-3" />
                Offer to shift
              </Button>
            </div>
          ))}
        </div>
      </GlassPanel>

      <Dialog open={assignTarget !== null} onOpenChange={(open) => !open && setAssignTarget(null)}>
        <DialogContent className="glass-strong border-white/80 bg-white/90 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Assign work — {assignTarget?.name}</DialogTitle>
            <DialogDescription className="text-xs">
              {assignTarget
                ? `${assignTarget.designation} · workload ${assignTarget.workload}% · ${assignTarget.openTasks} open tasks`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-foreground">Work order</label>
            <Select value={assignTask} onValueChange={setAssignTask}>
              <SelectTrigger className="border-white/70 bg-white/70 text-xs">
                <SelectValue placeholder="Select a work order" />
              </SelectTrigger>
              <SelectContent>
                {unassignedTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.code} · {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="cursor-pointer border-white/70 bg-white/70" onClick={() => setAssignTarget(null)}>
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              disabled={!assignTask}
              onClick={() => {
                toast.success("Task assigned", {
                  description: `${assignTarget?.name} notified on the workstation and shift board.`,
                });
                setAssignTarget(null);
                setAssignTask("");
              }}
            >
              <Send className="size-3.5" />
              Assign task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

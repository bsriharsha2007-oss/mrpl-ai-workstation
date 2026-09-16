import { Badge2, MeterBar, StatusBadge } from "@/components/common/Badges";
import { GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { BarSeriesChart } from "@/components/charts";
import { useWorkloadTrend, useCalendar, useMaintenance, useInspections } from "@/hooks/use-queries";
import { formatDate } from "@/utils/format";
import { CalendarRange, CalendarPlus, Gauge, Wrench } from "lucide-react";

/** Planning — turnaround, inspection and resource planning. */
export default function PlanningPage() {
  const calendar = useCalendar();
  const maintenance = useMaintenance();
  const inspections = useInspections();
  const workload = useWorkloadTrend();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Planning"
        description="Turnaround windows, inspection campaigns and resource allocation across the operating plan."
        crumbs={[{ label: "Workflow" }, { label: "Planning" }]}
        actions={
          <>
            <Badge2 tone="primary" icon={<CalendarRange className="size-3" />}>
              CDU-2 turnaround · T-21 days
            </Badge2>
            <Badge2 tone="muted">Resource plan v4</Badge2>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Planned work orders" value={42} icon={<Wrench className="size-4" />} caption="CDU-2 scope pack" delta={6} intent="positive" />
        <MetricCard label="Shutdown window" value={21} unit="days" icon={<CalendarPlus className="size-4" />} tone="warning" caption="26 Sep – 02 Oct" />
        <MetricCard label="Inspection campaigns" value={8} icon={<Gauge className="size-4" />} tone="info" caption="3 in progress" />
        <MetricCard label="Crew utilisation" value={81} unit="%" icon={<CalendarRange className="size-4" />} tone="primary" caption="Vs 85% plan ceiling" progress={81} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <GlassPanel>
          <PanelHeading
            title="Resource loading"
            description="Planned versus completed man-weeks."
            icon={<CalendarRange className="size-4" />}
          />
          <div className="mt-4">
            <BarSeriesChart
              data={workload.data ?? []}
              isLoading={workload.isLoading}
              series={[
                { key: "planned", label: "Planned", color: "#14b8a6" },
                { key: "completed", label: "Completed", color: "#10b981" },
              ]}
              height={220}
            />
          </div>
        </GlassPanel>

        <GlassPanel>
          <PanelHeading
            title="Maintenance calendar"
            description="Confirmed work windows by crew."
            icon={<Wrench className="size-4" />}
          />
          <ul className="mt-4 space-y-2">
            {(maintenance.data ?? []).slice(0, 6).map((job) => (
              <li key={job.id} className="glass-inset flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-foreground">
                    {job.asset}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {job.workOrder} · {job.window} · {job.crew} · lead {job.lead}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge2 tone={job.type === "Shutdown" ? "danger" : "info"}>{job.type}</Badge2>
                  <StatusBadge status={job.status} />
                </div>
              </li>
            ))}
          </ul>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <GlassPanel>
          <PanelHeading
            title="Inspection campaign plan"
            description="Scheduled statutory and condition-based inspections."
            icon={<Gauge className="size-4" />}
          />
          <ul className="mt-4 space-y-2">
            {(inspections.data ?? []).map((inspection) => (
              <li key={inspection.id} className="glass-inset flex items-center justify-between gap-3 rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-foreground">
                    {inspection.assetTag} · {inspection.type}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {inspection.inspector} · {formatDate(inspection.inspectedAt)}
                  </p>
                </div>
                <StatusBadge status={inspection.status} />
              </li>
            ))}
          </ul>
        </GlassPanel>

        <GlassPanel>
          <PanelHeading
            title="Key milestones"
            description="Dates committed to the operations review."
            icon={<CalendarPlus className="size-4" />}
          />
          <ul className="mt-4 space-y-2">
            {(calendar.data ?? []).slice(0, 6).map((event) => (
              <li key={event.id} className="glass-inset flex items-center justify-between gap-3 rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-foreground">{event.title}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {formatDate(event.date)} · {event.time} · {event.owner}
                  </p>
                </div>
                <Badge2 tone="info">{event.type}</Badge2>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <MeterBar value={64} tone="primary" />
            <p className="mt-1 text-[10px] text-muted-foreground">
              64% of the quarterly plan locked with confirmed crews
            </p>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

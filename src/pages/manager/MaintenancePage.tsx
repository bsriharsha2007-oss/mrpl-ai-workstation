import { Badge2, MeterBar, StatusBadge } from "@/components/common/Badges";
import { GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type DataColumn } from "@/components/common/DataTable";
import { MetricCard } from "@/components/common/MetricCard";
import { DonutChart, HeatmapGrid } from "@/components/charts";
import {
  useDefectDistribution,
  useEquipment,
  useInspectionHeatmap,
  useMaintenance,
} from "@/hooks/use-queries";
import type { EquipmentRecord, MaintenanceJob } from "@/types";
import { formatDate } from "@/utils/format";
import { Gauge, ShieldAlert, Wrench } from "lucide-react";

/** Maintenance — work order execution and asset reliability. */
export default function MaintenancePage() {
  const maintenance = useMaintenance();
  const equipment = useEquipment();
  const defects = useDefectDistribution();
  const heatmap = useInspectionHeatmap();

  const jobs = maintenance.data ?? [];
  const active = jobs.filter((job) => job.status !== "completed");

  const columns: DataColumn<MaintenanceJob>[] = [
    {
      key: "asset",
      header: "Job",
      sortValue: (row) => row.asset,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground">{row.asset}</p>
          <p className="truncate text-[10px] text-muted-foreground">
            {row.workOrder} · {row.type} · {row.crew}
          </p>
        </div>
      ),
    },
    { key: "window", header: "Window", hideBelow: "sm", render: (r) => <span className="text-[11px] text-muted-foreground">{r.window}</span> },
    { key: "lead", header: "Lead", hideBelow: "md", render: (r) => <span className="text-[11px] text-muted-foreground">{r.lead}</span> },
    { key: "priority", header: "Priority", render: (r) => <Badge2 tone={r.priority === "critical" ? "danger" : r.priority === "high" ? "warning" : "muted"}>{r.priority}</Badge2> },
    {
      key: "progress",
      header: "Progress",
      sortValue: (r) => r.progress,
      render: (r) => (
        <div className="flex items-center gap-2">
          <MeterBar value={r.progress} tone={r.priority === "critical" ? "danger" : "primary"} className="w-20" />
          <span className="tabular text-[11px] text-muted-foreground">{r.progress}%</span>
        </div>
      ),
    },
    { key: "status", header: "State", render: (r) => <StatusBadge status={r.status} /> },
  ];

  const assetColumns: DataColumn<EquipmentRecord>[] = [
    {
      key: "tag",
      header: "Asset",
      sortValue: (row) => row.tag,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground">{row.tag}</p>
          <p className="truncate text-[10px] text-muted-foreground">
            {row.name} · {row.area}
          </p>
        </div>
      ),
    },
    { key: "criticality", header: "Crit", render: (r) => <Badge2 tone={r.criticality === "A" ? "danger" : "muted"}>{r.criticality}</Badge2> },
    { key: "status", header: "Running state", hideBelow: "sm", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "vibration",
      header: "Vibration",
      hideBelow: "lg",
      sortValue: (r) => r.vibration,
      render: (r) => (
        <span className="tabular text-[11px] text-muted-foreground">{r.vibration} mm/s</span>
      ),
    },
    {
      key: "health",
      header: "Health",
      sortValue: (r) => r.health,
      render: (r) => (
        <div className="flex items-center gap-2">
          <MeterBar value={r.health} tone={r.health < 75 ? "danger" : r.health < 88 ? "warning" : "success"} className="w-20" />
          <span className="tabular text-[11px] text-muted-foreground">{r.health}%</span>
        </div>
      ),
    },
    { key: "next", header: "Next due", hideBelow: "xl", render: (r) => <span className="text-[11px] text-muted-foreground">{formatDate(r.nextDue)}</span> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Maintenance"
        description="Work order execution, asset condition and reliability screening across the department."
        crumbs={[{ label: "Workflow" }, { label: "Maintenance" }]}
        actions={
          <>
            <Badge2 tone="warning">{active.length} live work orders</Badge2>
            <Badge2 tone="danger" icon={<ShieldAlert className="size-3" />}>
              {(equipment.data ?? []).filter((asset) => asset.status === "fault").length} assets in fault
            </Badge2>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Live work orders" value={active.length} icon={<Wrench className="size-4" />} caption="2 critical on criticality-A assets" />
        <MetricCard label="PM adherence" value={86} unit="%" tone="success" icon={<Wrench className="size-4" />} caption="Target 90%" progress={86} />
        <MetricCard label="Defective assets" value={(equipment.data ?? []).filter((asset) => asset.health < 75).length} tone="danger" icon={<ShieldAlert className="size-4" />} caption="Health below 75%" />
        <MetricCard label="Avg vibration" value={2.6} unit="mm/s" decimals={1} tone="info" icon={<Gauge className="size-4" />} caption="Fleet-wide rolling average" />
      </div>

      <GlassPanel>
        <PanelHeading
          title="Work order board"
          description="Scheduled, running and completed maintenance jobs."
          icon={<Wrench className="size-4" />}
        />
        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={jobs}
            rowKey={(row) => row.id}
            isLoading={maintenance.isLoading}
            pageSize={8}
            caption="Maintenance work orders"
          />
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <GlassPanel className="xl:col-span-2">
          <PanelHeading
            title="Asset condition register"
            description="Condition monitoring values ranked by health."
            icon={<Gauge className="size-4" />}
          />
          <div className="mt-4">
            <DataTable
              columns={assetColumns}
              rows={equipment.data ?? []}
              rowKey={(row) => row.id}
              isLoading={equipment.isLoading}
              pageSize={6}
              caption="Asset condition register"
            />
          </div>
        </GlassPanel>

        <GlassPanel>
          <PanelHeading
            title="Defect mix"
            description="Findings raised by the vision and inspection agents."
            icon={<ShieldAlert className="size-4" />}
          />
          <div className="mt-2">
            <DonutChart
              data={defects.data ?? []}
              centerValue={`${(defects.data ?? []).reduce((sum, item) => sum + item.value, 0)}`}
              centerLabel="findings"
              height={210}
            />
          </div>
          <ul className="space-y-1.5">
            {(defects.data ?? []).map((item) => (
              <li key={item.name} className="flex items-center justify-between gap-2 text-[11px]">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2 rounded-sm" style={{ background: item.color }} />
                  {item.name}
                </span>
                <span className="tabular font-medium text-foreground">{item.value}%</span>
              </li>
            ))}
          </ul>
        </GlassPanel>
      </div>

      <GlassPanel>
        <PanelHeading
          title="Inspection coverage heatmap"
          description="Monthly coverage percentage by refinery area — teal meets target, amber needs attention."
          icon={<Gauge className="size-4" />}
        />
        <div className="mt-4">
          <HeatmapGrid rows={heatmap.data ?? []} isLoading={heatmap.isLoading} />
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground">
          Coverage data refreshes after every inspection upload — source: inspection
          management system.
        </p>
      </GlassPanel>
    </div>
  );
}

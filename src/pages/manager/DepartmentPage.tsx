import { Badge2, MeterBar } from "@/components/common/Badges";
import { GlassInset, GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard, MetricRow } from "@/components/common/MetricCard";
import {
  AreaTrendChart,
  DonutChart,
  LineTrendChart,
  RadialGauge,
} from "@/components/charts";
import { useComplianceTrend, useDepartments, useThroughputTrend } from "@/hooks/use-queries";
import { Building2, Gauge, ShieldCheck, Users } from "lucide-react";

/** Department — performance overview for the manager's own unit. */
export default function DepartmentPage() {
  const departments = useDepartments();
  const throughput = useThroughputTrend();
  const compliance = useComplianceTrend();

  const primary = departments.data?.[0];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Department overview"
        description="Performance, compliance and workforce state for Process Operations."
        crumbs={[{ label: "Oversight" }, { label: "Department" }]}
        actions={
          <>
            <Badge2 tone="primary" icon={<Building2 className="size-3" />}>
              {primary?.name ?? "Process Operations"} · {primary?.code ?? "OPS"}
            </Badge2>
            <Badge2 tone="muted">Head {primary?.head ?? "—"}</Badge2>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Headcount" value={primary?.headcount ?? 148} unit="people" icon={<Users className="size-4" />} caption="6 shifts × 4 crews" />
        <MetricCard label="Equipment health" value={primary?.equipmentHealth ?? 92} unit="%" tone="success" icon={<Gauge className="size-4" />} caption="Criticality-weighted" progress={primary?.equipmentHealth ?? 92} />
        <MetricCard label="Safety compliance" value={primary?.compliance ?? 96} unit="%" tone="success" icon={<ShieldCheck className="size-4" />} caption="OISD evidence current" progress={primary?.compliance ?? 96} />
        <MetricCard label="Open tasks" value={primary?.openTasks ?? 34} tone="warning" icon={<Gauge className="size-4" />} caption="4 criticality A" delta={-6} intent="positive" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <GlassPanel className="xl:col-span-2">
          <PanelHeading
            title="Operational trend"
            description="Crude throughput versus plan over the last 12 hours."
            icon={<Gauge className="size-4" />}
          />
          <div className="mt-4">
            <AreaTrendChart
              data={throughput.data ?? []}
              isLoading={throughput.isLoading}
              series={[
                { key: "crude", label: "Crude (t/h)", color: "#10b981" },
                { key: "target", label: "Plan", color: "#64748b", dashed: true },
                { key: "yield", label: "Distillate yield %", color: "#f59e0b" },
              ]}
              height={260}
            />
          </div>
        </GlassPanel>

        <GlassPanel>
          <PanelHeading
            title="Department health"
            description="Combined productivity and compliance."
            icon={<ShieldCheck className="size-4" />}
          />
          <div className="mt-4 space-y-2">
            <RadialGauge value={primary?.productivity ?? 88} label="Productivity" caption="Against plan" tone="success" />
            <RadialGauge value={primary?.compliance ?? 96} label="Compliance" caption="Statutory + internal" tone="primary" />
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <GlassPanel>
          <PanelHeading
            title="Compliance & safety trend"
            description="Six-month trajectory of compliance, safety and AI-assisted closures."
            icon={<ShieldCheck className="size-4" />}
          />
          <div className="mt-4">
            <LineTrendChart
              data={compliance.data ?? []}
              isLoading={compliance.isLoading}
              series={[
                { key: "compliance", label: "Compliance", color: "#0f766e" },
                { key: "safety", label: "Safety", color: "#10b981" },
                { key: "aiAssisted", label: "AI-assisted", color: "#f59e0b" },
              ]}
            />
          </div>
        </GlassPanel>

        <GlassPanel>
          <PanelHeading
            title="Refinery footprint"
            description="All departments with compliance and task load."
            icon={<Building2 className="size-4" />}
          />
          <div className="mt-4">
            <DonutChart
              data={(departments.data ?? []).map((department, index) => ({
                name: department.code,
                value: department.openTasks,
                color: ["#10b981", "#f59e0b", "#64748b", "#14b8a6", "#6366f1", "#f43f5e"][index % 6],
              }))}
              centerValue={`${(departments.data ?? []).reduce((sum, department) => sum + department.openTasks, 0)}`}
              centerLabel="open tasks"
              height={200}
            />
          </div>
          <div className="mt-3">
            <GlassInset>
              {(departments.data ?? []).map((department) => (
                <div key={department.id} className="border-b border-border/60 py-2 last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[11px] font-medium text-foreground">
                      {department.name}
                    </p>
                    <span className="tabular text-[10px] text-muted-foreground">
                      {department.headcount} people · {department.openTasks} tasks
                    </span>
                  </div>
                  <MeterBar value={department.compliance} tone={department.compliance >= 95 ? "success" : "warning"} className="mt-1.5" />
                </div>
              ))}
            </GlassInset>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel>
        <PanelHeading
          title="Department scorecard"
          description="Headline metrics reviewed at the weekly operations meeting."
          icon={<Gauge className="size-4" />}
        />
        <div className="mt-3">
          <GlassInset>
            <MetricRow label="On-stream factor" value="92.4%" hint="Target 93%" />
            <MetricRow label="Specific energy" value="6.28 GJ/t" hint="Benchmark 6.2 — watch" />
            <MetricRow label="Flare losses" value="0.31%" hint="Best quarter to date" />
            <MetricRow label="Training compliance" value="97%" hint="2 overdue refreshers" />
            <MetricRow label="AI-assisted man-hours saved" value="26.5 h" hint="This month" />
          </GlassInset>
        </div>
      </GlassPanel>
    </div>
  );
}

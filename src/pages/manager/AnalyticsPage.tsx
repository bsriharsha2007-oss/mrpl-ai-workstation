import { Badge2 } from "@/components/common/Badges";
import { GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AreaTrendChart,
  BarSeriesChart,
  DonutChart,
  HeatmapGrid,
  LineTrendChart,
} from "@/components/charts";
import {
  useAgentUsage,
  useComplianceTrend,
  useDefectDistribution,
  useEnergyTrend,
  useInspectionHeatmap,
  useThroughputTrend,
} from "@/hooks/use-queries";
import { Activity, BarChart3, Flame, Zap } from "lucide-react";

/** Analytics — departmental trends and AI-assisted performance analysis. */
export default function AnalyticsPage() {
  const throughput = useThroughputTrend();
  const compliance = useComplianceTrend();
  const energy = useEnergyTrend();
  const defects = useDefectDistribution();
  const usage = useAgentUsage();
  const heatmap = useInspectionHeatmap();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Analytics"
        description="Operational, compliance and AI-adoption trends across the department — refreshed with every historian sync."
        crumbs={[{ label: "Intelligence" }, { label: "Analytics" }]}
        actions={
          <>
            <Badge2 tone="success">Historian synced 12 min ago</Badge2>
            <Badge2 tone="primary" icon={<BarChart3 className="size-3" />}>
              6 dashboards · 24 datasets
            </Badge2>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <GlassPanel>
          <PanelHeading
            title="Throughput & yield"
            description="Crude charge, distillate yield and plan line."
            icon={<Activity className="size-4" />}
          />
          <div className="mt-4">
            <AreaTrendChart
              data={throughput.data ?? []}
              isLoading={throughput.isLoading}
              series={[
                { key: "crude", label: "Crude t/h", color: "#10b981" },
                { key: "target", label: "Plan", color: "#64748b", dashed: true },
                { key: "yield", label: "Yield %", color: "#f59e0b" },
              ]}
              height={250}
            />
          </div>
        </GlassPanel>

        <GlassPanel>
          <PanelHeading
            title="Compliance & safety"
            description="Six-month trend with AI-assisted closures overlaid."
            icon={<Activity className="size-4" />}
          />
          <div className="mt-4">
            <LineTrendChart
              data={compliance.data ?? []}
              isLoading={compliance.isLoading}
              series={[
                { key: "compliance", label: "Compliance %", color: "#0f766e" },
                { key: "safety", label: "Safety %", color: "#10b981" },
                { key: "aiAssisted", label: "AI-assisted", color: "#f59e0b" },
              ]}
              height={250}
            />
          </div>
        </GlassPanel>

        <GlassPanel>
          <PanelHeading
            title="Specific energy consumption"
            description="Monthly SEC against the refinery benchmark."
            icon={<Zap className="size-4" />}
          />
          <div className="mt-4">
            <AreaTrendChart
              data={energy.data ?? []}
              isLoading={energy.isLoading}
              series={[
                { key: "specificEnergy", label: "SEC GJ/t", color: "#14b8a6" },
                { key: "benchmark", label: "Benchmark", color: "#64748b", dashed: true },
              ]}
              height={250}
            />
          </div>
        </GlassPanel>

        <GlassPanel>
          <PanelHeading
            title="Agent usage"
            description="AI requests by workspace in the last 24 hours."
            icon={<BarChart3 className="size-4" />}
          />
          <div className="mt-4">
            <BarSeriesChart
              data={(usage.data ?? []).map((item) => ({ label: item.name, requests: item.requests }))}
              series={[{ key: "requests", label: "Requests", color: "#14b8a6" }]}
              height={250}
            />
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <GlassPanel>
          <PanelHeading
            title="Defect distribution"
            description="Where inspection findings originate."
            icon={<Flame className="size-4" />}
          />
          <div className="mt-2">
            <DonutChart
              data={defects.data ?? []}
              centerValue={`${(defects.data ?? []).reduce((sum, item) => sum + item.value, 0)}`}
              centerLabel="index"
              height={220}
            />
          </div>
        </GlassPanel>

        <GlassPanel className="xl:col-span-2">
          <PanelHeading
            title="Inspection coverage"
            description="Monthly coverage by area — teal on target, amber below."
            icon={<Activity className="size-4" />}
          />
          <div className="mt-4">
            <HeatmapGrid rows={heatmap.data ?? []} isLoading={heatmap.isLoading} />
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

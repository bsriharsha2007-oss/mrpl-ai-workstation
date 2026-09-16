import { Badge2, MeterBar, StatusBadge } from "@/components/common/Badges";
import { GlassInset, GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { ActivityTimeline } from "@/components/common/ActivityTimeline";
import { MetricCard, MetricRow } from "@/components/common/MetricCard";
import { LoadingState } from "@/components/common/States";
import {
  BarSeriesChart,
  DonutChart,
  LineTrendChart,
  RadialGauge,
} from "@/components/charts";
import {
  DashboardGrid,
  KpiRow,
  NotificationsWidget,
  QuickActionsPanel,
  RecentListWidget,
} from "@/features/dashboard/widgets";
import { useRole } from "@/hooks/use-role";
import {
  useAgentUsage,
  useAgents,
  useAuditEvents,
  useComplianceTrend,
  useDocuments,
  useKpis,
  useModels,
  useNotifications,
  useSecurityPosture,
  useSystemMetrics,
} from "@/hooks/use-queries";
import { compactNumber, formatNumber, relativeTime } from "@/utils/format";
import {
  Activity,
  Bot,
  Cpu,
  Database,
  HardDrive,
  KeyRound,
  ScrollText,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  TriangleAlert,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";

/** Administrator dashboard — enterprise administration and AI platform health. */
export default function AdminDashboard() {
  const { profile } = useRole();
  const navigate = useNavigate();

  const kpis = useKpis("admin");
  const system = useSystemMetrics();
  const agents = useAgents();
  const models = useModels();
  const audit = useAuditEvents();
  const security = useSecurityPosture();
  const notifications = useNotifications();
  const documents = useDocuments();
  const usage = useAgentUsage();
  const compliance = useComplianceTrend();

  const gpu = system.data?.find((metric) => metric.id === "sm-02");
  const storage = system.data?.find((metric) => metric.id === "sm-06");
  const vector = system.data?.find((metric) => metric.id === "sm-04");

  const runningAgents = useMemo(
    () => (agents.data ?? []).filter((agent) => agent.status === "online").length,
    [agents.data],
  );

  const totalRequests = useMemo(
    () => (agents.data ?? []).reduce((total, agent) => total + agent.requests24h, 0),
    [agents.data],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Enterprise control dashboard"
        description="Platform KPIs, sovereign AI runtime, infrastructure utilisation, security posture and the immutable audit trail."
        actions={
          <>
            <Badge2 tone="success" icon={<ShieldCheck className="size-3" />}>
              Sovereign on-premise · zero egress
            </Badge2>
            <Badge2 tone="muted">{profile.department} · {profile.designation}</Badge2>
          </>
        }
      />

      <GlassPanel glow>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              MRPL Sovereign AI Workstation
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {formatNumber(totalRequests)} agent requests in the last 24 hours,{" "}
              {runningAgents} agents serving, {models.data?.length ?? 6} models in the
              registry and {compactNumber(1284200)} knowledge chunks indexed across the
              enterprise corpus.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <RadialGauge
              value={gpu?.value ?? 78}
              label="GPU fleet"
              caption={`${gpu?.detail ?? "16 × H100 / 4 × L40S"}`}
              tone={(gpu?.status ?? "healthy") === "healthy" ? "success" : "warning"}
            />
            <RadialGauge
              value={storage?.value ?? 71}
              label="Archive storage"
              caption={storage?.detail ?? "412 TB of 580 TB"}
              tone="primary"
            />
            <RadialGauge
              value={vector?.value ?? 64}
              label="Vector store"
              caption={vector?.detail ?? "1.28 M chunks"}
              tone="info"
            />
          </div>
        </div>
      </GlassPanel>

      <KpiRow>
        {(kpis.data ?? []).map((kpi) => (
          <MetricCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            unit={kpi.unit}
            caption={kpi.caption}
            delta={kpi.delta}
            intent={kpi.intent}
            decimals={kpi.label.toLowerCase().includes("uptime") ? 3 : undefined}
            progress={kpi.target ? (kpi.value / kpi.target) * 100 : undefined}
            icon={<Activity className="size-4" />}
          />
        ))}
      </KpiRow>

      <DashboardGrid
        main={
          <>
            <GlassPanel>
              <PanelHeading
                title="System health"
                description="Cluster, inference, vector store, database, archive and pipeline state."
                icon={<Server className="size-4" />}
                action={
                  <Badge2 tone="danger">
                    {(system.data ?? []).filter((metric) => metric.status === "critical").length} critical
                  </Badge2>
                }
              />
              {system.isLoading ? (
                <LoadingState minHeight={200} />
              ) : (
                <ul className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {(system.data ?? []).map((metric) => (
                    <li key={metric.id} className="glass-inset space-y-1.5 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-foreground">
                            {metric.label}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {metric.detail}
                          </p>
                        </div>
                        <StatusBadge status={metric.status} />
                      </div>
                      <div className="flex items-center gap-2">
                        <MeterBar
                          value={metric.value}
                          max={metric.capacity}
                          tone={
                            metric.status === "critical"
                              ? "danger"
                              : metric.status === "watch"
                                ? "warning"
                                : "success"
                          }
                          className="flex-1"
                        />
                        <span className="tabular shrink-0 text-[11px] font-semibold text-foreground">
                          {metric.value.toLocaleString("en-IN")} {metric.unit}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </GlassPanel>

            <GlassPanel>
              <PanelHeading
                title="AI agent throughput"
                description="Requests served per agent in the last 24 hours."
                icon={<Bot className="size-4" />}
                action={<Badge2 tone="primary">{formatNumber(totalRequests)} requests</Badge2>}
              />
              <div className="mt-4">
                <BarSeriesChart
                  data={(usage.data ?? []).map((item) => ({
                    label: item.name,
                    requests: item.requests,
                  }))}
                  series={[{ key: "requests", label: "Requests", color: "#14b8a6" }]}
                  height={220}
                />
              </div>
            </GlassPanel>

            <GlassPanel>
              <PanelHeading
                title="Agent runtime"
                description="Accuracy, latency and ownership per sovereign agent."
                icon={<Cpu className="size-4" />}
              />
              {agents.isLoading ? (
                <LoadingState minHeight={160} />
              ) : (
                <div className="mt-4 space-y-2">
                  {(agents.data ?? []).map((agent) => (
                    <div
                      key={agent.id}
                      className="glass-inset flex flex-wrap items-center justify-between gap-3 rounded-lg p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground">{agent.name}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {agent.model} · {agent.owner} · {agent.purpose}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge2 tone="muted">
                          {formatNumber(agent.requests24h)} req / 24 h
                        </Badge2>
                        <Badge2 tone={agent.accuracy > 0.94 ? "success" : "warning"}>
                          {(agent.accuracy * 100).toFixed(1)}% accuracy
                        </Badge2>
                        <Badge2 tone="info">{agent.latencyMs} ms p95</Badge2>
                        <StatusBadge status={agent.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassPanel>

            <GlassPanel>
              <PanelHeading
                title="Audit timeline"
                description="Immutable, tamper-evident platform activity."
                icon={<ScrollText className="size-4" />}
                action={
                  <button
                    type="button"
                    onClick={() => navigate("/audit-logs")}
                    className="cursor-pointer text-[11px] font-medium text-primary hover:underline"
                  >
                    Open audit logs →
                  </button>
                }
              />
              {audit.isLoading ? (
                <LoadingState minHeight={160} />
              ) : (
                <div className="mt-4">
                  <ActivityTimeline
                    items={(audit.data ?? []).slice(0, 6).map((event) => ({
                      id: event.id,
                      title: `${event.actor} · ${event.action}`,
                      description: `${event.target} · ${event.module} · ${event.ip}`,
                      timestamp: event.at,
                      tone:
                        event.severity === "critical"
                          ? "danger"
                          : event.severity === "warning"
                            ? "warning"
                            : "info",
                    }))}
                  />
                </div>
              )}
            </GlassPanel>

            <GlassPanel>
              <PanelHeading
                title="AI adoption & compliance"
                description="AI-assisted closures against safety and compliance scores."
                icon={<Activity className="size-4" />}
              />
              <div className="mt-4">
                <LineTrendChart
                  data={compliance.data ?? []}
                  isLoading={compliance.isLoading}
                  series={[
                    { key: "compliance", label: "Compliance %", color: "#0f766e" },
                    { key: "safety", label: "Safety %", color: "#10b981" },
                    { key: "aiAssisted", label: "AI-assisted closures", color: "#f59e0b" },
                  ]}
                />
              </div>
            </GlassPanel>
          </>
        }
        rail={
          <>
            <QuickActionsPanel
              actions={[
                { label: "Create user", to: "/users", icon: UserPlus },
                { label: "Assign roles", to: "/roles", icon: KeyRound },
                { label: "Manage permissions", to: "/permissions", icon: ShieldCheck },
                { label: "Restart AI services", to: "/ai-agents", icon: Server },
                { label: "View logs", to: "/audit-logs", icon: ScrollText },
                { label: "Manage departments", to: "/departments", icon: Users },
              ]}
            />

            <GlassPanel>
              <PanelHeading
                title="Security alerts"
                description="Open findings across identity, network and AI guardrails."
                icon={<TriangleAlert className="size-4" />}
                action={
                  <Badge2 tone="warning">
                    {(security.data ?? []).filter((item) => item.status !== "enforced").length} open
                  </Badge2>
                }
              />
              {security.isLoading ? (
                <LoadingState minHeight={140} />
              ) : (
                <ul className="mt-4 space-y-2">
                  {(security.data ?? []).map((control) => (
                    <li key={control.id} className="glass-inset rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[11px] font-medium text-foreground">
                          {control.control}
                        </p>
                        <StatusBadge status={control.status} />
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {control.framework} · owner {control.owner} · reviewed{" "}
                        {relativeTime(control.reviewedAt)}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <MeterBar
                          value={control.coverage}
                          tone={control.coverage >= 95 ? "success" : "warning"}
                          className="flex-1"
                        />
                        <span className="tabular text-[10px] text-muted-foreground">
                          {control.coverage}%
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </GlassPanel>

            <GlassPanel>
              <PanelHeading
                title="Knowledge base statistics"
                description="Corpus size, indexing state and retrieval performance."
                icon={<Database className="size-4" />}
              />
              <div className="mt-4">
                <GlassInset>
                  <MetricRow label="Documents indexed" value="24,180" hint="8 refinery areas" />
                  <MetricRow label="Vector chunks" value="1,284,200" hint="3 collections" />
                  <MetricRow label="Retrieval precision" value="94.6%" hint="Top-5 grounding" />
                  <MetricRow label="Re-index queue" value="42" unit="jobs" hint="Nightly batch" />
                  <MetricRow label="Controlled documents" value={documents.data?.length ?? 10} hint="Retention enforced" />
                </GlassInset>
              </div>
              <div className="mt-3">
                <DonutChart
                  data={(usage.data ?? []).map((item) => ({
                    name: item.name,
                    value: item.requests,
                    color: item.color,
                  }))}
                  centerValue={`${runningAgents}`}
                  centerLabel="agents live"
                  height={200}
                />
              </div>
            </GlassPanel>

            <RecentListWidget
              title="Model registry"
              description="Sovereign models loaded on the inference fabric."
              icon={<Cpu className="size-4" />}
              isLoading={models.isLoading}
              items={(models.data ?? []).slice(0, 5).map((model) => ({
                id: model.id,
                title: model.name,
                meta: `${model.provider} · ${model.params} · ${model.gpu}`,
                trailing: <StatusBadge status={model.status} />,
              }))}
            />

            <GlassPanel>
              <PanelHeading
                title="Storage utilisation"
                description="Object, archive and vector storage footprint."
                icon={<HardDrive className="size-4" />}
              />
              <div className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Enterprise archive</span>
                    <span className="tabular font-medium text-foreground">412 TB / 580 TB</span>
                  </div>
                  <MeterBar value={71} tone="primary" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Vision imagery</span>
                    <span className="tabular font-medium text-foreground">86 TB / 120 TB</span>
                  </div>
                  <MeterBar value={72} tone="success" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Backup vault</span>
                    <span className="tabular font-medium text-foreground">204 TB / 300 TB</span>
                  </div>
                  <MeterBar value={68} tone="success" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Export egress buffer</span>
                    <span className="tabular font-medium text-foreground">88% used</span>
                  </div>
                  <MeterBar value={88} tone="danger" />
                </div>
              </div>
            </GlassPanel>

            <GlassPanel>
              <PanelHeading
                title="Enterprise settings"
                description="Sovereign policy in force for this deployment."
                icon={<SlidersHorizontal className="size-4" />}
              />
              <div className="mt-4">
                <GlassInset>
                  <MetricRow label="AI data residency" value="On-premise only" />
                  <MetricRow label="Audit retention" value="7 years" />
                  <MetricRow label="Model egress" value="Blocked" />
                  <MetricRow label="Session policy" value="8 h idle timeout" />
                  <MetricRow label="Backup cadence" value="Every 4 hours" />
                </GlassInset>
              </div>
            </GlassPanel>

            <NotificationsWidget
              notifications={notifications.data ?? []}
              isLoading={notifications.isLoading}
            />
          </>
        }
      />
    </div>
  );
}

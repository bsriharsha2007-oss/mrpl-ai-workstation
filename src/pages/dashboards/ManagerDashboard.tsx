import { Badge2, MeterBar, StatusBadge } from "@/components/common/Badges";
import { GlassInset, GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard, MetricRow } from "@/components/common/MetricCard";
import { LoadingState } from "@/components/common/States";
import { AreaTrendChart, RadialGauge } from "@/components/charts";
import {
  AssetHealthWidget,
  CalendarStripWidget,
  DashboardGrid,
  InspectionProgressWidget,
  KpiRow,
  NotificationsWidget,
  PendingApprovalsWidget,
  QuickActionsPanel,
  RecentListWidget,
  SafetyAlertsWidget,
  ShiftPanel,
  TaskListWidget,
  WelcomeCard,
} from "@/features/dashboard/widgets";
import { useRole } from "@/hooks/use-role";
import {
  useApprovals,
  useCalendar,
  useDecideApproval,
  useDepartments,
  useEmployees,
  useEquipment,
  useInspections,
  useKpis,
  useNotifications,
  useReports,
  useSafetyAlerts,
  useShift,
  useTasks,
} from "@/hooks/use-queries";
import { relativeTime } from "@/utils/format";
import { toast } from "sonner";
import {
  BadgeCheck,
  Bot,
  Building2,
  CalendarPlus,
  ClipboardCheck,
  FileBarChart2,
  Gauge,
  ListChecks,
  Users,
  Wrench,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";

/** Manager dashboard — department management and operational oversight. */
export default function ManagerDashboard() {
  const { profile } = useRole();
  const navigate = useNavigate();

  const kpis = useKpis("manager");
  const approvals = useApprovals("pending");
  const tasks = useTasks();
  const equipment = useEquipment();
  const inspections = useInspections();
  const safety = useSafetyAlerts();
  const shift = useShift();
  const notifications = useNotifications();
  const reports = useReports();
  const departments = useDepartments();
  const employees = useEmployees();
  const calendar = useCalendar();
  const decide = useDecideApproval();

  const departmentTasks = useMemo(
    () =>
      (tasks.data ?? []).filter(
        (task) => task.department === "Process Operations" || task.department === "Mechanical Maintenance",
      ),
    [tasks.data],
  );

  const criticalAssets = useMemo(
    () => (equipment.data ?? []).filter((asset) => asset.health < 85).slice(0, 6),
    [equipment.data],
  );

  const team = useMemo(
    () => [...(employees.data ?? [])].sort((a, b) => b.workload - a.workload).slice(0, 6),
    [employees.data],
  );

  const department = departments.data?.[0];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Department command dashboard"
        description="Approvals, maintenance pipeline, equipment health and department KPIs for the current operating cycle."
        actions={
          <>
            <Badge2 tone="primary" icon={<Building2 className="size-3" />}>
              {profile.department}
            </Badge2>
            <Badge2 tone="warning">
              {(approvals.data ?? []).length} approvals awaiting decision
            </Badge2>
          </>
        }
      />

      <WelcomeCard
        name={profile.name}
        roleLabel={`${profile.designation} · ${profile.shift}`}
        meta={
          <>
            <Badge2 tone="muted">{department?.headcount ?? 148} personnel</Badge2>
            <Badge2 tone="success">
              Compliance {department?.compliance ?? 96}%
            </Badge2>
            <Badge2 tone="info">
              Equipment health {department?.equipmentHealth ?? 92}%
            </Badge2>
          </>
        }
        actions={
          <>
            <button
              type="button"
              onClick={() => navigate("/approvals")}
              className="cursor-pointer rounded-lg border border-primary bg-primary px-3 py-2 text-[11px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Review approvals
            </button>
            <button
              type="button"
              onClick={() => navigate("/team")}
              className="glass-inset cursor-pointer rounded-lg px-3 py-2 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40"
            >
              Assign tasks
            </button>
            <button
              type="button"
              onClick={() => navigate("/reports")}
              className="glass-inset cursor-pointer rounded-lg px-3 py-2 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40"
            >
              Generate department report
            </button>
          </>
        }
      />

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
            progress={kpi.target ? (kpi.value / kpi.target) * 100 : undefined}
            icon={<Gauge className="size-4" />}
          />
        ))}
      </KpiRow>

      <DashboardGrid
        main={
          <>
            <PendingApprovalsWidget
              approvals={(approvals.data ?? []).slice(0, 4)}
              isLoading={approvals.isLoading}
              canDecide
              onDecide={(id, decision) => {
                decide.mutate(
                  { id, decision },
                  {
                    onSuccess: () =>
                      toast.success(
                        decision === "approved"
                          ? "Request approved and routed to the next authority"
                          : "Request returned to the requester with comments",
                      ),
                  },
                );
              }}
            />

            <TaskListWidget
              title="Open department tasks"
              description={`${departmentTasks.filter((t) => t.status !== "completed").length} open work orders across Process Operations and Mechanical Maintenance.`}
              icon={<ListChecks className="size-4" />}
              tasks={departmentTasks}
              isLoading={tasks.isLoading}
            />

            <GlassPanel>
              <PanelHeading
                title="Operational trends"
                description="Crude throughput against plan and yield spread for the last 12 hours."
                icon={<Gauge className="size-4" />}
                action={<Badge2 tone="success">On plan</Badge2>}
              />
              <div className="mt-4">
                <AreaTrendChart
                  data={[]}
                  series={[
                    { key: "crude", label: "Crude throughput (t/h)", color: "#10b981" },
                    { key: "target", label: "Plan", color: "#64748b", dashed: true },
                  ]}
                  valueSuffix=" t/h"
                />
              </div>
            </GlassPanel>

            <AssetHealthWidget equipment={criticalAssets} isLoading={equipment.isLoading} />

            <GlassPanel>
              <PanelHeading
                title="Employee workload"
                description="Highest utilisation first — rebalance before the next shift handover."
                icon={<Users className="size-4" />}
              />
              {employees.isLoading ? (
                <LoadingState minHeight={140} />
              ) : (
                <ul className="mt-4 space-y-3">
                  {team.map((member) => (
                    <li key={member.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-foreground">
                            {member.name}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {member.designation} · {member.shift} ·{" "}
                            {member.openTasks} open tasks
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="tabular text-xs font-semibold text-foreground">
                            {member.workload}%
                          </span>
                          <StatusBadge status={member.status} />
                        </div>
                      </div>
                      <MeterBar
                        value={member.workload}
                        tone={
                          member.workload > 85
                            ? "danger"
                            : member.workload > 70
                              ? "warning"
                              : "success"
                        }
                      />
                    </li>
                  ))}
                </ul>
              )}
            </GlassPanel>

            <RecentListWidget
              title="AI recommendations awaiting review"
              description="Agent-suggested actions with confidence and evidence."
              icon={<Bot className="size-4" />}
              items={[
                {
                  id: "rec-1",
                  title: "Hold standby blower ready — K-5101 bearing trend +38 °C",
                  meta: "Predictive Maintenance Agent · confidence 91% · 5 h ago",
                  trailing: <Badge2 tone="danger">High</Badge2>,
                },
                {
                  id: "rec-2",
                  title: "Extend UT monitoring interval for P-1204-A1A to 12 months",
                  meta: "Document Intelligence Agent · confidence 89% · 1 d ago",
                  trailing: <Badge2 tone="warning">Review</Badge2>,
                },
                {
                  id: "rec-3",
                  title: "Fast-track HS-2101 cladding repair into the CDU-2 window",
                  meta: "Vision Inspection Agent · confidence 92% · 2 d ago",
                  trailing: <Badge2 tone="warning">Review</Badge2>,
                },
              ]}
            />

            <RecentListWidget
              title="Recent department reports"
              description="KPI, compliance and maintenance packs produced this cycle."
              icon={<FileBarChart2 className="size-4" />}
              isLoading={reports.isLoading}
              items={(reports.data ?? []).slice(0, 4).map((report) => ({
                id: report.id,
                title: report.title,
                meta: `${report.type} · ${report.period} · generated ${relativeTime(report.generatedAt)}`,
                trailing: <StatusBadge status={report.status} />,
              }))}
            />
          </>
        }
        rail={
          <>
            <QuickActionsPanel
              actions={[
                { label: "Approve requests", to: "/approvals", icon: ClipboardCheck },
                { label: "Assign tasks", to: "/team", icon: Users },
                { label: "Department report", to: "/reports", icon: FileBarChart2 },
                { label: "Schedule inspection", to: "/planning", icon: CalendarPlus },
                { label: "Maintenance plan", to: "/maintenance", icon: Wrench },
                { label: "Analytics", to: "/analytics", icon: Gauge },
              ]}
            />

            <GlassPanel>
              <PanelHeading
                title="Department productivity"
                description="Utilisation, adherence and safety compliance combined."
                icon={<BadgeCheck className="size-4" />}
              />
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <RadialGauge
                  value={department?.productivity ?? 88}
                  label="Productivity"
                  caption="Against monthly operating plan"
                  tone="success"
                />
                <RadialGauge
                  value={department?.compliance ?? 96}
                  label="Safety compliance"
                  caption="OISD / Factory Act evidence"
                  tone="primary"
                />
              </div>
              <div className="mt-3">
                <GlassInset>
                  <MetricRow label="Open work orders" value={department?.openTasks ?? 34} hint="4 criticality A" />
                  <MetricRow label="Equipment health" value={`${department?.equipmentHealth ?? 92}%`} hint="Weighted by criticality" />
                  <MetricRow label="Headcount on shift" value={38} unit="of 148" hint="Shift A coverage" />
                </GlassInset>
              </div>
            </GlassPanel>

            <InspectionProgressWidget
              inspections={inspections.data ?? []}
              isLoading={inspections.isLoading}
            />
            <SafetyAlertsWidget alerts={safety.data ?? []} isLoading={safety.isLoading} />
            <CalendarStripWidget events={calendar.data ?? []} isLoading={calendar.isLoading} />
            <ShiftPanel shift={shift.data} />
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

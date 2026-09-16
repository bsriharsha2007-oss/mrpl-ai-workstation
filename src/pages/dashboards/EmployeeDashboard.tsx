import { Badge2 } from "@/components/common/Badges";
import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import {
  AssetHealthWidget,
  DashboardGrid,
  InspectionProgressWidget,
  KpiRow,
  NotificationsWidget,
  PinnedSopWidget,
  ProductivityWidget,
  QuickActionsPanel,
  RecentListWidget,
  RecentVisionWidget,
  SafetyAlertsWidget,
  ShiftPanel,
  TaskListWidget,
  WelcomeCard,
} from "@/features/dashboard/widgets";
import { useRole } from "@/hooks/use-role";
import {
  useConversations,
  useDocuments,
  useEquipment,
  useInspections,
  useKpis,
  useNotifications,
  useReports,
  useSafetyAlerts,
  useShift,
  useTasks,
  useVisionAnalyses,
} from "@/hooks/use-queries";
import { relativeTime } from "@/utils/format";
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Gauge,
  ListChecks,
  ScanEye,
  Sparkles,
  Timer,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";

const QUICK_ACTIONS = [
  { label: "Upload image", to: "/vision", icon: ScanEye },
  { label: "Upload document", to: "/documents", icon: FileText },
  { label: "Search knowledge", to: "/knowledge", icon: Sparkles },
  { label: "Generate report", to: "/reports", icon: ClipboardList },
  { label: "Ask AI", to: "/chat", icon: Sparkles },
  { label: "Start inspection", to: "/tasks", icon: Gauge },
];

/** Employee dashboard — daily refinery operations. */
export default function EmployeeDashboard() {
  const { profile } = useRole();
  const navigate = useNavigate();

  const kpis = useKpis("employee");
  const tasks = useTasks({ assignee: profile.name });
  const equipment = useEquipment();
  const inspections = useInspections();
  const safety = useSafetyAlerts();
  const shift = useShift();
  const notifications = useNotifications();
  const conversations = useConversations("employee");
  const documents = useDocuments();
  const reports = useReports();
  const vision = useVisionAnalyses();

  const mine = tasks.data ?? [];
  const openTasks = useMemo(
    () => mine.filter((task) => task.status === "open" || task.status === "in-progress"),
    [mine],
  );
  const completedTasks = useMemo(
    () => mine.filter((task) => task.status === "completed"),
    [mine],
  );
  const blockedTasks = useMemo(
    () => mine.filter((task) => task.status === "blocked"),
    [mine],
  );

  const assignedAssets = useMemo(
    () => (equipment.data ?? []).slice(0, 6),
    [equipment.data],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Shift operations dashboard"
        description="Your tasks, assigned assets, AI-assisted inspections and the safety picture for the current duty shift."
        actions={
          <>
            <Badge2 tone="primary" icon={<Timer className="size-3" />}>
              {shift.data?.shift ?? "Shift A"} · {shift.data?.from ?? "06:00"} –{" "}
              {shift.data?.to ?? "14:00"}
            </Badge2>
            <Badge2 tone="muted">Sovereign zone · no external egress</Badge2>
          </>
        }
      />

      <WelcomeCard
        name={profile.name}
        roleLabel={`${profile.designation} · ${profile.area}`}
        shift={shift.data ? `${shift.data.shift} · ${shift.data.from} – ${shift.data.to}` : undefined}
        handover={shift.data?.handoverNotes}
        actions={
          <>
            <button
              type="button"
              onClick={() => navigate("/vision")}
              className="glass-inset cursor-pointer rounded-lg px-3 py-2 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40"
            >
              Upload inspection image
            </button>
            <button
              type="button"
              onClick={() => navigate("/chat")}
              className="cursor-pointer rounded-lg border border-primary bg-primary px-3 py-2 text-[11px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Ask the AI copilot
            </button>
            <button
              type="button"
              onClick={() => navigate("/reports")}
              className="glass-inset cursor-pointer rounded-lg px-3 py-2 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40"
            >
              Generate shift report
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
            icon={<Sparkles className="size-4" />}
          />
        ))}
      </KpiRow>

      <DashboardGrid
        main={
          <>
            <TaskListWidget
              title="Today's tasks"
              description={`${openTasks.length} open · ${blockedTasks.length} blocked · ${completedTasks.length} completed`}
              icon={<ListChecks className="size-4" />}
              tasks={openTasks}
              isLoading={tasks.isLoading}
              footer={
                <Badge2 tone={openTasks.some((t) => t.priority === "critical") ? "danger" : "success"}>
                  <Clock className="size-3" />
                  {openTasks.filter((t) => t.priority === "critical").length} critical
                </Badge2>
              }
            />

            <TaskListWidget
              title="Completed & blocked this cycle"
              description="Closed work orders and items needing escalation."
              icon={<CheckCircle2 className="size-4" />}
              tasks={[...completedTasks, ...blockedTasks]}
              isLoading={tasks.isLoading}
              emptyTitle="No closed tasks yet"
            />

            <RecentVisionWidget analyses={vision.data ?? []} isLoading={vision.isLoading} />

            <RecentListWidget
              title="Recent AI conversations"
              description="Continue a grounded discussion with an enterprise agent."
              icon={<Sparkles className="size-4" />}
              isLoading={conversations.isLoading}
              items={(conversations.data ?? []).map((conversation) => ({
                id: conversation.id,
                title: conversation.title,
                meta: `${conversation.agent} · ${conversation.messageCount} messages · ${relativeTime(conversation.updatedAt)}`,
              }))}
            />

            <RecentListWidget
              title="Recent reports"
              description="Generated shift, inspection and compliance documents."
              icon={<FileText className="size-4" />}
              isLoading={reports.isLoading}
              items={(reports.data ?? []).slice(0, 4).map((report) => ({
                id: report.id,
                title: report.title,
                meta: `${report.type} · ${report.period} · ${report.status}`,
              }))}
            />
          </>
        }
        rail={
          <>
            <QuickActionsPanel actions={QUICK_ACTIONS} />
            <ShiftPanel shift={shift.data} />
            <InspectionProgressWidget
              inspections={inspections.data ?? []}
              isLoading={inspections.isLoading}
            />
            <SafetyAlertsWidget alerts={safety.data ?? []} isLoading={safety.isLoading} />
            <AssetHealthWidget equipment={assignedAssets} isLoading={equipment.isLoading} />
            <RecentListWidget
              title="Recent uploads"
              description="Documents and drawings you added to the knowledge base."
              icon={<FileText className="size-4" />}
              isLoading={documents.isLoading}
              items={(documents.data ?? []).slice(0, 4).map((document) => ({
                id: document.id,
                title: document.name,
                meta: `${document.kind} · ${document.size} · ${relativeTime(document.uploadedAt)}`,
              }))}
            />
            <PinnedSopWidget
              items={[
                { id: "sop-1", title: "SOP-CDU-014 · Column pressure control", meta: "Rev 6 · reviewed 3 days ago" },
                { id: "sop-2", title: "SOP-FLARE-002 · Flare header purge", meta: "Rev 4 · revision pending approval" },
                { id: "sop-3", title: "PTP-CDU-011 · Hot work permit", meta: "Rev 2 · HSE controlled" },
              ]}
            />
            <ProductivityWidget
              score={88}
              caption="Shift output against plan"
              metrics={[
                { label: "Rounds completed", value: "12 / 12", hint: "All rounds logged" },
                { label: "AI assisted", value: "9 items", hint: "This shift" },
                { label: "Avg response", value: "4.2 h", hint: "Task turnaround" },
                { label: "Man-hours saved", value: "6.5 h", hint: "Aug–Sep" },
              ]}
            />
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

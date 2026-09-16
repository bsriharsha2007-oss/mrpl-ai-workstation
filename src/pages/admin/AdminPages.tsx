/**
 * Enterprise administration pages.
 *
 * Each export is a full-page screen for the administrator personality. They
 * share the DataTable / GlassPanel vocabulary so the governance surfaces stay
 * consistent with the operations dashboards.
 */

import { Badge2, MeterBar, StatusBadge } from "@/components/common/Badges";
import { ActivityTimeline } from "@/components/common/ActivityTimeline";
import { DetailRow, GlassInset, GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchField } from "@/components/common/ActivityTimeline";
import { DataTable, type DataColumn } from "@/components/common/DataTable";
import { MetricCard, MetricRow } from "@/components/common/MetricCard";
import { DonutChart, HeatmapGrid, RadialGauge } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  useAgents,
  useAuditEvents,
  useDepartments,
  useDocuments,
  useEmployees,
  useModels,
  usePermissions,
  useRoles,
  useSecurityPosture,
  useSystemMetrics,
} from "@/hooks/use-queries";
import { useRole } from "@/hooks/use-role";
import { CAPABILITY_LABELS, type Capability } from "@/utils/rbac";
import { formatDate, formatNumber, relativeTime } from "@/utils/format";
import type { AgentRecord, EmployeeRecord, RoleRecord } from "@/types";
import {
  Activity,
  Bot,
  BookOpen,
  Building2,
  Cpu,
  Database,
  FileStack,
  HardDrive,
  KeyRound,
  Loader2,
  Plus,
  Server,
  ShieldCheck,
  ScrollText,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

/* ------------------------------- shared bits ------------------------------ */

function AdminHeader({
  title,
  description,
  crumbs,
  badges,
  action,
}: {
  title: string;
  description: string;
  crumbs: string[];
  badges?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <PageHeader
      title={title}
      description={description}
      crumbs={[{ label: "Enterprise" }, { label: crumbs[1] }]}
      actions={
        <>
          {badges}
          {action}
        </>
      }
    />
  );
}

/* --------------------------------- users --------------------------------- */

export function UsersPage() {
  const employees = useEmployees();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("employee");

  const columns: DataColumn<EmployeeRecord>[] = [
    {
      key: "name",
      header: "User",
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
    { key: "role", header: "Role", hideBelow: "sm", render: (r) => <Badge2 tone={r.role === "admin" ? "danger" : r.role === "manager" ? "warning" : "muted"}>{r.role}</Badge2> },
    { key: "status", header: "State", render: (r) => <StatusBadge status={r.status} /> },
    { key: "compliance", header: "Compliance", hideBelow: "lg", sortValue: (r) => r.compliance, render: (r) => <span className="tabular text-[11px] text-muted-foreground">{r.compliance}%</span> },
    {
      key: "active",
      header: "Last active",
      hideBelow: "xl",
      sortValue: (r) => new Date(r.lastActive).getTime(),
      render: (r) => <span className="text-[11px] text-muted-foreground">{relativeTime(r.lastActive)}</span>,
    },
    {
      key: "action",
      header: "",
      align: "right",
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7 cursor-pointer px-2 text-[10px] border-white/70 bg-white/70"
          onClick={(event) => {
            event.stopPropagation();
            toast("Account actions", {
              description: `${row.name} — reset MFA, adjust role, suspend or offboard via the identity provider.`,
            });
          }}
        >
          Manage
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <AdminHeader
        title="Users"
        description="Provision, review and manage workstation accounts across the refinery."
        crumbs={["Enterprise", "Users"]}
        badges={
          <>
            <Badge2 tone="primary" icon={<Users className="size-3" />}>
              {employees.data?.length ?? 0} shown of 1,346
            </Badge2>
            <Badge2 tone="muted">SSO + MFA enforced</Badge2>
          </>
        }
        action={
          <Button size="sm" className="cursor-pointer gap-1.5" onClick={() => setCreateOpen(true)}>
            <UserPlus className="size-3.5" />
            Create user
          </Button>
        }
      />

      <GlassPanel>
        <PanelHeading
          title="Account directory"
          description="Every principal with workstation access."
          icon={<Users className="size-4" />}
          action={
            <SearchField value={search} onChange={setSearch} placeholder="Search users…" className="w-[200px]" />
          }
        />
        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={(employees.data ?? []).filter((employee) =>
              `${employee.name} ${employee.employeeId} ${employee.department} ${employee.role}`
                .toLowerCase()
                .includes(search.trim().toLowerCase()),
            )}
            rowKey={(row) => row.id}
            isLoading={employees.isLoading}
            pageSize={8}
            caption="User directory"
          />
        </div>
      </GlassPanel>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="glass-strong border-white/80 bg-white/90 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Create workstation user</DialogTitle>
            <DialogDescription className="text-xs">
              The account is created in the enterprise directory and provisioned
              with the selected role on first sign-in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-foreground">Full name</label>
              <Input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="e.g. Rohit Pais"
                className="border-white/70 bg-white/70 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-foreground">Role</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="border-white/70 bg-white/70 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Refinery Employee</SelectItem>
                  <SelectItem value="manager">Department Manager</SelectItem>
                  <SelectItem value="admin">Enterprise Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <GlassInset>
              <p className="text-[10px] leading-4 text-muted-foreground">
                Default capabilities: personal dashboard, AI workspaces, uploads,
                reports. Managers additionally receive approvals and team views;
                administrators receive enterprise configuration.
              </p>
            </GlassInset>
          </div>
          <DialogFooter>
            <Button variant="outline" className="cursor-pointer border-white/70 bg-white/70" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="cursor-pointer gap-2"
              disabled={!newName.trim()}
              onClick={() => {
                toast.success("User created", {
                  description: `${newName} provisioned as ${newRole}.`,
                });
                setNewName("");
                setCreateOpen(false);
              }}
            >
              <Plus className="size-3.5" />
              Create user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --------------------------------- roles --------------------------------- */

export function RolesPage() {
  const roles = useRoles();
  const employees = useEmployees();

  const columns: DataColumn<RoleRecord>[] = [
    {
      key: "name",
      header: "Role",
      sortValue: (row) => row.name,
      render: (row) => (
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground">{row.name}</p>
          <p className="line-clamp-2 text-[10px] text-muted-foreground">{row.description}</p>
        </div>
      ),
    },
    { key: "tier", header: "Tier", render: (r) => <Badge2 tone={r.tier === "Enterprise" ? "danger" : r.tier === "Supervisory" ? "warning" : "muted"}>{r.tier}</Badge2> },
    { key: "members", header: "Members", hideBelow: "sm", sortValue: (r) => r.members, render: (r) => <span className="tabular text-[11px] text-muted-foreground">{formatNumber(r.members)}</span> },
    {
      key: "modules",
      header: "Modules",
      hideBelow: "lg",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.modules.slice(0, 4).map((module) => (
            <Badge2 key={module} tone="muted">
              {module}
            </Badge2>
          ))}
          {row.modules.length > 4 ? (
            <Badge2 tone="info">+{row.modules.length - 4}</Badge2>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <AdminHeader
        title="Roles"
        description="Role catalogue mapping refinery responsibilities to workstation capabilities."
        crumbs={["Enterprise", "Roles"]}
        badges={<Badge2 tone="primary">{roles.data?.length ?? 3} roles defined</Badge2>}
      />
      <GlassPanel>
        <PanelHeading title="Role catalogue" icon={<KeyRound className="size-4" />} />
        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={roles.data ?? []}
            rowKey={(row) => row.id}
            isLoading={roles.isLoading}
            pageSize={6}
            caption="Role catalogue"
          />
        </div>
      </GlassPanel>
      <GlassPanel>
        <PanelHeading
          title="Membership snapshot"
          description="Current assignment of roles across the directory sample."
          icon={<Users className="size-4" />}
        />
        <div className="mt-3">
          <GlassInset>
            {(roles.data ?? []).map((role) => (
              <DetailRow
                key={role.id}
                label={role.name}
                value={`${formatNumber(role.members)} members · ${role.tier}`}
              />
            ))}
            <DetailRow
              label="Employees on this page"
              value={`${(employees.data ?? []).filter((employee) => employee.role === "employee").length} of ${employees.data?.length ?? 0}`}
            />
          </GlassInset>
        </div>
      </GlassPanel>
    </div>
  );
}

/* ------------------------------ permissions ------------------------------ */

export function PermissionsPage() {
  const permissions = usePermissions();
  const { role } = useRole();

  return (
    <div className="space-y-4">
      <AdminHeader
        title="Permissions"
        description="Capability matrix enforced by the gateway and mirrored by the workstation UI."
        crumbs={["Enterprise", "Permissions"]}
        badges={<Badge2 tone="primary">16 capabilities mapped</Badge2>}
      />
      <GlassPanel>
        <PanelHeading
          title="Capability matrix"
          description="Employee, manager and administrator authority per module."
          icon={<ShieldCheck className="size-4" />}
        />
        <div className="mt-4 space-y-2">
          {(permissions.data ?? []).map((permission) => (
            <div key={permission.id} className="glass-inset flex flex-wrap items-center justify-between gap-3 rounded-lg px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-foreground">{permission.capability}</p>
                <p className="text-[10px] text-muted-foreground">{permission.module}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge2 tone={permission.employee ? "success" : "muted"}>Employee {permission.employee ? "✓" : "—"}</Badge2>
                <Badge2 tone={permission.manager ? "success" : "muted"}>Manager {permission.manager ? "✓" : "—"}</Badge2>
                <Badge2 tone={permission.admin ? "success" : "muted"}>Admin {permission.admin ? "✓" : "—"}</Badge2>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
      <GlassPanel>
        <PanelHeading
          title="Frontend capability guard"
          description={`The signed-in session currently resolves to the ${role} personality; UI capability gating is derived from this matrix.`}
          icon={<ShieldCheck className="size-4" />}
        />
        <div className="mt-3">
          <GlassInset>
            {(Object.keys(CAPABILITY_LABELS) as Capability[])
              .slice(0, 8)
              .map((capability) => (
                <DetailRow key={capability} label={CAPABILITY_LABELS[capability]} value={capability} />
              ))}
          </GlassInset>
        </div>
      </GlassPanel>
    </div>
  );
}

/* ------------------------------ departments ------------------------------ */

export function DepartmentsPage() {
  const departments = useDepartments();

  const columns: DataColumn<(typeof DEPARTMENTS_ROW)[number]>[] = [];
  void columns;

  return (
    <div className="space-y-4">
      <AdminHeader
        title="Departments"
        description="Organisation structure, heads, headcount and performance by refinery area."
        crumbs={["Enterprise", "Departments"]}
        badges={<Badge2 tone="primary">{departments.data?.length ?? 0} departments</Badge2>}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {(departments.data ?? []).map((department) => (
          <GlassPanel key={department.id}>
            <PanelHeading
              title={department.name}
              description={`${department.code} · head ${department.head}`}
              icon={<Building2 className="size-4" />}
            />
            <div className="mt-3 space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Headcount</span>
                <span className="tabular font-medium text-foreground">{department.headcount}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Compliance</span>
                  <span className="tabular font-medium text-foreground">{department.compliance}%</span>
                </div>
                <MeterBar value={department.compliance} tone={department.compliance >= 95 ? "success" : "warning"} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Equipment health</span>
                  <span className="tabular font-medium text-foreground">{department.equipmentHealth}%</span>
                </div>
                <MeterBar value={department.equipmentHealth} tone="primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Productivity</span>
                  <span className="tabular font-medium text-foreground">{department.productivity}%</span>
                </div>
                <MeterBar value={department.productivity} tone="success" />
              </div>
              <p className="text-[10px] text-muted-foreground">{department.area}</p>
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}

const DEPARTMENTS_ROW = [] as import("@/types").DepartmentRecord[];

/* -------------------------------- agents --------------------------------- */

export function AgentsPage() {
  const agents = useAgents();
  const [restartTarget, setRestartTarget] = useState<AgentRecord | null>(null);

  const columns: DataColumn<AgentRecord>[] = [
    {
      key: "name",
      header: "Agent",
      sortValue: (row) => row.name,
      render: (row) => (
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground">{row.name}</p>
          <p className="line-clamp-2 text-[10px] text-muted-foreground">{row.purpose}</p>
        </div>
      ),
    },
    { key: "model", header: "Model", hideBelow: "md", render: (r) => <span className="text-[11px] text-muted-foreground">{r.model}</span> },
    { key: "status", header: "State", render: (r) => <StatusBadge status={r.status} /> },
    { key: "requests", header: "Requests 24 h", hideBelow: "sm", sortValue: (r) => r.requests24h, render: (r) => <span className="tabular text-[11px] text-muted-foreground">{formatNumber(r.requests24h)}</span> },
    { key: "accuracy", header: "Accuracy", hideBelow: "lg", sortValue: (r) => r.accuracy, render: (r) => <span className="tabular text-[11px] text-muted-foreground">{(r.accuracy * 100).toFixed(1)}%</span> },
    { key: "latency", header: "p95", hideBelow: "xl", sortValue: (r) => r.latencyMs, render: (r) => <span className="tabular text-[11px] text-muted-foreground">{r.latencyMs} ms</span> },
    {
      key: "action",
      header: "",
      align: "right",
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7 cursor-pointer gap-1 px-2 text-[10px] border-white/70 bg-white/70"
          onClick={(event) => {
            event.stopPropagation();
            setRestartTarget(row);
          }}
        >
          <Activity className="size-3" />
          Restart
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <AdminHeader
        title="AI Agents"
        description="Sovereign agent runtime: purpose, model binding, throughput, accuracy and lifecycle control."
        crumbs={["Enterprise", "AI Agents"]}
        badges={
          <>
            <Badge2 tone="success">
              {(agents.data ?? []).filter((agent) => agent.status === "online").length} online
            </Badge2>
            <Badge2 tone="warning">
              {(agents.data ?? []).filter((agent) => agent.status !== "online").length} attention
            </Badge2>
          </>
        }
      />
      <GlassPanel>
        <PanelHeading
          title="Agent fleet"
          description="Restart, drain or rebind any agent. All actions are audit-logged."
          icon={<Bot className="size-4" />}
        />
        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={agents.data ?? []}
            rowKey={(row) => row.id}
            isLoading={agents.isLoading}
            pageSize={8}
            caption="Agent fleet"
          />
        </div>
      </GlassPanel>

      <Dialog open={restartTarget !== null} onOpenChange={(open) => !open && setRestartTarget(null)}>
        <DialogContent className="glass-strong border-white/80 bg-white/90 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Restart {restartTarget?.name}?</DialogTitle>
            <DialogDescription className="text-xs">
              In-flight requests drain for up to 60 seconds before the new
              process takes the model binding.
            </DialogDescription>
          </DialogHeader>
          <GlassInset>
            <DetailRow label="Model" value={restartTarget?.model ?? "—"} />
            <DetailRow label="Owner" value={restartTarget?.owner ?? "—"} />
            <DetailRow label="Requests 24 h" value={formatNumber(restartTarget?.requests24h ?? 0)} />
          </GlassInset>
          <DialogFooter>
            <Button variant="outline" className="cursor-pointer border-white/70 bg-white/70" onClick={() => setRestartTarget(null)}>
              Cancel
            </Button>
            <Button
              className="cursor-pointer gap-2"
              onClick={() => {
                toast.success("Restart scheduled", {
                  description: `${restartTarget?.name} will rejoin the fleet within a minute.`,
                });
                setRestartTarget(null);
              }}
            >
              <Loader2 className="size-3.5" />
              Restart agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------- models --------------------------------- */

export function ModelsPage() {
  const models = useModels();

  return (
    <div className="space-y-4">
      <AdminHeader
        title="Models"
        description="Sovereign model registry — weights, GPU bindings and serving state."
        crumbs={["Enterprise", "Models"]}
        badges={<Badge2 tone="primary">{models.data?.length ?? 0} models registered</Badge2>}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {(models.data ?? []).map((model) => (
          <GlassPanel key={model.id}>
            <PanelHeading
              title={model.name}
              description={`${model.provider} · loaded ${relativeTime(model.loadedAt)}`}
              icon={<Cpu className="size-4" />}
              action={<StatusBadge status={model.status} />}
            />
            <div className="mt-3">
              <GlassInset>
                <DetailRow label="Parameters" value={model.params} />
                <DetailRow label="Modality" value={model.modality} />
                <DetailRow label="GPU binding" value={model.gpu} />
                <DetailRow label="Loaded" value={relativeTime(model.loadedAt)} />
              </GlassInset>
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- knowledge base ---------------------------- */

export function KnowledgeBasePage() {
  const documents = useDocuments();

  return (
    <div className="space-y-4">
      <AdminHeader
        title="Knowledge Base"
        description="Enterprise corpus, indexing pipeline and retrieval quality governance."
        crumbs={["Enterprise", "Knowledge Base"]}
        badges={
          <>
            <Badge2 tone="primary" icon={<BookOpen className="size-3" />}>
              24,180 documents · 1.28 M chunks
            </Badge2>
            <Badge2 tone="success">Retrieval precision 94.6%</Badge2>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MetricCard label="Documents indexed" value={24180} icon={<FileStack className="size-4" />} caption="Across 8 refinery areas" delta={184} intent="positive" />
        <MetricCard label="Vector chunks" value={1284200} icon={<Database className="size-4" />} tone="info" caption="3 collections" />
        <MetricCard label="Re-index queue" value={42} unit="jobs" tone="warning" icon={<Activity className="size-4" />} caption="Nightly batch" />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <GlassPanel className="xl:col-span-2">
          <PanelHeading
            title="Controlled documents"
            description="Recently indexed corpus additions."
            icon={<FileStack className="size-4" />}
          />
          <div className="mt-4 space-y-2">
            {(documents.data ?? []).slice(0, 6).map((document) => (
              <div key={document.id} className="glass-inset flex items-center justify-between gap-3 rounded-lg px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-foreground">{document.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {document.department} · {document.kind} · {document.pages} pages ·{" "}
                    {relativeTime(document.uploadedAt)}
                  </p>
                </div>
                <StatusBadge status={document.status} />
              </div>
            ))}
          </div>
        </GlassPanel>
        <GlassPanel>
          <PanelHeading
            title="Corpus composition"
            description="Share of indexed documents by origin."
            icon={<Database className="size-4" />}
          />
          <div className="mt-2">
            <DonutChart
              data={[
                { name: "SOPs & procedures", value: 34, color: "#10b981" },
                { name: "Engineering drawings", value: 26, color: "#14b8a6" },
                { name: "Inspection reports", value: 22, color: "#f59e0b" },
                { name: "OEM manuals", value: 12, color: "#6366f1" },
                { name: "Statutory standards", value: 6, color: "#64748b" },
              ]}
              centerValue="24,180"
              centerLabel="documents"
              height={220}
            />
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

/* ------------------------------- audit logs ------------------------------ */

export function AuditLogsPage() {
  const audit = useAuditEvents();

  return (
    <div className="space-y-4">
      <AdminHeader
        title="Audit Logs"
        description="Immutable, tamper-evident record of every privileged action on the platform."
        crumbs={["Enterprise", "Audit Logs"]}
        badges={<Badge2 tone="success">Retention 7 years · hash-chained</Badge2>}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <GlassPanel className="xl:col-span-2">
          <PanelHeading
            title="Event stream"
            description="Newest first. Severity is derived from action and module."
            icon={<ScrollText className="size-4" />}
          />
          {audit.isLoading ? (
            <p className="py-8 text-center text-xs text-muted-foreground">Loading audit trail…</p>
          ) : (
            <div className="mt-4">
              <ActivityTimeline
                items={(audit.data ?? []).map((event) => ({
                  id: event.id,
                  title: `${event.actor} — ${event.action}`,
                  description: `${event.target} · module ${event.module} · from ${event.ip}`,
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
        <div className="space-y-4">
          <GlassPanel>
            <PanelHeading title="Audit summary" icon={<ScrollText className="size-4" />} />
            <div className="mt-3">
              <GlassInset>
                <MetricRow label="Events today" value={214} hint="Across all modules" />
                <MetricRow label="Critical severity" value={(audit.data ?? []).filter((event) => event.severity === "critical").length} hint="Security & enterprise changes" />
                <MetricRow label="Chain integrity" value="Verified" hint="Last check 12 min ago" />
                <MetricRow label="Export" value="SIEM feed active" hint="Splunk-compatible" />
              </GlassInset>
            </div>
          </GlassPanel>
          <GlassPanel>
            <PanelHeading title="Sample integrity" description="Hash chain over the event log." icon={<ShieldCheck className="size-4" />} />
            <div className="mt-3 flex items-center justify-center py-4">
              <RadialGauge value={100} label="Chain verified" caption="0 breaks detected" tone="success" />
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- security ------------------------------- */

export function SecurityPage() {
  const security = useSecurityPosture();

  return (
    <div className="space-y-4">
      <AdminHeader
        title="Security"
        description="Control posture across identity, sovereign AI policy and statutory frameworks."
        crumbs={["Enterprise", "Security"]}
        badges={
          <>
            <Badge2 tone="success">
              {(security.data ?? []).filter((control) => control.status === "enforced").length} enforced
            </Badge2>
            <Badge2 tone="warning">
              {(security.data ?? []).filter((control) => control.status !== "enforced").length} attention
            </Badge2>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {(security.data ?? []).map((control) => (
          <GlassPanel key={control.id}>
            <PanelHeading
              title={control.control}
              description={`${control.framework} · owner ${control.owner} · reviewed ${relativeTime(control.reviewedAt)}`}
              icon={<ShieldCheck className="size-4" />}
              action={<StatusBadge status={control.status} />}
            />
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Coverage</span>
                <span className="tabular font-medium text-foreground">{control.coverage}%</span>
              </div>
              <MeterBar value={control.coverage} tone={control.coverage >= 95 ? "success" : "warning"} />
              <p className="pt-1 text-[10px] text-muted-foreground">
                {control.status === "action-required"
                  ? "Remediation plan due to Internal Audit."
                  : control.status === "monitoring"
                    ? "Evidence collected continuously; no action required."
                    : "Fully enforced with automated evidence collection."}
              </p>
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- system health ----------------------------- */

function SystemInfrastructurePage({
  scope,
}: {
  scope: "health" | "database" | "storage";
}) {
  const system = useSystemMetrics();

  const filtered = useMemo(() => {
    if (scope === "health") return system.data ?? [];
    if (scope === "database") return (system.data ?? []).filter((metric) => ["sm-01", "sm-05", "sm-07", "sm-08"].includes(metric.id));
    return (system.data ?? []).filter((metric) => ["sm-04", "sm-06", "sm-09"].includes(metric.id));
  }, [scope, system.data]);

  return (
    <div className="space-y-4">
      <AdminHeader
        title={
          scope === "health"
            ? "System Health"
            : scope === "database"
              ? "Database"
              : "Storage"
        }
        description={
          scope === "health"
            ? "Cluster, inference fabric, queues and backup freshness for the sovereign deployment."
            : scope === "database"
              ? "Primary and replica datastores powering the workstation."
              : "Object, archive, vector and backup storage pools."
        }
        crumbs={["Enterprise", scope === "health" ? "System Health" : scope === "database" ? "Database" : "Storage"]}
        badges={<Badge2 tone="success">Monitoring · Prometheus + Grafana</Badge2>}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filtered.map((metric) => (
          <GlassPanel key={metric.id}>
            <PanelHeading
              title={metric.label}
              description={metric.detail}
              icon={<Server className="size-4" />}
              action={<StatusBadge status={metric.status} />}
            />
            <div className="mt-4 flex items-center gap-4">
              <RadialGauge
                value={Math.round((metric.value / metric.capacity) * 100)}
                label={`${metric.value.toLocaleString("en-IN")} ${metric.unit}`}
                caption={`Capacity ${metric.capacity.toLocaleString("en-IN")}`}
                tone={metric.status === "critical" ? "danger" : metric.status === "watch" ? "warning" : "success"}
                className="flex-1"
              />
            </div>
          </GlassPanel>
        ))}
      </div>
      <GlassPanel>
        <PanelHeading
          title="Coverage heatmap"
          description="Service availability by area over the last 12 months."
          icon={<Activity className="size-4" />}
        />
        <div className="mt-4">
          <HeatmapGrid
            rows={[
              { area: "API gateway", values: [99, 99, 100, 99, 98, 99, 100, 99, 99, 100, 99, 99] },
              { area: "Inference", values: [97, 98, 96, 97, 99, 98, 97, 98, 99, 97, 98, 99] },
              { area: "Vector store", values: [99, 100, 99, 99, 100, 99, 100, 99, 100, 99, 99, 100] },
              { area: "Document OCR", values: [95, 96, 94, 97, 96, 98, 97, 96, 98, 97, 96, 98] },
              { area: "Vision service", values: [93, 95, 96, 94, 97, 95, 96, 98, 97, 96, 95, 98] },
            ]}
            threshold={95}
          />
        </div>
      </GlassPanel>
    </div>
  );
}

export function SystemHealthPage() {
  return <SystemInfrastructurePage scope="health" />;
}

export function DatabasePage() {
  return <SystemInfrastructurePage scope="database" />;
}

export function StoragePage() {
  return <SystemInfrastructurePage scope="storage" />;
}

export { AdminHeader as AdminPageHeader };

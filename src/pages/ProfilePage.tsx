import { Badge2 } from "@/components/common/Badges";
import { DetailRow, GlassInset, GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { ActivityTimeline } from "@/components/common/ActivityTimeline";
import { useRole } from "@/hooks/use-role";
import { useConversations, useInspections, useTasks } from "@/hooks/use-queries";
import { formatDate, relativeTime } from "@/utils/format";
import { BadgeCheck, Building2, KeyRound, Mail, Phone, ShieldCheck, Timer, UserRound } from "lucide-react";

/** Profile — personal information, access and recent activity. */
export default function ProfilePage() {
  const { profile, roleLabel, assignedRole } = useRole();
  const tasks = useTasks({ assignee: profile.name });
  const inspections = useInspections();
  const conversations = useConversations("profile");

  const openTasks = (tasks.data ?? []).filter((task) => task.status !== "completed").length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="My profile"
        description="Personal information, workstation access and your recent activity across the refinery platform."
        crumbs={[{ label: "Account" }, { label: "Profile" }]}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4">
          <GlassPanel glow>
            <div className="flex items-center gap-4">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/12 text-xl font-bold text-primary">
                {profile.avatarInitials}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold tracking-tight text-foreground">
                  {profile.name}
                </h2>
                <p className="truncate text-xs text-muted-foreground">{profile.designation}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge2 tone="primary">{roleLabel}</Badge2>
                  <Badge2 tone="muted">{profile.employeeId}</Badge2>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <GlassInset>
                <DetailRow label="Email" value={profile.email} />
                <DetailRow label="Phone" value={profile.phone} />
                <DetailRow label="Department" value={profile.department} />
                <DetailRow label="Plant area" value={profile.area} />
                <DetailRow label="Shift" value={profile.shift} />
                <DetailRow label="Location" value={profile.location} />
                <DetailRow label="Joined" value={formatDate(profile.joinedOn)} />
                <DetailRow label="Last active" value={relativeTime(profile.lastActive)} />
              </GlassInset>
            </div>
          </GlassPanel>

          <GlassPanel>
            <PanelHeading
              title="Access & permissions"
              description="What your account can do on this workstation."
              icon={<KeyRound className="size-4" />}
            />
            <ul className="mt-3 space-y-2 text-[11px]">
              {[
                "View personal information and assigned work",
                "Upload documents and inspection imagery",
                "Use AI workspaces — chat, vision, documents, knowledge",
                "Download reports and export conversations",
                "Submit maintenance requests and incident reports",
                roleLabel === "Refinery Employee"
                  ? "No approval authority — requests route to your manager"
                  : "Approve permits, purchases, incidents and procedures",
                assignedRole === "admin"
                  ? "Enterprise administration — users, roles, agents, audit"
                  : "No access to enterprise administration modules",
              ].map((line) => (
                <li key={line} className="glass-inset flex items-start gap-2 rounded-lg px-3 py-2 text-foreground">
                  <BadgeCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  {line}
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>

        <div className="space-y-4 xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <GlassPanel className="text-center">
              <p className="tabular text-2xl font-bold text-foreground">{openTasks}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Open work orders</p>
            </GlassPanel>
            <GlassPanel className="text-center">
              <p className="tabular text-2xl font-bold text-foreground">
                {inspections.data?.length ?? 0}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Inspections this cycle</p>
            </GlassPanel>
            <GlassPanel className="text-center">
              <p className="tabular text-2xl font-bold text-foreground">
                {conversations.data?.length ?? 0}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">AI conversations</p>
            </GlassPanel>
          </div>

          <GlassPanel>
            <PanelHeading
              title="Recent activity"
              description="Your last interactions across tasks, workspaces and reports."
              icon={<UserRound className="size-4" />}
            />
            <div className="mt-4">
              <ActivityTimeline
                items={[
                  {
                    id: "act-1",
                    title: "Verified P-2013B seal flush plan during Shift A rounds",
                    description: "Work order WO-88412 · barrier pressure within tolerance",
                    timestamp: new Date(Date.now() - 2 * 3600_000).toISOString(),
                    tone: "success",
                    icon: <Timer className="size-3" />,
                  },
                  {
                    id: "act-2",
                    title: "Uploaded CDU-2 P&ID Rev 12 to the document workspace",
                    description: "Indexed with 42 tag changes versus Rev 11",
                    timestamp: new Date(Date.now() - 5 * 3600_000).toISOString(),
                    tone: "primary",
                    icon: <Building2 className="size-3" />,
                  },
                  {
                    id: "act-3",
                    title: "Asked the operations copilot about the pressure drift",
                    description: "4-message conversation with 3 cited sources",
                    timestamp: new Date(Date.now() - 7 * 3600_000).toISOString(),
                    tone: "info",
                    icon: <Mail className="size-3" />,
                  },
                  {
                    id: "act-4",
                    title: "Closed 12 CUI findings from the Unit 4 drone survey",
                    description: "Inspection cycle UT4-PIPE · thermography",
                    timestamp: new Date(Date.now() - 30 * 3600_000).toISOString(),
                    tone: "success",
                    icon: <ShieldCheck className="size-3" />,
                  },
                  {
                    id: "act-5",
                    title: "Signed the site safety commitment",
                    description: "Annual HSE acknowledgement recorded",
                    timestamp: new Date(Date.now() - 96 * 3600_000).toISOString(),
                    tone: "warning",
                    icon: <Phone className="size-3" />,
                  },
                ]}
              />
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

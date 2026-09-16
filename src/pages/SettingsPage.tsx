import { Badge2 } from "@/components/common/Badges";
import { GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useRole } from "@/hooks/use-role";
import { ROLE_LABELS, useUiStore } from "@/store/ui-store";
import type { Role } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import {
  Bell,
  Globe,
  Lock,
  Monitor,
  Palette,
  Server,
  Sparkles,
  UserRound,
} from "lucide-react";

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border/60 py-3.5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground">{title}</p>
        {description ? (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/** Settings — workspace preferences; enterprise policy for administrators. */
export default function SettingsPage() {
  const { role, roleLabel } = useRole();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useUiStore((state) => state.setSidebarCollapsed);
  const rolePreview = useUiStore((state) => state.rolePreview);
  const setRolePreview = useUiStore((state) => state.setRolePreview);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [aiDigest, setAiDigest] = useState(false);
  const [density, setDensity] = useState("comfortable");
  const [language, setLanguage] = useState("en-IN");

  return (
    <div className="space-y-4">
      <PageHeader
        title="Settings"
        description={
          role === "admin"
            ? "Personal workspace preferences plus enterprise-wide configuration for the sovereign deployment."
            : "Workspace preferences for your account. Enterprise policy is managed by the platform administration team."
        }
        crumbs={[{ label: "Account" }, { label: "Settings" }]}
        actions={<Badge2 tone="primary">{roleLabel}</Badge2>}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <GlassPanel>
          <PanelHeading
            title="Workspace"
            description="Layout and navigation behaviour."
            icon={<Monitor className="size-4" />}
          />
          <div className="mt-2">
            <SettingRow
              title="Sidebar start state"
              description="Collapsed saves width on control-room displays."
            >
              <Switch checked={collapsed} onCheckedChange={setSidebarCollapsed} />
            </SettingRow>
            <SettingRow
              title="Interface density"
              description="Comfortable spacing is recommended for shift-long sessions."
            >
              <Select value={density} onValueChange={setDensity}>
                <SelectTrigger className="w-40 border-white/70 bg-white/70 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow
              title="Language & region"
              description="Formats dates and numbers for the Katipalla site."
            >
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40 border-white/70 bg-white/70 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-IN">English (India)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="kn">Kannada</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow
              title="Dashboard preview"
              description="Demonstrate the other role dashboards (frontend preview)."
            >
              <Select
                value={rolePreview ?? "default"}
                onValueChange={(value) =>
                  setRolePreview(value === "default" ? null : (value as Role))
                }
              >
                <SelectTrigger className="w-52 border-white/70 bg-white/70 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">My assigned role</SelectItem>
                  {(["employee", "manager", "admin"] as Role[]).map((option) => (
                    <SelectItem key={option} value={option}>
                      {ROLE_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>
          </div>
        </GlassPanel>

        <GlassPanel>
          <PanelHeading
            title="Notifications"
            description="How events reach you."
            icon={<Bell className="size-4" />}
          />
          <div className="mt-2">
            <SettingRow title="In-app notifications" description="Drawer and top-bar badges.">
              <Switch checked={pushAlerts} onCheckedChange={setPushAlerts} />
            </SettingRow>
            <SettingRow title="Email summaries" description="Daily digest to your MRPL mailbox.">
              <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </SettingRow>
            <SettingRow
              title="Critical safety escalation"
              description="Always on for critical alerts — cannot be disabled on the gateway."
            >
              <Switch checked onCheckedChange={() => undefined} disabled />
            </SettingRow>
            <SettingRow
              title="AI findings digest"
              description="Vision and document agent findings bundled hourly."
            >
              <Switch checked={aiDigest} onCheckedChange={setAiDigest} />
            </SettingRow>
          </div>
        </GlassPanel>

        <GlassPanel>
          <PanelHeading
            title="AI preferences"
            description="How the copilot works for you."
            icon={<Sparkles className="size-4" />}
          />
          <div className="mt-3 space-y-2 text-[11px] leading-5 text-muted-foreground">
            <p className="glass-inset rounded-lg px-3 py-2">
              <span className="font-medium text-foreground">Grounding:</span> answers always
              cite SOPs, standards and historian context from the sovereign corpus.
            </p>
            <p className="glass-inset rounded-lg px-3 py-2">
              <span className="font-medium text-foreground">Egress:</span> prompts and
              attachments never leave MRPL infrastructure. Model egress is blocked by policy.
            </p>
            <p className="glass-inset rounded-lg px-3 py-2">
              <span className="font-medium text-foreground">Authority:</span> the copilot
              advises; engineers and console operators retain decision authority.
            </p>
          </div>
          <Separator className="my-3" />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="cursor-pointer"
              onClick={() => toast.success("Preferences saved")}
            >
              Save preferences
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer border-white/70 bg-white/70"
              onClick={() =>
                toast("Workspace reset", { description: "Layout restored to defaults." })
              }
            >
              Reset layout
            </Button>
          </div>
        </GlassPanel>

        {role === "admin" ? (
          <GlassPanel>
            <PanelHeading
              title="Enterprise policy"
              description="Sovereign configuration applied platform-wide."
              icon={<Server className="size-4" />}
            />
            <div className="mt-2">
              <SettingRow
                title="AI data residency"
                description="All inference on-premise; public model APIs blocked."
              >
                <Badge2 tone="success">Enforced</Badge2>
              </SettingRow>
              <SettingRow
                title="Audit retention"
                description="Immutable log retained for statutory review."
              >
                <Badge2 tone="primary">7 years</Badge2>
              </SettingRow>
              <SettingRow
                title="Session policy"
                description="Idle timeout in hours for control-room terminals."
              >
                <Input
                  defaultValue="8"
                  className="h-8 w-20 border-white/70 bg-white/70 text-center text-xs"
                />
              </SettingRow>
              <SettingRow
                title="Backup cadence"
                description="Incremental every 4 hours, full nightly."
              >
                <Badge2 tone="info">Active</Badge2>
              </SettingRow>
            </div>
          </GlassPanel>
        ) : (
          <GlassPanel>
            <PanelHeading
              title="Security"
              description="Account protection managed by the enterprise IdP."
              icon={<Lock className="size-4" />}
            />
            <div className="mt-3 space-y-2 text-[11px] leading-5 text-muted-foreground">
              <p className="glass-inset rounded-lg px-3 py-2">
                <span className="font-medium text-foreground">Multi-factor:</span> enforced
                by the refinery identity provider at every sign-in.
              </p>
              <p className="glass-inset rounded-lg px-3 py-2">
                <span className="font-medium text-foreground">Session:</span> 8-hour idle
                timeout on shared control-room terminals.
              </p>
              <p className="glass-inset rounded-lg px-3 py-2">
                <span className="font-medium text-foreground">Downloads:</span> every export
                is watermarked and logged to the audit trail.
              </p>
            </div>
          </GlassPanel>
        )}
      </div>

      <GlassPanel>
        <PanelHeading
          title="Session"
          description="Current sign-in context for this workstation."
          icon={<Globe className="size-4" />}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge2 tone="success">
            Signed in · {ROLE_LABELS[role]}
          </Badge2>
          <Badge2 tone="muted" icon={<UserRound className="size-3" />}>
            Katipalla Refinery · Mangaluru
          </Badge2>
          <Badge2 tone="info" icon={<Palette className="size-3" />}>
            Light glass theme
          </Badge2>
        </div>
      </GlassPanel>
    </div>
  );
}

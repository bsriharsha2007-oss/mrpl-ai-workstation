import { Badge2, PriorityBadge } from "@/components/common/Badges";
import { ActivityTimeline } from "@/components/common/ActivityTimeline";
import { GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, LoadingState } from "@/components/common/States";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useNotificationsByCategory,
  useSafetyAlerts,
} from "@/hooks/use-queries";
import { cn } from "@/lib/utils";
import type { NotificationCategory } from "@/types";
import { relativeTime } from "@/utils/format";
import {
  Bell,
  Bot,
  CheckCheck,
  ClipboardCheck,
  ListChecks,
  Server,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

const FILTERS: { value: NotificationCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "task", label: "Tasks" },
  { value: "approval", label: "Approvals" },
  { value: "ai", label: "AI" },
  { value: "system", label: "System" },
  { value: "safety", label: "Safety" },
];

const ICONS: Record<NotificationCategory, typeof Bell> = {
  task: ListChecks,
  approval: ClipboardCheck,
  ai: Bot,
  system: Server,
  safety: ShieldAlert,
};

/** Notification Centre — categorised feed with timeline and filters. */
export default function NotificationsPage() {
  const [filter, setFilter] = useState<NotificationCategory | "all">("all");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const { data, isLoading } = useNotificationsByCategory(filter);
  const safety = useSafetyAlerts();
  const navigate = useNavigate();

  const all = data ?? [];
  const unread = all.filter((item) => !item.read && !readIds.has(item.id));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notification Centre"
        description="Every task, approval, AI, system and safety event routed to you, with priority indicators and a full timeline."
        crumbs={[{ label: "Workspaces" }, { label: "Notifications" }]}
        actions={
          <button
            type="button"
            className="glass-inset flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40"
            onClick={() => setReadIds(new Set(all.map((item) => item.id)))}
          >
            <CheckCheck className="size-3.5 text-primary" />
            Mark all as read
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <GlassPanel>
            <PanelHeading
              title="Categorised feed"
              description={`${all.length} notifications · ${unread.length} unread`}
              icon={<Bell className="size-4" />}
            />
            <div className="mt-3">
              <Tabs value={filter} onValueChange={(value) => setFilter(value as NotificationCategory | "all")}>
                <TabsList className="w-full justify-start overflow-x-auto bg-white/60">
                  {FILTERS.map((option) => (
                    <TabsTrigger key={option.value} value={option.value} className="text-[11px]">
                      {option.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="mt-4 space-y-2">
              {isLoading ? (
                <LoadingState label="Loading notifications…" minHeight={180} />
              ) : all.length === 0 ? (
                <EmptyState
                  title="Nothing in this category"
                  description="Events will appear here the moment they are routed to you."
                />
              ) : (
                all.map((notification) => {
                  const Icon = ICONS[notification.category];
                  const read = notification.read || readIds.has(notification.id);
                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => {
                        setReadIds((current) => new Set(current).add(notification.id));
                        if (notification.href) navigate(notification.href);
                      }}
                      className={cn(
                        "flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40",
                        read ? "border-border/70 bg-white/50" : "border-teal-200/70 bg-teal-50/55",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                          read ? "border-slate-200/80 bg-white/70 text-slate-500" : "border-teal-200/80 bg-white/85 text-primary",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-foreground">
                            {notification.title}
                          </p>
                          <div className=

[FILE_TOO_LARGE]: The combined read_files output exceeded the 100,000 character hard limit. This file was truncated after 5,549 characters. Read it separately or use code_search for the relevant section.
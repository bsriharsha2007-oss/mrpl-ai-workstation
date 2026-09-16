import { Badge2, PriorityBadge } from "@/components/common/Badges";
import { EmptyState, LoadingState } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/hooks/use-queries";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import type { AppNotification, NotificationCategory } from "@/types";
import { relativeTime } from "@/utils/format";
import {
  BellRing,
  Bot,
  CheckCheck,
  ClipboardCheck,
  ListChecks,
  Server,
  ShieldAlert,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

const CATEGORY_FILTERS: { value: NotificationCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "task", label: "Tasks" },
  { value: "approval", label: "Approvals" },
  { value: "ai", label: "AI" },
  { value: "system", label: "System" },
  { value: "safety", label: "Safety" },
];

const CATEGORY_ICON: Record<NotificationCategory, typeof ListChecks> = {
  task: ListChecks,
  approval: ClipboardCheck,
  ai: Bot,
  system: Server,
  safety: ShieldAlert,
};

const CATEGORY_TONE: Record<NotificationCategory, "primary" | "info" | "success" | "warning" | "danger"> = {
  task: "primary",
  approval: "info",
  ai: "success",
  system: "warning",
  safety: "danger",
};

function NotificationRow({
  notification,
  read,
  onOpen,
}: {
  notification: AppNotification;
  read: boolean;
  onOpen: () => void;
}) {
  const Icon = CATEGORY_ICON[notification.category];
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-all duration-200 hover:border-primary/40 hover:bg-white/70",
        read
          ? "border-border/70 bg-white/45"
          : "border-teal-200/70 bg-teal-50/50",
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border",
            read
              ? "border-slate-200/80 bg-white/70 text-slate-500"
              : "border-teal-200/80 bg-white/80 text-primary",
          )}
        >
          <Icon className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold leading-4 text-foreground">
              {notification.title}
            </p>
            {!read ? (
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
            ) : null}
          </div>
          <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
            {notification.body}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <PriorityBadge priority={notification.priority} />
            <Badge2 tone={CATEGORY_TONE[notification.category]}>
              {notification.category}
            </Badge2>
            <span className="text-[10px] text-muted-foreground">
              {notification.actor ? `${notification.actor} · ` : ""}
              {relativeTime(notification.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

/** Right-hand notification centre with category filters and read state. */
export function NotificationDrawer() {
  const open = useUiStore((state) => state.notificationsOpen);
  const setOpen = useUiStore((state) => state.setNotificationsOpen);
  const { data, isLoading } = useNotifications();
  const [filter, setFilter] = useState<NotificationCategory | "all">("all");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const items = useMemo(() => {
    const list = data ?? [];
    return filter === "all"
      ? list
      : list.filter((item) => item.category === filter);
  }, [data, filter]);

  const unread = (data ?? []).filter((item) => !item.read && !readIds.has(item.id));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="glass-strong w-full border-l border-white/70 bg-white/85 p-0 sm:max-w-[430px]"
      >
        <SheetHeader className="border-b border-border/60 px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-sm">
            <BellRing className="size-4 text-primary" />
            Notification centre
          </SheetTitle>
          <SheetDescription className="text-xs">
            {unread.length} unread · {data?.length ?? 0} total across tasks,
            approvals, AI agents, safety and platform events.
          </SheetDescription>
          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer gap-1.5 border-white/70 bg-white/70 text-xs"
              onClick={() =>
                setReadIds(new Set((data ?? []).map((item) => item.id)))
              }
            >
              <CheckCheck className="size-3.5" />
              Mark all as read
            </Button>
          </div>
        </SheetHeader>

        <div className="px-4 pt-3">
          <Tabs
            value={filter}
            onValueChange={(value) => setFilter(value as NotificationCategory | "all")}
          >
            <TabsList className="w-full justify-start overflow-x-auto bg-white/60">
              {CATEGORY_FILTERS.map((option) => (
                <TabsTrigger
                  key={option.value}
                  value={option.value}
                  className="text-[11px]"
                >
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="thin-scroll h-[calc(100vh-190px)] px-4 pb-4">
          {isLoading ? (
            <LoadingState label="Loading notifications…" minHeight={140} />
          ) : items.length === 0 ? (
            <EmptyState
              title="No notifications in this category"
              description="Task, approval, AI, system and safety events will appear here as they happen."
              className="mt-4"
            />
          ) : (
            <div className="space-y-2 pt-3">
              {items.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  read={notification.read || readIds.has(notification.id)}
                  onOpen={() => {
                    setReadIds((current) => new Set(current).add(notification.id));
                    if (notification.href) {
                      setOpen(false);
                      navigate(notification.href);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

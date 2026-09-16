import { AiAssistant } from "@/features/shell/AiAssistant";
import { CommandPalette } from "@/features/shell/CommandPalette";
import { NotificationDrawer } from "@/features/shell/NotificationDrawer";
import {
  MobileSidebar,
  Sidebar,
  type NavBadges,
} from "@/features/shell/Sidebar";
import { pageTitleFromPath, TopNav } from "@/features/shell/TopNav";
import { StatusBar } from "@/features/shell/StatusBar";
import {
  useApprovals,
  useNotifications,
  useStatusBar,
  useTasks,
} from "@/hooks/use-queries";
import { useRole } from "@/hooks/use-role";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";

/**
 * AppLayout — the workstation shell.
 *
 * Persistent glass sidebar, sticky top navigation, scrollable content area,
 * notification drawer, command palette, floating AI assistant and a footer
 * status bar, all assembled once for every authenticated route.
 */
export default function AppLayout() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const mobileNavOpen = useUiStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const setCommandOpen = useUiStore((state) => state.setCommandOpen);
  const { role, profile } = useRole();
  const location = useLocation();

  const tasksQuery = useTasks({
    assignee: role === "employee" ? profile.name : undefined,
  });
  const approvalsQuery = useApprovals("pending");
  const notificationsQuery = useNotifications();
  const statusBarQuery = useStatusBar();

  const badges: NavBadges = {
    tasks: (tasksQuery.data ?? []).filter((task) => task.status !== "completed")
      .length,
    approvals: (approvalsQuery.data ?? []).filter(
      (item) => item.status === "pending",
    ).length,
    notifications: (notificationsQuery.data ?? []).filter((item) => !item.read)
      .length,
  };

  // Ctrl / ⌘ + K opens the command palette; Escape closes overlays.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandOpen]);

  useEffect(() => {
    document.title = `${pageTitleFromPath(location.pathname)} · MRPL Sovereign AI Workstation`;
  }, [location.pathname]);

  return (
    <div className="app-canvas min-h-screen">
      <Sidebar badges={badges} />
      <MobileSidebar
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
        badges={badges}
      />

      <div
        className={cn(
          "relative z-10 flex min-h-screen flex-col transition-[padding] duration-300 ease-out",
          collapsed ? "lg:pl-[76px]" : "lg:pl-[268px]",
        )}
      >
        <TopNav
          badges={badges}
          unreadCount={badges.notifications}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="mx-auto w-full max-w-[1640px] flex-1 px-3 pt-4 pb-14 sm:px-5 lg:px-6">
          <Outlet />
        </main>

        <StatusBar info={statusBarQuery.data} userName={profile.name} />
      </div>

      <NotificationDrawer />
      <CommandPalette />
      <AiAssistant />
    </div>
  );
}

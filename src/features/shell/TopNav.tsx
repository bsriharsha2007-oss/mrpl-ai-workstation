import { Badge2 } from "@/components/common/Badges";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { NavBadges } from "@/features/shell/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, useUiStore } from "@/store/ui-store";
import { relativeTime } from "@/utils/format";
import {
  Bell,
  Bot,
  ChevronDown,
  Command,
  Cpu,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MessagesSquare,
  ScanEye,
  Search,
  Settings,
  Sparkles,
  UserRound,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 10_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

const AGENT_BY_PATH: { match: RegExp; agent: string; model: string }[] = [
  { match: /^\/vision/, agent: "Vision Inspector", model: "mrpl-vision-34b" },
  { match: /^\/documents/, agent: "Document Intelligence", model: "mrpl-doc-70b" },
  { match: /^\/knowledge/, agent: "Knowledge Retrieval", model: "mrpl-retriever-8b" },
  { match: /^\/reports/, agent: "Report Writer", model: "mrpl-sovereign-70b" },
  { match: /^\/(tasks|approvals|planning|maintenance|calendar)/, agent: "Operations Copilot", model: "mrpl-sovereign-70b" },
  { match: /^\/(users|roles|permissions|audit-logs|security|system-health|database|storage|models|ai-agents)/, agent: "Compliance Sentinel", model: "mrpl-guard-13b" },
];

export function pageTitleFromPath(pathname: string): string {
  const titles: Record<string, string> = {
    "/workstation": "AI Workspace",
    "/dashboard": "Dashboard",
    "/tasks": "My Tasks",
    "/vision": "Vision Workspace",
    "/documents": "Document Workspace",
    "/knowledge": "Knowledge Search",
    "/chat": "AI Chat Workspace",
    "/reports": "Reports Workspace",
    "/downloads": "Downloads",
    "/notifications": "Notification Centre",
    "/profile": "Profile",
    "/settings": "Settings",
    "/department": "Department",
    "/team": "Team",
    "/approvals": "Approvals",
    "/planning": "Planning",
    "/maintenance": "Maintenance",
    "/analytics": "Analytics",
    "/calendar": "Calendar",
    "/users": "Users",
    "/roles": "Roles",
    "/permissions": "Permissions",
    "/departments": "Departments",
    "/ai-agents": "AI Agents",
    "/models": "Models",
    "/knowledge-base": "Knowledge Base",
    "/audit-logs": "Audit Logs",
    "/security": "Security",
    "/system-health": "System Health",
    "/database": "Database",
    "/storage": "Storage",
  };
  return titles[pathname] ?? "Workstation";
}

/** Cross-role shortcuts surfaced by the command palette. */
export const QUICK_ACTIONS: { label: string; to: string }[] = [
  { label: "Start a new AI conversation", to: "/workstation" },
  { label: "Analyse an inspection image", to: "/vision" },
  { label: "Upload a document or drawing", to: "/documents" },
  { label: "Search the knowledge base", to: "/knowledge" },
  { label: "Generate a report", to: "/reports" },
  { label: "Review my tasks", to: "/tasks" },
];

export function TopNav({
  badges,
  unreadCount,
  onOpenMobileNav,
}: {
  badges: NavBadges;
  unreadCount: number;
  onOpenMobileNav: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { role, roleLabel, profile } = useRole();
  const setCommandOpen = useUiStore((state) => state.setCommandOpen);
  const toggleNotifications = useUiStore((state) => state.toggleNotifications);
  const now = useClock();

  // The agent shown tracks what surface the operator is working in.
  const contextAgent =
    AGENT_BY_PATH.find((entry) => entry.match.test(location.pathname)) ?? {
      agent: "Operations Copilot",
      model: "mrpl-sovereign-70b",
    };

  return (
    <header className="glass-strong sticky top-0 z-30 border-b border-white/70">
      <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-5">
        <Button
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer lg:hidden"
          aria-label="Open navigation"
          onClick={onOpenMobileNav}
        >
          <Menu className="size-4" />
        </Button>

        {/* Brand */}
        <button
          type="button"
          onClick={() => navigate("/workstation")}
          className="flex cursor-pointer items-center gap-2.5"
          aria-label="MRPL AI Workspace"
        >
          <img src="/mrpl-mark.svg" alt="MRPL" className="size-8 shrink-0 rounded-lg" />
          <span className="hidden min-w-0 flex-col md:flex">
            <span className="truncate text-[13px] font-bold leading-4 tracking-tight text-foreground">
              MRPL Sovereign AI Workstation
            </span>
            <span className="truncate text-[11px] leading-4 text-muted-foreground">
              {pageTitleFromPath(location.pathname)} · Katipalla Refinery
            </span>
          </span>
        </button>

        {/* Global search */}
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="glass-inset group flex h-9 flex-1 cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 lg:max-w-md"
        >
          <Search className="size-3.5 shrink-0 text-slate-400 group-hover:text-primary" />
          <span className="truncate">Search tasks, assets, documents, SOPs…</span>
          <span className="tabular ml-auto hidden items-center gap-1 rounded border border-border/80 bg-white/70 px-1.5 py-0.5 text-[10px] font-medium sm:flex">
            <Command className="size-2.5" />K
          </span>
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Role badge */}
          <Badge2 tone="primary" className="hidden lg:inline-flex">
            {roleLabel}
          </Badge2>

          {/* Active agent chip */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => navigate("/workstation")}
                  className="glass-inset hidden cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:border-primary/40 xl:flex"
                >
                  <Bot className="size-3.5 text-primary" />
                  <span className="leading-3.5">
                    <span className="block text-[11px] font-semibold text-foreground">
                      {contextAgent.agent}
                    </span>
                    <span className="block text-[9px] text-muted-foreground">
                      {contextAgent.model}
                    </span>
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                Current AI agent — click to open the AI Workspace
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Live clock */}
          <span className="glass-inset tabular hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-foreground 2xl:flex">
            <Cpu className="size-3 text-emerald-600" />
            {now.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}{" "}
            IST
          </span>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="relative cursor-pointer"
                  aria-label="Notifications"
                  onClick={() => toggleNotifications()}
                >
                  <Bell className="size-4" />
                  {unreadCount > 0 ? (
                    <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
                      {unreadCount}
                    </span>
                  ) : null}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                {unreadCount} unread · {badges.approvals} approvals pending
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-primary"
                  aria-label="Open AI assistant"
                  onClick={() => navigate("/workstation")}
                >
                  <Sparkles className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Open the AI Workspace</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "glass-inset flex cursor-pointer items-center gap-2 rounded-lg py-1 pr-2 pl-1 transition-colors hover:border-primary/40",
                )}
                aria-label="Account menu"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/12 text-[10px] font-semibold text-primary">
                  {profile.avatarInitials}
                </span>
                <span className="hidden text-left leading-4 sm:block">
                  <span className="block text-[11px] font-semibold text-foreground">
                    {profile.name}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    {profile.employeeId}
                  </span>
                </span>
                <ChevronDown className="size-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground">{profile.name}</p>
                <p className="text-[11px] font-normal text-muted-foreground">
                  {profile.designation}
                </p>
                <p className="text-[11px] font-normal text-muted-foreground">
                  {profile.department} · {profile.shift}
                </p>
                <p className="text-[10px] font-normal text-muted-foreground/80">
                  Last active {relativeTime(profile.lastActive)}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-xs"
                onClick={() => navigate("/workstation")}
              >
                <MessagesSquare className="size-3.5 text-muted-foreground" />
                AI Workspace
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-xs"
                onClick={() => navigate("/dashboard")}
              >
                <LayoutDashboard className="size-3.5 text-muted-foreground" />
                My dashboard
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-xs"
                onClick={() => navigate("/profile")}
              >
                <UserRound className="size-3.5 text-muted-foreground" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-xs"
                onClick={() => navigate("/settings")}
              >
                <Settings className="size-3.5 text-muted-foreground" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-xs"
                onClick={() => setCommandOpen(true)}
              >
                <LifeBuoy className="size-3.5 text-muted-foreground" />
                Command palette &amp; help
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
                onClick={async () => {
                  await signOut();
                }}
              >
                <LogOut className="size-3.5" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

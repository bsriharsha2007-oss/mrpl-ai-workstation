import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NAV_BY_ROLE, ROUTE_TITLES, type NavBadge } from "@/features/nav/nav-config";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import { motion } from "framer-motion";
import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router";

export interface NavBadges {
  tasks: number;
  approvals: number;
  notifications: number;
}

function MrplMark({ size = 36 }: { size?: number }) {
  return (
    <img
      src="/mrpl-mark.svg"
      alt="MRPL"
      width={size}
      height={size}
      className="shrink-0 rounded-[10px]"
    />
  );
}

function BrandBlock({ collapsed }: { collapsed: boolean }) {
  const { roleLabel } = useRole();
  return (
    <div className="flex items-center gap-2.5 overflow-hidden px-3 py-3.5">
      <MrplMark />
      {!collapsed ? (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          className="min-w-0"
        >
          <p className="truncate text-sm font-bold leading-4 tracking-tight text-foreground">
            MRPL
          </p>
          <p className="truncate text-[11px] leading-4 text-muted-foreground">
            Sovereign AI Workstation
          </p>
          <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-wide text-primary">
            {roleLabel}
          </p>
        </motion.div>
      ) : null}
    </div>
  );
}

function NavList({
  collapsed,
  badges,
  onNavigate,
}: {
  collapsed: boolean;
  badges: NavBadges;
  onNavigate?: () => void;
}) {
  const { role } = useRole();
  const sections = NAV_BY_ROLE[role];

  return (
    <TooltipProvider delayDuration={200}>
      <nav className="space-y-4 px-2 pb-4">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed ? (
              <p className="px-3 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                {section.title}
              </p>
            ) : (
              <div className="mx-2 my-1.5 h-px bg-border/70" aria-hidden />
            )}
            {section.items.map((item) => {
              const count = item.badge ? badges[item.badge as NavBadge] : 0;
              const Icon = item.icon;
              const link = (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200",
                      collapsed && "justify-center px-2",
                      isActive
                        ? "nav-active-glow border border-teal-200/70 bg-teal-50/75 text-teal-800"
                        : "border border-transparent text-slate-600 hover:bg-white/70 hover:text-foreground",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <motion.span
                          layoutId="nav-rail"
                          className="absolute left-0 h-5 w-[3px] rounded-r-full bg-primary"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      ) : null}
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-colors",
                          isActive
                            ? "text-primary"
                            : "text-slate-400 group-hover:text-slate-600",
                        )}
                      />
                      {!collapsed ? (
                        <>
                          <span className="truncate">{item.label}</span>
                          {count > 0 ? (
                            <span className="tabular ml-auto rounded-full border border-amber-200/80 bg-amber-50/90 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                              {count}
                            </span>
                          ) : null}
                        </>
                      ) : count > 0 ? (
                        <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-amber-500" />
                      ) : null}
                    </>
                  )}
                </NavLink>
              );

              return collapsed ? (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    <span className="font-medium">{item.label}</span>
                    {item.hint ? (
                      <span className="block text-muted-foreground">{item.hint}</span>
                    ) : null}
                  </TooltipContent>
                </Tooltip>
              ) : (
                link
              );
            })}
          </div>
        ))}
      </nav>
    </TooltipProvider>
  );
}

function AccountBlock({ collapsed }: { collapsed: boolean }) {
  const { profile, roleLabel } = useRole();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "glass-inset mx-2 mb-2 flex items-center gap-2.5 rounded-lg p-2.5",
        collapsed && "justify-center",
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-semibold text-primary">
        {profile.avatarInitials}
      </span>
      {!collapsed ? (
        <>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">
              {profile.name}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">{roleLabel}</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Sign out"
            className="cursor-pointer text-muted-foreground hover:text-destructive"
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
          >
            <LogOut className="size-3.5" />
          </Button>
        </>
      ) : null}
    </div>
  );
}

/** Fixed desktop sidebar with animated collapse. */
export function Sidebar({ badges }: { badges: NavBadges }) {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 268 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="glass fixed top-0 left-0 z-40 hidden h-screen flex-col border-r border-white/70 lg:flex"
    >
      <BrandBlock collapsed={collapsed} />
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
        {!collapsed ? (
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <Sparkles className="size-3 text-primary" />
            Agentic platform
          </span>
        ) : null}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn("cursor-pointer text-muted-foreground", collapsed && "mx-auto")}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
      </div>
      <ScrollArea className="thin-scroll flex-1 pt-2">
        <NavList collapsed={collapsed} badges={badges} />
      </ScrollArea>
      <AccountBlock collapsed={collapsed} />
    </motion.aside>
  );
}

/** Tablet / phone navigation drawer. */
export function MobileSidebar({
  open,
  onOpenChange,
  badges,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badges: NavBadges;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="glass-strong w-[280px] border-r border-white/70 bg-white/85 p-0 sm:max-w-[280px]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>MRPL workstation navigation</SheetTitle>
        </SheetHeader>
        <BrandBlock collapsed={false} />
        <ScrollArea className="thin-scroll h-[calc(100vh-140px)]">
          <NavList collapsed={false} badges={badges} onNavigate={() => onOpenChange(false)} />
        </ScrollArea>
        <AccountBlock collapsed={false} />
      </SheetContent>
    </Sheet>
  );
}

/** Convenience helper for the shell header title. */
export function titleForPath(pathname: string): string {
  return ROUTE_TITLES[pathname] ?? "Workstation";
}

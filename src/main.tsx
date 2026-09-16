import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

// Lazy load route components for better code splitting
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const AppLayout = lazy(() => import("./layouts/AppLayout.tsx"));
const WorkstationPage = lazy(() => import("./pages/workspaces/WorkstationPage.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const TasksPage = lazy(() => import("./pages/TasksPage.tsx"));
const VisionWorkspace = lazy(() => import("./pages/workspaces/VisionWorkspace.tsx"));
const DocumentWorkspace = lazy(() => import("./pages/workspaces/DocumentWorkspace.tsx"));
const KnowledgeWorkspace = lazy(() => import("./pages/workspaces/KnowledgeWorkspace.tsx"));
const ChatWorkspace = lazy(() => import("./pages/workspaces/ChatWorkspace.tsx"));
const ReportsWorkspace = lazy(() => import("./pages/workspaces/ReportsWorkspace.tsx"));
const DownloadsPage = lazy(() => import("./pages/DownloadsPage.tsx"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage.tsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.tsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.tsx"));
const ApprovalsPage = lazy(() => import("./pages/manager/ApprovalsPage.tsx"));
const TeamPage = lazy(() => import("./pages/manager/TeamPage.tsx"));
const DepartmentPage = lazy(() => import("./pages/manager/DepartmentPage.tsx"));
const PlanningPage = lazy(() => import("./pages/manager/PlanningPage.tsx"));
const MaintenancePage = lazy(() => import("./pages/manager/MaintenancePage.tsx"));
const CalendarPage = lazy(() => import("./pages/manager/CalendarPage.tsx"));
const AnalyticsPage = lazy(() => import("./pages/manager/AnalyticsPage.tsx"));
const {
  UsersPage,
  RolesPage,
  PermissionsPage,
  DepartmentsPage,
  AgentsPage,
  ModelsPage,
  KnowledgeBasePage,
  AuditLogsPage,
  SecurityPage,
  SystemHealthPage,
  DatabasePage,
  StoragePage,
} = {
  UsersPage: lazy(() => import("./pages/admin/AdminPages").then((m) => ({ default: m.UsersPage }))),
  RolesPage: lazy(() => import("./pages/admin/AdminPages").then((m) => ({ default: m.RolesPage }))),
  PermissionsPage: lazy(() => import("./pages/admin/AdminPages").then((m) => ({ default: m.PermissionsPage }))),
  DepartmentsPage: lazy(() => import("./pages/admin/AdminPages").then((m) => ({ default: m.DepartmentsPage }))),
  AgentsPage: lazy(() => import("./pages/admin/AdminPages").then((m) => ({ default: m.AgentsPage }))),
  ModelsPage: lazy(() => import("./pages/admin/AdminPages").then((m) => ({ default: m.ModelsPage }))),
  KnowledgeBasePage: lazy(() => import("./pages/admin/AdminPages").then((m) => ({ default: m.KnowledgeBasePage }))),
  AuditLogsPage: lazy(() => import("./pages/admin/AdminPages").then((m) => ({ default: m.AuditLogsPage }))),
  SecurityPage: lazy(() => import("./pages/admin/AdminPages").then((m) => ({ default: m.SecurityPage }))),
  SystemHealthPage: lazy(() => import("./pages/admin/AdminPages").then((m) => ({ default: m.SystemHealthPage }))),
  DatabasePage: lazy(() => import("./pages/admin/AdminPages").then((m) => ({ default: m.DatabasePage }))),
  StoragePage: lazy(() => import("./pages/admin/AdminPages").then((m) => ({ default: m.StoragePage }))),
};
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="app-canvas flex min-h-screen items-center justify-center">
      <div className="glass flex items-center gap-3 rounded-xl px-5 py-4">
        <span className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">
          Loading MRPL workstation…
        </span>
      </div>
    </div>
  );
}

/** Silent error boundary — if VlyToolbar crashes it renders nothing instead of
 *  crashing the whole app (e.g. hook errors in the browser runtime). */
class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[VlyToolbar] Caught error, toolbar disabled:", err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[Preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="app-canvas flex min-h-screen items-center justify-center p-6 text-foreground">
          <div className="glass max-w-lg rounded-xl p-6 text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 text-xs break-words text-muted-foreground">
              {this.state.message}
            </p>
            {this.state.stack ? (
              <pre className="thin-scroll mt-3 max-h-40 overflow-auto rounded border border-border/60 p-2 text-left text-[10px] leading-4 text-muted-foreground/80">
                {this.state.stack}
              </pre>
            ) : null}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

/** All authenticated workstation pages live under the shared shell layout. */
function WorkstationRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="workstation" element={<WorkstationPage />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="vision" element={<VisionWorkspace />} />
        <Route path="documents" element={<DocumentWorkspace />} />
        <Route path="knowledge" element={<KnowledgeWorkspace />} />
        <Route path="chat" element={<ChatWorkspace />} />
        <Route path="reports" element={<ReportsWorkspace />} />
        <Route path="downloads" element={<DownloadsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        {/* Manager */}
        <Route path="department" element={<DepartmentPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="planning" element={<PlanningPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        {/* Administrator */}
        <Route path="users" element={<UsersPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="permissions" element={<PermissionsPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="ai-agents" element={<AgentsPage />} />
        <Route path="models" element={<ModelsPage />} />
        <Route path="knowledge-base" element={<KnowledgeBasePage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="security" element={<SecurityPage />} />
        <Route path="system-health" element={<SystemHealthPage />} />
        <Route path="database" element={<DatabasePage />} />
        <Route path="storage" element={<StoragePage />} />
      </Route>
    </Routes>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <VlyToolbar />
      </ToolbarErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConvexAuthProvider client={convex}>
          <BrowserRouter>
            <RouteSyncer />
            <Suspense fallback={<RouteLoading />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route
                  path="/auth"
                  element={<AuthPage redirectAfterAuth="/dashboard" />}
                />
                <Route
                  path="*"
                  element={
                    <RequireAuth redirectImmediately>
                      <WorkstationRoutes />
                    </RequireAuth>
                  }
                />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster />
        </ConvexAuthProvider>
      </QueryClientProvider>
    </RootErrorBoundary>
  </StrictMode>,
);

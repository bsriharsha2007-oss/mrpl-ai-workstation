import type { Role } from "@/types";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Building2,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  Cpu,
  Database,
  Download,
  FileStack,
  FileText,
  Gauge,
  HardDrive,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  ScanEye,
  ScrollText,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";

export type NavBadge = "tasks" | "approvals" | "notifications";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: NavBadge;
  /** Short description used by the command palette. */
  hint?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/** Left navigation per dashboard personality. */
export const NAV_BY_ROLE: Record<Role, NavSection[]> = {
  employee: [
    {
      title: "Operate",
      items: [
        {
          label: "AI Workspace",
          to: "/workstation",
          icon: Sparkles,
          hint: "Sovereign AI control center — chat, agents and document context",
        },
        {
          label: "Dashboard",
          to: "/dashboard",
          icon: LayoutDashboard,
          hint: "Shift overview, tasks and safety alerts",
        },
        {
          label: "My Tasks",
          to: "/tasks",
          icon: ListChecks,
          badge: "tasks",
          hint: "Assigned work orders and inspections",
        },
      ],
    },
    {
      title: "AI Workspaces",
      items: [
        { label: "Vision Workspace", to: "/vision", icon: ScanEye, hint: "Inspection image analysis" },
        { label: "Document Workspace", to: "/documents", icon: FileStack, hint: "Drawings, SOPs and datasheets" },
        { label: "Knowledge Search", to: "/knowledge", icon: BookOpen, hint: "Semantic enterprise search" },
        { label: "AI Chat", to: "/chat", icon: MessageSquare, hint: "Agent conversations and prompts" },
      ],
    },
    {
      title: "Output",
      items: [
        { label: "Reports", to: "/reports", icon: FileText, hint: "Generate and export reports" },
        { label: "Analytics", to: "/analytics", icon: BarChart3, hint: "Your productivity and inspection trends" },
        { label: "Downloads", to: "/downloads", icon: Download, hint: "Exports and secure downloads" },
        { label: "Notifications", to: "/notifications", icon: Bell, badge: "notifications", hint: "Alerts and approvals" },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Profile", to: "/profile", icon: UserRound, hint: "Your refinery profile" },
        { label: "Settings", to: "/settings", icon: Settings, hint: "Workspace preferences" },
      ],
    },
  ],
  manager: [
    {
      title: "Oversight",
      items: [
        {
          label: "AI Workspace",
          to: "/workstation",
          icon: Sparkles,
          hint: "Sovereign AI control center — chat, agents and document context",
        },
        { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, hint: "Department KPIs and priorities" },
        { label: "Department", to: "/department", icon: Building2, hint: "Department performance" },
        { label: "Team", to: "/team", icon: Users, hint: "Workload and skills coverage" },
      ],
    },
    {
      title: "Workflow",
      items: [
        { label: "Approvals", to: "/approvals", icon: ClipboardCheck, badge: "approvals", hint: "Permits, purchases and incidents" },
        { label: "Planning", to: "/planning", icon: CalendarRange, hint: "Turnaround and resource planning" },
        { label: "Maintenance", to: "/maintenance", icon: Wrench, hint: "Work orders and reliability" },
        { label: "Calendar", to: "/calendar", icon: CalendarDays, hint: "Shutdowns, audits and drills" },
      ],
    },
    {
      title: "Intelligence",
      items: [
        { label: "Vision", to: "/vision", icon: ScanEye, hint: "Inspection image analysis" },
        { label: "Knowledge", to: "/knowledge", icon: BookOpen, hint: "Semantic enterprise search" },
        { label: "Analytics", to: "/analytics", icon: BarChart3, hint: "Trends, heatmaps and KPIs" },
        { label: "Reports", to: "/reports", icon: FileText, hint: "Department and compliance packs" },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Notifications", to: "/notifications", icon: Bell, badge: "notifications", hint: "Alerts and approvals" },
        { label: "Settings", to: "/settings", icon: Settings, hint: "Workspace preferences" },
      ],
    },
  ],
  admin: [
    {
      title: "Enterprise",
      items: [
        {
          label: "AI Workspace",
          to: "/workstation",
          icon: Sparkles,
          hint: "Sovereign AI control center — chat, agents and document context",
        },
        { label: "Enterprise Dashboard", to: "/dashboard", icon: Gauge, hint: "Platform KPIs and health" },
        { label: "Users", to: "/users", icon: Users, hint: "Provision and manage accounts" },
        { label: "Roles", to: "/roles", icon: KeyRound, hint: "Role catalogue and members" },
        { label: "Permissions", to: "/permissions", icon: ShieldCheck, hint: "Capability matrix" },
        { label: "Departments", to: "/departments", icon: Building2, hint: "Organisation structure" },
      ],
    },
    {
      title: "AI Platform",
      items: [
        { label: "AI Agents", to: "/ai-agents", icon: Bot, hint: "Agent runtime and accuracy" },
        { label: "Models", to: "/models", icon: Cpu, hint: "Sovereign model registry" },
        { label: "Knowledge Base", to: "/knowledge-base", icon: BookOpen, hint: "Corpus and indexing" },
      ],
    },
    {
      title: "Governance",
      items: [
        { label: "Audit Logs", to: "/audit-logs", icon: ScrollText, hint: "Immutable activity trail" },
        { label: "Security", to: "/security", icon: ShieldCheck, hint: "Controls and posture" },
        { label: "System Health", to: "/system-health", icon: Activity, hint: "Cluster and service health" },
        { label: "Database", to: "/database", icon: Database, hint: "Datastores and replicas" },
        { label: "Storage", to: "/storage", icon: HardDrive, hint: "Object, archive and vector storage" },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Settings", to: "/settings", icon: Settings, hint: "Enterprise configuration" },
      ],
    },
  ],
};

/** Titles used by the shell header, breadcrumbs and command palette. */
export const ROUTE_TITLES: Record<string, string> = {
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

/** The signed-in destination for each personality. */
export const ROLE_HOME: Record<Role, string> = {
  employee: "/dashboard",
  manager: "/dashboard",
  admin: "/dashboard",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  employee: "Daily refinery operations workspace",
  manager: "Department oversight and approvals",
  admin: "Enterprise administration and AI platform",
};

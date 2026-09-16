/**
 * Frontend capability matrix.
 *
 * Mirrors the role permissions stated in the workstation requirements. The
 * backend will re-validate every action; this matrix only shapes the UI so
 * users never see controls they cannot use.
 */

import type { Role } from "@/types";

export const CAPABILITIES = {
  "task.view.own": ["employee", "manager", "admin"],
  "task.assign": ["manager", "admin"],
  "approval.decide": ["manager", "admin"],
  "department.view": ["manager", "admin"],
  "team.workload.view": ["manager", "admin"],
  "analytics.department": ["manager", "admin"],
  "ai.recommendations.review": ["manager", "admin"],
  "workspace.vision": ["employee", "manager", "admin"],
  "workspace.documents": ["employee", "manager", "admin"],
  "workspace.knowledge": ["employee", "manager", "admin"],
  "workspace.chat": ["employee", "manager", "admin"],
  "report.generate": ["employee", "manager", "admin"],
  "report.department": ["manager", "admin"],
  "enterprise.users.manage": ["admin"],
  "enterprise.roles.manage": ["admin"],
  "enterprise.permissions.manage": ["admin"],
  "enterprise.departments.manage": ["admin"],
  "enterprise.agents.manage": ["admin"],
  "enterprise.models.manage": ["admin"],
  "enterprise.knowledge.manage": ["admin"],
  "enterprise.audit.view": ["admin"],
  "enterprise.security.manage": ["admin"],
  "enterprise.system.manage": ["admin"],
  "enterprise.settings.manage": ["admin"],
} as const satisfies Record<string, readonly Role[]>;

export type Capability = keyof typeof CAPABILITIES;

export function can(role: Role, capability: Capability): boolean {
  return (CAPABILITIES[capability] as readonly Role[]).includes(role);
}

/** Human-readable capability groups used on the Roles & Permissions screens. */
export const CAPABILITY_LABELS: Record<Capability, string> = {
  "task.view.own": "View and update own tasks",
  "task.assign": "Assign tasks to personnel",
  "approval.decide": "Approve or reject requests",
  "department.view": "View department overview",
  "team.workload.view": "View team workload",
  "analytics.department": "Access department analytics",
  "ai.recommendations.review": "Review AI recommendations",
  "workspace.vision": "Use the vision workspace",
  "workspace.documents": "Use the document workspace",
  "workspace.knowledge": "Search enterprise knowledge",
  "workspace.chat": "Use the AI chat workspace",
  "report.generate": "Generate reports",
  "report.department": "Generate department reports",
  "enterprise.users.manage": "Create and manage users",
  "enterprise.roles.manage": "Assign roles",
  "enterprise.permissions.manage": "Manage permissions",
  "enterprise.departments.manage": "Manage departments",
  "enterprise.agents.manage": "Manage AI agents",
  "enterprise.models.manage": "Manage model registry",
  "enterprise.knowledge.manage": "Administer the knowledge base",
  "enterprise.audit.view": "Read audit logs",
  "enterprise.security.manage": "Configure security controls",
  "enterprise.system.manage": "Operate system services",
  "enterprise.settings.manage": "Configure enterprise settings",
};

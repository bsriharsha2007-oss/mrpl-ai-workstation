import { useRole } from "@/hooks/use-role";
import AdminDashboard from "@/pages/dashboards/AdminDashboard";
import EmployeeDashboard from "@/pages/dashboards/EmployeeDashboard";
import ManagerDashboard from "@/pages/dashboards/ManagerDashboard";
import type { Role } from "@/types";
import type { ComponentType } from "react";

/**
 * Dashboard — the signed-in role's home surface.
 *
 * Each role resolves to its own dashboard in place (employee → operations,
 * manager → department oversight, admin → enterprise control). The mock
 * session written at sign-in drives the mapping, so users land on the right
 * dashboard immediately after authentication with no redirect hop.
 */
const ROLE_DASHBOARDS: Record<Role, ComponentType> = {
  employee: EmployeeDashboard,
  manager: ManagerDashboard,
  admin: AdminDashboard,
};

export default function Dashboard() {
  const { role } = useRole();
  const RoleDashboard = ROLE_DASHBOARDS[role] ?? EmployeeDashboard;
  return <RoleDashboard />;
}

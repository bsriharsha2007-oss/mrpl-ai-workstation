/**
 * Workforce and governance services — employees, role catalogue, permission
 * matrix, departments and the signed-in profile.
 */

import { mockResponse } from "@/services/http";
import {
  DEFAULT_USER,
  DEPARTMENTS,
  EMPLOYEES,
  PERMISSIONS,
  PROFILES,
  ROLES,
} from "@/services/mock/data";
import type {
  DepartmentRecord,
  EmployeeRecord,
  PermissionRecord,
  Role,
  RoleRecord,
  UserProfile,
} from "@/types";

export const workforceService = {
  /** Resolves the workstation profile for a role (used by dashboard preview). */
  async getProfile(role?: Role | null): Promise<UserProfile> {
    return mockResponse(role ? PROFILES[role] : DEFAULT_USER, 180);
  },

  async listEmployees(params: { department?: string; search?: string } = {}) {
    const term = params.search?.trim().toLowerCase();
    const result: EmployeeRecord[] = EMPLOYEES.filter((employee) => {
      if (params.department && employee.department !== params.department) {
        return false;
      }
      if (
        term &&
        !`${employee.name} ${employee.employeeId} ${employee.designation}`
          .toLowerCase()
          .includes(term)
      ) {
        return false;
      }
      return true;
    });
    return mockResponse(result);
  },

  async listRoles(): Promise<RoleRecord[]> {
    return mockResponse(ROLES);
  },

  async listPermissions(): Promise<PermissionRecord[]> {
    return mockResponse(PERMISSIONS);
  },

  async listDepartments(): Promise<DepartmentRecord[]> {
    return mockResponse(DEPARTMENTS);
  },
};

export type WorkforceService = typeof workforceService;

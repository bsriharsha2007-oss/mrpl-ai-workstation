/**
 * Refinery operations services — tasks, assets, inspections, maintenance,
 * approvals, safety and duty calendar.
 *
 * Every function is typed and async so the mock implementation can be swapped
 * for `apiGet(...)` against the real gateway without touching UI code.
 */

import {
  APPROVALS,
  CALENDAR_EVENTS,
  EQUIPMENT,
  INSPECTIONS,
  MAINTENANCE_JOBS,
  SAFETY_ALERTS,
  SHIFT_INFO,
  TASKS,
} from "@/services/mock/data";
import { mockResponse } from "@/services/http";
import type {
  ApprovalItem,
  CalendarEvent,
  EquipmentRecord,
  InspectionRecord,
  MaintenanceJob,
  Priority,
  SafetyAlert,
  ShiftInfo,
  TaskRecord,
  TaskStatus,
} from "@/types";

const PRIORITY_WEIGHT: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export interface TaskQuery {
  assignee?: string;
  status?: TaskStatus | "all";
  department?: string;
  search?: string;
  limit?: number;
}

export const operationsService = {
  /** Tasks assigned to a person, department or team. */
  async listTasks(query: TaskQuery = {}): Promise<TaskRecord[]> {
    const { assignee, status = "all", department, search, limit } = query;
    const term = search?.trim().toLowerCase();

    const result = TASKS.filter((task) => {
      if (assignee && task.assignee !== assignee) return false;
      if (status !== "all" && task.status !== status) return false;
      if (department && task.department !== department) return false;
      if (
        term &&
        !`${task.title} ${task.code} ${task.asset} ${task.tags.join(" ")}`
          .toLowerCase()
          .includes(term)
      ) {
        return false;
      }
      return true;
    })
      .sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority])
      .slice(0, limit ?? 50);

    return mockResponse(result);
  },

  async taskSummary(assignee: string) {
    const mine = TASKS.filter((task) => task.assignee === assignee);
    return mockResponse({
      total: mine.length,
      dueToday: mine.filter((task) => task.status !== "completed").length,
      completed: mine.filter((task) => task.status === "completed").length,
      pending: mine.filter(
        (task) => task.status === "open" || task.status === "in-progress",
      ).length,
      blocked: mine.filter((task) => task.status === "blocked").length,
      critical: mine.filter((task) => task.priority === "critical").length,
    });
  },

  async listEquipment(): Promise<EquipmentRecord[]> {
    return mockResponse(
      [...EQUIPMENT].sort((a, b) => a.health - b.health),
    );
  },

  async listInspections(): Promise<InspectionRecord[]> {
    return mockResponse(INSPECTIONS);
  },

  async listMaintenance(): Promise<MaintenanceJob[]> {
    return mockResponse(MAINTENANCE_JOBS);
  },

  async listApprovals(status: ApprovalItem["status"] | "all" = "all") {
    const result =
      status === "all"
        ? APPROVALS
        : APPROVALS.filter((item) => item.status === status);
    return mockResponse(result);
  },

  async decideApproval(id: string, decision: "approved" | "rejected") {
    return mockResponse({ id, decision, decidedAt: new Date().toISOString() });
  },

  async listSafetyAlerts(): Promise<SafetyAlert[]> {
    return mockResponse(SAFETY_ALERTS);
  },

  async getShift(): Promise<ShiftInfo> {
    return mockResponse(SHIFT_INFO);
  },

  async listCalendar(): Promise<CalendarEvent[]> {
    return mockResponse(
      [...CALENDAR_EVENTS].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    );
  },
};

export type OperationsService = typeof operationsService;

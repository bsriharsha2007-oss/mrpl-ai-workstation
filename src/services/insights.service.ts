/**
 * Insights, reporting and platform services — KPIs, trends, reports, download
 * history, notifications, audit trail, security posture and system health.
 */

import { mockResponse } from "@/services/http";
import {
  ADMIN_KPIS,
  AI_USAGE_BY_AGENT,
  AUDIT_EVENTS,
  COMPLIANCE_TREND,
  DEFECT_DISTRIBUTION,
  DOWNLOADS,
  EMPLOYEE_KPIS,
  ENERGY_TREND,
  INSPECTION_HEATMAP,
  MANAGER_KPIS,
  NOTIFICATIONS,
  REPORTS,
  SECURITY_POSTURE,
  STATUS_BAR,
  SYSTEM_METRICS,
  THROUGHPUT_TREND,
  WORKLOAD_TREND,
} from "@/services/mock/data";
import type {
  AppNotification,
  AuditEvent,
  DownloadItem,
  KpiMetric,
  NotificationCategory,
  ReportRecord,
  Role,
  SecurityPosture,
  StatusBarInfo,
  SystemMetric,
  TrendPoint,
} from "@/types";

export const insightsService = {
  async getKpis(role: Role): Promise<KpiMetric[]> {
    const kpis =
      role === "admin" ? ADMIN_KPIS : role === "manager" ? MANAGER_KPIS : EMPLOYEE_KPIS;
    return mockResponse(kpis);
  },

  async getThroughputTrend(): Promise<TrendPoint[]> {
    return mockResponse(THROUGHPUT_TREND);
  },

  async getComplianceTrend(): Promise<TrendPoint[]> {
    return mockResponse(COMPLIANCE_TREND);
  },

  async getEnergyTrend(): Promise<TrendPoint[]> {
    return mockResponse(ENERGY_TREND);
  },

  async getWorkloadTrend(): Promise<TrendPoint[]> {
    return mockResponse(WORKLOAD_TREND);
  },

  async getDefectDistribution() {
    return mockResponse(DEFECT_DISTRIBUTION);
  },

  async getAgentUsage() {
    return mockResponse(AI_USAGE_BY_AGENT);
  },

  async getInspectionHeatmap() {
    return mockResponse(INSPECTION_HEATMAP);
  },

  async listReports(): Promise<ReportRecord[]> {
    return mockResponse(REPORTS);
  },

  /** Queues report generation and returns the updated record. */
  async generateReport(input: {
    title: string;
    type: ReportRecord["type"];
    period: string;
    owner: string;
    department: string;
  }): Promise<ReportRecord> {
    return mockResponse(
      {
        id: `rep-${Math.random().toString(36).slice(2, 8)}`,
        title: input.title,
        type: input.type,
        period: input.period,
        owner: input.owner,
        department: input.department,
        status: "draft",
        generatedAt: new Date().toISOString(),
        pages: Math.round(4 + Math.random() * 24),
        formats: ["PDF", "DOCX", "XLSX"],
      },
      900,
    );
  },

  async listDownloads(): Promise<DownloadItem[]> {
    return mockResponse(DOWNLOADS);
  },

  async listNotifications(): Promise<AppNotification[]> {
    return mockResponse(NOTIFICATIONS, 180);
  },

  async markAllRead() {
    return mockResponse({ updated: NOTIFICATIONS.length });
  },

  async listAuditEvents(): Promise<AuditEvent[]> {
    return mockResponse(AUDIT_EVENTS);
  },

  async listSecurityPosture(): Promise<SecurityPosture[]> {
    return mockResponse(SECURITY_POSTURE);
  },

  async listSystemMetrics(): Promise<SystemMetric[]> {
    return mockResponse(SYSTEM_METRICS);
  },

  async getStatusBar(): Promise<StatusBarInfo> {
    return mockResponse(STATUS_BAR, 120);
  },

  async filterNotifications(
    category: NotificationCategory | "all",
  ): Promise<AppNotification[]> {
    const items =
      category === "all"
        ? NOTIFICATIONS
        : NOTIFICATIONS.filter((item) => item.category === category);
    return mockResponse(items, 160);
  },
};

export type InsightsService = typeof insightsService;

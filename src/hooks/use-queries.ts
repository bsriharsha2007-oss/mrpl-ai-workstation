/**
 * TanStack Query bindings for the workstation service layer.
 *
 * Components never call services directly: they consume these hooks, which
 * already provide caching, retries and loading/error state. Pointing the
 * service layer at the live gateway is therefore transparent to the UI.
 */

import { operationsService, type TaskQuery } from "@/services/operations.service";
import { aiService } from "@/services/ai.service";
import { insightsService } from "@/services/insights.service";
import { workforceService } from "@/services/workforce.service";
import type { NotificationCategory, Role } from "@/types";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const queryKeys = {
  tasks: (query: TaskQuery) => ["tasks", query] as const,
  taskSummary: (assignee: string) => ["tasks", "summary", assignee] as const,
  equipment: ["equipment"] as const,
  inspections: ["inspections"] as const,
  maintenance: ["maintenance"] as const,
  approvals: (status: string) => ["approvals", status] as const,
  safety: ["safety-alerts"] as const,
  shift: ["shift"] as const,
  calendar: ["calendar"] as const,
  employees: (params: { department?: string; search?: string }) =>
    ["employees", params] as const,
  roles: ["roles"] as const,
  permissions: ["permissions"] as const,
  departments: ["departments"] as const,
  conversations: ["ai", "conversations"] as const,
  vision: ["ai", "vision"] as const,
  documents: ["ai", "documents"] as const,
  knowledge: (query: string, scope: string) =>
    ["ai", "knowledge", query, scope] as const,
  savedSearches: ["ai", "saved-searches"] as const,
  agents: ["ai", "agents"] as const,
  models: ["ai", "models"] as const,
  kpis: (role: Role) => ["kpis", role] as const,
  throughput: ["trend", "throughput"] as const,
  compliance: ["trend", "compliance"] as const,
  energy: ["trend", "energy"] as const,
  workload: ["trend", "workload"] as const,
  defects: ["chart", "defects"] as const,
  agentUsage: ["chart", "agent-usage"] as const,
  heatmap: ["chart", "heatmap"] as const,
  reports: ["reports"] as const,
  downloads: ["downloads"] as const,
  notifications: ["notifications"] as const,
  audit: ["audit"] as const,
  security: ["security"] as const,
  system: ["system"] as const,
  statusBar: ["status-bar"] as const,
};

/* ------------------------------- operations ------------------------------ */

export const useTasks = (query: TaskQuery = {}) =>
  useQuery({
    queryKey: queryKeys.tasks(query),
    queryFn: () => operationsService.listTasks(query),
    placeholderData: keepPreviousData,
  });

export const useTaskSummary = (assignee: string) =>
  useQuery({
    queryKey: queryKeys.taskSummary(assignee),
    queryFn: () => operationsService.taskSummary(assignee),
  });

export const useEquipment = () =>
  useQuery({ queryKey: queryKeys.equipment, queryFn: () => operationsService.listEquipment() });

export const useInspections = () =>
  useQuery({ queryKey: queryKeys.inspections, queryFn: () => operationsService.listInspections() });

export const useMaintenance = () =>
  useQuery({ queryKey: queryKeys.maintenance, queryFn: () => operationsService.listMaintenance() });

export const useApprovals = (status = "all") =>
  useQuery({
    queryKey: queryKeys.approvals(status),
    queryFn: () => operationsService.listApprovals(status as never),
    placeholderData: keepPreviousData,
  });

export const useDecideApproval = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; decision: "approved" | "rejected" }) =>
      operationsService.decideApproval(input.id, input.decision),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["approvals"] });
    },
  });
};

export const useSafetyAlerts = () =>
  useQuery({ queryKey: queryKeys.safety, queryFn: () => operationsService.listSafetyAlerts() });

export const useShift = () =>
  useQuery({ queryKey: queryKeys.shift, queryFn: () => operationsService.getShift() });

export const useCalendar = () =>
  useQuery({ queryKey: queryKeys.calendar, queryFn: () => operationsService.listCalendar() });

/* ------------------------------- workforce ------------------------------- */

export const useEmployees = (params: { department?: string; search?: string } = {}) =>
  useQuery({
    queryKey: queryKeys.employees(params),
    queryFn: () => workforceService.listEmployees(params),
    placeholderData: keepPreviousData,
  });

export const useRoles = () =>
  useQuery({ queryKey: queryKeys.roles, queryFn: () => workforceService.listRoles() });

export const usePermissions = () =>
  useQuery({ queryKey: queryKeys.permissions, queryFn: () => workforceService.listPermissions() });

export const useDepartments = () =>
  useQuery({ queryKey: queryKeys.departments, queryFn: () => workforceService.listDepartments() });

/* ------------------------------ AI workspaces ---------------------------- */

export const useConversations = (roleKey = "workspace") =>
  useQuery({
    queryKey: [...queryKeys.conversations, roleKey],
    queryFn: () => aiService.listConversations(),
  });

export const useVisionAnalyses = () =>
  useQuery({ queryKey: queryKeys.vision, queryFn: () => aiService.listVisionAnalyses() });

export const useAnalyzeImage = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof aiService.analyzeImage>[0]) =>
      aiService.analyzeImage(input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.vision });
    },
  });
};

export const useDocuments = () =>
  useQuery({ queryKey: queryKeys.documents, queryFn: () => aiService.listDocuments() });

export const useUploadDocument = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof aiService.uploadDocument>[0]) =>
      aiService.uploadDocument(input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.documents });
    },
  });
};

export const useKnowledgeSearch = (query: string, scope = "all") =>
  useQuery({
    queryKey: queryKeys.knowledge(query, scope),
    queryFn: () => aiService.searchKnowledge(query, scope),
    enabled: query.trim().length > 1,
    placeholderData: keepPreviousData,
  });

export const useSavedSearches = () =>
  useQuery({ queryKey: queryKeys.savedSearches, queryFn: () => aiService.listSavedSearches() });

export const useAgents = () =>
  useQuery({ queryKey: queryKeys.agents, queryFn: () => aiService.listAgents() });

export const useModels = () =>
  useQuery({ queryKey: queryKeys.models, queryFn: () => aiService.listModels() });

export const useSendChatMessage = () =>
  useMutation({ mutationFn: (input: Parameters<typeof aiService.sendChatMessage>[0]) => aiService.sendChatMessage(input) });

/* -------------------------------- insights ------------------------------- */

export const useKpis = (role: Role) =>
  useQuery({ queryKey: queryKeys.kpis(role), queryFn: () => insightsService.getKpis(role) });

export const useThroughputTrend = () =>
  useQuery({ queryKey: queryKeys.throughput, queryFn: () => insightsService.getThroughputTrend() });

export const useComplianceTrend = () =>
  useQuery({ queryKey: queryKeys.compliance, queryFn: () => insightsService.getComplianceTrend() });

export const useEnergyTrend = () =>
  useQuery({ queryKey: queryKeys.energy, queryFn: () => insightsService.getEnergyTrend() });

export const useWorkloadTrend = () =>
  useQuery({ queryKey: queryKeys.workload, queryFn: () => insightsService.getWorkloadTrend() });

export const useDefectDistribution = () =>
  useQuery({ queryKey: queryKeys.defects, queryFn: () => insightsService.getDefectDistribution() });

export const useAgentUsage = () =>
  useQuery({ queryKey: queryKeys.agentUsage, queryFn: () => insightsService.getAgentUsage() });

export const useInspectionHeatmap = () =>
  useQuery({ queryKey: queryKeys.heatmap, queryFn: () => insightsService.getInspectionHeatmap() });

export const useReports = () =>
  useQuery({ queryKey: queryKeys.reports, queryFn: () => insightsService.listReports() });

export const useGenerateReport = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof insightsService.generateReport>[0]) =>
      insightsService.generateReport(input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.reports });
    },
  });
};

export const useDownloads = () =>
  useQuery({ queryKey: queryKeys.downloads, queryFn: () => insightsService.listDownloads() });

export const useNotifications = () =>
  useQuery({ queryKey: queryKeys.notifications, queryFn: () => insightsService.listNotifications() });

export const useNotificationsByCategory = (category: NotificationCategory | "all") =>
  useQuery({
    queryKey: [...queryKeys.notifications, category],
    queryFn: () => insightsService.filterNotifications(category),
    placeholderData: keepPreviousData,
  });

export const useAuditEvents = () =>
  useQuery({ queryKey: queryKeys.audit, queryFn: () => insightsService.listAuditEvents() });

export const useSecurityPosture = () =>
  useQuery({ queryKey: queryKeys.security, queryFn: () => insightsService.listSecurityPosture() });

export const useSystemMetrics = () =>
  useQuery({ queryKey: queryKeys.system, queryFn: () => insightsService.listSystemMetrics() });

export const useStatusBar = () =>
  useQuery({
    queryKey: queryKeys.statusBar,
    queryFn: () => insightsService.getStatusBar(),
    staleTime: 60_000,
  });

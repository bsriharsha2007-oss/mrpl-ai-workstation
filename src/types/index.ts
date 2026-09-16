/**
 * MRPL Sovereign Enterprise AI Workstation — domain type contracts.
 *
 * These types are the single source of truth shared by the mock service layer
 * today and by the real API client later. UI components only ever consume
 * these shapes, so replacing `src/services/*` with live HTTP calls requires no
 * component changes.
 */

/* -------------------------------------------------------------------------- */
/* Identity, roles and access control                                          */
/* -------------------------------------------------------------------------- */

/** Dashboard personalities supported by the workstation. */
export type Role = "employee" | "manager" | "admin";

/** Anything that can be pending review inside the platform. */
export type ApprovalState = "pending" | "approved" | "rejected" | "returned";

export interface UserProfile {
  id: string;
  /** MRPL employee number, e.g. MRPL-48213. */
  employeeId: string;
  name: string;
  email: string;
  role: Role;
  designation: string;
  department: string;
  /** Refinery area the user is attached to (CDU, VGO-HDT, Utilities…). */
  area: string;
  shift: string;
  location: string;
  phone: string;
  avatarInitials: string;
  joinedOn: string;
  lastActive: string;
}

export interface EmployeeRecord {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  role: Role;
  shift: string;
  status: "active" | "on-leave" | "off-shift" | "inactive";
  workload: number;
  openTasks: number;
  compliance: number;
  lastActive: string;
}

export interface RoleRecord {
  id: string;
  name: string;
  key: Role;
  description: string;
  members: number;
  tier: "Operational" | "Supervisory" | "Enterprise";
  modules: string[];
}

export interface PermissionRecord {
  id: string;
  module: string;
  capability: string;
  employee: boolean;
  manager: boolean;
  admin: boolean;
}

export interface DepartmentRecord {
  id: string;
  name: string;
  code: string;
  head: string;
  headcount: number;
  area: string;
  compliance: number;
  openTasks: number;
  equipmentHealth: number;
  productivity: number;
}

/* -------------------------------------------------------------------------- */
/* Operations                                                                  */
/* -------------------------------------------------------------------------- */

export type Priority = "critical" | "high" | "medium" | "low";
export type TaskStatus = "open" | "in-progress" | "blocked" | "completed";

export interface TaskRecord {
  id: string;
  code: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  asset: string;
  assetTag: string;
  assignee: string;
  department: string;
  dueDate: string;
  createdAt: string;
  progress: number;
  tags: string[];
}

export interface EquipmentRecord {
  id: string;
  tag: string;
  name: string;
  area: string;
  unit: string;
  criticality: "A" | "B" | "C";
  health: number;
  status: "running" | "standby" | "maintenance" | "fault";
  vibration: number;
  temperature: number;
  lastInspection: string;
  nextDue: string;
}

export interface InspectionRecord {
  id: string;
  assetTag: string;
  asset: string;
  type: string;
  inspector: string;
  inspectedAt: string;
  status: "completed" | "in-progress" | "scheduled" | "overdue";
  findings: number;
  severity: Priority;
  compliance: number;
  aiConfidence: number;
}

export interface MaintenanceJob {
  id: string;
  workOrder: string;
  asset: string;
  assetTag: string;
  type: "Preventive" | "Predictive" | "Corrective" | "Shutdown";
  window: string;
  crew: string;
  lead: string;
  status: "planned" | "scheduled" | "in-progress" | "completed";
  priority: Priority;
  progress: number;
}

export interface ApprovalItem {
  id: string;
  title: string;
  category: "Work permit" | "Purchase" | "Maintenance" | "Incident" | "Procedure";
  requester: string;
  department: string;
  submittedAt: string;
  status: ApprovalState;
  priority: Priority;
  value: string;
  summary: string;
}

export interface ShiftInfo {
  shift: string;
  from: string;
  to: string;
  crew: string;
  area: string;
  supervisor: string;
  handoverNotes: string[];
}

export interface SafetyAlert {
  id: string;
  severity: Priority;
  title: string;
  area: string;
  raisedAt: string;
  status: "active" | "monitoring" | "closed";
  action: string;
}

/* -------------------------------------------------------------------------- */
/* AI workspaces                                                               */
/* -------------------------------------------------------------------------- */

export interface AgentRecord {
  id: string;
  name: string;
  purpose: string;
  model: string;
  status: "online" | "degraded" | "offline" | "training";
  requests24h: number;
  accuracy: number;
  latencyMs: number;
  owner: string;
}

export interface ModelRecord {
  id: string;
  name: string;
  provider: string;
  params: string;
  modality: string;
  status: "serving" | "loading" | "queued" | "archived";
  gpu: string;
  loadedAt: string;
}

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  agent?: string;
  confidence?: number;
  citations?: string[];
}

export interface AiConversation {
  id: string;
  title: string;
  agent: string;
  updatedAt: string;
  messageCount: number;
  pinned?: boolean;
  messages: ChatMessage[];
}

export interface DetectedEquipment {
  id: string;
  label: string;
  tag: string;
  confidence: number;
  box: { x: number; y: number; w: number; h: number };
  condition: "normal" | "watch" | "defect";
}

export interface OcrBlock {
  id: string;
  text: string;
  confidence: number;
  region: string;
}

export interface VisionAnalysis {
  id: string;
  fileName: string;
  assetTag: string;
  asset: string;
  uploadedBy: string;
  uploadedAt: string;
  modality: "Visual inspection" | "Thermography" | "Radiography" | "Drone survey";
  summary: string;
  compliance: number;
  confidence: number;
  status: "analyzed" | "processing" | "flagged";
  equipment: DetectedEquipment[];
  ocr: OcrBlock[];
  recommendations: string[];
}

export type DocumentKind = "PDF" | "DOCX" | "XLSX" | "PPTX" | "DWG";

export interface DocumentRecord {
  id: string;
  name: string;
  kind: DocumentKind;
  size: string;
  department: string;
  uploadedBy: string;
  uploadedAt: string;
  version: string;
  versions: number;
  status: "indexed" | "processing" | "archived";
  bookmarked: boolean;
  summary: string;
  metadata: { label: string; value: string }[];
  pages: number;
}

export interface KnowledgeResult {
  id: string;
  title: string;
  source: string;
  kind: DocumentKind | "Manual" | "SOP" | "Standard";
  snippet: string;
  score: number;
  department: string;
  updatedAt: string;
  related: string[];
}

export interface SavedSearch {
  id: string;
  label: string;
  query: string;
  scope: string;
  results: number;
  savedAt: string;
}

export type ReportStatus = "draft" | "in-review" | "approved" | "published";

export interface ReportRecord {
  id: string;
  title: string;
  type:
    | "Shift handover"
    | "Inspection"
    | "Compliance"
    | "Maintenance"
    | "Department KPI"
    | "Enterprise audit";
  period: string;
  owner: string;
  department: string;
  status: ReportStatus;
  generatedAt: string;
  pages: number;
  formats: ("PDF" | "DOCX" | "XLSX")[];
}

export interface DownloadItem {
  id: string;
  name: string;
  kind: string;
  size: string;
  downloadedAt: string;
  destination: string;
  status: "ready" | "generating" | "expired";
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                               */
/* -------------------------------------------------------------------------- */

export type NotificationCategory = "task" | "approval" | "system" | "ai" | "safety";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  priority: Priority;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
  actor?: string;
}

/* -------------------------------------------------------------------------- */
/* Analytics, system and governance                                            */
/* -------------------------------------------------------------------------- */

export interface TrendPoint {
  label: string;
  [series: string]: string | number;
}

export interface KpiMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  delta: number;
  intent: "positive" | "negative" | "neutral";
  caption: string;
  target?: number;
}

export interface SystemMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  capacity: number;
  status: "healthy" | "watch" | "critical";
  detail: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  module: string;
  at: string;
  severity: "info" | "warning" | "critical";
  ip: string;
}

export interface SecurityPosture {
  id: string;
  control: string;
  framework: string;
  status: "enforced" | "monitoring" | "action-required";
  coverage: number;
  owner: string;
  reviewedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: "Inspection" | "Shutdown" | "Audit" | "Training" | "Review";
  date: string;
  time: string;
  owner: string;
  area: string;
  status: "confirmed" | "tentative" | "completed";
}

export interface StatusBarInfo {
  plant: string;
  shift: string;
  aiServices: number;
  latencyMs: number;
  dataSyncAt: string;
  environment: string;
}

/**
 * Deterministic mock dataset for the MRPL Sovereign Enterprise AI Workstation.
 *
 * The backend team will replace these collections with live API responses. The
 * shapes here match `src/types` exactly, so no UI component changes are needed
 * when the real endpoints land.
 */

import type {
  AgentRecord,
  AiConversation,
  AppNotification,
  ApprovalItem,
  AuditEvent,
  CalendarEvent,
  DepartmentRecord,
  DocumentRecord,
  DownloadItem,
  EmployeeRecord,
  EquipmentRecord,
  InspectionRecord,
  KpiMetric,
  KnowledgeResult,
  MaintenanceJob,
  ModelRecord,
  PermissionRecord,
  ReportRecord,
  RoleRecord,
  SafetyAlert,
  SavedSearch,
  SecurityPosture,
  ShiftInfo,
  StatusBarInfo,
  SystemMetric,
  TaskRecord,
  TrendPoint,
  UserProfile,
  VisionAnalysis,
} from "@/types";

/* ----------------------------- date helpers ------------------------------ */

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();
const hoursAgo = (n: number) => iso(n * HOUR);
const daysAgo = (n: number) => iso(n * DAY);
const daysAhead = (n: number) => iso(-n * DAY);

/* --------------------------- identity records ---------------------------- */

const DUTY_MANAGER: UserProfile = {
  id: "usr-1001",
  employeeId: "MRPL-48213",
  name: "Ananya Rao",
  email: "ananya.rao@mrpl.co.in",
  role: "employee",
  designation: "Senior Process Engineer",
  department: "Process Engineering",
  area: "Crude Distillation Unit — CDU-2",
  shift: "Shift A · 06:00 – 14:00",
  location: "MRPL Refinery, Katipalla, Mangaluru",
  phone: "+91 824 227 1000",
  avatarInitials: "AR",
  joinedOn: "2016-07-11",
  lastActive: hoursAgo(0.1),
};

/** Alternate profile used when previewing the supervisory dashboard. */
export const MANAGER_PROFILE: UserProfile = {
  ...DUTY_MANAGER,
  id: "usr-2001",
  employeeId: "MRPL-31077",
  name: "Vikram Shetty",
  email: "vikram.shetty@mrpl.co.in",
  role: "manager",
  designation: "Manager — Process Operations",
  department: "Process Operations",
  shift: "General Shift · 09:00 – 18:00",
  avatarInitials: "VS",
  joinedOn: "2011-02-04",
  lastActive: hoursAgo(0.4),
};

/** Alternate profile used when previewing the enterprise dashboard. */
export const ADMIN_PROFILE: UserProfile = {
  ...DUTY_MANAGER,
  id: "usr-3001",
  employeeId: "MRPL-10042",
  name: "Meera Krishnan",
  email: "meera.krishnan@mrpl.co.in",
  role: "admin",
  designation: "Chief Information Security Officer",
  department: "Digital & IT",
  shift: "General Shift · 09:00 – 18:00",
  avatarInitials: "MK",
  joinedOn: "2009-05-19",
  lastActive: hoursAgo(0.2),
};

export const PROFILES: Record<"employee" | "manager" | "admin", UserProfile> = {
  employee: DUTY_MANAGER,
  manager: MANAGER_PROFILE,
  admin: ADMIN_PROFILE,
};

export const DEFAULT_USER: UserProfile = DUTY_MANAGER;

/* ------------------------------- workforce ------------------------------- */

export const SHIFT_INFO: ShiftInfo = {
  shift: "Shift A",
  from: "06:00",
  to: "14:00",
  crew: "Crew A-3 · 9 personnel",
  area: "CDU-2 / VGO-HDT interface",
  supervisor: "Vikram Shetty",
  handoverNotes: [
    "CDU-2 column top pressure stable at 1.42 kg/cm² through the shift.",
    "P-2013B seal flush line flagged for follow-up during Shift B rounds.",
    "Flare header purge verified — no abnormal hydrocarbon carryover.",
    "Sulphur recovery unit converter bed temperature trending +6 °C.",
  ],
};

export const EMPLOYEES: EmployeeRecord[] = [
  {
    id: "emp-01",
    employeeId: "MRPL-48213",
    name: "Ananya Rao",
    designation: "Senior Process Engineer",
    department: "Process Engineering",
    role: "employee",
    shift: "Shift A",
    status: "active",
    workload: 72,
    openTasks: 6,
    compliance: 96,
    lastActive: hoursAgo(0.1),
  },
  {
    id: "emp-02",
    employeeId: "MRPL-45019",
    name: "Rahul Nair",
    designation: "Rotating Equipment Engineer",
    department: "Mechanical Maintenance",
    role: "employee",
    shift: "Shift B",
    status: "active",
    workload: 64,
    openTasks: 4,
    compliance: 92,
    lastActive: hoursAgo(0.6),
  },
  {
    id: "emp-03",
    employeeId: "MRPL-51088",
    name: "Sneha Bhat",
    designation: "Inspection Engineer",
    department: "Inspection & NDT",
    role: "employee",
    shift: "General",
    status: "on-leave",
    workload: 38,
    openTasks: 2,
    compliance: 88,
    lastActive: daysAgo(2),
  },
  {
    id: "emp-04",
    employeeId: "MRPL-39455",
    name: "Imran Khan",
    designation: "Shift Operations Supervisor",
    department: "Process Operations",
    role: "manager",
    shift: "Shift C",
    status: "active",
    workload: 81,
    openTasks: 9,
    compliance: 94,
    lastActive: hoursAgo(0.3),
  },
  {
    id: "emp-05",
    employeeId: "MRPL-42771",
    name: "Deepa Menon",
    designation: "Instrumentation Engineer",
    department: "Instrumentation",
    role: "employee",
    shift: "Shift A",
    status: "active",
    workload: 58,
    openTasks: 5,
    compliance: 97,
    lastActive: hoursAgo(0.9),
  },
  {
    id: "emp-06",
    employeeId: "MRPL-33012",
    name: "Suresh Prabhu",
    designation: "Manager — Inspection & NDT",
    department: "Inspection & NDT",
    role: "manager",
    shift: "General",
    status: "active",
    workload: 69,
    openTasks: 7,
    compliance: 95,
    lastActive: hoursAgo(1.2),
  },
  {
    id: "emp-07",
    employeeId: "MRPL-47823",
    name: "Fatima Sheikh",
    designation: "Process Safety Engineer",
    department: "HSE",
    role: "employee",
    shift: "General",
    status: "active",
    workload: 61,
    openTasks: 4,
    compliance: 99,
    lastActive: hoursAgo(0.7),
  },
  {
    id: "emp-08",
    employeeId: "MRPL-50114",
    name: "Karthik Kamath",
    designation: "Field Operator — Utilities",
    department: "Utilities & Offsites",
    role: "employee",
    shift: "Shift B",
    status: "off-shift",
    workload: 44,
    openTasks: 3,
    compliance: 90,
    lastActive: hoursAgo(6),
  },
  {
    id: "emp-09",
    employeeId: "MRPL-28119",
    name: "Latha Gowda",
    designation: "Head — Digital & IT",
    department: "Digital & IT",
    role: "admin",
    shift: "General",
    status: "active",
    workload: 55,
    openTasks: 5,
    compliance: 98,
    lastActive: hoursAgo(0.5),
  },
  {
    id: "emp-10",
    employeeId: "MRPL-44390",
    name: "Arjun Devadiga",
    designation: "Maintenance Planner",
    department: "Mechanical Maintenance",
    role: "employee",
    shift: "General",
    status: "active",
    workload: 77,
    openTasks: 8,
    compliance: 93,
    lastActive: hoursAgo(1.6),
  },
  {
    id: "emp-11",
    employeeId: "MRPL-40028",
    name: "Pooja Hegde",
    designation: "Corrosion Engineer",
    department: "Inspection & NDT",
    role: "employee",
    shift: "Shift C",
    status: "active",
    workload: 52,
    openTasks: 4,
    compliance: 91,
    lastActive: hoursAgo(2.1),
  },
  {
    id: "emp-12",
    employeeId: "MRPL-52201",
    name: "Nikhil Shenoy",
    designation: "Graduate Engineer Trainee",
    department: "Process Engineering",
    role: "employee",
    shift: "Shift B",
    status: "active",
    workload: 34,
    openTasks: 2,
    compliance: 84,
    lastActive: hoursAgo(3.4),
  },
];

export const DEPARTMENTS: DepartmentRecord[] = [
  {
    id: "dept-01",
    name: "Process Operations",
    code: "OPS",
    head: "Vikram Shetty",
    headcount: 148,
    area: "CDU / VGO-HDT / SRU",
    compliance: 96,
    openTasks: 34,
    equipmentHealth: 92,
    productivity: 88,
  },
  {
    id: "dept-02",
    name: "Mechanical Maintenance",
    code: "MECH",
    head: "Arjun Devadiga",
    headcount: 96,
    area: "Rotating & static equipment",
    compliance: 93,
    openTasks: 41,
    equipmentHealth: 87,
    productivity: 82,
  },
  {
    id: "dept-03",
    name: "Inspection & NDT",
    code: "INS",
    head: "Suresh Prabhu",
    headcount: 54,
    area: "Asset integrity",
    compliance: 95,
    openTasks: 22,
    equipmentHealth: 89,
    productivity: 85,
  },
  {
    id: "dept-04",
    name: "Instrumentation",
    code: "INST",
    head: "Deepa Menon",
    headcount: 47,
    area: "Field & control systems",
    compliance: 97,
    openTasks: 18,
    equipmentHealth: 94,
    productivity: 90,
  },
  {
    id: "dept-05",
    name: "HSE",
    code: "HSE",
    head: "Fatima Sheikh",
    headcount: 38,
    area: "Process safety / fire",
    compliance: 99,
    openTasks: 12,
    equipmentHealth: 95,
    productivity: 91,
  },
  {
    id: "dept-06",
    name: "Utilities & Offsites",
    code: "UTL",
    head: "Karthik Kamath",
    headcount: 63,
    area: "Boilers / DM water / tank farm",
    compliance: 94,
    openTasks: 26,
    equipmentHealth: 90,
    productivity: 86,
  },
];

export const ROLES: RoleRecord[] = [
  {
    id: "role-01",
    name: "Refinery Employee",
    key: "employee",
    description:
      "Daily operations access — tasks, inspections, documents, AI workspaces and personal reports.",
    members: 1182,
    tier: "Operational",
    modules: ["Dashboard", "My Tasks", "Vision", "Documents", "Knowledge", "AI Chat", "Reports"],
  },
  {
    id: "role-02",
    name: "Department Manager",
    key: "manager",
    description:
      "Supervisory access — approvals, planning, maintenance scheduling, department KPIs and analytics.",
    members: 146,
    tier: "Supervisory",
    modules: ["Department", "Team", "Approvals", "Planning", "Maintenance", "Analytics"],
  },
  {
    id: "role-03",
    name: "Enterprise Administrator",
    key: "admin",
    description:
      "Sovereign platform administration — users, roles, AI agents, models, security, audit and infrastructure.",
    members: 18,
    tier: "Enterprise",
    modules: ["Users", "Roles", "Permissions", "AI Agents", "Models", "Security", "Audit", "System"],
  },
];

export const PERMISSIONS: PermissionRecord[] = [
  { id: "perm-01", module: "Workspaces", capability: "View personal dashboard", employee: true, manager: true, admin: true },
  { id: "perm-02", module: "Workspaces", capability: "Upload inspection imagery", employee: true, manager: true, admin: true },
  { id: "perm-03", module: "Workspaces", capability: "Upload controlled documents", employee: true, manager: true, admin: true },
  { id: "perm-04", module: "Workspaces", capability: "Query enterprise knowledge base", employee: true, manager: true, admin: true },
  { id: "perm-05", module: "Workspaces", capability: "Export AI conversation transcripts", employee: true, manager: true, admin: true },
  { id: "perm-06", module: "Approvals", capability: "Approve work permits & purchases", employee: false, manager: true, admin: true },
  { id: "perm-07", module: "Approvals", capability: "Assign tasks to personnel", employee: false, manager: true, admin: true },
  { id: "perm-08", module: "Approvals", capability: "Review AI recommendations", employee: false, manager: true, admin: true },
  { id: "perm-09", module: "Governance", capability: "View department reports", employee: false, manager: true, admin: true },
  { id: "perm-10", module: "Governance", capability: "View team workload", employee: false, manager: true, admin: true },
  { id: "perm-11", module: "Enterprise", capability: "Create & deactivate users", employee: false, manager: false, admin: true },
  { id: "perm-12", module: "Enterprise", capability: "Assign roles & permissions", employee: false, manager: false, admin: true },
  { id: "perm-13", module: "Enterprise", capability: "Manage AI agents & model registry", employee: false, manager: false, admin: true },
  { id: "perm-14", module: "Enterprise", capability: "Restart AI services", employee: false, manager: false, admin: true },
  { id: "perm-15", module: "Enterprise", capability: "Read immutable audit trail", employee: false, manager: false, admin: true },
  { id: "perm-16", module: "Enterprise", capability: "Configure sovereign retention policy", employee: false, manager: false, admin: true },
];

/* ------------------------------ operations ------------------------------- */

export const TASKS: TaskRecord[] = [
  {
    id: "tsk-01",
    code: "WO-88412",
    title: "Verify P-2013B mechanical seal flush plan",
    description:
      "Confirm API Plan 53B barrier fluid pressure and inspect seal pot level during Shift B rounds.",
    priority: "critical",
    status: "in-progress",
    asset: "Crude charge pump P-2013B",
    assetTag: "P-2013B",
    assignee: "Ananya Rao",
    department: "Mechanical Maintenance",
    dueDate: daysAhead(0),
    createdAt: daysAgo(1),
    progress: 60,
    tags: ["Rotating", "Seal", "Shift A"],
  },
  {
    id: "tsk-02",
    code: "WO-88401",
    title: "Analyse CDU-2 column pressure excursion",
    description:
      "Compare 7-day historian trend against design envelope and attach findings to the shift report.",
    priority: "high",
    status: "open",
    asset: "CDU-2 main column",
    assetTag: "C-2001",
    assignee: "Ananya Rao",
    department: "Process Engineering",
    dueDate: daysAhead(1),
    createdAt: daysAgo(2),
    progress: 15,
    tags: ["Process", "Historian"],
  },
  {
    id: "tsk-03",
    code: "WO-88388",
    title: "Upload NDT radiographic film for VGO-HDT reactor",
    description:
      "Digitise and index the latest radiographic films for AI defect screening.",
    priority: "medium",
    status: "open",
    asset: "VGO-HDT reactor R-3001",
    assetTag: "R-3001",
    assignee: "Ananya Rao",
    department: "Inspection & NDT",
    dueDate: daysAhead(3),
    createdAt: daysAgo(3),
    progress: 0,
    tags: ["NDT", "AI vision"],
  },
  {
    id: "tsk-04",
    code: "WO-88370",
    title: "Close out insulation survey findings — Unit 4",
    description: "Sign off 12 CUI findings flagged during the thermography drone survey.",
    priority: "medium",
    status: "completed",
    asset: "Unit 4 piping network",
    assetTag: "UT4-PIPE",
    assignee: "Ananya Rao",
    department: "Inspection & NDT",
    dueDate: daysAgo(1),
    createdAt: daysAgo(6),
    progress: 100,
    tags: ["Thermography", "CUI"],
  },
  {
    id: "tsk-05",
    code: "WO-88419",
    title: "Update SOP for emergency flare header purge",
    description:
      "Incorporate the revised purge sequence approved by the process safety committee.",
    priority: "high",
    status: "open",
    asset: "Flare header",
    assetTag: "FL-1000",
    assignee: "Ananya Rao",
    department: "Process Operations",
    dueDate: daysAhead(2),
    createdAt: hoursAgo(9),
    progress: 25,
    tags: ["SOP", "Safety"],
  },
  {
    id: "tsk-06",
    code: "WO-88399",
    title: "Instrument loop check — TT-2145 / FT-2150",
    description: "Loop verification ahead of the CDU-2 turnaround instrument audit.",
    priority: "low",
    status: "blocked",
    asset: "CDU-2 instrument loop",
    assetTag: "TT-2145",
    assignee: "Deepa Menon",
    department: "Instrumentation",
    dueDate: daysAhead(5),
    createdAt: daysAgo(4),
    progress: 40,
    tags: ["Instrumentation", "Blocked"],
  },
  {
    id: "tsk-07",
    code: "WO-88424",
    title: "Bearing temperature review — Air blower K-5101",
    description: "Review vibration spectrum and recommend lubrication interval change.",
    priority: "high",
    status: "open",
    asset: "Air blower K-5101",
    assetTag: "K-5101",
    assignee: "Rahul Nair",
    department: "Mechanical Maintenance",
    dueDate: daysAhead(1),
    createdAt: hoursAgo(20),
    progress: 10,
    tags: ["Condition monitoring"],
  },
  {
    id: "tsk-08",
    code: "WO-88430",
    title: "Submit monthly effluent compliance pack",
    description: "Consolidate lab results and upload to the statutory reporting repository.",
    priority: "medium",
    status: "in-progress",
    asset: "Effluent treatment plant",
    assetTag: "ETP-01",
    assignee: "Fatima Sheikh",
    department: "HSE",
    dueDate: daysAhead(4),
    createdAt: daysAgo(2),
    progress: 55,
    tags: ["Compliance", "Statutory"],
  },
  {
    id: "tsk-09",
    code: "WO-88433",
    title: "Thermography round — DM water pump house",
    description: "Capture IR imagery for all 8 pumps and upload to the vision workspace.",
    priority: "low",
    status: "open",
    asset: "DM water pump house",
    assetTag: "UTL-DM",
    assignee: "Ananya Rao",
    department: "Utilities & Offsites",
    dueDate: daysAhead(6),
    createdAt: hoursAgo(30),
    progress: 0,
    tags: ["Thermography", "Routine"],
  },
  {
    id: "tsk-10",
    code: "WO-88436",
    title: "Review AI corrosion alert on line 6\"-P-1204-A1A",
    description: "Validate ultrasonic thickness prediction and either accept or dispute the alert.",
    priority: "high",
    status: "open",
    asset: "Line 6\"-P-1204-A1A",
    assetTag: "P-1204-A1A",
    assignee: "Pooja Hegde",
    department: "Inspection & NDT",
    dueDate: daysAhead(2),
    createdAt: hoursAgo(14),
    progress: 20,
    tags: ["Corrosion", "AI review"],
  },
  {
    id: "tsk-11",
    code: "WO-88440",
    title: "Prepare turnaround scope pack — CDU-2",
    description: "Compile 42 work packages with man-hour estimates for the steering committee.",
    priority: "critical",
    status: "in-progress",
    asset: "CDU-2",
    assetTag: "C-2001",
    assignee: "Arjun Devadiga",
    department: "Mechanical Maintenance",
    dueDate: daysAhead(7),
    createdAt: daysAgo(9),
    progress: 68,
    tags: ["Turnaround", "Planning"],
  },
  {
    id: "tsk-12",
    code: "WO-88444",
    title: "Validate AI-extracted datasheet for E-2103",
    description: "Confirm heat exchanger datasheet extraction against the vendor drawing Rev C.",
    priority: "medium",
    status: "open",
    asset: "Heat exchanger E-2103",
    assetTag: "E-2103",
    assignee: "Ananya Rao",
    department: "Process Engineering",
    dueDate: daysAhead(3),
    createdAt: hoursAgo(6),
    progress: 0,
    tags: ["Documents", "AI extraction"],
  },
];

export const EQUIPMENT: EquipmentRecord[] = [
  { id: "eq-01", tag: "P-2013B", name: "Crude charge pump", area: "CDU-2", unit: "Unit 2", criticality: "A", health: 74, status: "running", vibration: 4.8, temperature: 78, lastInspection: daysAgo(12), nextDue: daysAhead(3) },
  { id: "eq-02", tag: "C-2001", name: "Main distillation column", area: "CDU-2", unit: "Unit 2", criticality: "A", health: 91, status: "running", vibration: 1.2, temperature: 268, lastInspection: daysAgo(20), nextDue: daysAhead(18) },
  { id: "eq-03", tag: "K-5101", name: "Combustion air blower", area: "Utilities", unit: "Unit 5", criticality: "A", health: 68, status: "fault", vibration: 7.4, temperature: 96, lastInspection: daysAgo(31), nextDue: daysAgo(2) },
  { id: "eq-04", tag: "R-3001", name: "VGO hydrotreater reactor", area: "VGO-HDT", unit: "Unit 3", criticality: "A", health: 88, status: "running", vibration: 0.9, temperature: 372, lastInspection: daysAgo(8), nextDue: daysAhead(26) },
  { id: "eq-05", tag: "E-2103", name: "Feed / effluent exchanger", area: "CDU-2", unit: "Unit 2", criticality: "B", health: 82, status: "running", vibration: 0.6, temperature: 214, lastInspection: daysAgo(15), nextDue: daysAhead(11) },
  { id: "eq-06", tag: "B-1101", name: "Boiler feed water pump", area: "Utilities", unit: "Unit 5", criticality: "B", health: 94, status: "standby", vibration: 1.8, temperature: 62, lastInspection: daysAgo(4), nextDue: daysAhead(24) },
  { id: "eq-07", tag: "C-4201", name: "Sulphur recovery converter", area: "SRU", unit: "Unit 4", criticality: "A", health: 79, status: "running", vibration: 1.1, temperature: 341, lastInspection: daysAgo(9), nextDue: daysAhead(7) },
  { id: "eq-08", tag: "P-4102A", name: "Product transfer pump", area: "Tank farm", unit: "Offsites", criticality: "B", health: 96, status: "running", vibration: 1.4, temperature: 58, lastInspection: daysAgo(2), nextDue: daysAhead(28) },
  { id: "eq-09", tag: "GT-9001", name: "Gas turbine generator", area: "Power block", unit: "Unit 9", criticality: "A", health: 85, status: "running", vibration: 2.2, temperature: 118, lastInspection: daysAgo(6), nextDue: daysAhead(14) },
  { id: "eq-10", tag: "HE-2205", name: "Vacuum tower overhead condenser", area: "VDU", unit: "Unit 2", criticality: "B", health: 87, status: "maintenance", vibration: 0.7, temperature: 96, lastInspection: daysAgo(1), nextDue: daysAhead(30) },
  { id: "eq-11", tag: "K-2201", name: "Wet gas compressor", area: "VDU", unit: "Unit 2", criticality: "A", health: 72, status: "running", vibration: 5.9, temperature: 104, lastInspection: daysAgo(22), nextDue: daysAgo(1) },
  { id: "eq-12", tag: "PSV-3310", name: "Safety relief valve", area: "VGO-HDT", unit: "Unit 3", criticality: "A", health: 90, status: "standby", vibration: 0, temperature: 42, lastInspection: daysAgo(45), nextDue: daysAhead(9) },
];

export const INSPECTIONS: InspectionRecord[] = [
  { id: "ins-01", assetTag: "P-2013B", asset: "Crude charge pump", type: "Vibration survey", inspector: "Rahul Nair", inspectedAt: hoursAgo(6), status: "completed", findings: 3, severity: "high", compliance: 92, aiConfidence: 0.94 },
  { id: "ins-02", assetTag: "K-5101", asset: "Combustion air blower", type: "Thermography", inspector: "Sneha Bhat", inspectedAt: hoursAgo(22), status: "completed", findings: 5, severity: "critical", compliance: 78, aiConfidence: 0.91 },
  { id: "ins-03", assetTag: "C-4201", asset: "SRU converter", type: "Internal visual", inspector: "Pooja Hegde", inspectedAt: hoursAgo(40), status: "in-progress", findings: 2, severity: "medium", compliance: 88, aiConfidence: 0.87 },
  { id: "ins-04", assetTag: "UT4-PIPE", asset: "Unit 4 piping", type: "Drone CUI survey", inspector: "Sneha Bhat", inspectedAt: daysAgo(3), status: "completed", findings: 12, severity: "high", compliance: 84, aiConfidence: 0.93 },
  { id: "ins-05", assetTag: "R-3001", asset: "VGO-HDT reactor", type: "Radiography", inspector: "Pooja Hegde", inspectedAt: daysAgo(5), status: "completed", findings: 1, severity: "low", compliance: 96, aiConfidence: 0.97 },
  { id: "ins-06", assetTag: "K-2201", asset: "Wet gas compressor", type: "Lube oil analysis", inspector: "Rahul Nair", inspectedAt: daysAgo(1), status: "overdue", findings: 4, severity: "high", compliance: 81, aiConfidence: 0.89 },
  { id: "ins-07", assetTag: "PSV-3310", asset: "Safety relief valve", type: "Pop test", inspector: "Suresh Prabhu", inspectedAt: daysAhead(4), status: "scheduled", findings: 0, severity: "low", compliance: 100, aiConfidence: 0 },
  { id: "ins-08", assetTag: "HE-2205", asset: "Vacuum overhead condenser", type: "Eddy current", inspector: "Pooja Hegde", inspectedAt: daysAhead(2), status: "scheduled", findings: 0, severity: "medium", compliance: 100, aiConfidence: 0 },
];

export const MAINTENANCE_JOBS: MaintenanceJob[] = [
  { id: "mj-01", workOrder: "WO-88412", asset: "Crude charge pump P-2013B", assetTag: "P-2013B", type: "Corrective", window: "Today · 14:00 – 18:00", crew: "Mechanical Crew A", lead: "Rahul Nair", status: "in-progress", priority: "critical", progress: 60 },
  { id: "mj-02", workOrder: "WO-88424", asset: "Air blower K-5101", assetTag: "K-5101", type: "Predictive", window: "Today · 18:00 – 22:00", crew: "Rotating Crew B", lead: "Rahul Nair", status: "scheduled", priority: "high", progress: 0 },
  { id: "mj-03", workOrder: "WO-88501", asset: "Vacuum overhead condenser HE-2205", assetTag: "HE-2205", type: "Preventive", window: "Tomorrow · 08:00 – 16:00", crew: "Static Crew C", lead: "Arjun Devadiga", status: "planned", priority: "medium", progress: 0 },
  { id: "mj-04", workOrder: "WO-88512", asset: "Combustion air blower K-5101", assetTag: "K-5101", type: "Corrective", window: "19 Sep · 06:00 – 14:00", crew: "Rotating Crew A", lead: "Arjun Devadiga", status: "scheduled", priority: "critical", progress: 0 },
  { id: "mj-05", workOrder: "WO-88520", asset: "PSV-3310 recertification", assetTag: "PSV-3310", type: "Preventive", window: "20 Sep · 09:00 – 13:00", crew: "Inspection Crew A", lead: "Suresh Prabhu", status: "planned", priority: "high", progress: 0 },
  { id: "mj-06", workOrder: "WO-88533", asset: "GT-9001 hot gas path inspection", assetTag: "GT-9001", type: "Shutdown", window: "26 Sep – 02 Oct", crew: "OEM + Mechanical", lead: "Arjun Devadiga", status: "planned", priority: "critical", progress: 12 },
  { id: "mj-07", workOrder: "WO-88544", asset: "P-4102A alignment check", assetTag: "P-4102A", type: "Preventive", window: "18 Sep · 10:00 – 12:00", crew: "Rotating Crew C", lead: "Rahul Nair", status: "completed", priority: "low", progress: 100 },
  { id: "mj-08", workOrder: "WO-88551", asset: "C-4201 converter bed thermocouple", assetTag: "C-4201", type: "Corrective", window: "21 Sep · 07:00 – 15:00", crew: "Instrument Crew B", lead: "Deepa Menon", status: "planned", priority: "high", progress: 0 },
];

export const APPROVALS: ApprovalItem[] = [
  { id: "apr-01", title: "Hot work permit — CDU-2 pipe rack bay 4", category: "Work permit", requester: "Rahul Nair", department: "Mechanical Maintenance", submittedAt: hoursAgo(2), status: "pending", priority: "critical", value: "Risk: high", summary: "Welding activity near live hydrocarbon line. Fire watch and gas test attached." },
  { id: "apr-02", title: "Spare procurement — P-2013B mechanical seal kit", category: "Purchase", requester: "Arjun Devadiga", department: "Mechanical Maintenance", submittedAt: hoursAgo(7), status: "pending", priority: "high", value: "₹ 18.4 L", summary: "OEM seal kit with 4-week lead time; required before turnaround window." },
  { id: "apr-03", title: "Shutdown work package — GT-9001 hot gas path", category: "Maintenance", requester: "Arjun Devadiga", department: "Mechanical Maintenance", submittedAt: hoursAgo(26), status: "pending", priority: "critical", value: "₹ 1.42 Cr", summary: "OEM-assisted inspection with 7-day outage and revised generation plan." },
  { id: "apr-04", title: "Incident report closure — steam trap failure UT-4", category: "Incident", requester: "Fatima Sheikh", department: "HSE", submittedAt: hoursAgo(32), status: "pending", priority: "medium", value: "Severity 2", summary: "Root cause identified as corrosion-erosion; corrective actions verified." },
  { id: "apr-05", title: "SOP revision — emergency flare header purge", category: "Procedure", requester: "Ananya Rao", department: "Process Operations", submittedAt: hoursAgo(48), status: "pending", priority: "high", value: "Rev 4", summary: "Revised purge sequence with two additional verification steps." },
  { id: "apr-06", title: "Confined space entry — VGO-HDT reactor R-3001", category: "Work permit", requester: "Pooja Hegde", department: "Inspection & NDT", submittedAt: daysAgo(3), status: "approved", priority: "high", value: "Risk: high", summary: "Approved with standby rescue team and continuous gas monitoring." },
  { id: "apr-07", title: "Annual calibration contract — field instruments", category: "Purchase", requester: "Deepa Menon", department: "Instrumentation", submittedAt: daysAgo(5), status: "rejected", priority: "medium", value: "₹ 42.0 L", summary: "Returned to vendor for revised rate breakup and NABL accreditation proof." },
  { id: "apr-08", title: "Radiography work permit — Unit 4 spool", category: "Work permit", requester: "Pooja Hegde", department: "Inspection & NDT", submittedAt: daysAgo(1), status: "returned", priority: "medium", value: "Risk: medium", summary: "Boundary markings must be re-submitted with night-shift barricading plan." },
];

export const SAFETY_ALERTS: SafetyAlert[] = [
  { id: "saf-01", severity: "critical", title: "Gas test overdue on hard barricade HB-14", area: "CDU-2 pipe rack", raisedAt: hoursAgo(1), status: "active", action: "Stop work until re-test is complete." },
  { id: "saf-02", severity: "high", title: "K-5101 bearing temperature above alarm", area: "Utilities blower house", raisedAt: hoursAgo(5), status: "monitoring", action: "Trend every 30 minutes; prepare standby blower." },
  { id: "saf-03", severity: "medium", title: "Fire extinguisher inspection due — 6 units", area: "SRU area", raisedAt: hoursAgo(11), status: "monitoring", action: "Schedule inspection with HSE in next shift." },
  { id: "saf-04", severity: "high", title: "Hot surface insulation gap detected by AI vision", area: "VGO-HDT charge line", raisedAt: hoursAgo(19), status: "active", action: "Raise corrective work order and re-survey after repair." },
  { id: "saf-05", severity: "low", title: "Eyewash station audit completed — no findings", area: "Tank farm", raisedAt: daysAgo(2), status: "closed", action: "No action required." },
];

/* --------------------------- AI workspaces data -------------------------- */

export const AGENTS: AgentRecord[] = [
  { id: "ag-01", name: "Document Intelligence Agent", purpose: "Parse, classify and summarise engineering documents, datasheets and vendor drawings.", model: "MRPL-Doc-L-70B", status: "online", requests24h: 12840, accuracy: 0.963, latencyMs: 740, owner: "Digital & IT" },
  { id: "ag-02", name: "Vision Inspection Agent", purpose: "Detect corrosion, insulation damage and equipment defects in inspection imagery.", model: "MRPL-Vision-XL", status: "online", requests24h: 4820, accuracy: 0.941, latencyMs: 1180, owner: "Inspection & NDT" },
  { id: "ag-03", name: "Operations Copilot", purpose: "Answer operator queries grounded in SOPs, P&IDs and historian context.", model: "MRPL-Copilot-32B", status: "online", requests24h: 9260, accuracy: 0.928, latencyMs: 520, owner: "Process Operations" },
  { id: "ag-04", name: "Predictive Maintenance Agent", purpose: "Allocate remaining useful life and raise prescriptive maintenance actions.", model: "MRPL-RUL-Ensemble", status: "degraded", requests24h: 3140, accuracy: 0.887, latencyMs: 2140, owner: "Mechanical Maintenance" },
  { id: "ag-05", name: "Compliance Auditor Agent", purpose: "Map OISD / Factory Act clauses to live plant evidence and flag gaps.", model: "MRPL-Compliance-14B", status: "online", requests24h: 1980, accuracy: 0.974, latencyMs: 860, owner: "HSE" },
  { id: "ag-06", name: "Knowledge Graph Curator", purpose: "Link assets, drawings, incidents and procedures into the enterprise knowledge graph.", model: "MRPL-Graph-8B", status: "training", requests24h: 640, accuracy: 0.902, latencyMs: 1620, owner: "Digital & IT" },
];

export const MODELS: ModelRecord[] = [
  { id: "mdl-01", name: "MRPL-Copilot-32B", provider: "Sovereign On-Prem", params: "32B", modality: "Text", status: "serving", gpu: "4 × H100 80GB", loadedAt: daysAgo(11) },
  { id: "mdl-02", name: "MRPL-Vision-XL", provider: "Sovereign On-Prem", params: "1.2B vision / 8B text", modality: "Image + Text", status: "serving", gpu: "2 × L40S 48GB", loadedAt: daysAgo(9) },
  { id: "mdl-03", name: "MRPL-Doc-L-70B", provider: "Sovereign On-Prem", params: "70B", modality: "Text + Layout", status: "serving", gpu: "8 × H100 80GB", loadedAt: daysAgo(21) },
  { id: "mdl-04", name: "MRPL-Embed-Te", provider: "Sovereign On-Prem", params: "335M", modality: "Embedding", status: "serving", gpu: "1 × A100 40GB", loadedAt: daysAgo(64) },
  { id: "mdl-05", name: "MRPL-RUL-Ensemble", provider: "Hybrid", params: "Internal ensemble", modality: "Time series", status: "loading", gpu: "2 × A100 40GB", loadedAt: hoursAgo(2) },
  { id: "mdl-06", name: "MRPL-Compliance-14B", provider: "Sovereign On-Prem", params: "14B", modality: "Text + Retrieval", status: "serving", gpu: "2 × H100 80GB", loadedAt: daysAgo(15) },
];

const CONVERSATION_MESSAGES: Record<string, AiConversation["messages"]> = {
  "cnv-01": [
    {
      id: "msg-01",
      role: "user",
      content:
        "CDU-2 column top pressure drifted to 1.52 kg/cm² over the last 6 hours. What should I check first?",
      createdAt: hoursAgo(3),
    },
    {
      id: "msg-02",
      role: "assistant",
      agent: "Operations Copilot",
      confidence: 0.93,
      createdAt: hoursAgo(2.9),
      citations: [
        "SOP-CDU-014 Rev 6 · Column pressure control",
        "Historian · PT-2041 last 24 h",
      ],
      content: `**Assessment — pressure drift on CDU-2 (C-2001)**

The 6-hour drift from 1.42 to 1.52 kg/cm² is outside the normal band tracked by SOP-CDU-014 Rev 6. Likely contributors, in order of probability:

1. **Overhead condenser fouling** — HE-2205 is already flagged in maintenance with an eddy-current inspection scheduled. Reduced condensing duty raises column pressure.
2. **Reflux ratio falling away** — verify reflux flow controller FC-2207 against the design ratio.
3. **Pressure controller PC-2041 tuning drift** — check valve positioner output versus signal.
4. **Non-condensable accumulation** — confirm off-gas vent line is not partially blocked.

**Recommended next steps**

\`\`\`text
1. Trend PT-2041, FC-2207, TT-2214 for the last 12 h
2. Compare against the pressure envelope in SOP-CDU-014 (Table 3)
3. Raise a condition-monitoring task for HE-2205
4. Escalate to the duty manager if pressure exceeds 1.58 kg/cm²
\`\`\`

This is a recommendation only — the console operator retains authority for any control action.`,
    },
    {
      id: "msg-03",
      role: "user",
      content: "Attach the relevant SOP section to the shift report as well.",
      createdAt: hoursAgo(2.2),
    },
    {
      id: "msg-04",
      role: "assistant",
      agent: "Operations Copilot",
      confidence: 0.9,
      createdAt: hoursAgo(2.1),
      citations: ["SOP-CDU-014 Rev 6 · §4.2"],
      content:
        "Done. I have staged **SOP-CDU-014 Rev 6 §4.2 (Column pressure control)** and the PT-2041 historian extract as attachments for the Shift A handover report. The report draft is saved in Reports → *Shift handover · 16 Sep 2026*, and it will be routed to Vikram Shetty on submission.",
    },
  ],
  "cnv-02": [
    {
      id: "msg-05",
      role: "user",
      content:
        "Summarise the API 570 findings for the 6\"-P-1204-A1A line and whether we can extend the inspection interval.",
      createdAt: hoursAgo(26),
    },
    {
      id: "msg-06",
      role: "assistant",
      agent: "Document Intelligence Agent",
      confidence: 0.89,
      createdAt: hoursAgo(25.9),
      citations: [
        "Inspection report INS-2026-0412",
        "API 570 · §7 remaining life calculation",
      ],
      content: `**Findings — line 6"-P-1204-A1A**

| Parameter | Value | Limit | Verdict |
| --- | --- | --- | --- |
| Minimum measured thickness | 8.7 mm | 6.4 mm | Acceptable |
| Corrosion rate | 0.21 mm/yr | 0.25 mm/yr | Trending |
| Remaining life | 11.2 yr | 10 yr | Acceptable |

The interval extension from 24 to 36 months is **technically defensible**, but the predicted corrosion rate has risen 14% versus the previous campaign. I recommend a **condition-based extension** with ultrasonic grid monitoring every 12 months rather than a full interval extension.`,
    },
  ],
  "cnv-03": [
    {
      id: "msg-07",
      role: "user",
      content: "Which OISD clauses are impacted by the revised flare purge SOP?",
      createdAt: daysAgo(2),
    },
    {
      id: "msg-08",
      role: "assistant",
      agent: "Compliance Auditor Agent",
      confidence: 0.95,
      createdAt: daysAgo(2),
      citations: ["OISD-STD-114 §6.3", "SOP-FLARE-002 Rev 4"],
      content: `**Regulatory mapping — flare header purge SOP revision**

- **OISD-STD-114 §6.3** — purge rates must be verified and documented each shift. The revision adds an explicit verification step, so **compliance improves**.
- **OISD-STD-114 §6.7** — continuous monitoring of flare header oxygen content. Evidence trail now recorded via the workstation (audit ID retained 7 years).
- **Factory Act §41B** — safety committee approval is required before the revision is issued. Attach the minutes reference to the SOP record.

No conflicting clauses were detected across the 1,284 indexed regulatory documents.`,
    },
  ],
  "cnv-04": [
    {
      id: "msg-09",
      role: "user",
      content: "Draft a one-page summary of this month's department KPIs for the management review.",
      createdAt: daysAgo(4),
    },
    {
      id: "msg-10",
      role: "assistant",
      agent: "Operations Copilot",
      confidence: 0.87,
      createdAt: daysAgo(4),
      citations: ["Department KPI warehouse · August 2026"],
      content: `**Process Operations — management review summary**

- **Equipment availability 92.4%** (+1.8 pts MoM) driven by improved pump reliability on the crude circuit.
- **Open work orders 34** (−6 MoM); 4 are criticality A.
- **Inspection backlog 3 assets** overdue — K-2201, K-5101 leading indicators.
- **Safety compliance 96%**; one critical alert remains active on K-5101 bearing temperature.
- **AI-assisted closures** contributed 41 hours of recovered engineering man-hours.

**Ask:** approve the standby blower overhaul in the 19 Sep window to de-risk K-5101.`,
    },
  ],
};

export const CONVERSATIONS: AiConversation[] = [
  { id: "cnv-01", title: "CDU-2 column pressure drift investigation", agent: "Operations Copilot", updatedAt: hoursAgo(2.1), messageCount: 4, pinned: true, messages: CONVERSATION_MESSAGES["cnv-01"] },
  { id: "cnv-02", title: "API 570 remaining life — P-1204-A1A", agent: "Document Intelligence Agent", updatedAt: hoursAgo(25.9), messageCount: 2, messages: CONVERSATION_MESSAGES["cnv-02"] },
  { id: "cnv-03", title: "OISD mapping for flare purge SOP revision", agent: "Compliance Auditor Agent", updatedAt: daysAgo(2), messageCount: 2, messages: CONVERSATION_MESSAGES["cnv-03"] },
  { id: "cnv-04", title: "August department KPI summary", agent: "Operations Copilot", updatedAt: daysAgo(4), messageCount: 2, messages: CONVERSATION_MESSAGES["cnv-04"] },
];

export const VISION_ANALYSES: VisionAnalysis[] = [
  {
    id: "vis-01",
    fileName: "K-5101_blower_bearing_thermography.jpg",
    assetTag: "K-5101",
    asset: "Combustion air blower",
    uploadedBy: "Sneha Bhat",
    uploadedAt: hoursAgo(5),
    modality: "Thermography",
    summary:
      "Outboard bearing housing showing a 38 °C hot spot against a 60 °C ambient-corrected reference. Pattern is consistent with lubricant starvation rather than misalignment.",
    compliance: 78,
    confidence: 0.94,
    status: "flagged",
    equipment: [
      { id: "de-01", label: "Bearing housing (outboard)", tag: "K-5101-BRG-OB", confidence: 0.96, box: { x: 46, y: 52, w: 22, h: 20 }, condition: "defect" },
      { id: "de-02", label: "Coupling guard", tag: "K-5101-CPL", confidence: 0.91, box: { x: 18, y: 48, w: 20, h: 26 }, condition: "normal" },
      { id: "de-03", label: "Lube oil line", tag: "K-5101-LO", confidence: 0.88, box: { x: 68, y: 34, w: 18, h: 14 }, condition: "watch" },
    ],
    ocr: [
      { id: "ocr-01", text: "K-5101", confidence: 0.99, region: "Asset tag plate" },
      { id: "ocr-02", text: "MOTOR 450 kW · 2985 RPM", confidence: 0.95, region: "Motor nameplate" },
      { id: "ocr-03", text: "LUBE: ISO VG 46 · 2000 HRS", confidence: 0.92, region: "Bearing lube label" },
    ],
    recommendations: [
      "Raise a corrective work order for outboard bearing lubrication within 24 hours.",
      "Capture a second thermogram after re-greasing to close the loop.",
      "Cross-check vibration spectrum for BPFO frequency.",
    ],
  },
  {
    id: "vis-02",
    fileName: "UT4_pipe_rack_CUI_survey_07.jpg",
    assetTag: "UT4-PIPE",
    asset: "Unit 4 piping network",
    uploadedBy: "Sneha Bhat",
    uploadedAt: daysAgo(3),
    modality: "Drone survey",
    summary:
      "Insulation cladding breach detected on the 8\" steam header with visible wet staining. Localised CUI risk rated medium-high; two adjacent supports show coating breakdown.",
    compliance: 84,
    confidence: 0.92,
    status: "analyzed",
    equipment: [
      { id: "de-04", label: "8\" steam header", tag: "UT4-SH-08", confidence: 0.97, box: { x: 10, y: 40, w: 74, h: 18 }, condition: "defect" },
      { id: "de-05", label: "Pipe support S-114", tag: "UT4-S114", confidence: 0.89, box: { x: 30, y: 60, w: 16, h: 24 }, condition: "watch" },
      { id: "de-06", label: "Insulation cladding", tag: "UT4-CLAD", confidence: 0.93, box: { x: 56, y: 42, w: 24, h: 14 }, condition: "defect" },
    ],
    ocr: [
      { id: "ocr-04", text: "8\"-SH-1042-A1A", confidence: 0.94, region: "Line number stencil" },
      { id: "ocr-05", text: "INSUL. 100mm MINERAL WOOL", confidence: 0.9, region: "Cladding label" },
    ],
    recommendations: [
      "Open CUI investigation window for UT4-SH-08 within the next turnaround.",
      "UT spot readings at 6 grid points under the breached cladding.",
      "Record the finding in the asset integrity register.",
    ],
  },
  {
    id: "vis-03",
    fileName: "R-3001_reactor_nozzle_radiograph.tif",
    assetTag: "R-3001",
    asset: "VGO hydrotreater reactor",
    uploadedBy: "Pooja Hegde",
    uploadedAt: daysAgo(5),
    modality: "Radiography",
    summary:
      "No planar indications or crack-like defects detected on the N2 nozzle weld. Weld reinforcement profile is within ASME acceptance limits.",
    compliance: 96,
    confidence: 0.97,
    status: "analyzed",
    equipment: [
      { id: "de-07", label: "N2 nozzle weld", tag: "R-3001-N2-W1", confidence: 0.98, box: { x: 38, y: 36, w: 26, h: 30 }, condition: "normal" },
      { id: "de-08", label: "Reinforcement pad", tag: "R-3001-RP", confidence: 0.86, box: { x: 24, y: 60, w: 52, h: 16 }, condition: "normal" },
    ],
    ocr: [
      { id: "ocr-06", text: "WELD N2-W1 · RT FILM 12/14", confidence: 0.93, region: "Film header" },
      { id: "ocr-07", text: "ASME SEC VIII DIV 1", confidence: 0.96, region: "Drawing block" },
    ],
    recommendations: [
      "Accept the weld; no re-test required.",
      "Archive the film against asset R-3001 for the statutory 7-year retention.",
    ],
  },
];

export const DOCUMENTS: DocumentRecord[] = [
  {
    id: "doc-01",
    name: "CDU-2 P&ID Rev 12 (as-built).pdf",
    kind: "PDF",
    size: "18.4 MB",
    department: "Process Engineering",
    uploadedBy: "Ananya Rao",
    uploadedAt: hoursAgo(4),
    version: "Rev 12",
    versions: 12,
    status: "indexed",
    bookmarked: true,
    summary:
      "As-built P&ID covering the crude preheat train, column internals and overhead system. 42 tag changes versus Rev 11.",
    metadata: [
      { label: "Drawing number", value: "MRPL-PID-CDU2-0012" },
      { label: "Sheet count", value: "6" },
      { label: "Approved by", value: "Process Engineering Head" },
      { label: "Retention", value: "Life of asset" },
    ],
    pages: 6,
  },
  {
    id: "doc-02",
    name: "SOP-CDU-014 Column pressure control Rev 6.docx",
    kind: "DOCX",
    size: "2.1 MB",
    department: "Process Operations",
    uploadedBy: "Vikram Shetty",
    uploadedAt: hoursAgo(28),
    version: "Rev 6",
    versions: 6,
    status: "indexed",
    bookmarked: true,
    summary:
      "Operating procedure for column pressure control including excursion response matrix and escalation triggers.",
    metadata: [
      { label: "Procedure ID", value: "SOP-CDU-014" },
      { label: "Review cycle", value: "24 months" },
      { label: "Owner", value: "Process Operations" },
      { label: "Next review", value: "Mar 2027" },
    ],
    pages: 18,
  },
  {
    id: "doc-03",
    name: "P-2013B seal plan datasheet.xlsx",
    kind: "XLSX",
    size: "860 KB",
    department: "Mechanical Maintenance",
    uploadedBy: "Rahul Nair",
    uploadedAt: daysAgo(1),
    version: "Rev 3",
    versions: 3,
    status: "indexed",
    bookmarked: false,
    summary:
      "Pump datasheet with API Plan 53B seal parameters, barrier fluid pressures and OEM tolerances.",
    metadata: [
      { label: "Datasheet", value: "DS-P-2013B" },
      { label: "OEM", value: "Sulzer" },
      { label: "Seal type", value: "Dual pressurised" },
      { label: "API plan", value: "53B" },
    ],
    pages: 4,
  },
  {
    id: "doc-04",
    name: "Inspection report INS-2026-0412.pdf",
    kind: "PDF",
    size: "6.7 MB",
    department: "Inspection & NDT",
    uploadedBy: "Pooja Hegde",
    uploadedAt: daysAgo(2),
    version: "Final",
    versions: 2,
    status: "indexed",
    bookmarked: true,
    summary:
      "API 570 in-service inspection report for line 6\"-P-1204-A1A with UT grid readings and remaining-life calculation.",
    metadata: [
      { label: "Report ID", value: "INS-2026-0412" },
      { label: "Standard", value: "API 570" },
      { label: "Inspector", value: "Pooja Hegde" },
      { label: "Next due", value: "Sep 2027" },
    ],
    pages: 32,
  },
  {
    id: "doc-05",
    name: "Turnaround scope pack CDU-2.pptx",
    kind: "PPTX",
    size: "12.9 MB",
    department: "Mechanical Maintenance",
    uploadedBy: "Arjun Devadiga",
    uploadedAt: daysAgo(4),
    version: "Draft 3",
    versions: 3,
    status: "processing",
    bookmarked: false,
    summary:
      "Steering committee deck with 42 work packages, man-hour estimates and the critical path for the CDU-2 turnaround.",
    metadata: [
      { label: "Slides", value: "38" },
      { label: "Owner", value: "Turnaround cell" },
      { label: "Budget", value: "₹ 46.2 Cr" },
      { label: "Duration", value: "21 days" },
    ],
    pages: 38,
  },
  {
    id: "doc-06",
    name: "E-2103 heat exchanger drawing Rev C.dwg",
    kind: "DWG",
    size: "24.5 MB",
    department: "Process Engineering",
    uploadedBy: "Nikhil Shenoy",
    uploadedAt: daysAgo(6),
    version: "Rev C",
    versions: 3,
    status: "indexed",
    bookmarked: false,
    summary:
      "Mechanical drawing for the feed/effluent exchanger with nozzle orientation and tube sheet details.",
    metadata: [
      { label: "Drawing", value: "MRPL-MD-E2103-0003" },
      { label: "Vendor", value: "BHEL" },
      { label: "TEMA type", value: "BEM" },
      { label: "Rev", value: "C" },
    ],
    pages: 2,
  },
  {
    id: "doc-07",
    name: "OISD-STD-114 flare systems extract.pdf",
    kind: "PDF",
    size: "4.3 MB",
    department: "HSE",
    uploadedBy: "Fatima Sheikh",
    uploadedAt: daysAgo(9),
    version: "2024 edition",
    versions: 1,
    status: "indexed",
    bookmarked: true,
    summary:
      "Statutory extract covering flare header purging, oxygen monitoring and documentation requirements.",
    metadata: [
      { label: "Standard", value: "OISD-STD-114" },
      { label: "Edition", value: "2024" },
      { label: "Scope", value: "Flare & relief systems" },
      { label: "Retention", value: "7 years" },
    ],
    pages: 26,
  },
  {
    id: "doc-08",
    name: "Shift A handover log 15-Sep-2026.xlsx",
    kind: "XLSX",
    size: "420 KB",
    department: "Process Operations",
    uploadedBy: "Ananya Rao",
    uploadedAt: daysAgo(1),
    version: "Final",
    versions: 1,
    status: "indexed",
    bookmarked: false,
    summary:
      "Shift log with readings, deviations, permit status and pending handover actions.",
    metadata: [
      { label: "Shift", value: "A" },
      { label: "Crew", value: "A-3" },
      { label: "Entries", value: "84" },
      { label: "Open items", value: "6" },
    ],
    pages: 3,
  },
  {
    id: "doc-09",
    name: "Corrosion monitoring plan 2026.pdf",
    kind: "PDF",
    size: "8.8 MB",
    department: "Inspection & NDT",
    uploadedBy: "Suresh Prabhu",
    uploadedAt: daysAgo(14),
    version: "Rev 2",
    versions: 2,
    status: "indexed",
    bookmarked: false,
    summary:
      "Annual corrosion monitoring plan with UT locations, corrosion loops and inspection intervals.",
    metadata: [
      { label: "Plan ID", value: "CMP-2026" },
      { label: "Corrosion loops", value: "38" },
      { label: "UT locations", value: "412" },
      { label: "Owner", value: "Inspection & NDT" },
    ],
    pages: 48,
  },
  {
    id: "doc-10",
    name: "Vendor manual — wet gas compressor K-2201.pdf",
    kind: "PDF",
    size: "31.2 MB",
    department: "Mechanical Maintenance",
    uploadedBy: "Rahul Nair",
    uploadedAt: daysAgo(21),
    version: "OEM Rev 4",
    versions: 4,
    status: "archived",
    bookmarked: false,
    summary:
      "OEM installation, operation and maintenance manual including troubleshooting matrix.",
    metadata: [
      { label: "OEM", value: "Siemens Energy" },
      { label: "Machine", value: "K-2201" },
      { label: "Chapters", value: "14" },
      { label: "Support", value: "OEM contract AMC-2026" },
    ],
    pages: 210,
  },
];

export const KNOWLEDGE_RESULTS: KnowledgeResult[] = [
  {
    id: "kn-01",
    title: "Column pressure control and excursion response",
    source: "SOP-CDU-014 Rev 6 · Process Operations",
    kind: "SOP",
    snippet:
      "Normal column top pressure shall be maintained between 1.38 and 1.48 kg/cm². On exceeding 1.58 kg/cm², the console operator shall reduce charge rate by 5% and inform the duty manager immediately...",
    score: 0.94,
    department: "Process Operations",
    updatedAt: daysAgo(3),
    related: ["SOP-CDU-021", "INS-2026-0412", "OISD-STD-114"],
  },
  {
    id: "kn-02",
    title: "API 570 remaining-life calculation for P-1204-A1A",
    source: "Inspection report INS-2026-0412",
    kind: "PDF",
    snippet:
      "Minimum measured thickness 8.7 mm against a 6.4 mm retirement thickness. Corrosion rate 0.21 mm/yr produces a remaining life of 11.2 years, exceeding the 10-year interval criterion...",
    score: 0.91,
    department: "Inspection & NDT",
    updatedAt: daysAgo(2),
    related: ["CMP-2026", "API 570", "UT grid survey"],
  },
  {
    id: "kn-03",
    title: "Flare header purge and oxygen monitoring requirements",
    source: "OISD-STD-114 · clause 6.3 / 6.7",
    kind: "Standard",
    snippet:
      "Purge flow rates shall be verified and documented each shift. Flare header oxygen content shall be continuously monitored with alarm at 2% vol; excursions shall be recorded with the corrective action taken...",
    score: 0.89,
    department: "HSE",
    updatedAt: daysAgo(9),
    related: ["SOP-FLARE-002", "Factory Act §41B"],
  },
  {
    id: "kn-04",
    title: "API Plan 53B seal support system — commissioning checks",
    source: "Vendor commissioning manual · P-2013B",
    kind: "Manual",
    snippet:
      "Barrier fluid pressure shall be maintained 2.5 bar above seal chamber pressure. Verify accumulator pre-charge and confirm the cooler outlet temperature is below 65 °C before start-up...",
    score: 0.86,
    department: "Mechanical Maintenance",
    updatedAt: daysAgo(12),
    related: ["DS-P-2013B", "API 682"],
  },
  {
    id: "kn-05",
    title: "Corrosion under insulation management programme",
    source: "Corrosion monitoring plan CMP-2026",
    kind: "PDF",
    snippet:
      "CUI-susceptible locations shall be surveyed at least once per interval. Where cladding breaches are identified, UT readings shall be taken at a minimum of six grid points and the finding recorded in the integrity register...",
    score: 0.84,
    department: "Inspection & NDT",
    updatedAt: daysAgo(14),
    related: ["UT4-PIPE", "Insulation survey"],
  },
  {
    id: "kn-06",
    title: "Hot work permit decision matrix",
    source: "Permit to work system · HSE manual",
    kind: "Manual",
    snippet:
      "Hot work within 15 m of a live hydrocarbon line requires a gas test within the last 30 minutes, a dedicated fire watch and a signed area authority endorsement...",
    score: 0.82,
    department: "HSE",
    updatedAt: daysAgo(7),
    related: ["apr-01", "OISD-STD-105"],
  },
];

export const SAVED_SEARCHES: SavedSearch[] = [
  { id: "ss-01", label: "Column pressure excursions", query: "column top pressure drift excursion response", scope: "Process Operations", results: 48, savedAt: daysAgo(6) },
  { id: "ss-02", label: "Pump seal failures", query: "mechanical seal failure root cause centrifugal pump", scope: "Mechanical Maintenance", results: 112, savedAt: daysAgo(11) },
  { id: "ss-03", label: "CUI inspection standards", query: "corrosion under insulation survey requirements", scope: "Inspection & NDT", results: 76, savedAt: daysAgo(18) },
  { id: "ss-04", label: "Statutory retention rules", query: "statutory document retention refinery records", scope: "HSE", results: 34, savedAt: daysAgo(24) },
];

/* ------------------------------- AI output ------------------------------- */

export const REPORTS: ReportRecord[] = [
  { id: "rep-01", title: "Shift A handover — 16 Sep 2026", type: "Shift handover", period: "Shift A · 06:00 – 14:00", owner: "Ananya Rao", department: "Process Operations", status: "draft", generatedAt: hoursAgo(1), pages: 6, formats: ["PDF", "DOCX", "XLSX"] },
  { id: "rep-02", title: "Monthly inspection summary — August 2026", type: "Inspection", period: "Aug 2026", owner: "Suresh Prabhu", department: "Inspection & NDT", status: "approved", generatedAt: daysAgo(9), pages: 24, formats: ["PDF", "XLSX"] },
  { id: "rep-03", title: "Department KPI pack — August 2026", type: "Department KPI", period: "Aug 2026", owner: "Vikram Shetty", department: "Process Operations", status: "in-review", generatedAt: daysAgo(4), pages: 18, formats: ["PDF", "DOCX"] },
  { id: "rep-04", title: "Statutory compliance report — Q2 FY27", type: "Compliance", period: "Q2 FY 2026-27", owner: "Fatima Sheikh", department: "HSE", status: "published", generatedAt: daysAgo(17), pages: 42, formats: ["PDF"] },
  { id: "rep-05", title: "Preventive maintenance adherence — August 2026", type: "Maintenance", period: "Aug 2026", owner: "Arjun Devadiga", department: "Mechanical Maintenance", status: "approved", generatedAt: daysAgo(11), pages: 15, formats: ["PDF", "XLSX"] },
  { id: "rep-06", title: "Enterprise AI usage & governance audit", type: "Enterprise audit", period: "Aug 2026", owner: "Meera Krishnan", department: "Digital & IT", status: "in-review", generatedAt: daysAgo(2), pages: 31, formats: ["PDF", "DOCX"] },
  { id: "rep-07", title: "Turnaround readiness review — CDU-2", type: "Maintenance", period: "Sep 2026", owner: "Arjun Devadiga", department: "Mechanical Maintenance", status: "draft", generatedAt: hoursAgo(20), pages: 12, formats: ["PDF", "DOCX", "XLSX"] },
  { id: "rep-08", title: "Refinery energy performance — August 2026", type: "Department KPI", period: "Aug 2026", owner: "Vikram Shetty", department: "Process Operations", status: "published", generatedAt: daysAgo(13), pages: 20, formats: ["PDF"] },
];

export const DOWNLOADS: DownloadItem[] = [
  { id: "dl-01", name: "Shift A handover — 16 Sep 2026.pdf", kind: "PDF", size: "1.8 MB", downloadedAt: hoursAgo(1), destination: "My Downloads", status: "ready" },
  { id: "dl-02", name: "INS-2026-0412 inspection report.pdf", kind: "PDF", size: "6.7 MB", downloadedAt: daysAgo(1), destination: "My Downloads", status: "ready" },
  { id: "dl-03", name: "CDU-2 P&ID Rev 12.pdf", kind: "PDF", size: "18.4 MB", downloadedAt: daysAgo(2), destination: "Shared · Process Engineering", status: "ready" },
  { id: "dl-04", name: "Vision analysis export — K-5101.zip", kind: "Archive", size: "42.6 MB", downloadedAt: hoursAgo(4), destination: "Secure vault", status: "generating" },
  { id: "dl-05", name: "Corrosion monitoring plan 2026.pdf", kind: "PDF", size: "8.8 MB", downloadedAt: daysAgo(6), destination: "Shared · Inspection", status: "ready" },
  { id: "dl-06", name: "Turnaround scope pack CDU-2.pptx", kind: "PPTX", size: "12.9 MB", downloadedAt: daysAgo(8), destination: "My Downloads", status: "expired" },
];

/* ----------------------------- notifications ----------------------------- */

export const NOTIFICATIONS: AppNotification[] = [
  { id: "ntf-01", category: "safety", priority: "critical", title: "Gas test overdue — hard barricade HB-14", body: "CDU-2 pipe rack: stop work until the gas test is repeated and logged.", createdAt: hoursAgo(1), read: false, actor: "HSE control room", href: "/dashboard" },
  { id: "ntf-02", category: "task", priority: "high", title: "WO-88412 assigned to you", body: "Verify P-2013B mechanical seal flush plan before shift end.", createdAt: hoursAgo(2), read: false, actor: "Vikram Shetty", href: "/tasks" },
  { id: "ntf-03", category: "ai", priority: "high", title: "Vision agent flagged K-5101 bearing", body: "Thermography indicates a 38 °C hot spot on the outboard bearing housing.", createdAt: hoursAgo(5), read: false, actor: "Vision Inspection Agent", href: "/vision" },
  { id: "ntf-04", category: "approval", priority: "medium", title: "Hot work permit awaiting approval", body: "CDU-2 pipe rack bay 4 — submitted by Rahul Nair.", createdAt: hoursAgo(2.5), read: false, actor: "Rahul Nair", href: "/approvals" },
  { id: "ntf-05", category: "system", priority: "medium", title: "Model refresh completed", body: "MRPL-Compliance-14B finished nightly re-indexing of 1,284 regulatory documents.", createdAt: hoursAgo(8), read: true, actor: "Model registry" },
  { id: "ntf-06", category: "task", priority: "medium", title: "WO-88444 needs validation", body: "AI-extracted datasheet for E-2103 is awaiting engineering confirmation.", createdAt: hoursAgo(6), read: false, actor: "Document Intelligence Agent", href: "/tasks" },
  { id: "ntf-07", category: "ai", priority: "low", title: "Knowledge graph updated", body: "148 new asset-to-procedure links published by the curator agent.", createdAt: hoursAgo(14), read: true, actor: "Knowledge Graph Curator" },
  { id: "ntf-08", category: "approval", priority: "high", title: "Shutdown work package escalated", body: "GT-9001 hot gas path package routed to the enterprise approval chain.", createdAt: hoursAgo(26), read: true, actor: "Approval engine", href: "/approvals" },
  { id: "ntf-09", category: "system", priority: "low", title: "Backup verified", body: "Incremental enterprise backup completed with integrity check passed.", createdAt: daysAgo(1), read: true, actor: "System health" },
  { id: "ntf-10", category: "safety", priority: "medium", title: "Fire extinguisher inspection due", body: "6 units in the SRU area are past the scheduled inspection date.", createdAt: hoursAgo(11), read: false, actor: "HSE control room", href: "/dashboard" },
];

export const STATUS_BAR: StatusBarInfo = {
  plant: "Katipalla Refinery · Mangaluru",
  shift: "Shift A · 06:00 – 14:00",
  aiServices: 6,
  latencyMs: 640,
  dataSyncAt: hoursAgo(0.2),
  environment: "Sovereign on-premise",
};

/* -------------------------------- analytics ------------------------------ */

const wave = (i: number, base: number, amp: number, drift = 0) =>
  Math.round((base + Math.sin(i / 1.7) * amp + i * drift) * 10) / 10;

export const THROUGHPUT_TREND: TrendPoint[] = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
].map((label, i) => ({
  label,
  crude: wave(i, 218, 6, 0.2),
  target: 220,
  yield: wave(i, 92, 1.4),
}));

export const COMPLIANCE_TREND: TrendPoint[] = [
  "Apr", "May", "Jun", "Jul", "Aug", "Sep",
].map((label, i) => ({
  label,
  compliance: wave(i, 93, 1.2, 0.6),
  safety: wave(i, 91, 1.6, 0.7),
  aiAssisted: wave(i, 58, 3.5, 3.4),
}));

export const ENERGY_TREND: TrendPoint[] = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
].map((label, i) => ({
  label,
  specificEnergy: wave(i, 6.4, 0.16, -0.02),
  benchmark: 6.2,
}));

export const WORKLOAD_TREND: TrendPoint[] = [
  "Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6",
].map((label, i) => ({
  label,
  planned: wave(i, 42, 4, 0.6),
  completed: wave(i, 37, 5, 0.9),
}));

export const DEFECT_DISTRIBUTION = [
  { name: "Corrosion", value: 38, color: "#10b981" },
  { name: "Insulation damage", value: 24, color: "#f59e0b" },
  { name: "Mechanical wear", value: 18, color: "#64748b" },
  { name: "Instrumentation", value: 12, color: "#14b8a6" },
  { name: "Coating failure", value: 8, color: "#6366f1" },
];

export const AI_USAGE_BY_AGENT = [
  { name: "Doc Intelligence", requests: 12840, color: "#10b981" },
  { name: "Operations Copilot", requests: 9260, color: "#14b8a6" },
  { name: "Vision Inspection", requests: 4820, color: "#f59e0b" },
  { name: "Predictive Maint.", requests: 3140, color: "#6366f1" },
  { name: "Compliance Auditor", requests: 1980, color: "#64748b" },
];

/** Heatmap of inspection coverage: 7 areas × 12 months. */
export const INSPECTION_HEATMAP: { area: string; values: number[] }[] = [
  { area: "CDU-2", values: [82, 88, 74, 91, 86, 93, 89, 84, 92, 90, 87, 94] },
  { area: "VGO-HDT", values: [76, 72, 81, 79, 84, 88, 82, 80, 86, 83, 81, 89] },
  { area: "VDU", values: [64, 68, 71, 66, 74, 78, 72, 70, 76, 75, 73, 80] },
  { area: "SRU", values: [88, 84, 90, 86, 92, 89, 94, 91, 90, 93, 92, 95] },
  { area: "Utilities", values: [58, 62, 66, 60, 68, 72, 70, 66, 71, 69, 68, 74] },
  { area: "Tank farm", values: [72, 76, 74, 78, 80, 76, 82, 79, 81, 84, 80, 86] },
  { area: "Power block", values: [80, 82, 78, 84, 86, 88, 85, 83, 87, 89, 86, 91] },
];

export const EMPLOYEE_KPIS: KpiMetric[] = [
  { id: "ek-01", label: "Open tasks", value: 6, unit: "tasks", delta: -2, intent: "positive", caption: "4 due within 48 hours", target: 8 },
  { id: "ek-02", label: "Inspections logged", value: 14, unit: "this month", delta: 3, intent: "positive", caption: "AI pre-screened 11", target: 16 },
  { id: "ek-03", label: "AI assist hours saved", value: 26.5, unit: "hours", delta: 5.2, intent: "positive", caption: "Across 3 workspace sessions" },
  { id: "ek-04", label: "Safety observations", value: 9, unit: "closed", delta: 1, intent: "positive", caption: "1 critical alert active", target: 10 },
];

export const MANAGER_KPIS: KpiMetric[] = [
  { id: "mk-01", label: "Department availability", value: 92.4, unit: "%", delta: 1.8, intent: "positive", caption: "Target 93%", target: 93 },
  { id: "mk-02", label: "Pending approvals", value: 7, unit: "requests", delta: 2, intent: "negative", caption: "2 critical priority", target: 4 },
  { id: "mk-03", label: "Open work orders", value: 34, unit: "orders", delta: -6, intent: "positive", caption: "4 criticality A assets" },
  { id: "mk-04", label: "Safety compliance", value: 96.2, unit: "%", delta: 1.1, intent: "positive", caption: "1 critical alert active", target: 98 },
  { id: "mk-05", label: "Inspection progress", value: 78, unit: "%", delta: 6, intent: "positive", caption: "22 of 28 planned", target: 85 },
  { id: "mk-06", label: "Team utilisation", value: 81, unit: "%", delta: -3, intent: "negative", caption: "Two engineers over 90%" },
];

export const ADMIN_KPIS: KpiMetric[] = [
  { id: "ak-01", label: "Active users", value: 1346, unit: "today", delta: 42, intent: "positive", caption: "Across 8 refinery areas" },
  { id: "ak-02", label: "AI requests", value: 32840, unit: "24 hours", delta: 12.4, intent: "positive", caption: "6 agents online" },
  { id: "ak-03", label: "GPU utilisation", value: 78, unit: "%", delta: 5, intent: "negative", caption: "16 × H100 / 4 × L40S", target: 70 },
  { id: "ak-04", label: "Knowledge indexed", value: 1284200, unit: "chunks", delta: 18400, intent: "positive", caption: "24,180 documents" },
  { id: "ak-05", label: "Security alerts", value: 3, unit: "open", delta: -2, intent: "positive", caption: "0 critical, 3 monitored" },
  { id: "ak-06", label: "Platform uptime", value: 99.982, unit: "%", delta: 0.004, intent: "positive", caption: "Trailing 90 days" },
];

export const SYSTEM_METRICS: SystemMetric[] = [
  { id: "sm-01", label: "Application cluster", value: 12, unit: "pods", capacity: 16, status: "healthy", detail: "All workloads within the sovereign zone" },
  { id: "sm-02", label: "GPU fleet utilisation", value: 78, unit: "%", capacity: 100, status: "watch", detail: "16 × H100 80GB, 4 × L40S 48GB" },
  { id: "sm-03", label: "Inference latency p95", value: 1180, unit: "ms", capacity: 2000, status: "healthy", detail: "Vision agent is the slowest path" },
  { id: "sm-04", label: "Vector store utilisation", value: 64, unit: "%", capacity: 100, status: "healthy", detail: "1.28 M chunks across 3 collections" },
  { id: "sm-05", label: "Primary database load", value: 46, unit: "%", capacity: 100, status: "healthy", detail: "Timescale reader replicas balanced" },
  { id: "sm-06", label: "Archive storage", value: 71, unit: "%", capacity: 100, status: "healthy", detail: "412 TB of 580 TB consumed" },
  { id: "sm-07", label: "Message queue depth", value: 2140, unit: "jobs", capacity: 10000, status: "healthy", detail: "Ingestion pipeline catch-up" },
  { id: "sm-08", label: "Backup freshness", value: 98, unit: "%", capacity: 100, status: "healthy", detail: "Last full backup 4 hours ago" },
  { id: "sm-09", label: "Object storage egress", value: 88, unit: "%", capacity: 100, status: "critical", detail: "Nightly export window saturated" },
];

export const AUDIT_EVENTS: AuditEvent[] = [
  { id: "ad-01", actor: "Meera Krishnan", action: "Granted role", target: "Enterprise Administrator → Latha Gowda", module: "Roles", at: hoursAgo(3), severity: "warning", ip: "10.24.8.11" },
  { id: "ad-02", actor: "System", action: "Model promoted to serving", target: "MRPL-Compliance-14B", module: "Models", at: hoursAgo(8), severity: "info", ip: "10.24.0.5" },
  { id: "ad-03", actor: "Ananya Rao", action: "Exported AI transcript", target: "CDU-2 pressure drift conversation", module: "AI Chat", at: hoursAgo(2), severity: "info", ip: "10.24.12.87" },
  { id: "ad-04", actor: "Suresh Prabhu", action: "Uploaded controlled document", target: "INS-2026-0412.pdf", module: "Documents", at: daysAgo(2), severity: "info", ip: "10.24.14.42" },
  { id: "ad-05", actor: "System", action: "Blocked login attempt", target: "unknown principal · 41.2.88.19", module: "Security", at: hoursAgo(11), severity: "critical", ip: "41.2.88.19" },
  { id: "ad-06", actor: "Vikram Shetty", action: "Approved work permit", target: "apr-06 · Confined space R-3001", module: "Approvals", at: daysAgo(3), severity: "info", ip: "10.24.9.31" },
  { id: "ad-07", actor: "System", action: "Retention policy applied", target: "42 documents · 7-year rule", module: "Storage", at: daysAgo(1), severity: "info", ip: "10.24.0.7" },
  { id: "ad-08", actor: "Latha Gowda", action: "Rotated service credential", target: "vision-agent-key", module: "Security", at: daysAgo(4), severity: "warning", ip: "10.24.8.44" },
  { id: "ad-09", actor: "System", action: "Agent degraded", target: "Predictive Maintenance Agent", module: "AI Agents", at: hoursAgo(6), severity: "warning", ip: "10.24.0.9" },
  { id: "ad-10", actor: "Meera Krishnan", action: "Updated enterprise setting", target: "AI data residency → on-premise only", module: "Settings", at: daysAgo(6), severity: "warning", ip: "10.24.8.11" },
];

export const SECURITY_POSTURE: SecurityPosture[] = [
  { id: "sec-01", control: "Multi-factor authentication", framework: "ISO 27001 A.9.4", status: "enforced", coverage: 100, owner: "Digital & IT", reviewedAt: daysAgo(12) },
  { id: "sec-02", control: "Zero data egress to public models", framework: "Sovereign AI policy", status: "enforced", coverage: 100, owner: "CISO office", reviewedAt: daysAgo(4) },
  { id: "sec-03", control: "Role-based access control review", framework: "ISO 27001 A.9.2", status: "monitoring", coverage: 94, owner: "Digital & IT", reviewedAt: daysAgo(9) },
  { id: "sec-04", control: "Immutable audit logging", framework: "OISD-STD-139", status: "enforced", coverage: 100, owner: "CISO office", reviewedAt: daysAgo(2) },
  { id: "sec-05", control: "Privileged access recertification", framework: "Internal ITGC", status: "action-required", coverage: 82, owner: "Internal Audit", reviewedAt: daysAgo(21) },
  { id: "sec-06", control: "Model prompt-injection guardrails", framework: "AI governance", status: "monitoring", coverage: 91, owner: "AI platform", reviewedAt: daysAgo(6) },
];

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "cal-01", title: "CDU-2 column internal inspection", type: "Inspection", date: daysAhead(1), time: "08:00 – 14:00", owner: "Pooja Hegde", area: "CDU-2", status: "confirmed" },
  { id: "cal-02", title: "GT-9001 hot gas path shutdown", type: "Shutdown", date: daysAhead(10), time: "06:00 · 7 days", owner: "Arjun Devadiga", area: "Power block", status: "confirmed" },
  { id: "cal-03", title: "OISD statutory audit window", type: "Audit", date: daysAhead(4), time: "09:30 – 17:00", owner: "Fatima Sheikh", area: "Refinery-wide", status: "tentative" },
  { id: "cal-04", title: "AI copilot operator training — Shift B", type: "Training", date: daysAhead(2), time: "15:00 – 17:00", owner: "Latha Gowda", area: "Learning centre", status: "confirmed" },
  { id: "cal-05", title: "Turnaround steering committee", type: "Review", date: daysAhead(3), time: "11:00 – 12:30", owner: "Vikram Shetty", area: "Board room", status: "confirmed" },
  { id: "cal-06", title: "PSV-3310 recertification", type: "Inspection", date: daysAhead(4), time: "09:00 – 13:00", owner: "Suresh Prabhu", area: "VGO-HDT", status: "confirmed" },
  { id: "cal-07", title: "Corrosion loop review — Q3", type: "Review", date: daysAhead(7), time: "10:00 – 11:30", owner: "Suresh Prabhu", area: "Inspection lab", status: "tentative" },
  { id: "cal-08", title: "Emergency response drill — flare system", type: "Training", date: daysAhead(6), time: "07:00 – 10:00", owner: "Fatima Sheikh", area: "Flare area", status: "confirmed" },
  { id: "cal-09", title: "Equipment health review — rotating", type: "Review", date: daysAgo(1), time: "14:00 – 15:30", owner: "Rahul Nair", area: "Reliability cell", status: "completed" },
];

export const FIRST_USER_PROFILE = DUTY_MANAGER;

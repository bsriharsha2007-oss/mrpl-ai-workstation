/**
 * Sovereign agent registry — the specialized AI agents of the workstation.
 *
 * The Task Classifier routes every incoming request to exactly one of these
 * agents before execution. Each agent declares its capabilities so the UI can
 * surface what it will do, and the services layer uses the registry for the
 * grounded mock-playbook that stands in for the on-premise inference cluster.
 */

export type AgentKey =
  | "vision"
  | "knowledge"
  | "document"
  | "telemetry"
  | "planning"
  | "governance"
  | "reporting";

export interface AgentDefinition {
  key: AgentKey;
  /** Human name shown in the UI. */
  name: string;
  /** The model the agent runs on in the sovereign inference cluster. */
  model: string;
  /** One-line description of the agent's mandate. */
  mandate: string;
  /** Concrete capabilities, rendered as chips in the UI. */
  capabilities: string[];
}

export const SOVEREIGN_AGENTS: Record<AgentKey, AgentDefinition> = {
  vision: {
    key: "vision",
    name: "Vision Agent",
    model: "Qwen 2.5-VL 72B (on-prem)",
    mandate: "Reads inspection imagery, drawings and P&IDs like a senior inspector.",
    capabilities: [
      "OCR",
      "Engineering drawing analysis",
      "P&ID interpretation",
      "Equipment identification",
      "Gauge reading",
      "PPE detection",
      "Safety compliance",
      "Table understanding",
      "Chart understanding",
      "Visual question answering",
      "Industrial image captioning",
      "Metadata extraction",
      "Bounding boxes",
      "Inspection report analysis",
      "Image summarization",
    ],
  },
  knowledge: {
    key: "knowledge",
    name: "Knowledge Agent",
    model: "BGE-M3 embeddings · on-prem vector store",
    mandate: "Retrieves grounded evidence from the sovereign corpus before any answer.",
    capabilities: [
      "Semantic search",
      "Context retrieval",
      "Embeddings",
      "Cross-document reasoning",
      "Vector search",
      "Knowledge graph retrieval",
    ],
  },
  document: {
    key: "document",
    name: "Document Agent",
    model: "Layout-aware parser · MRPL sov-doc-1",
    mandate: "Ingests and structures every controlled document on the platform.",
    capabilities: [
      "PDF analysis",
      "DOCX",
      "PPTX",
      "Excel",
      "SOP parsing",
      "OCR",
      "Chunking",
      "Metadata extraction",
      "Semantic indexing",
      "Report generation",
      "Document classification",
    ],
  },
  telemetry: {
    key: "telemetry",
    name: "Telemetry Agent",
    model: "SQL-llama-3 70B · historian gateway",
    mandate: "Queries plant telemetry directly and turns sensor history into answers.",
    capabilities: [
      "PostgreSQL queries",
      "Trend analysis",
      "Threshold monitoring",
      "Sensor analytics",
      "Industrial dashboards",
      "Alert generation",
    ],
  },
  planning: {
    key: "planning",
    name: "Planning Agent",
    model: "MRPL sov-plan-70b",
    mandate: "Builds executable maintenance and shutdown plans with spares and crews.",
    capabilities: [
      "Maintenance scheduling",
      "Resource allocation",
      "Priority planning",
      "Work order suggestions",
      "Shutdown planning",
    ],
  },
  governance: {
    key: "governance",
    name: "Governance Agent",
    model: "MRPL sov-gov-8b · policy engine",
    mandate: "Guards compliance, audit trails and the human-in-the-loop approval gate.",
    capabilities: [
      "Compliance",
      "Audit trails",
      "Policy validation",
      "Approval workflow",
      "Human-in-the-loop",
      "Risk assessment",
    ],
  },
  reporting: {
    key: "reporting",
    name: "Reporting Agent",
    model: "MRPL sov-report-70b",
    mandate: "Produces executive, maintenance, incident and inspection reports on demand.",
    capabilities: [
      "Executive reports",
      "Maintenance reports",
      "Incident reports",
      "Inspection reports",
      "Excel reports",
      "PDF reports",
      "Word reports",
    ],
  },
};

export const ALL_AGENTS: AgentDefinition[] = Object.values(SOVEREIGN_AGENTS);

/** The agent executed for a request, once the classifier has routed it. */
export interface Classification {
  agent: AgentKey;
  confidence: number;
  /** What the classifier matched on — shown subtly in the UI. */
  matchedOn: string[];
  routedAtMs: number;
}

/** Ordered rules — first match wins, mirroring a real classifier pipeline. */
const ROUTING_RULES: {
  agent: AgentKey;
  patterns: RegExp;
  signals: string[];
}[] = [
  {
    agent: "vision",
    patterns:
      /image|photo|camera|thermal|thermograph|drawing|p&id|pid|gauge|ocr|inspector? (?:image|photo)|visual|bounding|ppe|helmet|equipment identif|caption|scan/i,
    signals: ["visual cues", "imagery or drawing reference"],
  },
  {
    agent: "telemetry",
    patterns:
      /trend|sensor|historian|temperature|pressure|vibrat|threshold|alarm|reading|pt-|tt-|fc-|flow ?rate|setpoint|live data|kpi (?:trend|spike)/i,
    signals: ["sensor or historian signal", "live plant data"],
  },
  {
    agent: "reporting",
    patterns:
      /report|draft|handover|summar\w* (?:report|shift)|executive|export|excel|docx|pdf download|weekly|monthly summary/i,
    signals: ["report artifact requested"],
  },
  {
    agent: "planning",
    patterns:
      /plan|schedul|shutdown|turnaround|work order|spares?|resource allocat|priorit(?:y|ise|ize) (?:queue|tasks)|maintenance plan|roster/i,
    signals: ["scheduling or planning intent"],
  },
  {
    agent: "governance",
    patterns:
      /complian|oisd|audit|policy|approval|permit|statutory|regulat|risk|safety gap|clause|legal|incident report/i,
    signals: ["compliance or governance intent"],
  },
  {
    agent: "document",
    patterns:
      /document|doc|pdf|word|excel|pptx|sop|manual|datasheet|extract|rev(?:ision)? \d|parse|summar\w* (?:manual|document|sop)/i,
    signals: ["document parsing or SOP reference"],
  },
  {
    agent: "knowledge",
    patterns: /.*/,
    signals: ["default — corpus retrieval"],
  },
];

/**
 * The Task Classifier. Deterministic so previews are stable; the backend team
 * replaces the body with the trained router without touching the UI.
 */
export function classifyTask(prompt: string): Classification {
  const startedAt = Date.now();
  const text = prompt.trim();
  for (const rule of ROUTING_RULES) {
    const matched = text.match(rule.patterns);
    if (matched) {
      const strength = Math.min(0.98, 0.72 + matched[0].length / 60);
      return {
        agent: rule.agent,
        confidence: rule.agent === "knowledge" ? 0.68 : strength,
        matchedOn: matched[0].length > 0 ? [matched[0].toLowerCase(), ...rule.signals] : rule.signals,
        routedAtMs: Date.now() - startedAt + 12,
      };
    }
  }
  return {
    agent: "knowledge",
    confidence: 0.68,
    matchedOn: ROUTING_RULES[ROUTING_RULES.length - 1].signals,
    routedAtMs: Date.now() - startedAt + 12,
  };
}

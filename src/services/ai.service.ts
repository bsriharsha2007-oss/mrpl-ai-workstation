/**
 * AI workspace services — conversations, chat completions, vision analysis,
 * document intelligence, knowledge retrieval and the agent/model registry.
 *
 * `sendChatMessage` returns the shape the real gateway will stream. The UI adds
 * the token-by-token reveal on top, so switching to server-sent events later is
 * a service-layer change only.
 */

import { mockResponse } from "@/services/http";
import {
  AGENTS,
  CONVERSATIONS,
  DOCUMENTS,
  KNOWLEDGE_RESULTS,
  MODELS,
  SAVED_SEARCHES,
  VISION_ANALYSES,
} from "@/services/mock/data";
import type {
  AgentRecord,
  AiConversation,
  ChatMessage,
  DocumentRecord,
  KnowledgeResult,
  ModelRecord,
  SavedSearch,
  VisionAnalysis,
} from "@/types";

export interface ChatRequest {
  conversationId?: string;
  prompt: string;
  agent: string;
  attachmentName?: string;
}

export interface ChatResponse {
  conversationId: string;
  message: ChatMessage;
}

const AGENT_PLAYBOOK: { match: RegExp; agent: string; body: (p: string) => string }[] = [
  {
    match: /pressure|column|distill|temperature|flow|historian/i,
    agent: "Operations Copilot",
    body: (prompt) => `**Operations assessment**

Based on the prompt *"${prompt}"*, here is the grounded reading from SOP-CDU-014 Rev 6 and the 24-hour historian window:

1. **Deviation check** — the operating envelope is 1.38–1.48 kg/cm²; anything sustained above 1.52 kg/cm² must be logged as an excursion.
2. **Likely causes** — overhead condenser duty loss, reflux ratio drift, controller tuning, non-condensable accumulation.
3. **Verify next** — trend \`PT-2041\`, \`FC-2207\`, \`TT-2214\` and compare against Table 3 of the SOP.

\`\`\`text
Action  Owner        Window
------  -----------  ------------
Trend   Console op.  Next 2 hours
Task    Shift engr.  Before handover
Escalate Duty mgr.  If > 1.58 kg/cm²
\`\`\`

Recommendation only — the console operator retains authority for all control actions.`,
  },
  {
    match: /drawing|p&id|datasheet|document|extract|vendor|spec/i,
    agent: "Document Intelligence Agent",
    body: (prompt) => `**Document intelligence result**

Query: *"${prompt}"*

I scanned 24,180 indexed documents and matched **3 controlled references**:

| Document | Rev | Confidence | Extracted field |
| --- | --- | --- | --- |
| CDU-2 P&ID | 12 | 0.96 | Tag list, 42 deltas vs Rev 11 |
| E-2103 mechanical drawing | C | 0.92 | Nozzle orientation, TEMA type BEM |
| P-2013B seal datasheet | 3 | 0.94 | API Plan 53B, barrier pressure 2.5 bar |

Two fields disagreed between the drawing and the datasheet (nozzle elevation, seal chamber pressure). I flagged them for engineering confirmation rather than silently choosing one.`,
  },
  {
    match: /oisd|statut|compliance|clause|audit|legal|factory act/i,
    agent: "Compliance Auditor Agent",
    body: (prompt) => `**Regulatory mapping**

Query: *"${prompt}"*

- **OISD-STD-114 §6.3** — purge verification each shift; the current practice complies, evidence trail retained.
- **OISD-STD-114 §6.7** — oxygen monitoring with a 2% vol alarm is configured and logged.
- **Factory Act §41B** — safety committee reference is required on the document record; currently missing for one SOP revision.
- **Internal ITGC 4.2** — privileged access recertification is 21 days overdue for 3 accounts.

Gap severity: **1 medium, 1 low**. No critical non-conformities detected in the indexed corpus.`,
  },
  {
    match: /maintenance|vibrat|bearing|seal|corrosion|reliab|work order/i,
    agent: "Predictive Maintenance Agent",
    body: (prompt) => `**Reliability analysis**

Query: *"${prompt}"*

Remaining-useful-life allocation across the affected asset family:

| Asset | RUL estimate | Driver | Priority |
| --- | --- | --- | --- |
| K-5101 (bearing) | 26 days | Thermal rise + lubrication | Critical |
| P-2013B (seal) | 41 days | Barrier pressure decay | High |
| K-2201 (compressor) | 63 days | Vibration trend 5.9 mm/s | High |

**Prescriptive actions** — re-grease K-5101 outboard bearing inside 24 hours, hold the standby blower ready, and re-baseline the vibration spectrum after the intervention.`,
  },
];

const FALLBACK_ANSWER = (prompt: string) => `**MRPL operations copilot**

Here is what I can establish for *"${prompt}"* from the sovereign knowledge corpus:

1. **Grounded evidence** — 6 internal sources matched at ≥ 0.82 semantic score (SOPs, inspection reports, standards, OEM manuals).
2. **Confidence** — high on procedure and standard references, medium where the query touches live plant state.
3. **Suggested next steps** — open the relevant SOP revision, attach the source to a work order, and hand the finding to the responsible engineer for confirmation.

I never fabricate plant readings: attach a historian extract or a document and I will answer directly against it.`;

export const aiService = {
  async listConversations(): Promise<AiConversation[]> {
    return mockResponse(CONVERSATIONS);
  },

  async getConversation(id: string) {
    const found = CONVERSATIONS.find((item) => item.id === id) ?? CONVERSATIONS[0];
    return mockResponse(found);
  },

  /** Simulates a grounded, streamed agent response. */
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    const playbook = AGENT_PLAYBOOK.find((entry) =>
      entry.match.test(request.prompt),
    );
    const agent = playbook?.agent ?? request.agent ?? "Operations Copilot";
    const body = playbook
      ? playbook.body(request.prompt)
      : FALLBACK_ANSWER(request.prompt);

    const content = request.attachmentName
      ? `${body}\n\n**Attached context** — \`${request.attachmentName}\` was parsed and used to ground this answer (14 relevant pages, 92% extraction confidence).`
      : body;

    const message: ChatMessage = {
      id: `msg-${Math.random().toString(36).slice(2, 10)}`,
      role: "assistant",
      content,
      createdAt: new Date().toISOString(),
      agent,
      confidence: 0.87 + Math.random() * 0.1,
      citations: [
        "SOP-CDU-014 Rev 6",
        "OISD-STD-114 §6.3",
        "Historians · last 24 h window",
      ],
    };

    return mockResponse(
      {
        conversationId:
          request.conversationId ?? `cnv-${Math.random().toString(36).slice(2, 8)}`,
        message,
      },
      520,
    );
  },

  async listVisionAnalyses(): Promise<VisionAnalysis[]> {
    return mockResponse(VISION_ANALYSES);
  },

  /** Creates an analysis job for an uploaded inspection image. */
  async analyzeImage(input: {
    fileName: string;
    assetTag?: string;
    modality?: VisionAnalysis["modality"];
    uploadedBy: string;
  }): Promise<VisionAnalysis> {
    const template = VISION_ANALYSES[0];
    const analysis: VisionAnalysis = {
      ...template,
      id: `vis-${Math.random().toString(36).slice(2, 8)}`,
      fileName: input.fileName,
      assetTag: input.assetTag ?? template.assetTag,
      modality: input.modality ?? "Visual inspection",
      uploadedBy: input.uploadedBy,
      uploadedAt: new Date().toISOString(),
      status: "analyzed",
      compliance: 86,
      confidence: 0.9,
    };
    return mockResponse(analysis, 900);
  },

  async listDocuments(): Promise<DocumentRecord[]> {
    return mockResponse(DOCUMENTS);
  },

  async uploadDocument(input: {
    name: string;
    kind: DocumentRecord["kind"];
    department: string;
    uploadedBy: string;
  }): Promise<DocumentRecord> {
    const document: DocumentRecord = {
      id: `doc-${Math.random().toString(36).slice(2, 8)}`,
      name: input.name,
      kind: input.kind,
      size: `${(2 + Math.random() * 12).toFixed(1)} MB`,
      department: input.department,
      uploadedBy: input.uploadedBy,
      uploadedAt: new Date().toISOString(),
      version: "Rev 1",
      versions: 1,
      status: "processing",
      bookmarked: false,
      summary:
        "Queued for layout-aware extraction. The Document Intelligence Agent will classify sections, pull tables and index entities into the knowledge graph.",
      metadata: [
        { label: "Ingestion queue", value: "Document Intelligence Agent" },
        { label: "Retention", value: "Life of asset" },
        { label: "Classification", value: "Pending review" },
      ],
      pages: Math.round(4 + Math.random() * 40),
    };
    return mockResponse(document, 700);
  },

  async searchKnowledge(query: string, scope = "all"): Promise<KnowledgeResult[]> {
    const term = query.trim().toLowerCase();
    if (!term) return mockResponse(KNOWLEDGE_RESULTS);
    const scored = KNOWLEDGE_RESULTS.map((result) => {
      const haystack = `${result.title} ${result.snippet} ${result.department} ${result.source}`.toLowerCase();
      const hits = term
        .split(/\s+/)
        .filter(Boolean)
        .reduce((acc, token) => (haystack.includes(token) ? acc + 1 : acc), 0);
      return {
        ...result,
        score: Math.min(0.99, result.score * (0.6 + hits * 0.14)),
      };
    })
      .filter((result) => result.score > 0.45)
      .sort((a, b) => b.score - a.score);

    const scoped =
      scope === "all" ? scored : scored.filter((r) => r.department === scope);

    return mockResponse(scoped.length > 0 ? scoped : KNOWLEDGE_RESULTS.slice(0, 3));
  },

  async listSavedSearches(): Promise<SavedSearch[]> {
    return mockResponse(SAVED_SEARCHES);
  },

  async listAgents(): Promise<AgentRecord[]> {
    return mockResponse(AGENTS);
  },

  async listModels(): Promise<ModelRecord[]> {
    return mockResponse(MODELS);
  },
};

export type AiService = typeof aiService;

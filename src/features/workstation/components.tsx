/**
 * Workstation feature components — the AI control center building blocks.
 *
 * Reusable pieces assembled by `WorkstationPage`: the AI execution timeline,
 * chat empty state, prompt composer, document context panel, AI activity
 * center, quick actions and the message surface. All data comes from the
 * existing TanStack Query hooks, so the panels light up with the same mock
 * enterprise dataset the rest of the workstation uses.
 */

import { MarkdownBlock } from "@/components/common/MarkdownBlock";
import { Badge2, MeterBar, StatusBadge } from "@/components/common/Badges";
import { DetailRow, GlassInset, GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { EmptyState, LoadingState } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/hooks/use-role";
import {
  useAgents,
  useConversations,
  useDocuments,
  useReports,
  useTasks,
} from "@/hooks/use-queries";
import { cn } from "@/lib/utils";
import type { ChatMessage, DocumentRecord } from "@/types";
import { relativeTime } from "@/utils/format";
import { motion } from "framer-motion";
import {
  Bot,
  Check,
  ClipboardList,
  Copy,
  CornerDownRight,
  Download,
  FileText,
  FileUp,
  FolderSearch,
  Gauge,
  ImageIcon,
  MessageSquarePlus,
  Mic,
  Paperclip,
  PencilRuler,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  RefreshCw,
  Search,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/* Shared bits                                                                 */
/* -------------------------------------------------------------------------- */

const FILE_KIND_COLORS: Record<string, string> = {
  PDF: "bg-rose-50/80 text-rose-700 border-rose-200/70",
  DOCX: "bg-sky-50/80 text-sky-700 border-sky-200/70",
  XLSX: "bg-emerald-50/80 text-emerald-700 border-emerald-200/70",
  PPTX: "bg-amber-50/80 text-amber-700 border-amber-200/70",
  DWG: "bg-indigo-50/80 text-indigo-700 border-indigo-200/70",
};

export function FileKindChip({ kind }: { kind: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[9px] font-bold tracking-wide",
        FILE_KIND_COLORS[kind] ?? "bg-slate-50 text-slate-600 border-slate-200",
      )}
    >
      {kind}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* AI execution timeline                                                       */
/* -------------------------------------------------------------------------- */

const EXECUTION_STEPS = [
  "Task received",
  "Task classified",
  "Agent selected",
  "Knowledge retrieval",
  "Reasoning",
  "Validation",
  "Response generated",
] as const;

/** Animated pipeline shown above a streaming response. */
export function ExecutionTimeline() {
  return (
    <div className="glass-inset rounded-xl px-4 py-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        AI execution pipeline
      </p>
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
        {EXECUTION_STEPS.map((step, index) => (
          <motion.span
            key={step}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.22, duration: 0.3 }}
            className="flex items-center gap-1"
          >
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                index === EXECUTION_STEPS.length - 1
                  ? "border-teal-200/80 bg-teal-50/80 text-teal-800"
                  : "border-border/70 bg-white/70 text-muted-foreground",
              )}
            >
              {step}
            </span>
            {index < EXECUTION_STEPS.length - 1 ? (
              <CornerDownRight className="size-2.5 rotate-90 text-slate-300" />
            ) : null}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Chat empty state                                                            */
/* -------------------------------------------------------------------------- */

export interface EmptyStateAction {
  label: string;
  prompt: string;
  icon: typeof FileText;
}

export const STARTER_ACTIONS: EmptyStateAction[] = [
  { label: "Analyze an SOP", prompt: "Walk me through SOP-CDU-014 section by section and flag the steps that changed in Rev 7.", icon: FileText },
  { label: "Inspect equipment image", prompt: "Screen the latest thermography set for K-5101 and list anomalies above 0.8 confidence.", icon: ImageIcon },
  { label: "Search knowledge", prompt: "Which standards govern flare header purging, and where do they conflict with the current SOP?", icon: Search },
  { label: "Generate report", prompt: "Draft the Shift A handover report for the CDU area with open alarms and pending permits.", icon: FileUp },
  { label: "Summarize manual", prompt: "Summarise the K-5101 compressor OEM manual chapter on seal gas systems into 5 bullets.", icon: FileText },
  { label: "Review inspection", prompt: "Review API 570 findings for line 6\"-P-1204-A1A and estimate remaining life.", icon: ShieldCheck },
  { label: "Safety compliance", prompt: "List every open OISD compliance gap for my area and rank them by statutory deadline.", icon: ShieldCheck },
  { label: "Maintenance plan", prompt: "Create a preventive maintenance plan for P-6107 over the next quarter with spares.", icon: Wrench },
];

export function ChatEmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  const { profile } = useRole();
  const firstName = profile.name.split(" ")[0];

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="glass-strong flex size-20 items-center justify-center rounded-2xl border border-teal-200/60"
        >
          <Bot className="size-9 text-primary" />
        </motion.div>
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-white"
        >
          <Sparkles className="size-3" />
        </motion.span>
      </motion.div>

      <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        What would you like to accomplish today, {firstName}?
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Start a grounded conversation. Every answer cites the SOP, drawing,
        standard or historian window it was based on — nothing leaves the MRPL
        network.
      </p>

      <Button
        size="lg"
        className="mt-6 h-12 cursor-pointer gap-2 px-8 text-sm"
        onClick={() => onPick("Summarise the current state of my area and what needs my attention first.")}
      >
        <MessageSquarePlus className="size-4" />
        Start a New AI Conversation
      </Button>

      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {STARTER_ACTIONS.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.05 }}
            whileHover={{ y: -2 }}
            type="button"
            onClick={() => onPick(action.prompt)}
            className="glass-inset flex cursor-pointer flex-col items-start gap-1.5 rounded-xl p-3 text-left transition-colors hover:border-primary/40"
          >
            <action.icon className="size-3.5 text-primary" />
            <span className="text-[11px] font-semibold leading-4 text-foreground">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Prompt composer                                                             */
/* -------------------------------------------------------------------------- */

const QUICK_TEMPLATES = [
  "Summarise shift handover",
  "K-5101 bearing alarm",
  "API 570 remaining life",
  "Flare purge SOP check",
  "Open permits for CDU",
];

export function PromptComposer({
  value,
  onChange,
  onSend,
  onAttachDocument,
  onAttachImage,
  attachments,
  onRemoveAttachment,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAttachDocument: () => void;
  onAttachImage: () => void;
  attachments: string[];
  onRemoveAttachment: (name: string) => void;
  disabled?: boolean;
}) {
  const MAX = 2000;

  return (
    <div className="space-y-2 border-t border-border/60 px-4 py-3">
      {attachments.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {attachments.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 rounded-full border border-sky-200/80 bg-sky-50/80 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-sky-700 backdrop-blur-sm"
            >
              <Paperclip className="size-3" />
              <span className="max-w-[220px] truncate">{name}</span>
              <button
                type="button"
                aria-label={`Remove attachment ${name}`}
                className="cursor-pointer rounded-full p-0.5 transition-colors hover:bg-sky-100"
                onClick={() => onRemoveAttachment(name)}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer border-white/70 bg-white/70"
            aria-label="Attach a document"
            title="Attach document"
            onClick={onAttachDocument}
          >
            <FileUp className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer border-white/70 bg-white/70"
            aria-label="Attach an image"
            title="Attach image"
            onClick={onAttachImage}
          >
            <ImageIcon className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer border-white/70 bg-white/70"
            aria-label="Voice input"
            title="Voice input"
            onClick={() => toast.info("Voice input", { description: "Dictation is handled by the on-premise speech service once connected." })}
          >
            <Mic className="size-3.5" />
          </Button>
        </div>
        <div className="flex-1">
          <Textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            rows={2}
            maxLength={MAX}
            placeholder="Ask about an asset, a deviation, an SOP or a drawing… (Enter to send, Shift+Enter for a new line)"
            className="max-h-32 min-h-[64px] resize-none border-white/70 bg-white/70 text-xs"
          />
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={cn("tabular text-[10px]", value.length > MAX * 0.9 ? "text-amber-600" : "text-muted-foreground/70")}>
            {value.length}/{MAX}
          </span>
          <Button
            size="icon"
            className="cursor-pointer"
            aria-label="Send message"
            disabled={!value.trim() || disabled}
            onClick={onSend}
          >
            <Send className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
          Templates
        </span>
        {QUICK_TEMPLATES.map((template) => (
          <button
            key={template}
            type="button"
            className="cursor-pointer rounded-full border border-border/70 bg-white/60 px-2.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            onClick={() => onChange(template)}
          >
            {template}
          </button>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Message surface                                                             */
/* -------------------------------------------------------------------------- */

export function WorkstationMessage({
  message,
  agent,
  responseMs,
}: {
  message: ChatMessage;
  agent?: string;
  responseMs?: number;
}) {
  const isUser = message.role === "user";
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  if (isUser) {
    return (
      <div className="flex flex-row-reverse gap-2.5">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-[10px] font-semibold text-slate-600">
          You
        </span>
        <div className="min-w-0 max-w-[86%] rounded-xl border border-white/80 bg-primary/10 px-4 py-3">
          <MarkdownBlock content={message.content} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-50/80 text-primary">
        <Bot className="size-3.5" />
      </span>
      <div className="min-w-0 max-w-[86%] rounded-xl border border-border/70 bg-white/72 px-4 py-3">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge2 tone="primary" icon={<Sparkles className="size-3" />}>
            {message.agent ?? agent ?? "Operations Copilot"}
          </Badge2>
          {message.confidence !== undefined ? (
            <Badge2 tone="muted">Confidence {Math.round(message.confidence * 100)}%</Badge2>
          ) : null}
          {responseMs ? <Badge2 tone="info">{(responseMs / 1000).toFixed(1)}s</Badge2> : null}
          <span className="text-[10px] text-muted-foreground">
            {relativeTime(message.createdAt)}
          </span>
        </div>

        <MarkdownBlock content={message.content} />

        {message.citations && message.citations.length > 0 ? (
          <div className="mt-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
              Referenced sources
            </p>
            <div className="flex flex-wrap gap-1.5">
              {message.citations.map((citation) => (
                <Badge2 key={citation} tone="info" icon={<FileText className="size-3" />}>
                  {citation}
                </Badge2>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-3 flex items-center gap-1 border-t border-border/50 pt-2">
          {[
            {
              icon: Copy,
              label: "Copy",
              onClick: () => {
                void navigator.clipboard.writeText(message.content);
                toast.success("Response copied");
              },
            },
            {
              icon: Download,
              label: "Export",
              onClick: () => toast.success("Response exported as Markdown"),
            },
            {
              icon: ThumbsUp,
              label: "Helpful",
              active: feedback === "up",
              onClick: () => setFeedback(feedback === "up" ? null : "up"),
            },
            {
              icon: ThumbsDown,
              label: "Not helpful",
              active: feedback === "down",
              onClick: () => setFeedback(feedback === "down" ? null : "down"),
            },
            {
              icon: RefreshCw,
              label: "Regenerate",
              onClick: () => toast.info("Regenerating", { description: "The agent will produce a fresh answer for this prompt." }),
            },
            {
              icon: CornerDownRight,
              label: "Continue",
              onClick: () => toast.info("Continuing", { description: "Ask a follow-up and the agent keeps its context." }),
            },
          ].map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={cn(
                "flex cursor-pointer items-center gap-1 rounded px-1.5 py-1 text-[10px] font-medium transition-colors",
                action.active
                  ? "bg-teal-50/80 text-teal-700"
                  : "text-muted-foreground hover:bg-white/80 hover:text-foreground",
              )}
            >
              <action.icon className="size-3" />
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Document context panel                                                      */
/* -------------------------------------------------------------------------- */

type DocFilter = "all" | "sop" | "drawing" | "inspection" | "manual";

const DOC_FILTERS: { key: DocFilter; label: string }[] = [
  { key: "all", label: "All permitted" },
  { key: "sop", label: "Pinned SOPs" },
  { key: "drawing", label: "Engineering drawings" },
  { key: "inspection", label: "Inspection reports" },
  { key: "manual", label: "Recent manuals" },
];

function classifyDocument(doc: DocumentRecord): DocFilter {
  const name = doc.name.toLowerCase();
  if (name.includes("sop") || name.includes("procedure")) return "sop";
  if (doc.kind === "DWG" || name.includes("pid") || name.includes("drawing")) return "drawing";
  if (name.includes("inspection") || name.includes("api") || name.includes("570")) return "inspection";
  if (name.includes("manual") || name.includes("oem")) return "manual";
  return "all";
}

/** Smart context rail: permitted documents, one click to attach to the thread. */
export function DocumentContextPanel({
  onAttach,
  attachedNames,
}: {
  onAttach: (name: string) => void;
  attachedNames: string[];
}) {
  const documents = useDocuments();
  const [filter, setFilter] = useState<DocFilter>("all");
  const [search, setSearch] = useState("");

  const all = documents.data ?? [];
  const visible = all
    .filter((doc) => (filter === "all" ? true : classifyDocument(doc) === filter))
    .filter((doc) =>
      search.trim()
        ? doc.name.toLowerCase().includes(search.trim().toLowerCase())
        : true,
    )
    .slice(0, 24);

  return (
    <GlassPanel padded={false} className="flex h-full min-h-0 flex-col">
      <div className="space-y-2.5 border-b border-border/60 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FolderSearch className="size-4 text-primary" />
            <p className="text-xs font-bold tracking-tight text-foreground">Document context</p>
          </div>
          <Badge2 tone="muted">{all.length} indexed</Badge2>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search permitted documents…"
            className="glass-inset h-8 w-full rounded-lg pl-8 pr-2 text-[11px] text-foreground outline-none placeholder:text-muted-foreground/70"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {DOC_FILTERS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilter(option.key)}
              className={cn(
                "cursor-pointer rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
                filter === option.key
                  ? "border-teal-200/80 bg-teal-50/80 text-teal-800"
                  : "border-border/70 bg-white/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="thin-scroll min-h-0 flex-1">
        <div className="space-y-1.5 p-2.5">
          {documents.isLoading ? (
            <LoadingState label="Loading documents…" minHeight={120} />
          ) : visible.length === 0 ? (
            <p className="px-2 py-6 text-center text-[11px] text-muted-foreground">
              No documents match this filter.
            </p>
          ) : (
            visible.map((doc) => {
              const attached = attachedNames.includes(doc.name);
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => {
                    onAttach(doc.name);
                    toast.success("Document attached", {
                      description: `${doc.name} is now grounding the conversation.`,
                    });
                  }}
                  className={cn(
                    "w-full cursor-pointer rounded-lg border p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40",
                    attached ? "border-teal-200/80 bg-teal-50/60" : "border-transparent bg-white/55",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <FileKindChip kind={doc.kind} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-semibold leading-4 text-foreground">
                        {doc.name}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                        {doc.department} · {doc.version} · {relativeTime(doc.uploadedAt)}
                      </p>
                    </div>
                    {attached ? <Check className="mt-0.5 size-3.5 shrink-0 text-primary" /> : null}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Badge2 tone={doc.status === "indexed" ? "success" : "warning"}>
                      {doc.status === "indexed" ? "Permitted" : doc.status}
                    </Badge2>
                    {doc.metadata[0] ? (
                      <span className="truncate text-[9px] text-muted-foreground/70">
                        {doc.metadata[0].label}: {doc.metadata[0].value}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
      <p className="border-t border-border/60 px-3.5 py-2 text-[10px] leading-4 text-muted-foreground">
        Click a document to attach it — the agent grounds its next answer on it.
      </p>
    </GlassPanel>
  );
}

/* -------------------------------------------------------------------------- */
/* AI activity center                                                          */
/* -------------------------------------------------------------------------- */

export function ActivityCenter({
  activeAgent,
  streaming,
  lastAssistant,
  attachedNames,
}: {
  activeAgent: string;
  streaming: boolean;
  lastAssistant?: ChatMessage;
  attachedNames: string[];
}) {
  const conversations = useConversations("workstation");
  const tasks = useTasks({});
  const reports = useReports();
  const agents = useAgents();

  const pinned = (conversations.data ?? []).filter((c) => c.pinned).slice(0, 3);
  const recent = (conversations.data ?? []).slice(0, 5);
  const activeTask = (tasks.data ?? []).find((task) => task.status === "in-progress");
  const agent = (agents.data ?? []).find((a) => a.name === activeAgent);

  return (
    <div className="space-y-3">
      <GlassPanel padded={false}>
        <div className="space-y-3 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-primary" />
              <p className="text-xs font-bold tracking-tight text-foreground">Selected agent</p>
            </div>
            {agent ? <StatusBadge status={agent.status} /> : null}
          </div>
          <div className="glass-inset rounded-lg p-3">
            <p className="text-[11px] font-semibold text-foreground">
              {activeAgent}
            </p>
            <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
              {agent?.model ?? "mrpl-sovereign-70b"} ·{" "}
              {agent ? `${(agent.accuracy * 100).toFixed(1)}% accuracy` : "94.1% accuracy"} ·{" "}
              {agent?.latencyMs ?? 620} ms
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Processing status</span>
              <Badge2 tone={streaming ? "warning" : "success"}>
                {streaming ? "Reasoning…" : "Idle · ready"}
              </Badge2>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Confidence (last answer)</span>
              <span className="tabular font-medium text-foreground">
                {lastAssistant?.confidence
                  ? `${Math.round(lastAssistant.confidence * 100)}%`
                  : "—"}
              </span>
            </div>
            <MeterBar value={(lastAssistant?.confidence ?? 0) * 100} tone="success" />
          </div>

          <GlassInset>
            <DetailRow label="Referenced documents" value={attachedNames.length ? attachedNames.join(", ") : "None attached"} />
            <DetailRow label="AI memory" value="Session + area telemetry context" />
            <DetailRow label="Retention" value="7 years · immutable" />
          </GlassInset>

          {pinned.length > 0 ? (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                Pinned conversations
              </p>
              {pinned.map((conversation) => (
                <div key={conversation.id} className="flex items-start gap-1.5 rounded px-1 py-0.5">
                  <Star className="mt-0.5 size-3 shrink-0 text-amber-500" />
                  <span className="min-w-0 truncate text-[10px] text-foreground">
                    {conversation.title}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </GlassPanel>

      <GlassPanel>
        <PanelHeading
          title="Current task"
          description="The active work order the agent is tracking."
          icon={<ClipboardList className="size-4" />}
        />
        <div className="mt-3 space-y-2">
          {activeTask ? (
            <>
              <p className="text-[11px] font-semibold leading-4 text-foreground">
                {activeTask.code} · {activeTask.title}
              </p>
              <MeterBar value={activeTask.progress} tone="primary" />
              <p className="text-[10px] text-muted-foreground">
                {activeTask.assetTag} · {activeTask.priority} priority · due{" "}
                {relativeTime(activeTask.dueDate)}
              </p>
            </>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              No task in progress — the agent will follow your assigned work orders.
            </p>
          )}
        </div>
      </GlassPanel>

      <GlassPanel padded={false}>
        <div className="flex items-center justify-between border-b border-border/60 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="size-4 text-primary" />
            <p className="text-xs font-bold tracking-tight text-foreground">Recent chats</p>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {pinned.length} pinned
          </span>
        </div>
        <div className="space-y-1 p-2">
          {recent.map((conversation) => (
            <div
              key={conversation.id}
              className="flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/70"
            >
              {conversation.pinned ? (
                <Star className="mt-0.5 size-3 shrink-0 text-amber-500" />
              ) : (
                <Sparkles className="mt-0.5 size-3 shrink-0 text-slate-300" />
              )}
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium leading-4 text-foreground">
                  {conversation.title}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {conversation.agent} · {relativeTime(conversation.updatedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel padded={false}>
        <div className="flex items-center gap-2 border-b border-border/60 px-3.5 py-2.5">
          <Gauge className="size-4 text-primary" />
          <p className="text-xs font-bold tracking-tight text-foreground">Recent AI actions</p>
        </div>
        <div className="space-y-1 p-2">
          {(reports.data ?? []).slice(0, 4).map((report) => (
            <div key={report.id} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-white/70">
              <FileText className="mt-0.5 size-3 shrink-0 text-slate-400" />
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium leading-4 text-foreground">
                  {report.title}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {report.type} · {report.status} · {relativeTime(report.generatedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}

/** Unused placeholder kept so EmptyState import stays valid if the file is split later. */
export const WorkstationEmptyHint = EmptyState;

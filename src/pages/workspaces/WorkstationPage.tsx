import { Badge2, MeterBar } from "@/components/common/Badges";
import { DetailRow, GlassInset, GlassPanel } from "@/components/common/GlassPanel";
import {
  ActivityCenter,
  ChatEmptyState,
  DocumentContextPanel,
  ExecutionTimeline,
  PromptComposer,
  WorkstationMessage,
  STARTER_ACTIONS,
} from "@/features/workstation/components";
import { useRole } from "@/hooks/use-role";
import {
  useAgents,
  useConversations,
  useDocuments,
  useInspections,
  useReports,
  useSendChatMessage,
  useShift,
  useTasks,
} from "@/hooks/use-queries";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";
import { relativeTime } from "@/utils/format";
import { motion } from "framer-motion";
import {
  Bot,
  CheckCircle2,
  ClipboardList,
  FileStack,
  History,
  Lightbulb,
  MessagesSquare,
  ShieldAlert,
  Sparkles,
  Star,
  Timer,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const AI_TIPS = [
  "Attach the K-5101 datasheet before asking about seal gas — grounding improves answer accuracy.",
  "Ask “what changed in Rev 7” on any SOP to get a clause-level diff against the previous version.",
  "Pin recurring conversations so your shift crew can pick them up from the shared history.",
];

/** The workstation heart — the AI control center at /workstation. */
export default function WorkstationPage() {
  const { profile } = useRole();
  const navigate = useNavigate();

  const conversations = useConversations("workstation");
  const agents = useAgents();
  const documents = useDocuments();
  const tasks = useTasks({});
  const reports = useReports();
  const inspections = useInspections();
  const shift = useShift();
  const send = useSendChatMessage();

  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [streaming, setStreaming] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState("Operations Copilot");
  const [elapsedMs, setElapsedMs] = useState<number | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  const list = conversations.data ?? [];
  const active = list.find((conversation) => conversation.id === activeId);
  const messages = activeId ? threads[activeId] ?? [] : [];
  const lastAssistant = useMemo(
    () => [...messages].reverse().find((m) => m.role === "assistant"),
    [messages],
  );

  useEffect(() => {
    const first = list[0];
    if (first && !activeId) {
      setActiveId(first.id);
      setSelectedAgent(first.agent);
      setThreads((current) => ({ ...current, [first.id]: first.messages }));
    }
  }, [activeId, list]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, streaming]);

  const newConversation = () => {
    const id = `cnv-${Date.now()}`;
    setThreads((current) => ({ ...current, [id]: [] }));
    setActiveId(id);
    toast.success("New conversation started");
  };

  const attach = (name: string) => {
    setAttachments((current) => (current.includes(name) ? current : [...current, name]));
  };

  const runPrompt = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || send.isPending) return;

    // Resolve the conversation id up front so a first prompt from the empty
    // state writes into exactly the thread that becomes active (the state
    // update is async, so re-reading `activeId` below would race).
    const conversationId = activeId ?? `cnv-${Date.now()}`;
    if (!activeId) {
      setThreads((current) => ({ ...current, [conversationId]: [] }));
      setActiveId(conversationId);
    }

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: attachments.length
        ? `${trimmed}\n\n_Attached: ${attachments.join(", ")}_`
        : trimmed,
      createdAt: new Date().toISOString(),
    };
    setThreads((current) => ({
      ...current,
      [conversationId]: [...(current[conversationId] ?? []), userMessage],
    }));
    setInput("");

    const startedAt = Date.now();
    const response = await send.mutateAsync({
      conversationId,
      prompt: trimmed,
      agent: selectedAgent,
      attachmentName: attachments[0],
    });
    setElapsedMs(Date.now() - startedAt);
    setAttachments([]);

    const content = response.message.content;
    const step = Math.max(28, Math.round(content.length / 70));
    setStreaming("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += step;
      setStreaming(content.slice(0, index));
      if (index >= content.length) {
        window.clearInterval(timer);
        setStreaming(null);
        setThreads((current) => ({
          ...current,
          [conversationId]: [...(current[conversationId] ?? []), response.message],
        }));
      }
    }, 18);
  };

  const openTasks = (tasks.data ?? []).filter((task) => task.status !== "completed");
  const activeTask = (tasks.data ?? []).find((task) => task.status === "in-progress");
  const recentDocs = (documents.data ?? []).slice(0, 4);
  const recentReports = (reports.data ?? []).slice(0, 3);
  const recentConversations = (conversations.data ?? []).slice(0, 4);
  const openFindings = (inspections.data ?? [])
    .filter((inspection) => inspection.findings > 0)
    .slice(0, 3);

  const firstName = profile.name.split(" ")[0];

  return (
    <div className="space-y-4">
      {/* Welcome strip */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <GlassPanel glow className="relative overflow-hidden">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
                <Sparkles className="size-3.5" />
                AI Workspace · sovereign control center
              </p>
              <h1 className="mt-1.5 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                Good shift, {firstName}.
              </h1>
              <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
                {shift.data
                  ? `${shift.data.shift} · ${shift.data.crew} · ${shift.data.area} · supervisor ${shift.data.supervisor}`
                  : "Shift A · Katipalla Refinery"}
                . Six agents are online and grounded on the plant corpus.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(agents.data ?? []).slice(0, 3).map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setSelectedAgent(agent.name)}
                  className={cn(
                    "glass-inset cursor-pointer rounded-lg px-3 py-2 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40",
                    selectedAgent === agent.name && "border-teal-200/80 bg-teal-50/70",
                  )}
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                    <Bot className="size-3 text-primary" />
                    {agent.name.replace(" Agent", "")}
                  </span>
                  <span className="mt-0.5 block text-[9px] text-muted-foreground">
                    {agent.model}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </GlassPanel>

        <GlassPanel padded={false}>
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
            <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-tight text-foreground">
              <Timer className="size-3.5 text-primary" />
              Current task
            </span>
            {activeTask ? (
              <Badge2 tone="warning">{activeTask.progress}% complete</Badge2>
            ) : (
              <Badge2 tone="muted">None active</Badge2>
            )}
          </div>
          <div className="p-3.5">
            {activeTask ? (
              <>
                <p className="text-xs font-semibold leading-5 text-foreground">
                  {activeTask.code} · {activeTask.title}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {activeTask.asset} ({activeTask.assetTag}) · {activeTask.priority} priority ·
                  due {relativeTime(activeTask.dueDate)}
                </p>
                <div className="mt-2.5">
                  <MeterBar value={activeTask.progress} tone="primary" />
                </div>
              </>
            ) : (
              <p className="text-[11px] leading-5 text-muted-foreground">
                No work order in progress. Ask the copilot to prioritise your queue or
                open the tasks board.
              </p>
            )}
          </div>
        </GlassPanel>
      </div>

      {/* Main control center grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        {/* Left — document context */}
        <div className="order-2 max-h-[760px] xl:order-1">
          <DocumentContextPanel onAttach={attach} attachedNames={attachments} />
        </div>

        {/* Center — the AI workspace */}
        <GlassPanel
          padded={false}
          className="order-1 flex min-h-[720px] flex-col xl:order-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold tracking-tight text-foreground">
                {active?.title ?? "New AI conversation"}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {selectedAgent} · grounded on {documents.data?.length ?? 0} indexed documents ·
                zero egress
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge2 tone={streaming !== null ? "warning" : "success"}>
                {streaming !== null ? "Streaming" : "Ready"}
              </Badge2>
              <button
                type="button"
                onClick={newConversation}
                className="glass-inset flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-medium text-foreground transition-colors hover:border-primary/40"
              >
                <MessagesSquare className="size-3" />
                New
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4"
          >
            {messages.length === 0 && streaming === null ? (
              <ChatEmptyState onPick={(prompt) => void runPrompt(prompt)} />
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <WorkstationMessage
                    key={message.id}
                    message={message}
                    agent={selectedAgent}
                    responseMs={message.role === "assistant" ? elapsedMs : undefined}
                  />
                ))}
              </div>
            )}

            {streaming !== null ? (
              <div className="mt-4 space-y-3">
                <ExecutionTimeline />
                <div className="flex gap-2.5">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-50/80 text-primary">
                    <Bot className="size-3.5" />
                  </span>
                  <div className="min-w-0 max-w-[86%] rounded-xl border border-border/70 bg-white/72 px-4 py-3">
                    {streaming ? (
                      <p className="text-[12px] leading-6 whitespace-pre-wrap text-foreground">
                        {streaming}
                        <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-primary align-middle" />
                      </p>
                    ) : (
                      <span className="flex gap-1">
                        {[0, 1, 2].map((dot) => (
                          <motion.span
                            key={dot}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.2 }}
                            className="size-1.5 rounded-full bg-primary"
                          />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <PromptComposer
            value={input}
            onChange={setInput}
            onSend={() => void runPrompt(input)}
            onAttachDocument={() => attach(recentDocs[0]?.name ?? "CDU-2 P&ID Rev 12 (as-built).pdf")}
            onAttachImage={() => attach("K-5101 thermography 2026-09-16.jpg")}
            attachments={attachments}
            onRemoveAttachment={(name) =>
              setAttachments((current) => current.filter((item) => item !== name))
            }
            disabled={send.isPending || streaming !== null}
          />
        </GlassPanel>

        {/* Right — AI activity center */}
        <div className="order-3 thin-scroll max-h-[760px] space-y-3 overflow-y-auto pr-0.5">
          <ActivityCenter
            activeAgent={selectedAgent}
            streaming={streaming !== null}
            lastAssistant={lastAssistant}
            attachedNames={attachments}
          />
        </div>
      </div>

      {/* Bottom rail — quick actions and recent activity */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <GlassPanel>
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            <p className="text-xs font-bold tracking-tight text-foreground">Quick actions</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">
            {[
              { label: "Upload SOP", to: "/documents", icon: FileStack },
              { label: "Upload drawing", to: "/documents", icon: FileStack },
              { label: "Upload inspection", to: "/vision", icon: Sparkles },
              { label: "Generate report", to: "/reports", icon: ClipboardList },
              { label: "Maintenance plan", to: "/maintenance", icon: ClipboardList },
              { label: "Knowledge search", to: "/knowledge", icon: Sparkles },
              { label: "Safety audit", to: "/tasks", icon: ShieldAlert },
              { label: "Equipment ID", to: "/vision", icon: Zap },
            ].map((action) => (
              <motion.button
                key={action.label}
                whileHover={{ y: -2 }}
                type="button"
                onClick={() => navigate(action.to)}
                className="glass-inset flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] font-medium text-foreground transition-colors hover:border-primary/40"
              >
                <action.icon className="size-3.5 shrink-0 text-primary" />
                {action.label}
              </motion.button>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel padded={false}>
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
            <History className="size-4 text-primary" />
            <p className="text-xs font-bold tracking-tight text-foreground">Recent activity</p>
          </div>
          <div className="space-y-1 p-2">
            {recentConversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => {
                  setActiveId(conversation.id);
                  setSelectedAgent(conversation.agent);
                  setThreads((current) => ({
                    ...current,
                    [conversation.id]: conversation.messages,
                  }));
                }}
                className="flex w-full cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/70"
              >
                {conversation.pinned ? (
                  <Star className="mt-0.5 size-3 shrink-0 text-amber-500" />
                ) : (
                  <MessagesSquare className="mt-0.5 size-3 shrink-0 text-slate-400" />
                )}
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-medium leading-4 text-foreground">
                    {conversation.title}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    {conversation.agent} · {conversation.messageCount} messages ·{" "}
                    {relativeTime(conversation.updatedAt)}
                  </span>
                </span>
              </button>
            ))}
            {recentDocs.slice(0, 2).map((doc) => (
              <div key={doc.id} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-white/70">
                <FileStack className="mt-0.5 size-3 shrink-0 text-slate-400" />
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-medium leading-4 text-foreground">
                    Uploaded · {doc.name}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    {doc.department} · {relativeTime(doc.uploadedAt)}
                  </span>
                </span>
              </div>
            ))}
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-white/70">
                <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-emerald-500" />
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-medium leading-4 text-foreground">
                    {report.title}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    {report.status} · {relativeTime(report.generatedAt)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel padded={false}>
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
            <Lightbulb className="size-4 text-primary" />
            <p className="text-xs font-bold tracking-tight text-foreground">AI tips & alerts</p>
          </div>
          <div className="space-y-2 p-3.5">
            {AI_TIPS.map((tip, index) => (
              <div key={index} className="glass-inset flex items-start gap-2 rounded-lg p-2.5">
                <Sparkles className="mt-0.5 size-3 shrink-0 text-primary" />
                <p className="text-[11px] leading-4 text-foreground">{tip}</p>
              </div>
            ))}
            {openFindings.length > 0 ? (
              <GlassInset>
                <DetailRow
                  label="Open inspection findings"
                  value={`${openFindings.length} assets flagged`}
                />
                <DetailRow
                  label="Highest severity"
                  value={openFindings[0]?.severity ?? "—"}
                />
                <DetailRow
                  label="Task queue"
                  value={`${openTasks.length} open work orders`}
                />
              </GlassInset>
            ) : null}
            <div className="flex flex-wrap gap-1.5">
              {STARTER_ACTIONS.slice(0, 4).map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => void runPrompt(action.prompt)}
                  className="cursor-pointer rounded-full border border-border/70 bg-white/60 px-2.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

import { Badge2, MeterBar, StatusBadge } from "@/components/common/Badges";
import { DetailRow, GlassInset, GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, LoadingState } from "@/components/common/States";
import { SearchField } from "@/components/common/ActivityTimeline";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/hooks/use-role";
import { useAgents, useConversations, useSendChatMessage } from "@/hooks/use-queries";
import { cn } from "@/lib/utils";
import type { AiConversation, ChatMessage } from "@/types";
import { relativeTime } from "@/utils/format";
import {
  Bot,
  Check,
  Copy,
  Download,
  FileUp,
  MessageSquarePlus,
  Paperclip,
  Send,
  Sparkles,
  Star,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

const PROMPT_TEMPLATES = [
  {
    group: "Operations",
    items: [
      "Explain the current CDU-2 column pressure deviation and the first three checks.",
      "Summarise the shift handover into a one-page brief for the duty manager.",
      "Draft the escalation note for the K-5101 bearing temperature alarm.",
    ],
  },
  {
    group: "Integrity & compliance",
    items: [
      "Summarise API 570 findings for line 6\"-P-1204-A1A and remaining life.",
      "Which OISD clauses apply to the revised flare header purge SOP?",
      "List open statutory gaps relevant to this month's audit window.",
    ],
  },
];

function CodeSurface({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="glass-inset relative my-2 overflow-hidden rounded-lg">
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Extract
        </span>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1 text-[10px] font-medium text-primary hover:underline"
          onClick={() => {
            void navigator.clipboard.writeText(children);
            setCopied(true);
            toast.success("Copied to clipboard");
            window.setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="thin-scroll overflow-x-auto px-3 py-2 text-[11px] leading-5">
        <code className="font-mono text-slate-700">{children}</code>
      </pre>
    </div>
  );
}

function MarkdownBlock({ content }: { content: string }) {
  return (
    <div className="space-y-2 text-[12px] leading-6 text-foreground">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h3 className="mt-1 text-sm font-bold tracking-tight">{children}</h3>
          ),
          h2: ({ children }) => (
            <h3 className="mt-1 text-sm font-bold tracking-tight">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="mt-1 text-[13px] font-semibold">{children}</h4>
          ),
          p: ({ children }) => <p className="leading-6">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="ml-4 list-disc space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="ml-4 list-decimal space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-6">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/40 pl-3 text-muted-foreground">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="thin-scroll overflow-x-auto">
              <table className="w-full border-collapse text-[11px]">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border/70 bg-white/60 px-2 py-1 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border/70 px-2 py-1 align-top">{children}</td>
          ),
          code: ({ className, children }) => {
            const raw = String(children ?? "").replace(/\n$/, "");
            const isBlock = Boolean(className) || raw.includes("\n");
            if (!isBlock) {
              return (
                <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-teal-800">
                  {raw}
                </code>
              );
            }
            return <CodeSurface>{raw}</CodeSurface>;
          },
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}

function MessageBubble({ message, agent }: { message: ChatMessage; agent?: string }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-2.5", isUser && "flex-row-reverse")}>
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
          isUser
            ? "border-slate-200 bg-white/80 text-slate-600"
            : "border-teal-200 bg-teal-50/80 text-primary",
        )}
      >
        {isUser ? "You" : <Bot className="size-3.5" />}
      </span>
      <div
        className={cn(
          "min-w-0 max-w-[88%] rounded-xl border px-4 py-3",
          isUser
            ? "border-white/80 bg-primary/10"
            : "border-border/70 bg-white/72",
        )}
      >
        {!isUser ? (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge2 tone="primary" icon={<Sparkles className="size-3" />}>
              {message.agent ?? agent ?? "Operations Copilot"}
            </Badge2>
            {message.confidence !== undefined ? (
              <Badge2 tone="muted">
                Confidence {Math.round(message.confidence * 100)}%
              </Badge2>
            ) : null}
            <span className="text-[10px] text-muted-foreground">
              {relativeTime(message.createdAt)}
            </span>
            <button
              type="button"
              className="ml-auto flex cursor-pointer items-center gap-1 text-[10px] font-medium text-primary hover:underline"
              onClick={() => {
                void navigator.clipboard.writeText(message.content);
                toast.success("Response copied");
              }}
            >
              <Copy className="size-3" />
              Copy
            </button>
          </div>
        ) : null}

        <MarkdownBlock content={message.content} />

        {message.citations && message.citations.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {message.citations.map((citation) => (
              <Badge2 key={citation} tone="info">
                {citation}
              </Badge2>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** AI Chat Workspace — grounded conversations with sovereign enterprise agents. */
export default function ChatWorkspace() {
  const { profile } = useRole();
  const conversations = useConversations("chat-workspace");
  const agents = useAgents();
  const send = useSendChatMessage();

  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>({});
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [streaming, setStreaming] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState("Operations Copilot");
  const scrollRef = useRef<HTMLDivElement>(null);

  const list = conversations.data ?? [];
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter((conversation) =>
      `${conversation.title} ${conversation.agent}`.toLowerCase().includes(term),
    );
  }, [list, search]);

  useEffect(() => {
    const first = list[0];
    if (first && !activeId) {
      setActiveId(first.id);
      setSelectedAgent(first.agent);
    }
  }, [activeId, list]);

  useEffect(() => {
    if (!list.length) return;
    setThreads((current) => {
      const next = { ...current };
      list.forEach((conversation: AiConversation) => {
        if (!next[conversation.id]) next[conversation.id] = conversation.messages;
      });
      return next;
    });
  }, [list]);

  const active = list.find((conversation) => conversation.id === activeId);
  const messages = activeId ? threads[activeId] ?? [] : [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, streaming]);

  const ask = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || send.isPending || !activeId) return;
    setInput("");

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
      [activeId]: [...(current[activeId] ?? []), userMessage],
    }));

    const response = await send.mutateAsync({
      conversationId: activeId,
      prompt: trimmed,
      agent: selectedAgent,
      attachmentName: attachments[0],
    });
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
          [activeId]: [...(current[activeId] ?? []), response.message],
        }));
      }
    }, 18);
  };

  const exportConversation = () => {
    if (!active) return;
    const body = `# ${active.title}\n\nAgent: ${active.agent}\nExported by ${profile.name} · ${new Date().toISOString()}\n\n${messages
      .map((message) => `## ${message.role === "user" ? "Operator" : message.agent}\n\n${message.content}`)
      .join("\n\n")}`;
    const blob = new Blob([body], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${active.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Conversation exported as Markdown");
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <div className="space-y-4">
      <PageHeader
        title="AI Chat Workspace"
        description="Grounded conversations with sovereign refinery agents. Every answer is traceable to SOPs, standards and historian context — nothing leaves the MRPL network."
        crumbs={[{ label: "AI Workspaces" }, { label: "AI Chat" }]}
        actions={
          <>
            <Badge2 tone="primary" icon={<Sparkles className="size-3" />}>
              {agents.data?.filter((agent) => agent.status === "online").length ?? 6} agents online
            </Badge2>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer gap-1.5 border-white/70 bg-white/70"
              onClick={exportConversation}
            >
              <Download className="size-3.5" />
              Export conversation
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[270px_minmax(0,1fr)_300px]">
        {/* Conversation history */}
        <GlassPanel className="order-2 xl:order-1" padded={false}>
          <div className="space-y-3 p-4">
            <Button
              className="w-full cursor-pointer gap-2"
              size="sm"
              onClick={() => {
                const id = `cnv-${Date.now()}`;
                setThreads((current) => ({ ...current, [id]: [] }));
                setActiveId(id);
                toast.success("New conversation started");
              }}
            >
              <MessageSquarePlus className="size-3.5" />
              New conversation
            </Button>
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search conversations"
            />
          </div>
          <ScrollArea className="thin-scroll h-[520px] px-3 pb-3">
            {conversations.isLoading ? (
              <LoadingState label="Loading history…" minHeight={140} />
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No conversations match"
                description="Try a different search term or start a new conversation."
              />
            ) : (
              <ul className="space-y-1.5">
                {filtered.map((conversation) => (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveId(conversation.id);
                        setSelectedAgent(conversation.agent);
                      }}
                      className={cn(
                        "w-full cursor-pointer rounded-lg border p-2.5 text-left transition-colors",
                        conversation.id === activeId
                          ? "border-teal-200/80 bg-teal-50/70"
                          : "border-transparent hover:bg-white/70",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {conversation.pinned ? (
                          <Star className="mt-0.5 size-3 shrink-0 text-amber-500" />
                        ) : null}
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-[11px] font-medium leading-4 text-foreground">
                            {conversation.title}
                          </p>
                          <p className="mt-1 truncate text-[10px] text-muted-foreground">
                            {conversation.agent} · {conversation.messageCount} messages ·{" "}
                            {relativeTime(conversation.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </GlassPanel>

        {/* Thread */}
        <GlassPanel className="order-1 flex min-h-[640px] flex-col xl:order-2" padded={false}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">
                {active?.title ?? "New conversation"}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {selectedAgent} · {messages.length} messages · grounded on the sovereign corpus
              </p>
            </div>
            <Badge2 tone={streaming !== null ? "warning" : "success"}>
              {streaming !== null ? "Streaming" : "Ready"}
            </Badge2>
          </div>

          <div
            ref={scrollRef}
            className="thin-scroll flex-1 space-y-4 overflow-y-auto px-4 py-4"
          >
            {messages.length === 0 && streaming === null ? (
              <EmptyState
                title="Start a grounded conversation"
                description="Ask about an asset, a deviation, a standard or a document. Answers cite the internal sources they were grounded on."
                icon={<Bot className="size-4" />}
              />
            ) : null}
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} agent={selectedAgent} />
            ))}
            {streaming !== null ? (
              <div className="flex gap-2.5">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-50/80 text-primary">
                  <Bot className="size-3.5" />
                </span>
                <div className="min-w-0 max-w-[88%] rounded-xl border border-border/70 bg-white/72 px-4 py-3">
                  <MarkdownBlock content={streaming} />
                  <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-primary align-middle" />
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-2 border-t border-border/60 px-4 py-3">
            {attachments.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {attachments.map((name) => (
                  <Badge2 key={name} tone="info" icon={<Paperclip className="size-3" />}>
                    {name}
                  </Badge2>
                ))}
              </div>
            ) : null}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void ask(input);
                    }
                  }}
                  rows={2}
                  placeholder="Ask about an asset, a deviation, an SOP or a drawing… (Enter to send, Shift+Enter for a new line)"
                  className="max-h-32 min-h-[64px] resize-none border-white/70 bg-white/70 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="cursor-pointer border-white/70 bg-white/70"
                  aria-label="Attach a file to ground the answer"
                  onClick={() =>
                    setAttachments((current) =>
                      current.length
                        ? current
                        : ["CDU-2 P&ID Rev 12 (as-built).pdf"],
                    )
                  }
                >
                  <FileUp className="size-3.5" />
                </Button>
                <Button
                  size="icon"
                  className="cursor-pointer"
                  aria-label="Send message"
                  disabled={!input.trim() || send.isPending || !activeId}
                  onClick={() => void ask(input)}
                >
                  <Send className="size-3.5" />
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Responses are advisory. Console operators and engineers retain
              authority for every control or safety decision.
            </p>
          </div>
        </GlassPanel>

        {/* Agent rail */}
        <div className="order-3 space-y-4">
          <GlassPanel>
            <PanelHeading
              title="Agent indicator"
              description="Which sovereign agent is answering."
              icon={<Bot className="size-4" />}
            />
            <div className="mt-3 space-y-1.5">
              {(agents.data ?? []).slice(0, 4).map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setSelectedAgent(agent.name)}
                  className={cn(
                    "w-full cursor-pointer rounded-lg border p-2.5 text-left transition-colors",
                    agent.name === selectedAgent
                      ? "border-teal-200/80 bg-teal-50/70"
                      : "border-transparent hover:bg-white/70",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] font-medium text-foreground">
                      {agent.name}
                    </span>
                    <StatusBadge status={agent.status} />
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {agent.model} · {(agent.accuracy * 100).toFixed(1)}% accuracy ·{" "}
                    {agent.latencyMs} ms
                  </p>
                </button>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel>
            <PanelHeading
              title="Answer quality"
              description="Confidence and grounding for the latest response."
              icon={<Sparkles className="size-4" />}
            />
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Model confidence</span>
                  <span className="tabular font-medium text-foreground">
                    {lastAssistant?.confidence
                      ? `${Math.round(lastAssistant.confidence * 100)}%`
                      : "—"}
                  </span>
                </div>
                <MeterBar
                  value={(lastAssistant?.confidence ?? 0) * 100}
                  tone="success"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Grounding coverage</span>
                  <span className="tabular font-medium text-foreground">92%</span>
                </div>
                <MeterBar value={92} tone="primary" />
              </div>
              <GlassInset>
                <DetailRow label="Sources cited" value={`${lastAssistant?.citations?.length ?? 0} internal documents`} />
                <DetailRow label="Retention" value="7 years · immutable" />
                <DetailRow label="Egress" value="Blocked by policy" />
              </GlassInset>
            </div>
          </GlassPanel>

          <GlassPanel>
            <PanelHeading
              title="Prompt templates"
              description="Reusable prompts tuned for refinery work."
              icon={<FileUp className="size-4" />}
            />
            <div className="mt-3 space-y-3">
              {PROMPT_TEMPLATES.map((group) => (
                <div key={group.group} className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.group}
                  </p>
                  {group.items.map((template) => (
                    <button
                      key={template}
                      type="button"
                      onClick={() => setInput(template)}
                      className="glass-inset block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-[11px] leading-4 text-foreground transition-colors hover:border-primary/40"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

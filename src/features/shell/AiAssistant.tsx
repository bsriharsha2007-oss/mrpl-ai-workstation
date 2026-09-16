import { Badge2 } from "@/components/common/Badges";
import { InlineLoader } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSendChatMessage } from "@/hooks/use-queries";
import { useRole } from "@/hooks/use-role";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bot, Minus, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

const PROMPTS = [
  "Summarise the shift handover",
  "Explain the K-5101 bearing alert",
  "Which SOP covers column pressure?",
];

interface Turn {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent?: string;
}

/**
 * Floating AI assistant — available on every authenticated screen, with a
 * compact conversation loop that hands off to the full chat workspace when the
 * user needs citations, exports or long-form answers.
 */
export function AiAssistant() {
  const open = useUiStore((state) => state.assistantOpen);
  const setOpen = useUiStore((state) => state.setAssistantOpen);
  const toggleAssistant = useUiStore((state) => state.toggleAssistant);
  const { profile } = useRole();
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [streaming, setStreaming] = useState<string | null>(null);
  const send = useSendChatMessage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, streaming]);

  const ask = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || send.isPending) return;
    setInput("");
    setTurns((current) => [
      ...current,
      { id: `u-${Date.now()}`, role: "user", content: trimmed },
    ]);

    const response = await send.mutateAsync({
      prompt: trimmed,
      agent: "Operations Copilot",
    });

    const full = response.message.content;
    // Token-by-token reveal keeps the assistant feeling responsive.
    const step = Math.max(24, Math.round(full.length / 60));
    setStreaming("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += step;
      setStreaming(full.slice(0, index));
      if (index >= full.length) {
        window.clearInterval(timer);
        setStreaming(null);
        setTurns((current) => [
          ...current,
          {
            id: response.message.id,
            role: "assistant",
            content: full,
            agent: response.message.agent,
          },
        ]);
      }
    }, 22);
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={toggleAssistant}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 22 }}
        className={cn(
          "glass-strong fixed right-4 bottom-12 z-40 flex h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-xs font-semibold text-primary shadow-sm transition-transform hover:-translate-y-0.5 sm:right-6",
          open && "pointer-events-none opacity-0",
        )}
        aria-label="Ask the MRPL AI assistant"
      >
        <Sparkles className="size-4" />
        Ask MRPL AI
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.aside
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong fixed right-3 bottom-12 z-40 flex h-[520px] w-[min(380px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border-white/80"
            aria-label="AI assistant"
          >
            <header className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
              <span className="flex size-8 items-center justify-center rounded-lg border border-teal-200/70 bg-teal-50/80 text-primary">
                <Bot className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground">
                  MRPL Operations Copilot
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Grounded on SOPs, historian context and enterprise knowledge
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Minimise assistant"
                className="cursor-pointer text-muted-foreground"
                onClick={() => setOpen(false)}
              >
                <Minus className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close assistant"
                className="cursor-pointer text-muted-foreground"
                onClick={() => setOpen(false)}
              >
                <X className="size-3.5" />
              </Button>
            </header>

            <div ref={scrollRef} className="thin-scroll flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {turns.length === 0 && !streaming ? (
                <div className="space-y-3">
                  <p className="text-xs leading-5 text-muted-foreground">
                    Hello {profile.name.split(" ")[0]} — I can summarise shift
                    events, explain an AI alert, find the governing SOP or draft a
                    quick report. Nothing leaves the refinery network.
                  </p>
                  <div className="space-y-1.5">
                    {PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => void ask(prompt)}
                        className="glass-inset flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[11px] text-foreground transition-colors hover:border-primary/40"
                      >
                        {prompt}
                        <ArrowRight className="size-3 text-primary" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {turns.map((turn) => (
                <div
                  key={turn.id}
                  className={cn(
                    "max-w-[92%] rounded-xl border px-3 py-2 text-[11px] leading-5 whitespace-pre-wrap",
                    turn.role === "user"
                      ? "ml-auto border-white/70 bg-primary/10 text-foreground"
                      : "border-border/70 bg-white/70 text-foreground",
                  )}
                >
                  {turn.role === "assistant" ? (
                    <span className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      <Sparkles className="size-3" />
                      {turn.agent ?? "Operations Copilot"}
                    </span>
                  ) : null}
                  {turn.content}
                </div>
              ))}

              {streaming !== null ? (
                <div className="max-w-[92%] rounded-xl border border-border/70 bg-white/70 px-3 py-2 text-[11px] leading-5 whitespace-pre-wrap text-foreground">
                  {streaming}
                  <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-primary align-middle" />
                </div>
              ) : null}

              {send.isPending ? <InlineLoader label="Consulting agents…" /> : null}
            </div>

            <footer className="space-y-2 border-t border-border/60 px-3 py-3">
              <form
                className="flex items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void ask(input);
                }}
              >
                <Input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about an asset, SOP or reading…"
                  className="h-9 border-white/70 bg-white/70 text-xs"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="cursor-pointer"
                  disabled={!input.trim() || send.isPending}
                  aria-label="Send message"
                >
                  <Send className="size-3.5" />
                </Button>
              </form>
              <div className="flex items-center justify-between gap-2">
                <Badge2 tone="muted">Frontend preview · mock agents</Badge2>
                <button
                  type="button"
                  className="cursor-pointer text-[10px] font-medium text-primary hover:underline"
                  onClick={() => {
                    setOpen(false);
                    navigate("/chat");
                  }}
                >
                  Open full chat workspace →
                </button>
              </div>
            </footer>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}

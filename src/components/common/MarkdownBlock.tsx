/**
 * Shared markdown renderer for AI responses — glass-styled code surfaces,
 * tables, citations and inline code tuned for the light enterprise theme.
 */

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

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

export function MarkdownBlock({ content }: { content: string }) {
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

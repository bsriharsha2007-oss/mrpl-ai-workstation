import { Badge2, MeterBar } from "@/components/common/Badges";
import { GlassInset, GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, InlineLoader, LoadingState } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useKnowledgeSearch, useSavedSearches, useSendChatMessage } from "@/hooks/use-queries";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import type { KnowledgeResult } from "@/types";
import { relativeTime } from "@/utils/format";
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Clock,
  FileText,
  History,
  Layers,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

const SCOPE_OPTIONS = [
  "all",
  "Process Operations",
  "Mechanical Maintenance",
  "Inspection & NDT",
  "HSE",
];

function ResultCard({
  result,
  bookmarked,
  onToggleBookmark,
  onFollowRelated,
}: {
  result: KnowledgeResult;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onFollowRelated: (query: string) => void;
}) {
  return (
    <article className="glass-inset rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge2 tone="info">{result.kind}</Badge2>
            <span className="text-[10px] text-muted-foreground">
              {result.source} · updated {relativeTime(result.updatedAt)}
            </span>
          </div>
          <h3 className="mt-2 text-sm font-semibold leading-5 text-foreground">
            {result.title}
          </h3>
        </div>
        <button
          type="button"
          aria-label="Bookmark result"
          className="cursor-pointer text-muted-foreground transition-colors hover:text-primary"
          onClick={onToggleBookmark}
        >
          {bookmarked ? (
            <BookmarkCheck className="size-4 text-primary" />
          ) : (
            <Bookmark className="size-4" />
          )}
        </button>
      </div>

      <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">
        {result.snippet}
      </p>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Semantic score
        </span>
        <MeterBar
          value={result.score * 100}
          tone={result.score > 0.9 ? "success" : "primary"}
          className="max-w-[160px] flex-1"
        />
        <span className="tabular text-[11px] font-semibold text-foreground">
          {(result.score * 100).toFixed(0)}%
        </span>
      </div>

      {result.related.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Related:</span>
          {result.related.map((related) => (
            <button
              key={related}
              type="button"
              onClick={() => onFollowRelated(related)}
              className="cursor-pointer rounded-full border border-white/80 bg-white/70 px-2 py-0.5 text-[10px] text-slate-600 transition-colors hover:border-primary/40 hover:text-primary"
            >
              {related}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}

/** Knowledge Workspace — semantic search across the enterprise corpus. */
export default function KnowledgeWorkspace() {
  const [params, setParams] = useSearchParams();
  const initialQuery = params.get("q") ?? "";
  const [draft, setDraft] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [scope, setScope] = useState("all");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [answer, setAnswer] = useState<string | null>(null);

  const recentSearches = useUiStore((state) => state.recentSearches);
  const pushRecentSearch = useUiStore((state) => state.pushRecentSearch);
  const clearRecentSearches = useUiStore((state) => state.clearRecentSearches);

  const results = useKnowledgeSearch(query, scope);
  const saved = useSavedSearches();
  const ask = useSendChatMessage();

  useEffect(() => {
    const urlQuery = params.get("q") ?? "";
    if (urlQuery && urlQuery !== query) {
      setDraft(urlQuery);
      setQuery(urlQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const runSearch = (next: string) => {
    const trimmed = next.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setDraft(trimmed);
    pushRecentSearch(trimmed);
    setParams({ q: trimmed }, { replace: true });
  };

  const askAnswer = async () => {
    if (!query) return;
    const response = await ask.mutateAsync({
      prompt: `Answer this enterprise knowledge query using internal sources: ${query}`,
      agent: "Document Intelligence Agent",
    });
    setAnswer(response.message.content);
  };

  const topResults = results.data ?? [];
  const bestScore = useMemo(
    () => topResults.reduce((max, result) => Math.max(max, result.score), 0),
    [topResults],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Knowledge Search"
        description="Semantic retrieval across SOPs, standards, drawings, inspection reports and OEM manuals. Answers are grounded, cited and fully auditable."
        crumbs={[{ label: "AI Workspaces" }, { label: "Knowledge" }]}
        actions={
          <>
            <Badge2 tone="primary" icon={<Layers className="size-3" />}>
              1.28 M chunks · 24,180 documents
            </Badge2>
            <Badge2 tone="muted">Retrieval precision 94.6%</Badge2>
          </>
        }
      />

      <GlassPanel glow>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") runSearch(draft);
              }}
              placeholder="Ask a question or search a topic — e.g. “column pressure excursion procedure”"
              className="h-11 border-white/70 bg-white/75 pl-10 text-sm"
            />
          </div>
          <Select value={scope} onValueChange={setScope}>
            <SelectTrigger className="h-11 w-full border-white/70 bg-white/70 text-xs lg:w-[200px]">
              <SelectValue placeholder="Scope" />
            </SelectTrigger>
            <SelectContent>
              {SCOPE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === "all" ? "All departments" : option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              className="h-11 cursor-pointer gap-2 px-5"
              onClick={() => runSearch(draft)}
            >
              <Search className="size-4" />
              Search
            </Button>
            <Button
              variant="outline"
              className="h-11 cursor-pointer gap-2 border-white/70 bg-white/70"
              disabled={!query || ask.isPending}
              onClick={() => void askAnswer()}
            >
              <Sparkles className="size-4" />
              Answer
            </Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Try
          </span>
          {[
            "column pressure excursion procedure",
            "API 570 remaining life calculation",
            "corrosion under insulation requirements",
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => runSearch(suggestion)}
              className="cursor-pointer rounded-full border border-white/80 bg-white/70 px-2.5 py-1 text-[10px] text-slate-600 transition-colors hover:border-primary/40 hover:text-primary"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {answer || ask.isPending ? (
            <GlassPanel>
              <PanelHeading
                title="Grounded answer"
                description="Synthesised from the top-ranked internal sources."
                icon={<Sparkles className="size-4" />}
                action={<Badge2 tone="primary">Document Intelligence Agent</Badge2>}
              />
              <div className="mt-4">
                {ask.isPending ? (
                  <InlineLoader label="Retrieving and reasoning over internal sources…" />
                ) : (
                  <p className="text-xs leading-6 whitespace-pre-wrap text-foreground">
                    {answer}
                  </p>
                )}
              </div>
            </GlassPanel>
          ) : null}

          <GlassPanel>
            <PanelHeading
              title={query ? `Results for “${query}”` : "Enterprise search results"}
              description={
                query
                  ? `${topResults.length} ranked sources · best match ${(bestScore * 100).toFixed(0)}%`
                  : "Start with a question, an asset tag, a procedure number or a standard."
              }
              icon={<BookOpen className="size-4" />}
            />
            <div className="mt-4 space-y-3">
              {results.isLoading ? (
                <LoadingState label="Searching the enterprise corpus…" minHeight={180} />
              ) : !query ? (
                <EmptyState
                  title="Search the sovereign knowledge base"
                  description="Semantic search understands refinery terminology — try an asset tag, a deviation or a regulation clause."
                  icon={<Search className="size-4" />}
                />
              ) : topResults.length === 0 ? (
                <EmptyState
                  title="No confident match"
                  description="Try broadening the query or removing the department scope."
                />
              ) : (
                topResults.map((result) => (
                  <ResultCard
                    key={result.id}
                    result={result}
                    bookmarked={bookmarks.has(result.id)}
                    onToggleBookmark={() => {
                      setBookmarks((current) => {
                        const next = new Set(current);
                        if (next.has(result.id)) {
                          next.delete(result.id);
                          toast("Bookmark removed");
                        } else {
                          next.add(result.id);
                          toast.success("Saved to bookmarks", {
                            description: result.title,
                          });
                        }
                        return next;
                      });
                    }}
                    onFollowRelated={(related) => runSearch(related)}
                  />
                ))
              )}
            </div>
          </GlassPanel>
        </div>

        <div className="space-y-4">
          <GlassPanel>
            <PanelHeading
              title="Recent searches"
              description="Your last queries across the workstation."
              icon={<History className="size-4" />}
              action={
                recentSearches.length > 0 ? (
                  <button
                    type="button"
                    className="cursor-pointer text-[11px] font-medium text-primary hover:underline"
                    onClick={clearRecentSearches}
                  >
                    Clear
                  </button>
                ) : null
              }
            />
            <div className="mt-3 space-y-1.5">
              {recentSearches.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  Your searches will appear here for quick re-runs.
                </p>
              ) : (
                recentSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => runSearch(item)}
                    className="glass-inset flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[11px] text-foreground transition-colors hover:border-primary/40"
                  >
                    <Clock className="size-3 text-muted-foreground" />
                    <span className="truncate">{item}</span>
                  </button>
                ))
              )}
            </div>
          </GlassPanel>

          <GlassPanel>
            <PanelHeading
              title="Saved searches"
              description="Shared searches curated by your department."
              icon={<BookOpen className="size-4" />}
            />
            <div className="mt-3 space-y-2">
              {saved.isLoading ? (
                <LoadingState minHeight={100} />
              ) : (
                (saved.data ?? []).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => runSearch(item.query)}
                    className="glass-inset flex w-full cursor-pointer items-start justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:border-primary/40"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[11px] font-medium text-foreground">
                        {item.label}
                      </span>
                      <span className="block truncate text-[10px] text-muted-foreground">
                        {item.scope} · {item.results} sources · saved{" "}
                        {relativeTime(item.savedAt)}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </GlassPanel>

          <GlassPanel>
            <PanelHeading
              title="Bookmarks"
              description="Knowledge you pinned for later."
              icon={<Bookmark className="size-4" />}
            />
            <div className="mt-3 space-y-2">
              {bookmarks.size === 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  Bookmark a result to keep it alongside your pinned SOPs.
                </p>
              ) : (
                topResults
                  .filter((result) => bookmarks.has(result.id))
                  .map((result) => (
                    <div
                      key={result.id}
                      className="glass-inset rounded-lg px-3 py-2 text-[11px] text-foreground"
                    >
                      <p className="truncate font-medium">{result.title}</p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {result.source}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </GlassPanel>

          <GlassPanel>
            <PanelHeading
              title="Document references"
              description="Suggested controlled documents for this query."
              icon={<FileText className="size-4" />}
            />
            <div className="mt-3 space-y-2">
              {topResults.slice(0, 3).map((result) => (
                <GlassInset key={result.id} className="space-y-1">
                  <p className="truncate text-[11px] font-medium text-foreground">
                    {result.source}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {result.department} · {result.kind}
                  </p>
                  <div className="flex items-center gap-2">
                    <MeterBar value={result.score * 100} tone="primary" className="flex-1" />
                    <span className="tabular text-[10px] text-muted-foreground">
                      {(result.score * 100).toFixed(0)}%
                    </span>
                  </div>
                </GlassInset>
              ))}
              {topResults.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  References will appear after a search.
                </p>
              ) : null}
            </div>
          </GlassPanel>

          <GlassPanel>
            <PanelHeading
              title="Related knowledge"
              description="Adjacent topics the curator agent linked."
              icon={<Layers className="size-4" />}
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Array.from(
                new Set(topResults.flatMap((result) => result.related)),
              ).map((related) => (
                <button
                  key={related}
                  type="button"
                  onClick={() => runSearch(related)}
                  className={cn(
                    "cursor-pointer rounded-full border border-white/80 bg-white/70 px-2.5 py-1 text-[10px] text-slate-600",
                    "transition-colors hover:border-primary/40 hover:text-primary",
                  )}
                >
                  {related}
                </button>
              ))}
              {topResults.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  Related topics appear alongside results.
                </p>
              ) : null}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

import { Badge2, StatusBadge } from "@/components/common/Badges";
import { DetailRow, GlassInset, GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchField } from "@/components/common/ActivityTimeline";
import { DataTable, type DataColumn } from "@/components/common/DataTable";
import { EmptyState, LoadingState } from "@/components/common/States";
import { UploadArea } from "@/components/common/UploadArea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole } from "@/hooks/use-role";
import { useDocuments, useUploadDocument } from "@/hooks/use-queries";
import { cn } from "@/lib/utils";
import type { DocumentKind, DocumentRecord } from "@/types";
import { relativeTime } from "@/utils/format";
import {
  Bookmark,
  BookmarkCheck,
  Download,
  FileStack,
  FileText,
  History,
  Sparkles,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const KIND_TONE: Record<DocumentKind, "danger" | "info" | "success" | "warning" | "primary"> = {
  PDF: "danger",
  DOCX: "info",
  XLSX: "success",
  PPTX: "warning",
  DWG: "primary",
};

function DocumentPreview({ document }: { document: DocumentRecord }) {
  return (
    <div className="glass-inset relative aspect-[4/3] w-full overflow-hidden rounded-xl">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.95), rgba(238,242,246,0.9))",
        }}
      />
      <div className="absolute inset-0 flex flex-col p-4">
        <div className="flex items-center gap-2">
          <Badge2 tone={KIND_TONE[document.kind]}>{document.kind}</Badge2>
          <span className="truncate text-[10px] font-medium text-muted-foreground">
            {document.version} · {document.pages} pages
          </span>
        </div>
        <div className="mt-3 flex-1 space-y-2 overflow-hidden">
          <div className="h-2 w-3/4 rounded bg-slate-300/70" />
          <div className="h-2 w-1/2 rounded bg-slate-300/60" />
          <div className="mt-4 space-y-1.5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-1.5 rounded bg-slate-300/45"
                style={{ width: `${92 - index * 6}%` }}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-10 rounded bg-teal-200/40" />
            ))}
          </div>
        </div>
        <p className="truncate text-[10px] text-muted-foreground">
          Rendered preview · layout-aware extraction applied
        </p>
      </div>
    </div>
  );
}

/** Document Workspace — controlled documents, AI summaries and version history. */
export default function DocumentWorkspace() {
  const { profile } = useRole();
  const documents = useDocuments();
  const upload = useUploadDocument();

  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<DocumentKind | "all">("all");
  const [bookmarksOnly, setBookmarksOnly] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  const list = documents.data ?? [];
  const active = list.find((document) => document.id === activeId) ?? list[0];

  useEffect(() => {
    if (!activeId && list.length > 0) setActiveId(list[0].id);
  }, [activeId, list]);

  useEffect(() => {
    setBookmarked(
      new Set(list.filter((document) => document.bookmarked).map((d) => d.id)),
    );
  }, [list]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return list.filter((document) => {
      if (kind !== "all" && document.kind !== kind) return false;
      if (bookmarksOnly && !bookmarked.has(document.id)) return false;
      if (
        term &&
        !`${document.name} ${document.department} ${document.summary}`
          .toLowerCase()
          .includes(term)
      ) {
        return false;
      }
      return true;
    });
  }, [bookmarked, bookmarksOnly, kind, list, search]);

  const columns: DataColumn<DocumentRecord>[] = [
    {
      key: "name",
      header: "Document",
      sortValue: (row) => row.name,
      render: (row) => (
        <div className="flex items-start gap-2">
          <span
            className={cn(
              "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/70 bg-white/70",
            )}
          >
            <FileText className="size-3.5 text-primary" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground">{row.name}</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {row.department} · {row.size} · {row.pages} pages
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "kind",
      header: "Type",
      hideBelow: "sm",
      sortValue: (row) => row.kind,
      render: (row) => <Badge2 tone={KIND_TONE[row.kind]}>{row.kind}</Badge2>,
    },
    {
      key: "version",
      header: "Version",
      hideBelow: "md",
      sortValue: (row) => row.versions,
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.version} · {row.versions} revs
        </span>
      ),
    },
    {
      key: "status",
      header: "Index state",
      hideBelow: "lg",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "uploaded",
      header: "Uploaded",
      hideBelow: "xl",
      sortValue: (row) => new Date(row.uploadedAt).getTime(),
      render: (row) => (
        <span className="text-[11px] text-muted-foreground">
          {row.uploadedBy} · {relativeTime(row.uploadedAt)}
        </span>
      ),
    },
    {
      key: "bookmark",
      header: "",
      align: "right",
      render: (row) => (
        <button
          type="button"
          aria-label="Toggle bookmark"
          className="cursor-pointer text-muted-foreground transition-colors hover:text-primary"
          onClick={(event) => {
            event.stopPropagation();
            setBookmarked((current) => {
              const next = new Set(current);
              if (next.has(row.id)) {
                next.delete(row.id);
                toast("Bookmark removed", { description: row.name });
              } else {
                next.add(row.id);
                toast.success("Bookmarked", { description: row.name });
              }
              return next;
            });
          }}
        >
          {bookmarked.has(row.id) ? (
            <BookmarkCheck className="size-4 text-primary" />
          ) : (
            <Bookmark className="size-4" />
          )}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Document Workspace"
        description="Engineering drawings, SOPs, datasheets and inspection reports with layout-aware AI extraction, summaries and full version history."
        crumbs={[{ label: "AI Workspaces" }, { label: "Documents" }]}
        actions={
          <>
            <Badge2 tone="primary">{list.length} indexed documents</Badge2>
            <Button
              size="sm"
              className="cursor-pointer gap-1.5"
              onClick={() => setUploadOpen(true)}
            >
              <Upload className="size-3.5" />
              Upload document
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <GlassPanel className="space-y-4">
          <PanelHeading
            title="Document library"
            description="Search, filter and open controlled documents."
            icon={<FileStack className="size-4" />}
          />
          <div className="flex flex-wrap items-center gap-2">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search documents, departments or content…"
              className="min-w-[220px] flex-1"
            />
            <Select value={kind} onValueChange={(value) => setKind(value as DocumentKind | "all")}>
              <SelectTrigger className="h-9 w-[130px] border-white/70 bg-white/70 text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="DOCX">Word</SelectItem>
                <SelectItem value="XLSX">Excel</SelectItem>
                <SelectItem value="PPTX">PowerPoint</SelectItem>
                <SelectItem value="DWG">Drawing</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={bookmarksOnly ? "default" : "outline"}
              size="sm"
              className={cn(
                "cursor-pointer gap-1.5",
                !bookmarksOnly && "border-white/70 bg-white/70",
              )}
              onClick={() => setBookmarksOnly((value) => !value)}
            >
              <Bookmark className="size-3.5" />
              Bookmarks
            </Button>
          </div>

          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(row) => row.id}
            isLoading={documents.isLoading}
            onRowClick={(row) => setActiveId(row.id)}
            pageSize={6}
            caption="Enterprise document library"
            emptyTitle="No documents match the filters"
            emptyDescription="Adjust the search term or upload a new controlled document."
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <GlassInset className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Recent files
              </p>
              <ul className="space-y-1.5">
                {list.slice(0, 3).map((document) => (
                  <li key={document.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(document.id)}
                      className="w-full cursor-pointer text-left text-[11px] text-foreground hover:text-primary"
                    >
                      <span className="truncate">{document.name}</span>
                      <span className="block text-[10px] text-muted-foreground">
                        {relativeTime(document.uploadedAt)} · {document.uploadedBy}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </GlassInset>
            <GlassInset className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Bookmarks
              </p>
              {bookmarked.size === 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  Star a document to pin it here.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {list
                    .filter((document) => bookmarked.has(document.id))
                    .slice(0, 3)
                    .map((document) => (
                      <li key={document.id}>
                        <button
                          type="button"
                          onClick={() => setActiveId(document.id)}
                          className="w-full cursor-pointer text-left text-[11px] text-foreground hover:text-primary"
                        >
                          <span className="truncate">{document.name}</span>
                          <span className="block text-[10px] text-muted-foreground">
                            {document.kind} · {document.version}
                          </span>
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </GlassInset>
          </div>
        </GlassPanel>

        <div className="space-y-4">
          {active ? (
            <>
              <GlassPanel>
                <PanelHeading
                  title="Preview & AI summary"
                  description={`${active.department} · ${active.version}`}
                  icon={<FileText className="size-4" />}
                  action={<Badge2 tone={KIND_TONE[active.kind]}>{active.kind}</Badge2>}
                />
                <div className="mt-4 space-y-3">
                  <DocumentPreview document={active} />
                  <GlassInset>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      AI summary
                    </p>
                    <p className="mt-1.5 text-xs leading-5 text-foreground">
                      {active.summary}
                    </p>
                  </GlassInset>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer gap-1.5 border-white/70 bg-white/70"
                      onClick={() =>
                        toast.success("Download queued", {
                          description: `${active.name} will appear in Downloads.`,
                        })
                      }
                    >
                      <Download className="size-3.5" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer gap-1.5 border-white/70 bg-white/70"
                      onClick={() =>
                        toast.success("Knowledge agent asked", {
                          description: "Open the chat workspace for the full answer.",
                        })
                      }
                    >
                      <Sparkles className="size-3.5" />
                      Ask AI about this
                    </Button>
                  </div>
                </div>
              </GlassPanel>

              <GlassPanel>
                <PanelHeading
                  title="Extracted metadata"
                  description="Fields the document intelligence agent pulled out."
                  icon={<Sparkles className="size-4" />}
                />
                <div className="mt-4">
                  <GlassInset>
                    {active.metadata.map((entry) => (
                      <DetailRow key={entry.label} label={entry.label} value={entry.value} />
                    ))}
                    <DetailRow label="Pages" value={`${active.pages}`} />
                    <DetailRow label="Uploaded by" value={`${active.uploadedBy} · ${relativeTime(active.uploadedAt)}`} />
                  </GlassInset>
                </div>
              </GlassPanel>

              <GlassPanel>
                <PanelHeading
                  title="Version history"
                  description={`${active.versions} revisions retained under the sovereign retention policy.`}
                  icon={<History className="size-4" />}
                />
                <ol className="mt-4 space-y-3">
                  {Array.from({ length: Math.min(active.versions, 4) }).map((_, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border border-teal-200/80 bg-teal-50/70 text-[10px] font-semibold text-primary">
                        {active.versions - index}
                      </span>
                      <div className="min-w-0 flex-1 border-b border-border/60 pb-2">
                        <p className="text-[11px] font-medium text-foreground">
                          {index === 0
                            ? `${active.version} · current revision`
                            : `Rev ${active.versions - index} · superseded`}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {index === 0
                            ? `Uploaded ${relativeTime(active.uploadedAt)} by ${active.uploadedBy}`
                            : `Retained for audit · approved by process engineering`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </GlassPanel>
            </>
          ) : (
            <GlassPanel>
              <EmptyState
                title="No document selected"
                description="Pick a document from the library to see its preview, AI summary and version history."
                icon={<FileText className="size-4" />}
              />
            </GlassPanel>
          )}
        </div>
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="glass-strong max-h-[88vh] overflow-y-auto border-white/80 bg-white/90 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm">Upload controlled documents</DialogTitle>
            <DialogDescription className="text-xs">
              Documents are classified, summarised and indexed into the enterprise
              knowledge graph. Nothing is transmitted outside MRPL infrastructure.
            </DialogDescription>
          </DialogHeader>
          <UploadArea
            busy={upload.isPending}
            onFiles={async (files) => {
              const file = files[0];
              await upload.mutateAsync({
                name: file?.name ?? "New controlled document.pdf",
                kind: "PDF",
                department: profile.department,
                uploadedBy: profile.name,
              });
              setUploadOpen(false);
              toast.success("Document queued for indexing", {
                description: "The library will show it as processing.",
              });
            }}
            description="PDF, Word, Excel, PowerPoint or CAD drawings up to 120 MB."
          />
        </DialogContent>
      </Dialog>

      {documents.isLoading ? (
        <div className="hidden">
          <LoadingState />
        </div>
      ) : null}
    </div>
  );
}

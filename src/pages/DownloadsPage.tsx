import { Badge2, StatusBadge } from "@/components/common/Badges";
import { GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type DataColumn } from "@/components/common/DataTable";
import { MetricCard } from "@/components/common/MetricCard";
import { useDownloads } from "@/hooks/use-queries";
import type { DownloadItem } from "@/types";
import { relativeTime } from "@/utils/format";
import { Archive, Download, FolderOpen, HardDrive, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

/** Downloads — secure export history and vault delivery state. */
export default function DownloadsPage() {
  const downloads = useDownloads();

  const columns: DataColumn<DownloadItem>[] = [
    {
      key: "name",
      header: "File",
      sortValue: (row) => row.name,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/70 bg-white/70">
            <Download className="size-3.5 text-primary" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground">{row.name}</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {row.kind} · {row.size}
            </p>
          </div>
        </div>
      ),
    },
    { key: "destination", header: "Destination", hideBelow: "sm", render: (r) => <span className="text-[11px] text-muted-foreground">{r.destination}</span> },
    { key: "status", header: "State", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "when",
      header: "Requested",
      hideBelow: "md",
      sortValue: (r) => new Date(r.downloadedAt).getTime(),
      render: (r) => <span className="text-[11px] text-muted-foreground">{relativeTime(r.downloadedAt)}</span>,
    },
    {
      key: "action",
      header: "",
      align: "right",
      render: (row) => (
        <button
          type="button"
          className="cursor-pointer rounded-md border border-white/70 bg-white/70 px-2 py-1 text-[10px] font-medium text-primary transition-colors hover:border-primary/40"
          onClick={() =>
            row.status === "ready"
              ? toast.success("Download started", { description: row.name })
              : toast(row.status === "generating" ? "Still generating" : "Link expired", {
                  description: row.name,
                })
          }
        >
          {row.status === "ready" ? "Save again" : row.status === "generating" ? "Preparing…" : "Re-request"}
        </button>
      ),
    },
  ];

  const ready = (downloads.data ?? []).filter((item) => item.status === "ready").length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Downloads"
        description="Secure export history. Files are packaged inside the sovereign zone and delivered to your workstation or the shared vault."
        crumbs={[{ label: "Workspaces" }, { label: "Downloads" }]}
        actions={<Badge2 tone="success" icon={<ShieldCheck className="size-3" />}>Watermarked · DLP enforced</Badge2>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Ready to save" value={ready} unit="files" icon={<Download className="size-4" />} caption="Signed URLs valid 24 h" />
        <MetricCard label="Secure vault" value={42.6} unit="GB" decimals={1} icon={<HardDrive className="size-4" />} tone="info" caption="Encrypted at rest" />
        <MetricCard label="Shared folders" value={8} icon={<FolderOpen className="size-4" />} tone="primary" caption="Department-scoped" />
        <MetricCard label="Archive retention" value={7} unit="years" icon={<Archive className="size-4" />} tone="warning" caption="Statutory policy" />
      </div>

      <GlassPanel>
        <PanelHeading
          title="Download history"
          description="Everything you or the system exported on your behalf."
          icon={<Download className="size-4" />}
        />
        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={downloads.data ?? []}
            rowKey={(row) => row.id}
            isLoading={downloads.isLoading}
            pageSize={8}
            caption="Download history"
          />
        </div>
      </GlassPanel>
    </div>
  );
}

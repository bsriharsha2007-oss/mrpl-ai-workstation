import { ApprovalBadge, Badge2, PriorityBadge } from "@/components/common/Badges";
import { GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type DataColumn } from "@/components/common/DataTable";
import { MetricCard } from "@/components/common/MetricCard";
import { EmptyState } from "@/components/common/States";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApprovals, useDecideApproval } from "@/hooks/use-queries";
import type { ApprovalItem } from "@/types";
import { formatDateTime, relativeTime } from "@/utils/format";
import { CheckCircle2, ClipboardCheck, Loader2, Undo2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** Approvals — the manager's decision queue. */
export default function ApprovalsPage() {
  const approvals = useApprovals("all");
  const decide = useDecideApproval();
  const [active, setActive] = useState<ApprovalItem | null>(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const list = approvals.data ?? [];
  const pending = list.filter((item) => item.status === "pending");
  const decided = list.filter((item) => item.status !== "pending");

  const decideRequest = async (item: ApprovalItem, decision: "approved" | "rejected") => {
    setBusy(true);
    await decide.mutateAsync({ id: item.id, decision });
    setBusy(false);
    setActive(null);
    setComment("");
    toast.success(
      decision === "approved"
        ? "Approved and routed to the next authority"
        : "Returned to the requester with your comments",
      { description: item.title },
    );
  };

  const columns: DataColumn<ApprovalItem>[] = [
    {
      key: "title",
      header: "Request",
      sortValue: (row) => row.title,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground">{row.title}</p>
          <p className="truncate text-[10px] text-muted-foreground">
            {row.category} · {row.requester} · {row.department}
          </p>
        </div>
      ),
    },
    { key: "priority", header: "Priority", render: (r) => <PriorityBadge priority={r.priority} /> },
    { key: "value", header: "Value / risk", hideBelow: "sm", render: (r) => <span className="text-[11px] text-muted-foreground">{r.value}</span> },
    { key: "status", header: "Status", render: (r) => <ApprovalBadge status={r.status} /> },
    {
      key: "submitted",
      header: "Submitted",
      hideBelow: "md",
      sortValue: (r) => new Date(r.submittedAt).getTime(),
      render: (r) => <span className="text-[11px] text-muted-foreground">{relativeTime(r.submittedAt)}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Approvals"
        description="Work permits, purchase requisitions, incident closures and procedure revisions awaiting your decision."
        crumbs={[{ label: "Oversight" }, { label: "Approvals" }]}
        actions={<Badge2 tone="warning">{pending.length} awaiting decision</Badge2>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Awaiting decision" value={pending.length} icon={<ClipboardCheck className="size-4" />} caption="Median response 3.2 h" />
        <MetricCard label="Critical priority" value={pending.filter((item) => item.priority === "critical").length} tone="danger" icon={<XCircle className="size-4" />} caption="Stop-work risk if delayed" />
        <MetricCard label="Approved this week" value={12} tone="success" icon={<CheckCircle2 className="size-4" />} caption="+4 versus last week" delta={4} intent="positive" />
        <MetricCard label="Returned for rework" value={3} tone="info" icon={<Undo2 className="size-4" />} caption="Boundary & barricading items" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <GlassPanel>
          <PanelHeading
            title="Pending queue"
            description="Ordered by submission — critical items first on the dashboard."
            icon={<ClipboardCheck className="size-4" />}
          />
          <div className="mt-4 space-y-2">
            {approvals.isLoading ? (
              <p className="py-6 text-center text-xs text-muted-foreground">Loading…</p>
            ) : pending.length === 0 ? (
              <EmptyState
                title="Queue is clear"
                description="New requests will appear here the moment they are routed to you."
              />
            ) : (
              pending.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(item)}
                  className="glass-inset w-full cursor-pointer rounded-lg p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">{item.title}</p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {item.category} · {item.requester} · {item.value}
                      </p>
                    </div>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[11px] leading-5 text-muted-foreground">
                    {item.summary}
                  </p>
                  <p className="mt-1.5 text-[10px] text-muted-foreground/80">
                    Submitted {relativeTime(item.submittedAt)} · tap to review
                  </p>
                </button>
              ))
            )}
          </div>
        </GlassPanel>

        <GlassPanel>
          <PanelHeading
            title="Decision history"
            description="Every decision is recorded in the immutable audit trail."
            icon={<CheckCircle2 className="size-4" />}
          />
          <div className="mt-4">
            <DataTable
              columns={columns}
              rows={decided}
              rowKey={(row) => row.id}
              isLoading={approvals.isLoading}
              pageSize={6}
              caption="Decision history"
            />
          </div>
        </GlassPanel>
      </div>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="glass-strong border-white/80 bg-white/90 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">{active?.title}</DialogTitle>
            <DialogDescription className="text-xs">
              {active ? `${active.category} · ${active.requester} · ${active.department} · ${formatDateTime(active.submittedAt)}` : ""}
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs leading-5 text-muted-foreground">{active?.summary}</p>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-foreground" htmlFor="decision-comment">
              Decision comments (attached to the audit trail)
            </label>
            <Textarea
              id="decision-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Conditions, verification steps or reasons for return…"
              className="min-h-[80px] border-white/70 bg-white/70 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="cursor-pointer border-white/70 bg-white/70"
              disabled={busy}
              onClick={() => active && void decideRequest(active, "rejected")}
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Undo2 className="size-3.5" />}
              Return
            </Button>
            <Button className="cursor-pointer" disabled={busy} onClick={() => active && void decideRequest(active, "approved")}>
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
              Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

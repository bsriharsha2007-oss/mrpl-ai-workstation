import { Badge2, StatusBadge } from "@/components/common/Badges";
import { GlassInset, GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type DataColumn } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole } from "@/hooks/use-role";
import { useGenerateReport, useReports } from "@/hooks/use-queries";
import type { ReportRecord } from "@/types";
import { formatDateTime, relativeTime } from "@/utils/format";
import {
  Download,
  FileBarChart2,
  FileText,
  FileSpreadsheet,
  FileType2,
  Loader2,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const REPORT_TYPES: ReportRecord["type"][] = [
  "Shift handover",
  "Inspection",
  "Compliance",
  "Maintenance",
  "Department KPI",
  "Enterprise audit",
];

interface GenerateForm {
  title: string;
  type: ReportRecord["type"];
  period: string;
}

/** Reports Workspace — generate, preview, approve and export refinery reports. */
export default function ReportsWorkspace() {
  const { profile } = useRole();
  const reports = useReports();
  const generate = useGenerateReport();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [template, setTemplate] = useState<ReportRecord["type"]>("Shift handover");
  const [previewPeriod, setPreviewPeriod] = useState("16 Sep 2026 · Shift A");

  const form = useForm<GenerateForm>({
    defaultValues: { title: "", type: "Shift handover", period: "Sep 2026" },
  });

  const list = reports.data ?? [];
  const active = list.find((report) => report.id === activeId) ?? list[0];

  const columns: DataColumn<ReportRecord>[] = [
    {
      key: "title",
      header: "Report",
      sortValue: (row) => row.title,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground">{row.title}</p>
          <p className="truncate text-[10px] text-muted-foreground">
            {row.type} · {row.period} · {row.pages} pages
          </p>
        </div>
      ),
    },
    { key: "owner", header: "Owner", hideBelow: "md", sortValue: (r) => r.owner, render: (r) => <span className="text-[11px] text-muted-foreground">{r.owner}</span> },
    { key: "dept", header: "Department", hideBelow: "lg", render: (r) => <span className="text-[11px] text-muted-foreground">{r.department}</span> },
    { key: "status", header: "Approval", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "generated",
      header: "Generated",
      hideBelow: "sm",
      sortValue: (r) => new Date(r.generatedAt).getTime(),
      render: (r) => <span className="text-[11px] text-muted-foreground">{relativeTime(r.generatedAt)}</span>,
    },
    {
      key: "formats",
      header: "Export",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {row.formats.map((format) => (
            <button
              key={format}
              type="button"
              title={`Download ${format}`}
              className="cursor-pointer rounded-md border border-white/70 bg-white/70 p-1.5 text-muted-foreground transition-colors hover:text-primary"
              onClick={(event) => {
                event.stopPropagation();
                toast.success(`${format} export queued`, { description: row.title });
              }}
            >
              {format === "XLSX" ? (
                <FileSpreadsheet className="size-3.5" />
              ) : format === "DOCX" ? (
                <FileType2 className="size-3.5" />
              ) : (
                <FileText className="size-3.5" />
              )}
            </button>
          ))}
        </div>
      ),
    },
  ];

  const submitGenerate = form.handleSubmit(async (values) => {
    const report = await generate.mutateAsync({
      title: values.title.trim() || `${values.type} — ${values.period}`,
      type: values.type,
      period: values.period,
      owner: profile.name,
      department: profile.department,
    });
    setActiveId(report.id);
    setOpen(false);
    form.reset();
    toast.success("Report generated", {
      description: `${report.title} is ready for review.`,
    });
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Reports Workspace"
        description="Generate shift handovers, inspection and compliance packs with AI drafting, route them for approval and export in PDF, Word or Excel."
        crumbs={[{ label: "Workspaces" }, { label: "Reports" }]}
        actions={
          <>
            <Badge2 tone="primary">{list.length} reports this cycle</Badge2>
            <Button size="sm" className="cursor-pointer gap-1.5" onClick={() => setOpen(true)}>
              <Plus className="size-3.5" />
              Generate report
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <GlassPanel className="space-y-4">
          <PanelHeading
            title="Report library"
            description="Full history with approval status."
            icon={<FileBarChart2 className="size-4" />}
          />
          <DataTable
            columns={columns}
            rows={list}
            rowKey={(row) => row.id}
            isLoading={reports.isLoading}
            onRowClick={(row) => setActiveId(row.id)}
            pageSize={6}
            caption="Report history"
          />
        </GlassPanel>

        <div className="space-y-4">
          {active ? (
            <GlassPanel>
              <PanelHeading
                title="Report preview"
                description={`${active.type} · ${active.period}`}
                icon={<FileText className="size-4" />}
                action={<StatusBadge status={active.status} />}
              />
              <div className="mt-4 space-y-3">
                <div className="glass-inset space-y-2 rounded-lg p-4">
                  <p className="text-xs font-semibold text-foreground">{active.title}</p>
                  <div className="space-y-1.5 pt-1">
                    {[
                      "Executive summary drafted from shift logs and AI session extracts",
                      "KPI table with targets, actuals and variance commentary",
                      "Safety and compliance section with statutory references",
                      "Open actions with owners and due dates",
                      "Approval block routed to the department manager",
                    ].map((section) => (
                      <div key={section} className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-primary/60" />
                        <span className="text-[11px] text-muted-foreground">{section}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <GlassInset>
                  <div className="flex items-center justify-between py-1 text-[11px]">
                    <span className="text-muted-foreground">Owner</span>
                    <span className="font-medium text-foreground">{active.owner}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 text-[11px]">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium text-foreground">{active.department}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 text-[11px]">
                    <span className="text-muted-foreground">Generated</span>
                    <span className="font-medium text-foreground">{formatDateTime(active.generatedAt)}</span>
                  </div>
                </GlassInset>
                <div className="flex flex-wrap gap-2">
                  {(["PDF", "DOCX", "XLSX"] as const).map((format) => (
                    <Button
                      key={format}
                      size="sm"
                      variant="outline"
                      className="cursor-pointer gap-1.5 border-white/70 bg-white/70"
                      onClick={() =>
                        toast.success(`${format} download started`, { description: active.title })
                      }
                    >
                      <Download className="size-3.5" />
                      {format}
                    </Button>
                  ))}
                </div>
              </div>
            </GlassPanel>
          ) : null}

          <GlassPanel>
            <PanelHeading
              title="Approval workflow"
              description="Draft → review → approved → published, with an immutable audit trail."
              icon={<FileBarChart2 className="size-4" />}
            />
            <ol className="mt-4 space-y-3">
              {[
                { step: "Draft", note: "Author edits AI-drafted content", tone: "info" as const },
                { step: "In review", note: "Department manager verifies figures", tone: "warning" as const },
                { step: "Approved", note: "Signed by the accountable manager", tone: "success" as const },
                { step: "Published", note: "Distributed and archived for retention", tone: "primary" as const },
              ].map((stage) => (
                <li key={stage.step} className="flex items-center gap-3">
                  <Badge2 tone={stage.tone}>{stage.step}</Badge2>
                  <span className="text-[11px] text-muted-foreground">{stage.note}</span>
                </li>
              ))}
            </ol>
          </GlassPanel>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-strong border-white/80 bg-white/90 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Generate a report</DialogTitle>
            <DialogDescription className="text-xs">
              The AI drafting agent pre-fills the structure from shift logs,
              inspections and KPI data. You review before submission.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-3" onSubmit={submitGenerate}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-foreground" htmlFor="report-title">
                Report title
              </label>
              <Input
                id="report-title"
                placeholder="e.g. Shift A handover — 16 Sep 2026"
                className="border-white/70 bg-white/70 text-xs"
                {...form.register("title", { required: true })}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-foreground">Type</label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(value) => {
                    const type = value as ReportRecord["type"];
                    form.setValue("type", type);
                    setTemplate(type);
                  }}
                >
                  <SelectTrigger className="border-white/70 bg-white/70 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-foreground">Period</label>
                <Input
                  className="border-white/70 bg-white/70 text-xs"
                  placeholder="Sep 2026"
                  {...form.register("period", { required: true })}
                />
              </div>
            </div>
            <GlassInset>
              <p className="text-[11px] leading-5 text-muted-foreground">
                Template <span className="font-medium text-foreground">{template}</span> will
                be drafted for {profile.department}, routed to you as owner, and retained
                under the 7-year statutory policy.
              </p>
            </GlassInset>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer border-white/70 bg-white/70"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer gap-2" disabled={generate.isPending}>
                {generate.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                Generate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="hidden" data-preview-period={previewPeriod} />
    </div>
  );
}

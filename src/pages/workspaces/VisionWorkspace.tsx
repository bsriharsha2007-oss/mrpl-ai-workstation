import { Badge2, MeterBar, StatusBadge } from "@/components/common/Badges";
import { DetailRow, GlassInset, GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, InlineLoader, LoadingState } from "@/components/common/States";
import { UploadArea } from "@/components/common/UploadArea";
import { RadialGauge } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRole } from "@/hooks/use-role";
import {
  useAnalyzeImage,
  useSendChatMessage,
  useVisionAnalyses,
} from "@/hooks/use-queries";
import { cn } from "@/lib/utils";
import type { VisionAnalysis } from "@/types";
import { relativeTime } from "@/utils/format";
import {
  Camera,
  ScanEye,
  Send,
  ShieldAlert,
  Sparkles,
  Thermometer,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/** Synthetic inspection frame with the detected bounding boxes overlaid. */
function InspectionFrame({ analysis }: { analysis: VisionAnalysis }) {
  return (
    <div className="glass-inset relative aspect-[16/10] w-full overflow-hidden rounded-xl">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 20% 10%, #dfe7ee 0%, #c7d2db 38%, #9aa8b5 100%)",
        }}
      />
      {/* stylised equipment silhouettes so boxes read against imagery */}
      <div className="absolute inset-x-[8%] bottom-[18%] h-[26%] rounded-md bg-slate-600/45" />
      <div className="absolute left-[22%] bottom-[40%] h-[24%] w-[16%] rounded-md bg-slate-700/50" />
      <div className="absolute right-[14%] bottom-[38%] h-[30%] w-[10%] rounded-t-full bg-slate-700/45" />
      <div className="absolute inset-x-[6%] top-[12%] h-[6%] rounded bg-slate-500/25 blur-sm" />

      {analysis.equipment.map((item) => (
        <div
          key={item.id}
          className={cn(
            "absolute rounded-md border-2 transition-all duration-300 hover:bg-white/10",
            item.condition === "defect"
              ? "border-red-500/90"
              : item.condition === "watch"
                ? "border-amber-500/90"
                : "border-emerald-500/90",
          )}
          style={{
            left: `${item.box.x}%`,
            top: `${item.box.y}%`,
            width: `${item.box.w}%`,
            height: `${item.box.h}%`,
          }}
        >
          <span
            className={cn(
              "absolute -top-5 left-0 flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold whitespace-nowrap text-white",
              item.condition === "defect"
                ? "bg-red-600/90"
                : item.condition === "watch"
                  ? "bg-amber-600/90"
                  : "bg-emerald-600/90",
            )}
          >
            {item.tag} · {Math.round(item.confidence * 100)}%
          </span>
        </div>
      ))}

      <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded bg-black/35 px-2 py-1 text-[10px] font-medium text-white">
        <Camera className="size-3" />
        {analysis.fileName}
      </div>
      <div className="absolute top-2 right-2 rounded bg-white/80 px-2 py-1 text-[10px] font-semibold text-slate-700">
        {analysis.modality}
      </div>
    </div>
  );
}

/** Vision Workspace — inspection imagery analysis, OCR and compliance scoring. */
export default function VisionWorkspace() {
  const { profile } = useRole();
  const analyses = useVisionAnalyses();
  const analyze = useAnalyzeImage();
  const ask = useSendChatMessage();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<{ id: string; q: string; a: string }[]>([]);

  const list = analyses.data ?? [];
  const active = list.find((item) => item.id === activeId) ?? list[0];

  useEffect(() => {
    if (!activeId && list.length > 0) setActiveId(list[0].id);
  }, [activeId, list]);

  const handleUpload = async (files: File[]) => {
    const file = files[0];
    const analysis = await analyze.mutateAsync({
      fileName: file?.name ?? "inspection_capture.jpg",
      uploadedBy: profile.name,
      modality: "Visual inspection",
    });
    setActiveId(analysis.id);
    toast.success("Image analysed inside the sovereign zone", {
      description: `${analysis.equipment.length} equipment objects detected · ${Math.round(
        analysis.confidence * 100,
      )}% confidence`,
    });
  };

  const handleQuestion = async () => {
    const trimmed = question.trim();
    if (!trimmed || !active) return;
    setQuestion("");
    const response = await ask.mutateAsync({
      prompt: `About inspection image ${active.fileName} (${active.assetTag}): ${trimmed}`,
      agent: "Vision Inspection Agent",
    });
    setAnswers((current) => [
      ...current,
      { id: response.message.id, q: trimmed, a: response.message.content },
    ]);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Vision Workspace"
        description="Upload inspection imagery, thermography, radiography or drone surveys. The vision agent detects equipment, reads nameplates, scores safety compliance and drafts the inspection summary."
        crumbs={[{ label: "AI Workspaces" }, { label: "Vision" }]}
        actions={
          <>
            <Badge2 tone="primary" icon={<ScanEye className="size-3" />}>
              {list.length} analyses this cycle
            </Badge2>
            <Badge2 tone="muted">On-premise inference · no image egress</Badge2>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <GlassPanel>
            <PanelHeading
              title="Upload inspection imagery"
              description="Drag and drop, browse, or capture directly from a field device."
              icon={<ScanEye className="size-4" />}
            />
            <div className="mt-4">
              <UploadArea
                enableCamera
                busy={analyze.isPending}
                onFiles={(files) => void handleUpload(files)}
                title="Drop inspection imagery here"
                description="Thermograms, radiographs, drone survey frames or field photographs. JPEG, PNG, TIFF, DICOM or RAW up to 80 MB."
              />
            </div>
          </GlassPanel>

          {active ? (
            <GlassPanel>
              <PanelHeading
                title="Inspection frame"
                description={`${active.assetTag} · ${active.asset} · uploaded by ${active.uploadedBy} ${relativeTime(active.uploadedAt)}`}
                icon={<Camera className="size-4" />}
                action={<StatusBadge status={active.status} />}
              />
              <div className="mt-4">
                <InspectionFrame analysis={active} />
              </div>

              <div className="mt-4">
                <GlassInset>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Inspection summary
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-foreground">
                    {active.summary}
                  </p>
                </GlassInset>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <RadialGauge
                  value={active.compliance}
                  label="Safety compliance"
                  caption="OISD visual inspection checklist"
                  tone={active.compliance >= 90 ? "success" : "warning"}
                />
                <RadialGauge
                  value={Math.round(active.confidence * 100)}
                  label="Model confidence"
                  caption="Detection + classification confidence"
                  tone="primary"
                />
                <RadialGauge
                  value={Math.round(
                    (active.equipment.filter((item) => item.condition === "normal").length /
                      Math.max(1, active.equipment.length)) *
                      100,
                  )}
                  label="Condition normal"
                  caption={`${active.equipment.length} objects detected`}
                  tone="info"
                />
              </div>
            </GlassPanel>
          ) : null}

          <GlassPanel>
            <PanelHeading
              title="Visual question answering"
              description="Ask the vision agent about the frame, defects and recommended actions."
              icon={<Sparkles className="size-4" />}
            />
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void handleQuestion();
                  }}
                  placeholder='e.g. "Is the hot spot consistent with lubrication starvation?"'
                  className="border-white/70 bg-white/70 text-xs"
                />
                <Button
                  size="icon"
                  className="cursor-pointer"
                  aria-label="Ask about this image"
                  disabled={!question.trim() || ask.isPending}
                  onClick={() => void handleQuestion()}
                >
                  <Send className="size-3.5" />
                </Button>
              </div>
              {ask.isPending ? <InlineLoader label="Vision agent analysing…" /> : null}
              {answers.length === 0 && !ask.isPending ? (
                <p className="text-[11px] text-muted-foreground">
                  Suggested: “Which defect carries the highest safety risk?”, “What
                  is the recommended inspection interval?”, “Read the nameplate
                  details.”
                </p>
              ) : null}
              <ul className="space-y-2">
                {answers.map((item) => (
                  <li key={item.id} className="glass-inset rounded-lg p-3">
                    <p className="text-[11px] font-semibold text-foreground">{item.q}</p>
                    <p className="mt-1 text-[11px] leading-5 whitespace-pre-wrap text-muted-foreground">
                      {item.a}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </GlassPanel>
        </div>

        <div className="space-y-4">
          <GlassPanel>
            <PanelHeading
              title="Detected equipment"
              description="Objects, tags and condition classification."
              icon={<ScanEye className="size-4" />}
            />
            {analyses.isLoading ? (
              <LoadingState minHeight={140} />
            ) : (
              <ul className="mt-4 space-y-2">
                {(active?.equipment ?? []).map((item) => (
                  <li key={item.id} className="glass-inset rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium text-foreground">
                          {item.label}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {item.tag}
                        </p>
                      </div>
                      <Badge2
                        tone={
                          item.condition === "defect"
                            ? "danger"
                            : item.condition === "watch"
                              ? "warning"
                              : "success"
                        }
                      >
                        {item.condition}
                      </Badge2>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <MeterBar
                        value={item.confidence * 100}
                        tone={item.confidence > 0.93 ? "success" : "warning"}
                        className="flex-1"
                      />
                      <span className="tabular text-[10px] text-muted-foreground">
                        {Math.round(item.confidence * 100)}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </GlassPanel>

          <GlassPanel>
            <PanelHeading
              title="Extracted text (OCR)"
              description="Nameplates, tags and labels read from the frame."
              icon={<Thermometer className="size-4" />}
            />
            <div className="mt-4">
              <GlassInset>
                {(active?.ocr ?? []).map((block) => (
                  <DetailRow
                    key={block.id}
                    label={block.region}
                    value={
                      <span className="space-x-2">
                        <span>{block.text}</span>
                        <span className="tabular text-[10px] text-muted-foreground">
                          {Math.round(block.confidence * 100)}%
                        </span>
                      </span>
                    }
                  />
                ))}
              </GlassInset>
            </div>
          </GlassPanel>

          <GlassPanel>
            <PanelHeading
              title="AI recommendations"
              description="Prescriptive actions for the responsible engineer."
              icon={<ShieldAlert className="size-4" />}
            />
            <ul className="mt-4 space-y-2">
              {(active?.recommendations ?? []).map((recommendation) => (
                <li
                  key={recommendation}
                  className="glass-inset flex gap-2 rounded-lg px-3 py-2 text-[11px] leading-5 text-foreground"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {recommendation}
                </li>
              ))}
            </ul>
          </GlassPanel>

          <GlassPanel>
            <PanelHeading
              title="Analysis history"
              description="Every frame this asset has been screened against."
            />
            <Tabs defaultValue="recent" className="mt-3">
              <TabsList className="bg-white/60">
                <TabsTrigger value="recent" className="text-[11px]">
                  Recent
                </TabsTrigger>
                <TabsTrigger value="flagged" className="text-[11px]">
                  Flagged
                </TabsTrigger>
              </TabsList>
              <TabsContent value="recent">
                <ul className="space-y-2 pt-2">
                  {list.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(item.id)}
                        className={cn(
                          "w-full cursor-pointer rounded-lg border p-2.5 text-left transition-colors",
                          item.id === active?.id
                            ? "border-teal-200/80 bg-teal-50/70"
                            : "border-transparent hover:bg-white/70",
                        )}
                      >
                        <p className="truncate text-[11px] font-medium text-foreground">
                          {item.fileName}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {item.assetTag} · {item.modality} ·{" "}
                          {relativeTime(item.uploadedAt)}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="flagged">
                <ul className="space-y-2 pt-2">
                  {list
                    .filter((item) => item.status === "flagged")
                    .map((item) => (
                      <li
                        key={item.id}
                        className="rounded-lg border border-red-200/70 bg-red-50/50 p-2.5"
                      >
                        <p className="truncate text-[11px] font-medium text-foreground">
                          {item.fileName}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.assetTag} · compliance {item.compliance}% · review
                          required
                        </p>
                      </li>
                    ))}
                  {list.filter((item) => item.status === "flagged").length === 0 ? (
                    <EmptyState
                      title="No flagged analyses"
                      description="Frames with compliance findings will be listed here."
                      className="mt-2"
                    />
                  ) : null}
                </ul>
              </TabsContent>
            </Tabs>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

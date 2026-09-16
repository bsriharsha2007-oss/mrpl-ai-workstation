import { cn } from "@/lib/utils";
import type { StatusBarInfo } from "@/types";
import { relativeTime } from "@/utils/format";
import {
  Activity,
  Cpu,
  Database,
  FileStack,
  Gauge,
  HardDrive,
  MapPin,
  Network,
  Server,
  ShieldCheck,
  Timer,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function Dot({ tone }: { tone: string }) {
  return <span className={cn("size-1.5 shrink-0 rounded-full", tone)} />;
}

/**
 * Persistent control-room footer: infrastructure and platform state in one
 * glance — models, GPU, databases, the knowledge corpus, identity and build.
 */
export function StatusBar({
  info,
  userName,
  version = "2.4.1",
}: {
  info?: StatusBarInfo;
  userName?: string;
  version?: string;
}) {
  const now = useClock();

  const items = [
    { icon: MapPin, label: info?.plant ?? "Katipalla Refinery" },
    { icon: Timer, label: info?.shift ?? "Shift A" },
    {
      node: (
        <span className="flex items-center gap-1.5">
          <Cpu className="size-3 text-emerald-600" />
          4 models · all serving
        </span>
      ),
    },
    {
      node: (
        <span className="flex items-center gap-1.5">
          <Gauge className="size-3 text-emerald-600" />
          GPU 62% · 41 GB
        </span>
      ),
    },
    {
      node: (
        <span className="flex items-center gap-1.5">
          <Server className="size-3 text-emerald-600" />
          Inference p95 {info?.latencyMs ?? 640} ms
        </span>
      ),
    },
    {
      node: (
        <span className="flex items-center gap-1.5">
          <Database className="size-3 text-emerald-600" />
          DB healthy
        </span>
      ),
    },
    {
      node: (
        <span className="flex items-center gap-1.5">
          <Network className="size-3 text-emerald-600" />
          Vector store online
        </span>
      ),
    },
    {
      node: (
        <span className="flex items-center gap-1.5">
          <FileStack className="size-3 text-teal-600" />
          1.28 M chunks indexed
        </span>
      ),
    },
    {
      node: (
        <span className="flex items-center gap-1.5">
          <Activity className="size-3 text-sky-600" />
          {info?.environment ?? "Sovereign on-premise"}
        </span>
      ),
    },
  ];

  return (
    <footer className="glass-strong fixed inset-x-0 bottom-0 z-30 border-t border-white/70">
      <div className="flex h-8 items-center gap-3 overflow-x-auto px-3 text-[11px] sm:px-5">
        {items.map((item, index) => (
          <span
            key={index}
            className="flex shrink-0 items-center gap-1.5 text-muted-foreground"
          >
            {item.node ?? (
              <>
                <item.icon className="size-3 text-slate-400" />
                {item.label}
              </>
            )}
          </span>
        ))}
        <span className="tabular ml-auto flex shrink-0 items-center gap-1.5 text-muted-foreground">
          <Dot tone="bg-emerald-500" />
          <UserRound className="size-3" />
          {userName ?? "operator"}
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 text-muted-foreground/70 md:flex">
          v{version}
        </span>
        <span className="tabular hidden shrink-0 items-center gap-1.5 text-muted-foreground sm:flex">
          <Dot tone="animate-pulse bg-emerald-500" />
          {now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}{" "}
          IST
        </span>
      </div>
    </footer>
  );
}

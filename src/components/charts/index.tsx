/**
 * Chart kit — Recharts wrappers styled for the light glass theme.
 *
 * Emerald / amber / slate / teal / indigo / rose are the sanctioned series
 * colours; no neon gradients, no glow, quiet grids so trend reading stays easy
 * on a control-room display.
 */

import { GlassInset } from "@/components/common/GlassPanel";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/types";

export const CHART_COLORS = [
  "#10b981",
  "#f59e0b",
  "#64748b",
  "#14b8a6",
  "#6366f1",
  "#f43f5e",
] as const;

const AXIS = {
  stroke: "#94a3b8",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

const GRID_STROKE = "rgba(148, 163, 184, 0.24)";

export interface SeriesConfig {
  key: string;
  label: string;
  color: string;
  /** Render as a dashed reference line (targets / benchmarks). */
  dashed?: boolean;
}

interface TooltipPayloadItem {
  name?: string | number;
  value?: string | number;
  color?: string;
  dataKey?: string | number;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  valueSuffix?: string;
}

function GlassTooltip({ active, payload, label, valueSuffix }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs">
      {label !== undefined ? (
        <p className="mb-1 font-semibold text-foreground">{label}</p>
      ) : null}
      <ul className="space-y-0.5">
        {payload.map((item, index) => (
          <li
            key={`${item.dataKey ?? index}`}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="size-1.5 rounded-full"
                style={{ background: item.color }}
              />
              {item.name}
            </span>
            <span className="tabular font-medium text-foreground">
              {typeof item.value === "number"
                ? item.value.toLocaleString("en-IN")
                : item.value}
              {valueSuffix}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartFrame({
  children,
  height,
  isLoading,
}: {
  children: React.ReactNode;
  height: number;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
        style={{ height }}
      >
        <Loader2 className="size-3.5 animate-spin" />
        Loading trend…
      </div>
    );
  }
  return (
    <div style={{ height }} className="w-full">
      {children}
    </div>
  );
}

/** Gradient area trend with optional dashed target series. */
export function AreaTrendChart({
  data,
  series,
  xKey = "label",
  height = 240,
  valueSuffix = "",
  isLoading,
  stacked = false,
}: {
  data: TrendPoint[];
  series: SeriesConfig[];
  xKey?: string;
  height?: number;
  valueSuffix?: string;
  isLoading?: boolean;
  stacked?: boolean;
}) {
  return (
    <ChartFrame height={height} isLoading={isLoading}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            {series.map((item) => (
              <linearGradient
                key={item.key}
                id={`area-${item.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={item.color} stopOpacity={0.32} />
                <stop offset="100%" stopColor={item.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 4" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey={xKey} {...AXIS} interval="preserveStartEnd" />
          <YAxis {...AXIS} width={46} />
          <Tooltip
            content={<GlassTooltip valueSuffix={valueSuffix} />}
            cursor={{ stroke: "rgba(148,163,184,0.4)", strokeDasharray: "4 4" }}
          />
          {series.map((item) => (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={item.color}
              strokeWidth={2}
              strokeDasharray={item.dashed ? "5 5" : undefined}
              fill={item.dashed ? "transparent" : `url(#area-${item.key})`}
              stackId={stacked ? "1" : undefined}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/** Multi-series line trend for month-over-month comparisons. */
export function LineTrendChart({
  data,
  series,
  xKey = "label",
  height = 240,
  valueSuffix = "",
  isLoading,
}: {
  data: TrendPoint[];
  series: SeriesConfig[];
  xKey?: string;
  height?: number;
  valueSuffix?: string;
  isLoading?: boolean;
}) {
  return (
    <ChartFrame height={height} isLoading={isLoading}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 4" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey={xKey} {...AXIS} />
          <YAxis {...AXIS} width={46} />
          <Tooltip content={<GlassTooltip valueSuffix={valueSuffix} />} />
          <Legend
            verticalAlign="top"
            height={28}
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
          {series.map((item) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={item.color}
              strokeWidth={2}
              strokeDasharray={item.dashed ? "5 5" : undefined}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/** Grouped or stacked bars for workload, throughput and usage. */
export function BarSeriesChart({
  data,
  series,
  xKey = "label",
  height = 240,
  valueSuffix = "",
  isLoading,
  layout = "grouped",
}: {
  data: TrendPoint[] | Record<string, string | number>[];
  series: SeriesConfig[];
  xKey?: string;
  height?: number;
  valueSuffix?: string;
  isLoading?: boolean;
  layout?: "grouped" | "stacked";
}) {
  return (
    <ChartFrame height={height} isLoading={isLoading}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data as TrendPoint[]}
          margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
          barCategoryGap={layout === "stacked" ? "28%" : "22%"}
        >
          <CartesianGrid strokeDasharray="3 4" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey={xKey} {...AXIS} />
          <YAxis {...AXIS} width={46} />
          <Tooltip
            content={<GlassTooltip valueSuffix={valueSuffix} />}
            cursor={{ fill: "rgba(148,163,184,0.12)" }}
          />
          {series.map((item) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              name={item.label}
              fill={item.color}
              radius={[4, 4, 0, 0]}
              stackId={layout === "stacked" ? "1" : undefined}
              maxBarSize={38}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export interface DonutDatum {
  name: string;
  value: number;
  color: string;
}

/** Donut with a centred total, used for defect mix and agent usage split. */
export function DonutChart({
  data,
  height = 240,
  centerLabel,
  centerValue,
  isLoading,
}: {
  data: DonutDatum[];
  height?: number;
  centerLabel?: string;
  centerValue?: string;
  isLoading?: boolean;
}) {
  return (
    <ChartFrame height={height} isLoading={isLoading}>
      <div className="relative h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2}
              stroke="rgba(255,255,255,0.85)"
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<GlassTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {centerValue ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold text-foreground">{centerValue}</span>
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {centerLabel}
            </span>
          </div>
        ) : null}
      </div>
    </ChartFrame>
  );
}

/** Compact inline trend used inside metric cards and dense table rows. */
export function Sparkline({
  data,
  tone = "primary",
  height = 40,
}: {
  data: number[];
  tone?: "primary" | "success" | "warning" | "danger" | "info";
  height?: number;
}) {
  const color =
    tone === "success"
      ? "#10b981"
      : tone === "warning"
        ? "#f59e0b"
        : tone === "danger"
          ? "#f43f5e"
          : tone === "info"
            ? "#0284c7"
            : "#0f766e";

  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${tone}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.8}
          fill={`url(#spark-${tone})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Coverage heatmap for inspection / compliance matrices. */
export function HeatmapGrid({
  rows,
  isLoading,
  threshold = 80,
}: {
  rows: { area: string; values: number[] }[];
  isLoading?: boolean;
  threshold?: number;
}) {
  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        Loading coverage matrix…
      </div>
    );
  }

  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  return (
    <div className="thin-scroll overflow-x-auto">
      <div className="min-w-[520px]">
        <div className="mb-1 grid grid-cols-[92px_repeat(12,minmax(0,1fr))] gap-1 text-[10px] text-muted-foreground">
          <span />
          {months.map((month, index) => (
            <span key={`${month}-${index}`} className="text-center">
              {month}
            </span>
          ))}
        </div>
        {rows.map((row) => (
          <div
            key={row.area}
            className="grid grid-cols-[92px_repeat(12,minmax(0,1fr))] items-center gap-1 py-0.5"
          >
            <span className="truncate pr-2 text-xs text-muted-foreground">
              {row.area}
            </span>
            {row.values.map((value, index) => (
              <span
                key={`${row.area}-${index}`}
                title={`${row.area} · month ${index + 1} · ${value}%`}
                className="h-6 rounded-[4px] border border-white/60 transition-transform hover:scale-[1.06]"
                style={{
                  background:
                    value >= threshold
                      ? `rgba(15, 118, 110, ${0.14 + (value - threshold) / 160})`
                      : `rgba(217, 119, 6, ${0.12 + (threshold - value) / 140})`,
                }}
              />
            ))}
          </div>
        ))}
        <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-primary/60" /> ≥ {threshold}% covered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-amber-500/60" /> below target
          </span>
        </div>
      </div>
    </div>
  );
}

/** Radial gauge for utilisation / health values. */
export function RadialGauge({
  value,
  label,
  caption,
  tone = "primary",
  className,
}: {
  value: number;
  label: string;
  caption?: string;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
  className?: string;
}) {
  const color =
    tone === "danger"
      ? "#dc2626"
      : tone === "warning"
        ? "#f59e0b"
        : tone === "success"
          ? "#16a34a"
          : tone === "info"
            ? "#0284c7"
            : "#0f766e";
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  return (
    <GlassInset className={cn("flex items-center gap-4", className)}>
      <svg viewBox="0 0 80 80" className="size-20 shrink-0 -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,0.22)"
          strokeWidth="8"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="min-w-0">
        <p className="tabular text-lg font-semibold text-foreground">{clamped}%</p>
        <p className="text-xs font-medium text-foreground">{label}</p>
        {caption ? (
          <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{caption}</p>
        ) : null}
      </div>
    </GlassInset>
  );
}

import { Badge2 } from "@/components/common/Badges";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Boxes,
  Brain,
  CheckCircle2,
  Database,
  FileStack,
  Gauge,
  KeyRound,
  LayoutDashboard,
  Lock,
  MessagesSquare,
  ScanEye,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

const heroStats = [
  { label: "AI agents online", value: "12", icon: Bot },
  { label: "Documents indexed", value: "48.2K", icon: FileStack },
  { label: "Inspections analyzed", value: "1,284", icon: ScanEye },
  { label: "Platform uptime", value: "99.98%", icon: Gauge },
];

const capabilities = [
  {
    title: "AI Chat Workspace",
    body: "Converse with refinery-aware agents over SOPs, P&IDs, telemetry and maintenance records with citation-backed answers.",
    icon: MessagesSquare,
    to: "/workstation",
  },
  {
    title: "Vision Analysis",
    body: "Inspect equipment imagery for corrosion, leaks and safety compliance with OCR, bounding boxes and severity scoring.",
    icon: ScanEye,
    to: "/vision",
  },
  {
    title: "Document Intelligence",
    body: "Summarize manuals, extract metadata and compare SOP revisions across the full engineering document vault.",
    icon: FileStack,
    to: "/documents",
  },
  {
    title: "Knowledge Search",
    body: "Semantic search across the enterprise knowledge base with source attribution, bookmarks and saved queries.",
    icon: Brain,
    to: "/knowledge",
  },
  {
    title: "Reports Studio",
    body: "Generate, review and export inspection, safety and maintenance reports as PDF, DOCX or Excel deliverables.",
    icon: BarChart3,
    to: "/reports",
  },
  {
    title: "Enterprise Control",
    body: "Role-based dashboards, approvals, audit trails, GPU fleet monitoring and model governance for administrators.",
    icon: ShieldCheck,
    to: "/dashboard",
  },
];

const agentTabs = [
  {
    id: "sop",
    label: "SOP Analysis",
    icon: BookOpen,
    headline: "Every SOP, searchable and quotable",
    body: "Ask about a procedure and the workstation answers from the current controlled revision — citing section, revision code and the responsible discipline.",
    points: [
      "Answers cite SOP-TT-0942 Rev 07 rather than training data",
      "Superseded revisions are flagged before they mislead",
      "Clauses can be attached to a maintenance task in one click",
    ],
  },
  {
    id: "vision",
    label: "Vision Inspection",
    icon: ScanEye,
    headline: "Eyes on the asset, 24×7",
    body: "Upload an inspection photo from the CDU or Piperack — the vision agent detects equipment, reads nameplates and scores severity against the inspection standard.",
    points: [
      "Equipment and corrosion classification with confidence scores",
      "OCR of nameplates, gauges and gauge-glass readings",
      "Findings routed into the inspection register automatically",
    ],
  },
  {
    id: "reports",
    label: "Report Studio",
    icon: BarChart3,
    headline: "Shift reports that write themselves",
    body: "Generate daily, weekly and compliance reports from live operations data, with approval trails before anything leaves the department.",
    points: [
      "PDF, DOCX and Excel exports in the plant template",
      "Approval routing to the shift manager before release",
      "Full history with revision comparison",
    ],
  },
];

const trustRows = [
  { icon: Lock, label: "Role-based access control" },
  { icon: Database, label: "Vector knowledge retrieval" },
  { icon: Server, label: "On-premise GPU inference" },
  { icon: ShieldCheck, label: "Immutable audit logging" },
];

const metrics = [
  { icon: Activity, label: "Avg. AI response", value: "1.4s" },
  { icon: CheckCircle2, label: "Answer accuracy", value: "96.2%" },
  { icon: Timer, label: "Inference nodes busy", value: "8 / 10" },
  { icon: TrendingUp, label: "Audit events / day", value: "3,120" },
];

const deploymentRows = [
  { label: "Refineries covered", value: "3" },
  { label: "Processing units", value: "28" },
  { label: "Connected sensors", value: "12,400" },
  { label: "Engineering drawings", value: "9,150" },
];

function MrplMark({ className }: { className?: string }) {
  return (
    <img
      src="/mrpl-mark.svg"
      alt="MRPL"
      className={cn("shrink-0 rounded-xl", className)}
    />
  );
}

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState(agentTabs[0]!.id);

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      {/* Ambient light blooms — quiet, no dark glass */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-20 left-[6%] h-64 w-64 rounded-full bg-teal-300/25 blur-3xl" />
        <div className="absolute top-[430px] right-[5%] h-72 w-72 rounded-full bg-amber-200/20 blur-3xl" />
      </div>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link to="/" className="flex cursor-pointer items-center gap-3">
          <MrplMark className="size-10" />
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-foreground">MRPL</p>
            <p className="text-[11px] text-muted-foreground">
              Sovereign AI Workstation
            </p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <a className="cursor-pointer transition-colors hover:text-foreground" href="#capabilities">
            Capabilities
          </a>
          <a className="cursor-pointer transition-colors hover:text-foreground" href="#platform">
            Platform
          </a>
          <a className="cursor-pointer transition-colors hover:text-foreground" href="#trust">
            Trust
          </a>
        </nav>
        <Link
          to={isAuthenticated ? "/dashboard" : "/auth"}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5"
        >
          {isAuthenticated ? "Open dashboard" : "Sign in"}
          <ArrowRight className="size-3.5" />
        </Link>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="pt-14 pb-16 text-center sm:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl"
          >
            <Badge2 tone="primary" icon={<Sparkles className="size-3" />}>
              Sovereign enterprise AI · deployed on-premise
            </Badge2>
            <h1 className="mt-6 text-4xl leading-tight font-extrabold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
              The AI control room for{" "}
              <span className="text-primary">Mangalore Refinery</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              One governed workstation where refinery engineers, operators,
              managers and administrators analyze documents, drawings,
              inspection imagery, telemetry and knowledge repositories with
              purpose-built AI agents.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={isAuthenticated ? "/dashboard" : "/auth"}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5"
              >
                {isAuthenticated ? "Enter the workstation" : "Sign in to the workstation"}
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#capabilities"
                className="glass inline-flex cursor-pointer items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-foreground transition-transform duration-200 hover:-translate-y-0.5"
              >
                Explore capabilities
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Mangalore Refinery and Petrochemicals Limited · enterprise deployment
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {heroStats.map((stat) => (
              <div key={stat.label} className="glass glass-edge rounded-2xl p-4 text-left">
                <stat.icon className="size-4 text-primary" />
                <p className="tabular mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── Capabilities ───────────────────────────────────────────────── */}
        <section id="capabilities" className="scroll-mt-20 py-12">
          <div className="max-w-2xl">
            <Badge2 tone="success">Capabilities</Badge2>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
              Every refinery AI workflow, one workstation
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Purpose-built workspaces for documents, vision, knowledge and
              reporting — connected by a shared agent runtime and enterprise
              governance layer.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link
                  to={card.to}
                  className="glass glass-edge group block h-full cursor-pointer rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <card.icon className="size-5 text-primary" />
                    <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Agent tabs ─────────────────────────────────────────────────── */}
        <section className="py-12">
          <div className="glass glass-edge rounded-3xl p-5 sm:p-8">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="h-auto flex-wrap justify-start gap-1 bg-white/50">
                {agentTabs.map((entry) => (
                  <TabsTrigger
                    key={entry.id}
                    value={entry.id}
                    className="cursor-pointer gap-1.5 text-xs data-[state=active]:bg-white data-[state=active]:text-primary"
                  >
                    <entry.icon className="size-3.5" />
                    {entry.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <AnimatePresence mode="wait">
                {agentTabs.map((entry) => (
                  <TabsContent key={entry.id} value={entry.id} className="mt-6">
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.28 }}
                      className="grid gap-8 lg:grid-cols-2 lg:items-center"
                    >
                      <div>
                        <h3 className="text-2xl font-bold tracking-tight text-foreground">
                          {entry.headline}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          {entry.body}
                        </p>
                        <ul className="mt-5 space-y-2.5">
                          {entry.points.map((point) => (
                            <li
                              key={point}
                              className="flex items-start gap-2.5 text-sm text-foreground"
                            >
                              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="glass-inset rounded-2xl p-5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          <Bot className="size-3.5 text-primary" />
                          Agent snapshot
                        </div>
                        <div className="mt-4 space-y-3">
                          {metrics.map((metric) => (
                            <div
                              key={metric.label}
                              className="flex items-center justify-between border-b border-black/5 pb-2 text-sm last:border-0 last:pb-0"
                            >
                              <span className="flex items-center gap-2 text-muted-foreground">
                                <metric.icon className="size-3.5" />
                                {metric.label}
                              </span>
                              <span className="tabular font-semibold text-foreground">
                                {metric.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>
                ))}
              </AnimatePresence>
            </Tabs>
          </div>
        </section>

        {/* ── Platform / trust ───────────────────────────────────────────── */}
        <section id="platform" className="scroll-mt-20 py-12">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
            <div className="glass glass-edge rounded-3xl p-6 sm:p-8">
              <Badge2 tone="warning">Platform</Badge2>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                Built like refinery infrastructure
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                The workstation mirrors the discipline of a control room:
                deterministic answers with source attribution, approval trails
                before anything leaves the department, and continuous health
                monitoring across the agent fleet.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="glass-inset flex items-center gap-3 rounded-xl px-4 py-3"
                  >
                    <metric.icon className="size-4 text-primary" />
                    <div>
                      <p className="tabular text-sm font-semibold text-foreground">
                        {metric.value}
                      </p>
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass glass-edge rounded-3xl p-6 sm:p-8">
              <Badge2 tone="info">Deployment</Badge2>
              <h3 className="mt-3 text-xl font-bold tracking-tight text-foreground">
                Sovereign footprint
              </h3>
              <div className="mt-4 space-y-3">
                {deploymentRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between border-b border-black/5 pb-2 text-sm last:border-0 last:pb-0"
                  >
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="tabular font-semibold text-foreground">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="glass-inset mt-5 rounded-xl p-3.5">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  All inference runs on MRPL-managed GPU nodes inside the
                  refinery network. No plant data leaves the perimeter.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="trust" className="scroll-mt-20 py-12">
          <div className="grid gap-4 md:grid-cols-2">
            {trustRows.map((row) => (
              <div
                key={row.label}
                className="glass glass-edge flex items-center gap-4 rounded-2xl p-5"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/70">
                  <row.icon className="size-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">{row.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────────────────────────── */}
        <section className="py-12">
          <div className="glass glass-edge glow relative overflow-hidden rounded-3xl p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute -top-20 left-1/2 h-52 w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Ready to operate with sovereign AI?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Sign in with your MRPL identity and pick your workstation role.
              Employees, managers and administrators each get a purpose-built
              control room.
            </p>
            <div className="mt-7">
              <Link
                to={isAuthenticated ? "/dashboard" : "/auth"}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5"
              >
                {isAuthenticated ? "Open your dashboard" : "Sign in to the workstation"}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-xs text-muted-foreground sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <MrplMark className="size-6" />
            <span>© 2026 Mangalore Refinery and Petrochemicals Limited</span>
          </div>
          <span>Sovereign Enterprise AI Workstation · v2.4.1</span>
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-muted-foreground/80 sm:hidden">
          <Search className="size-3" />
          <span>Global search · Ctrl K</span>
          <KeyRound className="size-3" />
          <span>SSO + MFA</span>
          <Boxes className="size-3" />
          <span>12 agents</span>
          <Users className="size-3" />
          <span>1,180 operators</span>
        </div>
      </footer>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LANDING, ROLE_ENTRY_LABELS, useSessionStore } from "@/store/session-store";
import type { Role } from "@/types";
import {
  ArrowRight,
  Bot,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Suspense, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

interface AuthProps {
  redirectAfterAuth?: string;
}

const ROLE_OPTIONS: { role: Role; icon: typeof Bot; blurb: string }[] = [
  {
    role: "employee",
    icon: UserRound,
    blurb: "Shift tasks, inspections, documents and grounded AI answers",
  },
  {
    role: "manager",
    icon: Building2,
    blurb: "Approvals, department KPIs, planning and team workload",
  },
  {
    role: "admin",
    icon: ShieldCheck,
    blurb: "Users, agents, models, audit logs and platform health",
  },
];

/** "firstname.lastname@mrpl.co.in" → "Firstname Lastname". */
function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function MrplAuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-canvas relative flex min-h-screen flex-col">
      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:px-8">
        {/* Brand / narrative panel */}
        <section className="hidden lg:block">
          <div className="flex items-center gap-3">
            <img src="/mrpl-mark.svg" alt="MRPL" className="size-11 rounded-xl" />
            <div className="leading-4">
              <p className="text-sm font-bold tracking-tight text-foreground">MRPL</p>
              <p className="text-[11px] text-muted-foreground">
                Sovereign Enterprise AI Workstation
              </p>
            </div>
          </div>

          <h1 className="mt-10 text-4xl font-extrabold leading-tight tracking-tight text-foreground">
            Welcome to the refinery&apos;s
            <span className="text-primary"> intelligent control room</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            Analyse documents, drawings, inspection imagery and plant knowledge with
            sovereign enterprise AI — for engineers, operators, managers and
            administrators of Mangalore Refinery and Petrochemicals Limited.
          </p>

          <div className="mt-8 space-y-2.5">
            {[
              { label: "Sovereign on-premise AI — zero data egress" },
              { label: "Role-based dashboards with full audit trail" },
              { label: "Vision, documents, knowledge and reporting in one console" },
            ].map((item) => (
              <div key={item.label} className="glass-inset flex items-center gap-2.5 rounded-lg px-3.5 py-2.5">
                <ShieldCheck className="size-4 shrink-0 text-primary" />
                <span className="text-xs text-foreground">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-2 text-[11px] text-muted-foreground">
            <Lock className="size-3" />
            Katipalla Refinery · Mangaluru 575030 · authorised personnel only
          </div>
        </section>

        {/* Sign-in panel */}
        <section className="mx-auto w-full max-w-md">{children}</section>
      </div>
    </div>
  );
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { signIn } = useAuth();
  const startSession = useSessionStore((state) => state.startSession);
  const session = useSessionStore((state) => state.session);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  const [step, setStep] = useState<"signIn" | "otp" | "role">("signIn");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Post-auth destination: the requested page, then the role's dashboard. */
  const destinationFor = (role: Role) => {
    if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) return returnTo;
    if (redirectAfterAuth && redirectAfterAuth !== "/dashboard") {
      return redirectAfterAuth;
    }
    return ROLE_LANDING[role];
  };

  /** Enter the workstation under a role — persists the mock session first. */
  const enterWorkstation = async (role: Role, provider: "email-otp" | "anonymous") => {
    startSession({
      email: email || "operator@mrpl.co.in",
      name: email ? nameFromEmail(email) : undefined,
      role,
      provider,
      remember,
      signedInAt: new Date().toISOString(),
    });
    toast.success("Signed in", {
      description: `Redirecting to your ${ROLE_ENTRY_LABELS[role]} dashboard…`,
    });
    navigate(destinationFor(role), { replace: true });
  };

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      const typedEmail = String(formData.get("email") ?? "");
      setEmail(typedEmail);
      await signIn("email-otp", formData);
      setStep("otp");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send the verification code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep("role");
    } catch {
      setError("The verification code is incorrect or has expired.");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setEmail("operator@mrpl.co.in");
      await signIn("anonymous");
      setStep("role");
    } catch (err) {
      setError(
        `Failed to start a demo session: ${
          err instanceof Error ? err.message : "unknown error"
        }`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Already signed in (identity + session): go straight to the destination.
  if (session) {
    const role = session.role;
    return (
      <MrplAuthShell>
        <div className="glass-strong glass-edge rounded-2xl p-6 text-center sm:p-8">
          <Bot className="mx-auto size-6 text-primary" />
          <h2 className="mt-3 text-lg font-bold tracking-tight text-foreground">
            You are signed in
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {session.name ? `${session.name} · ` : ""}
            {ROLE_ENTRY_LABELS[role]} session active.
          </p>
          <Button
            className="mt-5 h-10 w-full cursor-pointer gap-2"
            onClick={() => navigate(destinationFor(role), { replace: true })}
          >
            Open your dashboard
            <ArrowRight className="size-4" />
          </Button>
          <button
            type="button"
            className="mt-3 w-full cursor-pointer text-[11px] text-muted-foreground hover:text-foreground"
            onClick={() => {
              setStep("signIn");
              setOtp("");
            }}
          >
            Use a different account
          </button>
        </div>
      </MrplAuthShell>
    );
  }

  return (
    <MrplAuthShell>
      <div className="glass-strong glass-edge rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 lg:hidden">
          <img src="/mrpl-mark.svg" alt="MRPL" className="size-10 rounded-xl" />
          <div className="leading-4">
            <p className="text-sm font-bold tracking-tight text-foreground">MRPL</p>
            <p className="text-[10px] text-muted-foreground">Sovereign AI Workstation</p>
          </div>
        </div>

        {step === "signIn" ? (
          <>
            <div className="mt-6 lg:mt-0">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Sign in to the workstation
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Use your MRPL email — we&apos;ll send a secure verification code.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-[11px] font-medium text-foreground">
                  Work email or username
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="username"
                    placeholder="firstname.lastname@mrpl.co.in"
                    className="h-10 border-white/70 bg-white/70 pl-9"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[11px] font-medium text-foreground">
                    Password
                  </label>
                  <button
                    type="button"
                    className="cursor-pointer text-[11px] font-medium text-primary hover:underline"
                    onClick={() =>
                      toast.info("Password reset", {
                        description:
                          "Contact the MRPL service desk (ext. 4357) — password resets are handled by the enterprise directory.",
                      })
                    }
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Your network password"
                    className="h-10 border-white/70 bg-white/70 pr-10 pl-9"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="text-[10px] leading-4 text-muted-foreground/80">
                  Corporate SSO verifies your password; the code below completes
                  multi-factor authentication.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-[11px] text-foreground">
                <Checkbox checked={remember} onCheckedChange={(value) => setRemember(value === true)} />
                Remember this workstation for 30 days
              </label>

              {error ? <p className="text-xs text-red-600">{error}</p> : null}

              <Button type="submit" className="h-10 w-full cursor-pointer gap-2" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending verification code…
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/70" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-transparent px-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-10 w-full cursor-pointer gap-2 border-white/70 bg-white/70"
              onClick={handleGuestLogin}
              disabled={isLoading}
            >
              <Eye className="size-4 text-primary" />
              Explore with a demo session
            </Button>

            <p className="mt-6 border-t border-border/60 pt-4 text-center text-[10px] leading-4 text-muted-foreground">
              This is a restricted MRPL information system. Activity is monitored and
              recorded. Unauthorised access is prohibited under company policy and
              applicable law.
            </p>
          </>
        ) : step === "otp" ? (
          <>
            <div className="mt-6 lg:mt-0">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Enter your verification code
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="mt-6 space-y-5">
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="code" value={otp} />

              <div className="flex justify-center">
                <InputOTP
                  value={otp}
                  onChange={setOtp}
                  maxLength={6}
                  disabled={isLoading}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && otp.length === 6 && !isLoading) {
                      (event.target as HTMLElement).closest("form")?.requestSubmit();
                    }
                  }}
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {error ? (
                <p className="text-center text-xs text-red-600">{error}</p>
              ) : null}

              <Button
                type="submit"
                className="h-10 w-full cursor-pointer gap-2"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    Verify &amp; continue
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => {
                    setStep("signIn");
                    setOtp("");
                  }}
                >
                  Use a different email
                </button>
                <button
                  type="button"
                  className="cursor-pointer font-medium text-primary hover:underline"
                  onClick={() => toast.info("Code re-sent", { description: email })}
                >
                  Didn&apos;t receive it? Resend
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="mt-6 lg:mt-0">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Select your workstation role
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Verified against the directory — you&apos;ll land on the matching
                dashboard. Until role APIs connect, this choice drives your session.
              </p>
            </div>

            <div className="mt-5 space-y-2.5">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.role}
                  type="button"
                  className="glass-inset flex w-full cursor-pointer items-start gap-3 rounded-xl p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40"
                  onClick={() => void enterWorkstation(option.role, "email-otp")}
                >
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <option.icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-foreground">
                      {ROLE_ENTRY_LABELS[option.role]}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
                      {option.blurb}
                    </span>
                  </span>
                  <ArrowRight className="mt-2 size-4 shrink-0 text-slate-300" />
                </button>
              ))}
            </div>

            <p className="mt-5 border-t border-border/60 pt-4 text-center text-[10px] leading-4 text-muted-foreground">
              Signed in as <span className="font-medium">{email}</span>
              {remember ? " · this workstation stays trusted for 30 days." : "."}
            </p>
          </>
        )}
      </div>
    </MrplAuthShell>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense
      fallback={
        <div className="app-canvas flex min-h-screen items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      }
    >
      <Auth {...props} />
    </Suspense>
  );
}

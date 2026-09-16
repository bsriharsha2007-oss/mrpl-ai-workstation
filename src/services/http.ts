/**
 * Central HTTP client for the MRPL Sovereign Enterprise AI Workstation.
 *
 * The backend is being delivered by a separate team. Until live endpoints are
 * available, every service function resolves from `src/services/mock`. Setting
 * `VITE_API_BASE_URL` switches the workstation to the live gateway without any
 * UI changes because all callers go through the typed service layer.
 *
 * Implemented on top of `fetch` (NOT axios): axios's dependency chain bundles
 * Node-only proxy agents (`https-proxy-agent` / `agent-base`) that crash in the
 * browser runtime with "Class extends value undefined is not a constructor".
 */

const env =
  (import.meta as unknown as { env?: Record<string, string | undefined> })
    .env ?? {};

export const API_BASE_URL = env.VITE_API_BASE_URL ?? "/api";

/** True while the workstation runs on the built-in mock dataset. */
export const USE_MOCK = !env.VITE_API_BASE_URL;

/** Structured clone with a JSON fallback for older runtimes. */
export function structuredCloneSafe<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Core request helper — typed JSON over fetch, with bearer-token injection. */
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("X-Workstation", "mrpl-sovereign-v1");
  const token = window.localStorage.getItem("mrpl.access-token");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${url}`, { ...init, headers });
  if (!response.ok) {
    console.warn(
      `[mrpl-api] request failed (${response.status})`,
      url,
    );
    throw new Error(`Request failed: ${response.status} ${url}`);
  }
  return (await response.json()) as T;
}

/** Typed GET helper — the shape the real backend will serve. */
export async function apiGet<T>(
  url: string,
  config?: Omit<RequestInit, "method" | "body">,
): Promise<T> {
  return request<T>(url, { ...config, method: "GET" });
}

/**
 * Minimal fetch-backed client with an axios-like surface, exported so service
 * code can migrate to live endpoints without changing call sites.
 */
export const http = {
  get: <T>(url: string, config?: Omit<RequestInit, "method" | "body">) =>
    request<T>(url, { ...config, method: "GET" }),
  post: <T>(url: string, body?: unknown, config?: Omit<RequestInit, "method" | "body">) =>
    request<T>(url, {
      ...config,
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(url: string, body?: unknown, config?: Omit<RequestInit, "method" | "body">) =>
    request<T>(url, {
      ...config,
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  patch: <T>(url: string, body?: unknown, config?: Omit<RequestInit, "method" | "body">) =>
    request<T>(url, {
      ...config,
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  delete: <T>(url: string, config?: Omit<RequestInit, "method" | "body">) =>
    request<T>(url, { ...config, method: "DELETE" }),
};

/** Simulates gateway latency so loading states are exercised in mock mode. */
export function mockResponse<T>(data: T, ms = 260): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredCloneSafe(data)), ms);
  });
}

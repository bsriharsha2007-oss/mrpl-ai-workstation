/**
 * Central HTTP client for the MRPL Sovereign Enterprise AI Workstation.
 *
 * The backend is being delivered by a separate team. Until live endpoints are
 * available, every service function resolves from `src/services/mock`. Setting
 * `VITE_API_BASE_URL` switches the workstation to the live gateway without any
 * UI changes because all callers go through the typed service layer.
 */

import axios, { type AxiosRequestConfig } from "axios";

const env =
  (import.meta as unknown as { env?: Record<string, string | undefined> })
    .env ?? {};

export const API_BASE_URL = env.VITE_API_BASE_URL ?? "/api";

/** True while the workstation runs on the built-in mock dataset. */
export const USE_MOCK = !env.VITE_API_BASE_URL;

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("mrpl.access-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["X-Workstation"] = "mrpl-sovereign-v1";
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status ?? "network";
    console.warn(`[mrpl-api] request failed (${status})`, error?.config?.url);
    return Promise.reject(error);
  },
);

/** Typed GET helper — the shape the real backend will serve. */
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await http.get<T>(url, config);
  return data;
}

/** Simulates gateway latency so loading states are exercised in mock mode. */
export function mockResponse<T>(data: T, ms = 260): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredCloneSafe(data)), ms);
  });
}

/** Structured clone with a JSON fallback for older runtimes. */
function structuredCloneSafe<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

export { structuredCloneSafe };

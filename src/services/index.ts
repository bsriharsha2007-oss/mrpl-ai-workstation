/**
 * Service facade.
 *
 * Feature code should import from here (`@/services`) so that the eventual swap
 * from mock providers to live HTTP endpoints stays a one-file change.
 */

export { aiService } from "@/services/ai.service";
export { insightsService } from "@/services/insights.service";
export { operationsService } from "@/services/operations.service";
export { workforceService } from "@/services/workforce.service";
export { API_BASE_URL, USE_MOCK, apiGet, http, mockResponse } from "@/services/http";
export type { ChatRequest, ChatResponse } from "@/services/ai.service";
export type { TaskQuery } from "@/services/operations.service";

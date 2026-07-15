import "server-only";
import type { LookupErrorCode } from "../../types/api";

export const DEFAULT_KEAP_BASE_URL = "https://api.infusionsoft.com/crm/rest/v2";
export const DEFAULT_KEAP_TIMEOUT_MS = 12_000;

export type KeapClientConfig = {
  accessToken: string;
  baseUrl: string;
  timeoutMs: number;
};

export type KeapFetchOptions = {
  path: string;
  searchParams?: URLSearchParams;
  config?: KeapClientConfig;
  fetchImpl?: typeof fetch;
};

export class KeapRequestError extends Error {
  readonly status?: number;
  readonly code: LookupErrorCode;
  readonly details?: unknown;

  constructor(code: LookupErrorCode, message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "KeapRequestError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) {
    return DEFAULT_KEAP_BASE_URL;
  }

  if (trimmed.endsWith("/crm/rest/v2")) {
    return trimmed;
  }

  return `${trimmed}/crm/rest/v2`;
}

export function getKeapClientConfig(env: Record<string, string | undefined> = process.env): KeapClientConfig {
  const accessToken = env.KEAP_ACCESS_TOKEN?.trim();

  if (!accessToken) {
    throw new KeapRequestError(
      "SERVICE_CONFIGURATION_ERROR",
      "The account service is unavailable.",
      503,
    );
  }

  const timeoutMs = Number(env.KEAP_REQUEST_TIMEOUT_MS ?? DEFAULT_KEAP_TIMEOUT_MS);

  return {
    accessToken,
    baseUrl: normalizeBaseUrl(env.KEAP_BASE_URL ?? DEFAULT_KEAP_BASE_URL),
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : DEFAULT_KEAP_TIMEOUT_MS,
  };
}

export function buildKeapUrl(path: string, config: Pick<KeapClientConfig, "baseUrl">, searchParams?: URLSearchParams): URL {
  const cleanPath = path.replace(/^\/+/, "");
  const url = new URL(`${config.baseUrl}/${cleanPath}`);

  if (searchParams) {
    searchParams.forEach((value, key) => url.searchParams.append(key, value));
  }

  return url;
}

function mapStatusToErrorCode(status: number): LookupErrorCode {
  if (status === 401) return "SERVICE_UNAUTHORIZED";
  if (status === 403) return "SERVICE_FORBIDDEN";
  if (status === 429) return "RATE_LIMITED";
  if (status >= 500) return "SERVICE_UNAVAILABLE";
  return "UNEXPECTED_RESPONSE";
}

export async function keapFetchJson<T>({
  path,
  searchParams,
  config = getKeapClientConfig(),
  fetchImpl = fetch,
}: KeapFetchOptions): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetchImpl(buildKeapUrl(path, config, searchParams), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    const text = await response.text();
    const body = text ? parseJson(text) : null;

    if (!response.ok) {
      throw new KeapRequestError(
        mapStatusToErrorCode(response.status),
        "The account service is unavailable.",
        response.status,
        body,
      );
    }

    return body as T;
  } catch (error) {
    if (error instanceof KeapRequestError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new KeapRequestError("REQUEST_TIMEOUT", "The account service timed out.", 504);
    }

    throw new KeapRequestError("SERVICE_UNAVAILABLE", "The account service is unavailable.", 503);
  } finally {
    clearTimeout(timeout);
  }
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new KeapRequestError("UNEXPECTED_RESPONSE", "The account service returned an unexpected response.", 502, error);
  }
}

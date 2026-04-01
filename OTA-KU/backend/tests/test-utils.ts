// tests/test-utils.ts
import { env } from "../src/config/env.config.js";

type RequestOptions = {
  method?: string;
  body?: BodyInit;
  headers?: Record<string, string>;
};

export const BASE_URL = `http://localhost:${env.BACKEND_PORT || 3000}`;

export function getEndpointUrl(path: string) {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createTestRequest(
  path: string,
  options: RequestOptions = {},
): Request {
  const url = getEndpointUrl(path);
  return new Request(url, {
    method: options.method || "GET",
    body: options.body,
    headers: {
      Origin: env.ALLOWED_ORIGINS[0],
      ...options.headers,
    },
  });
}

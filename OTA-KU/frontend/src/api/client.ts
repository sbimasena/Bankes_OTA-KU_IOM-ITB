import { QueryClient } from "@tanstack/react-query";

import { ApiClient, ApiError } from "./generated";

const normalizedApiBase = (import.meta.env.VITE_API_URL ?? "").replace(
  /\/api\/?$/,
  "",
);

export const api = new ApiClient({
  BASE: normalizedApiBase,
  WITH_CREDENTIALS: true,
  CREDENTIALS: "include",
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry(failureCount, error) {
        if (failureCount >= 3) return false;
        if (error instanceof ApiError) {
          if (error.status >= 400 && error.status < 500) return false;
        }
        return true;
      },
      gcTime: 1000 * 60 * 60 * 24, // 1 days
    },
  },
});

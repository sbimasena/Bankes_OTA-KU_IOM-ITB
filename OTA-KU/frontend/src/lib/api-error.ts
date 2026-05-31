/**
 * Extracts the user-facing error message from an API error.
 *
 * The generated API client (ApiError) stores the server response body in
 * `error.body`, not in `error.response.data` (Axios pattern). The generic
 * `error.message` only contains "Bad Request" / "Internal Server Error".
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    const body = (error as any)?.body;
    if (body?.message && typeof body.message === "string") {
      return body.message;
    }
    const msg = (error as any)?.message;
    if (msg && typeof msg === "string" && !msg.startsWith("Generic Error:")) {
      return msg;
    }
  }
  return fallback;
}

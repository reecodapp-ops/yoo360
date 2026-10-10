export async function sendProjectEnquiry(url: string, input: Record<string, unknown>, send: typeof fetch = fetch) {
  const response = await send(url, {
    method: "POST",
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(20000),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.accepted !== true) {
    throw new Error(typeof result?.error === "string" ? result.error : "Your enquiry could not be sent. Please try again.");
  }
}

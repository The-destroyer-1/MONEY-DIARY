import { NextResponse } from "next/server";

const recipient = "ratlstores1@gmail.com";
const attemptWindowMs = 15 * 60 * 1000;
const maxAttempts = 8;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "local";
}

export async function POST(request: Request) {
  const now = Date.now();
  const key = getClientKey(request);
  const attempt = loginAttempts.get(key);
  if (attempt && attempt.resetAt > now && attempt.count >= maxAttempts) {
    return NextResponse.json({ authenticated: false, error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  let credentials: unknown;
  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json({ authenticated: false, error: "Invalid login request." }, { status: 400 });
  }

  const values = credentials && typeof credentials === "object"
    ? credentials as Record<string, unknown>
    : {};
  const valid = typeof values.password === "string"
    && values.password === "123456";

  if (!valid) {
    const next = attempt && attempt.resetAt > now
      ? { count: attempt.count + 1, resetAt: attempt.resetAt }
      : { count: 1, resetAt: now + attemptWindowMs };
    loginAttempts.set(key, next);
    return NextResponse.json(
      { authenticated: false, error: next.count >= maxAttempts ? "Too many attempts. Try again in 15 minutes." : "Password is incorrect." },
      { status: next.count >= maxAttempts ? 429 : 401 },
    );
  }

  loginAttempts.delete(key);
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RATL_LOGIN_FROM;
  if (!apiKey || !from) {
    return NextResponse.json({ authenticated: true, notificationSent: false, notificationStatus: "not_configured" });
  }

  try {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        subject: "RATL DIARY sign-in",
        text: `A successful sign-in to RATL DIARY occurred at ${new Date().toISOString()}.`,
      }),
      cache: "no-store",
    });

    if (!emailResponse.ok) {
      console.error("RATL DIARY login notification failed:", emailResponse.status, await emailResponse.text());
      return NextResponse.json({ authenticated: true, notificationSent: false, notificationStatus: "send_failed" });
    }
    return NextResponse.json({ authenticated: true, notificationSent: true });
  } catch (error) {
    console.error("RATL DIARY login notification request failed:", error);
    return NextResponse.json({ authenticated: true, notificationSent: false, notificationStatus: "send_failed" });
  }
}

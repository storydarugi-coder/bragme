"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkRate } from "@/lib/rate-limit";
import { hashIp } from "@/lib/client-ip";

const COOKIE_NAME = "bragme_glorious";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

// One login attempt per IP per 10 seconds. For a single-password preview
// gate this is plenty for legitimate users (10s is the "I mistyped, let
// me try again" cadence) and brutal for brute force — at 6 attempts/min,
// any non-trivial password takes years to enumerate.
const LOGIN_WINDOW_SEC = 10;

function ipFromHeaders(h: Headers): string {
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xri = h.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}

export type LoginState = { error: string | null };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // Rate-limit BEFORE any password comparison: if the slot is held we
  // don't even read the submitted value, so timing can't leak whether a
  // password was correct vs the user was throttled.
  const headerList = await headers();
  const fingerprint = hashIp(ipFromHeaders(headerList));
  const rate = await checkRate(
    `glorious-login:${fingerprint}`,
    LOGIN_WINDOW_SEC,
  );
  if (!rate.ok) {
    return {
      error: `너무 빨라요. ${rate.retryAfterSec}초 후에 다시 시도해주세요.`,
    };
  }

  const password = formData.get("password");
  const from = formData.get("from");
  const expected = process.env.GLORIOUS_PASSWORD;

  if (!expected) {
    return { error: "GLORIOUS_PASSWORD가 서버에 설정되지 않았어요." };
  }
  if (typeof password !== "string" || !password) {
    return { error: "비밀번호를 입력해주세요." };
  }
  if (password !== expected) {
    return { error: "비밀번호가 틀렸어요." };
  }

  const store = await cookies();
  store.set(COOKIE_NAME, "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: THIRTY_DAYS,
    path: "/",
  });

  const target =
    typeof from === "string" && from.startsWith("/glorious")
      ? from
      : "/glorious";
  redirect(target);
}

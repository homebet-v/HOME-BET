import { sessionCookie, sessionCookieOptions, sessionValues, supabaseConfigured, supabaseRequest, type Session } from "./lib/supabase";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveHost, surfacePath } from "./lib/tenant";

function deploymentHost(name: string): string | undefined {
  const raw = process.env[name]?.trim().toLowerCase().replace(/\.$/, "");
  if (!raw) return undefined;
  const withoutProtocol = raw.replace(/^https?:\/\//, "");
  return withoutProtocol.split("/")[0]?.split(":")[0];
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/homebet-game-cache.js") return NextResponse.next();

  if (pathname === "/s" || pathname.startsWith("/s/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  const hostHeader = request.headers.get("host") ?? "localhost";
  const aliases = [
    "home-7j7mmlhwj-homebet.vercel.app",
    deploymentHost("VERCEL_URL"),
    deploymentHost("VERCEL_BRANCH_URL"),
    deploymentHost("VERCEL_PROJECT_PRODUCTION_URL"),
  ];
  const requestedHost = hostHeader.trim().toLowerCase().replace(/\.$/, "").split(":")[0] ?? "";
  if (requestedHost.endsWith(".vercel.app")) {
    aliases.push(requestedHost);
  }

  const surface = resolveHost(
    hostHeader,
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost",
    aliases,
  );
  const url = request.nextUrl.clone();
  url.pathname = surfacePath(surface, pathname);

  const refreshToken = request.cookies.get(sessionCookie.refresh)?.value;
  const expiresAt = Number(request.cookies.get(sessionCookie.expires)?.value ?? 0);
  let refreshed: ReturnType<typeof sessionValues> | undefined;
  if (refreshToken && expiresAt <= Date.now() / 1000 + 30 && supabaseConfigured()) {
    try {
      const session = await supabaseRequest<Session>("/auth/v1/token?grant_type=refresh_token", "public", { refresh_token: refreshToken });
      refreshed = sessionValues(session);
      for (const [key, value] of Object.entries(refreshed)) request.cookies.set(key, value);
    } catch {
      // The request can still render the sign-in screen if the token has expired.
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-homebet-surface", surface.kind);
  requestHeaders.set("x-homebet-slug", surface.slug ?? "");

  const response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  if (refreshed) {
    const options = sessionCookieOptions(hostHeader);
    for (const [key, value] of Object.entries(refreshed)) response.cookies.set(key, value, options);
    response.headers.set("Cache-Control", "private, no-store");
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)$).*)",
  ],
};

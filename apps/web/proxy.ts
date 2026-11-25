import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveHost, surfacePath } from "./lib/tenant";

function deploymentHost(name: string): string | undefined {
  const raw = process.env[name]?.trim().toLowerCase().replace(/\.$/, "");
  if (!raw) return undefined;
  const withoutProtocol = raw.replace(/^https?:\/\//, "");
  return withoutProtocol.split("/")[0]?.split(":")[0];
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-homebet-surface", surface.kind);
  requestHeaders.set("x-homebet-slug", surface.slug ?? "");

  return NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)$).*)",
  ],
};

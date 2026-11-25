import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveHost, surfacePath } from "./lib/tenant";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/s" || pathname.startsWith("/s/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  const surface = resolveHost(
    request.headers.get("host") ?? "localhost",
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost",
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

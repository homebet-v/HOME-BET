export type Surface =
  | { kind: "home"; slug: null }
  | { kind: "admin"; slug: string }
  | { kind: "casa"; slug: string }
  | { kind: "unknown"; slug: null };

const RESERVED = new Set(["home", "www", "api", "app", "localhost"]);
const SLUG = /^[a-z][a-z0-9-]{1,40}$/;

export function isSlug(value: string): boolean {
  return SLUG.test(value) && !value.endsWith("-");
}

function hostnameOf(hostHeader: string): string {
  const trimmed = hostHeader.trim().toLowerCase().replace(/\.$/, "");
  if (trimmed.startsWith("[")) {
    const end = trimmed.indexOf("]");
    return end === -1 ? trimmed : trimmed.slice(1, end);
  }
  return trimmed.split(":")[0] ?? trimmed;
}

export function resolveHost(
  hostHeader: string,
  rootDomain = "localhost",
  homeAliases: readonly (string | undefined)[] = [],
): Surface {
  const hostname = hostnameOf(hostHeader);
  const root = rootDomain.trim().toLowerCase().replace(/\.$/, "") || "localhost";

  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === root ||
    hostname === `www.${root}` ||
    hostname === `home.${root}` ||
    (hostname.endsWith(".vercel.app") && homeAliases.includes(hostname))
  ) {
    return { kind: "home", slug: null };
  }

  const suffix = `.${root}`;
  if (!hostname.endsWith(suffix)) {
    return { kind: "unknown", slug: null };
  }

  const label = hostname.slice(0, -suffix.length);
  if (label.length === 0 || label.includes(".")) {
    return { kind: "unknown", slug: null };
  }

  if (label.endsWith("-admin")) {
    const slug = label.slice(0, -"-admin".length);
    if (!isSlug(slug) || RESERVED.has(slug)) {
      return { kind: "unknown", slug: null };
    }
    return { kind: "admin", slug };
  }

  if (RESERVED.has(label) || !isSlug(label)) {
    return { kind: "unknown", slug: null };
  }

  return { kind: "casa", slug: label };
}

export function surfaceOrigin(
  kind: "home" | "admin" | "casa",
  slug: string | null,
  rootDomain = "localhost",
): string {
  const root = rootDomain.trim().toLowerCase().replace(/\.$/, "") || "localhost";
  const local = root === "localhost";
  const protocol = local ? "http" : "https";
  const port = local ? ":3000" : "";

  if (kind === "home") {
    return `${protocol}://${local ? "localhost" : `home.${root}`}${port}`;
  }

  const label = kind === "admin" ? `${slug}-admin` : slug;
  return `${protocol}://${label}.${root}${port}`;
}

export function surfacePath(surface: Surface, pathname: string): string {
  const rest = pathname === "/" ? "" : pathname;
  if (surface.kind === "home") return `/s/home${rest}`;
  if (surface.kind === "admin") return `/s/admin/${surface.slug}${rest}`;
  if (surface.kind === "casa") return `/s/casa/${surface.slug}${rest}`;
  return "/s/unknown";
}

import "server-only";

type Access = "public" | "service" | { token: string };
export type Session = { access_token: string; refresh_token: string; expires_at?: number; expires_in: number };
export const sessionCookie = { access: "hb-access", refresh: "hb-refresh", expires: "hb-expires" } as const;

export function supabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
}

export async function supabaseRequest<T>(path: string, access: Access = "public", body?: object) {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = access === "service"
    ? process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!projectUrl || !key) throw new Error("Supabase no está configurado.");
  const headers = new Headers({ apikey: key });
  if (typeof access === "object") headers.set("Authorization", `Bearer ${access.token}`);
  if (access === "service" && key.startsWith("eyJ")) headers.set("Authorization", `Bearer ${key}`);
  if (body !== undefined) headers.set("Content-Type", "application/json");
  const response = await fetch(new URL(path, projectUrl), {
    method: body === undefined ? "GET" : "POST",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase HTTP ${response.status}`);
  const data = await response.text();
  return (data ? JSON.parse(data) : null) as T;
}

export function sessionValues(session: Session) {
  return {
    [sessionCookie.access]: session.access_token,
    [sessionCookie.refresh]: session.refresh_token,
    [sessionCookie.expires]: String(session.expires_at ?? Math.floor(Date.now() / 1000) + session.expires_in),
  };
}

export function sessionCookieOptions(host: string) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: !/^([a-z0-9-]+\.)*localhost(?::\d+)?$/i.test(host),
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

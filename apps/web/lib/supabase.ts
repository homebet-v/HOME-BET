import "server-only";

type Access = "public" | "service" | { token: string };
export type Session = { access_token: string; refresh_token: string; expires_at?: number; expires_in: number };
export const sessionCookie = { access: "hb-access", refresh: "hb-refresh", expires: "hb-expires" } as const;

export function supabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
}

export async function supabaseRequest<T>(path: string, access: Access = "public", body?: object | Blob) {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = access === "service"
    ? process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!projectUrl || !key) throw new Error("Supabase no está configurado.");
  const headers = new Headers({ apikey: key });
  if (typeof access === "object") headers.set("Authorization", `Bearer ${access.token}`);
  if (access === "service" && key.startsWith("eyJ")) headers.set("Authorization", `Bearer ${key}`);
  if (body !== undefined) headers.set("Content-Type", body instanceof Blob ? body.type : "application/json");
  const response = await fetch(new URL(path, projectUrl), {
    method: body === undefined ? "GET" : "POST",
    headers,
    body: body instanceof Blob || body === undefined ? body : JSON.stringify(body),
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

const documentBucket = "house-documents";

export async function uploadHouseDocument(prefix: string, image: File, limit: number) {
  const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  const extension = extensions[image.type];
  if (!extension || image.size === 0 || image.size > limit) throw new Error("Formato o tamaño de imagen inválido.");
  const bytes = new Uint8Array(await image.slice(0, 12).arrayBuffer());
  const valid = extension === "jpg" ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
    : extension === "png" ? [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => byte === bytes[index])
    : String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (!valid) throw new Error("La imagen no coincide con el formato declarado.");
  const path = `${prefix}.${extension}`;
  await supabaseRequest(`/storage/v1/object/${documentBucket}/${path}`, "service", image);
  return path;
}

export async function signedHouseDocument(path: string) {
  const { signedURL } = await supabaseRequest<{ signedURL: string }>(
    `/storage/v1/object/sign/${documentBucket}/${path}`, "service", { expiresIn: 120 },
  );
  const url = signedURL.startsWith("/storage/v1/") ? signedURL : `/storage/v1${signedURL}`;
  return new URL(url, process.env.NEXT_PUBLIC_SUPABASE_URL).href;
}

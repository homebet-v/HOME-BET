export function publicPath(pathname: string): string {
  const nested = pathname.match(/^\/s\/(?:admin|casa)\/[^/]+(\/.*)?$/);
  if (nested) return nested[1] ?? "/";
  const home = pathname.match(/^\/s\/home(\/.*)?$/);
  if (home) return home[1] ?? "/";
  return pathname || "/";
}

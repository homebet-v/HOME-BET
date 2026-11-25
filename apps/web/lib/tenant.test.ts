import assert from "node:assert/strict";
import test from "node:test";
import { resolveHost, surfaceOrigin, surfacePath } from "./tenant.ts";

test("localhost and the apex open Home", () => {
  assert.deepEqual(resolveHost("localhost:3000"), { kind: "home", slug: null });
  assert.deepEqual(resolveHost("home.localhost:3000"), { kind: "home", slug: null });
  assert.deepEqual(resolveHost("homebet.com", "homebet.com"), { kind: "home", slug: null });
  assert.deepEqual(resolveHost("www.homebet.com", "homebet.com"), { kind: "home", slug: null });
  assert.deepEqual(resolveHost("home.homebet.com", "homebet.com"), { kind: "home", slug: null });
});

test("a house slug opens the player site and the sibling admin host", () => {
  assert.deepEqual(resolveHost("bet1.localhost:3000"), { kind: "casa", slug: "bet1" });
  assert.deepEqual(resolveHost("bet1-admin.localhost:3000"), { kind: "admin", slug: "bet1" });
  assert.deepEqual(resolveHost("bet1.homebet.com", "homebet.com"), {
    kind: "casa",
    slug: "bet1",
  });
  assert.deepEqual(resolveHost("bet1-admin.homebet.com", "homebet.com"), {
    kind: "admin",
    slug: "bet1",
  });
});

test("Vercel aliases open Home on exact matches", () => {
  const aliases = ["home-7j7mmlhwj-homebet.vercel.app", "home.vercel.app", undefined, "bet1.homebet.com"];
  assert.deepEqual(resolveHost("home-7j7mmlhwj-homebet.vercel.app", "homebet.com", aliases), { kind: "home", slug: null });
  assert.deepEqual(resolveHost("home.vercel.app", "homebet.com", aliases), { kind: "home", slug: null });
  assert.deepEqual(resolveHost("other.vercel.app", "homebet.com", aliases), { kind: "unknown", slug: null });
  assert.deepEqual(resolveHost("bet1.homebet.com", "homebet.com", aliases), { kind: "casa", slug: "bet1" });
});

test("nested hosts, reserved labels and foreign domains stay unknown", () => {
  assert.deepEqual(resolveHost("admin.bet1.localhost"), { kind: "unknown", slug: null });
  assert.deepEqual(resolveHost("api.localhost"), { kind: "unknown", slug: null });
  assert.deepEqual(resolveHost("-admin.localhost"), { kind: "unknown", slug: null });
  assert.deepEqual(resolveHost("bet1.com", "homebet.com"), { kind: "unknown", slug: null });
});

test("each surface has one public origin", () => {
  assert.equal(surfaceOrigin("home", null), "http://localhost:3000");
  assert.equal(surfaceOrigin("casa", "bet1"), "http://bet1.localhost:3000");
  assert.equal(surfaceOrigin("admin", "bet1"), "http://bet1-admin.localhost:3000");
  assert.equal(surfaceOrigin("casa", "bet1", "homebet.com"), "https://bet1.homebet.com");
  assert.equal(surfaceOrigin("home", null, "homebet.com"), "https://home.homebet.com");
});

test("the public path is rewritten under the surface prefix", () => {
  const casa = resolveHost("bet1.localhost");
  assert.equal(surfacePath(casa, "/"), "/s/casa/bet1");
  assert.equal(surfacePath(casa, "/juegos"), "/s/casa/bet1/juegos");
  assert.equal(surfacePath(resolveHost("localhost"), "/casinos"), "/s/home/casinos");
  assert.equal(
    surfacePath(resolveHost("bet2-admin.localhost"), "/"),
    "/s/admin/bet2",
  );
});

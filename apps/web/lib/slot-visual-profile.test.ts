import assert from "node:assert/strict";
import { test } from "node:test";
import { slotVisualProfile } from "./slot-visual-profile.ts";

const theme = { motif: "botanical" as const, secondary: "#aabbcc", surface: "#001100" };

test("cada juego conserva su escena y paleta en la presentación compartida", () => {
  const first = slotVisualProfile({ slug: "jardin-de-luces", accent: "#11ee66" }, theme);
  const second = slotVisualProfile({ slug: "bosque-micelio", accent: "#99ee22" }, theme);
  assert.notEqual(first.scene, second.scene);
  assert.equal(first.accent, "#11ee66");
  assert.equal(second.accent, "#99ee22");
  assert.equal(first.secondary, theme.secondary);
  assert.equal(first.surface, theme.surface);
  assert.notEqual(first.prizeBadges, second.prizeBadges, "cada juego tiene sus propias insignias aunque comparta familia");
  assert.notEqual(first.title, second.title);
  assert.notEqual(first.spin, second.spin);
  assert.equal(first.prizeBadges, slotVisualProfile({ slug: "jardin-de-luces", accent: "#11ee66" }, theme).prizeBadges, "las lecturas del mismo juego mantienen una lista estable");
  assert.equal(first.prizeBadges.length, 3);
  assert.notEqual(first.spin, first.chip);
});
test("la presentación de Coral conserva sus recursos propios", () => {
  const coral = slotVisualProfile({ slug: "oraculo-coral", accent: "#ff00ff" }, { motif: "ocean", secondary: "#00ffaa", surface: "#002211" });
  assert.equal(coral.scene, "/images/slots/oraculo-coral/remaster/scene.webp");
  assert.equal(coral.accent, "#35e4ff");
  assert.ok(coral.prizeBadges[0].endsWith("prize-pearl.webp"));
  assert.ok(coral.title.includes("oraculo-coral"));
});

test("la edición II comparte arte con su tema, sin depender de archivos duplicados", () => {
  const original = slotVisualProfile({ slug: "golden-sevens", accent: "#ef4444" }, theme);
  const edition = slotVisualProfile({ slug: "golden-sevens-ii", themeSlug: "golden-sevens", accent: "#ef4444" }, theme);
  assert.equal(edition.scene, original.scene);
  assert.equal(edition.title, original.title);
  assert.equal(edition.spin, original.spin);
  assert.equal(edition.prizeBadges, original.prizeBadges);
});

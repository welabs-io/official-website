// TESTES DA SINCRONIZAÇÃO DO MANIFESTO
// A failed validation in scripts/sync-motion.mjs leaves the live public/motion and lib/motion-manifest.json as they were,
// and drops the half-built folder. Needs the motion round and the npm cache of the machine (skipped where they are absent).
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const site = join(__dirname, "../..");
const round = join(
  homedir(),
  "code/control/portfolio/motion/portfolio-20261002",
);

// Name, size and content hash of every file under a folder: any change shows
function snapshot(dir: string): string {
  const lines: string[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d).sort()) {
      const file = join(d, name);
      if (statSync(file).isDirectory()) walk(file);
      else
        lines.push(
          `${file} ${createHash("sha1").update(readFileSync(file)).digest("hex")}`,
        );
    }
  };
  walk(dir);
  return createHash("sha1").update(lines.join("\n")).digest("hex");
}

const run = (args: string[]) =>
  spawnSync(
    process.execPath,
    [join(site, "scripts/sync-motion.mjs"), ...args],
    {
      encoding: "utf8",
    },
  );

describe.skipIf(!existsSync(round))("sync-motion", () => {
  const manifestPath = join(site, "lib/motion-manifest.json");
  const live = join(site, "public/motion/v5");

  it("a manifest whose piece is not the accepted one fails and leaves public/motion and lib/ intact", () => {
    const before = [snapshot(live), readFileSync(manifestPath, "utf8")];
    const bad = JSON.parse(readFileSync(manifestPath, "utf8"));
    const id = Object.keys(bad.pieces)[0];
    bad.pieces[id].sourceSha256 = "0".repeat(64);
    const dir = mkdtempSync(join(tmpdir(), "sync-"));
    const file = join(dir, "manifest.json");
    writeFileSync(file, JSON.stringify(bad));
    const result = run(["--manifest", file]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/not the accepted one|does not match/);
    expect([snapshot(live), readFileSync(manifestPath, "utf8")]).toEqual(
      before,
    );
    expect(existsSync(join(site, "public/motion/.v5-next"))).toBe(false);
  });

  it("a missing cover, found after the pieces were built, also leaves them intact", () => {
    const before = [snapshot(live), readFileSync(manifestPath, "utf8")];
    const empty = mkdtempSync(join(tmpdir(), "covers-"));
    const result = run(["--manifest", manifestPath, "--covers", empty]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/missing cover/);
    expect([snapshot(live), readFileSync(manifestPath, "utf8")]).toEqual(
      before,
    );
    expect(existsSync(join(site, "public/motion/.v5-next"))).toBe(false);
  });
});

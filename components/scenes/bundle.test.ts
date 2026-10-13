// TESTE DO PACOTE SOB DEMANDA
// scene-run.ts is the lazy chunk of every carousel of native scenes. Its runtime imports (type-only imports are erased)
// must not reach the script, the copy nor any JSON: the server writes the durations into the page, so those lists never
// ship in the chunk.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");

const resolveImport = (from: string, spec: string): string | null => {
  const base = spec.startsWith("@/")
    ? path.join(root, spec.slice(2))
    : spec.startsWith(".")
      ? path.resolve(path.dirname(from), spec)
      : null;
  if (!base) return null;
  for (const ext of ["", ".ts", ".tsx", ".json", "/index.ts"])
    if (
      existsSync(base + ext) &&
      !base.endsWith("/") &&
      (ext || path.extname(base))
    )
      return base + ext;
  return null;
};

// Every file reachable through value imports (`import type` and `export type` are skipped)
function runtimeGraph(entry: string): string[] {
  const seen = new Set<string>();
  const walk = (file: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    if (file.endsWith(".json")) return;
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(
      /^\s*(?:import|export)\s+(?!type\b)[^;]*?from\s+["']([^"']+)["']/gm,
    )) {
      const next = resolveImport(file, match[1]);
      if (next) walk(next);
    }
  };
  walk(entry);
  return [...seen];
}

describe("scene-run chunk", () => {
  const graph = runtimeGraph(
    path.join(root, "components/scenes/scene-run.ts"),
  ).map((f) => path.relative(root, f));
  it("imports no JSON, no script and no content: the server writes the durations next to the stage", () => {
    expect(graph.filter((f) => f.endsWith(".json"))).toEqual([]);
    expect(graph).not.toContain("lib/scenes/script.ts");
    expect(graph).not.toContain("lib/scenes/capabilities.ts");
    expect(graph.filter((f) => f.startsWith("lib/content/"))).toEqual([]);
  });
});

// TESTES DE ROTAS E REDIRECIONAMENTOS
// Routes are in English; every old address redirects in one hop to a final address.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error the Next config is plain ESM without types
import config from "../next.config.mjs";
import { retiredSlug } from "./public-slugs";

const root = path.resolve(__dirname, "..");
type Redirect = { source: string; destination: string; permanent: boolean };
const redirects = (await config.redirects!()) as Redirect[];

// Portuguese words that must not appear as a route segment, anchor or redirect destination
const PT =
  /^(produtos?|sobre|solucoes|solucao|contato|cadeia|trilhos|clientes|precos|politica|termos|institucional)$/;

const walk = (dir: string, out: string[] = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".next-split", ".git"].includes(entry.name))
      continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};

describe("route segments are in English", () => {
  const pageFiles = walk(path.join(root, "app")).filter((f) =>
    /\/(page|route)\.tsx?$/.test(f),
  );
  // The workbench of the video montage (lab/chain) left with the videos: the native chain is measured on the home itself
  // A route group "(site)" is a folder of the layout, not a segment of the address
  const urlSegments = (file: string) =>
    path
      .relative(path.join(root, "app"), path.dirname(file))
      .split(path.sep)
      .filter((s) => s && !/^\(.*\)$/.test(s));
  it("has the home and the product page", () => {
    const routes = pageFiles.map((f) => urlSegments(f).join("/"));
    // lab/scenes/[id]: the noindex workbench of the scene kit (components/scene-kit), one scene alone; lab/scenes lists them;
    // lab/foundation (v4): the noindex workbench of the v4 primitives (connector, typing, reveal, growing row)
    expect(routes.sort()).toEqual(["", "lab/foundation", "lab/scenes", "lab/scenes/[id]", "products/[slug]"]);
  });
  it.each(pageFiles)("%s has no Portuguese segment", (file) => {
    const segments = urlSegments(file);
    for (const s of segments) expect(s).not.toMatch(PT);
  });
  it("redirect destinations have no Portuguese segment or anchor", () => {
    for (const r of redirects) {
      const [pathname, hash] = r.destination.split("#");
      for (const s of pathname.split("/").filter(Boolean))
        expect(s, r.source).not.toMatch(PT);
      if (hash) expect(hash, r.source).not.toMatch(PT);
    }
  });
});

describe("redirects", () => {
  const bySource = new Map(redirects.map((r) => [r.source, r]));
  it("are permanent except the hidden product", () => {
    const temporary = redirects
      .filter((r) => !r.permanent)
      .map((r) => r.source);
    expect(
      temporary.every((s) =>
        /malupe|ecossistema-monitoramento|operacao-seguranca/.test(s),
      ),
    ).toBe(true);
  });
  it("end in one hop: no destination is another redirect source", () => {
    for (const r of redirects)
      expect(
        bySource.has(r.destination.split("#")[0]) &&
          r.destination.split("#")[0] !== "/",
        r.source,
      ).toBe(false);
  });
  it("sends /new to the home and the Portuguese routes to English ones or anchors", () => {
    expect(bySource.get("/new")?.destination).toBe("/");
    expect(bySource.get("/produtos")?.destination).toBe("/#products");
    expect(bySource.get("/solucoes")?.destination).toBe("/#products");
    expect(bySource.get("/sobre")?.destination).toBe("/#message");
    expect(bySource.get("/produtos/domus")?.destination).toBe(
      "/products/domus",
    );
  });
  it("sends the English routes without a page to the matching anchor", () => {
    expect(bySource.get("/products")).toMatchObject({
      destination: "/#products",
      permanent: true,
    });
    expect(bySource.get("/solutions")).toMatchObject({
      destination: "/#products",
      permanent: true,
    });
    expect(bySource.get("/about")).toMatchObject({
      destination: "/#message",
      permanent: true,
    });
  });
  it("keep internal ids and former slugs in line with lib/public-slugs", () => {
    for (const id of [
      "erp",
      "flow",
      "wekb",
      "welabs-crm",
      "channels",
      "rello",
      "hub-de-dominio",
    ]) {
      const target = retiredSlug(id)!;
      expect(bySource.get(`/produtos/${id}`)?.destination, id).toBe(
        `/products/${target}`,
      );
      expect(bySource.get(`/products/${id}`)?.destination, id).toBe(
        `/products/${target}`,
      );
      expect(bySource.get(`/welabs/produtos/${id}`)?.destination, id).toBe(
        `/products/${target}`,
      );
    }
  });
});

describe("the site is 100% native: no video, no player, no frame of another page", () => {
  const files = [
    ...walk(path.join(root, "app")),
    ...walk(path.join(root, "components")),
    ...walk(path.join(root, "lib")),
    ...walk(path.join(root, "public")),
  ];
  it("serves no video file and no folder of motion pieces", () => {
    expect(files.filter((f) => /\.(mp4|webm|mov)$/i.test(f))).toEqual([]);
    expect(files.filter((f) => f.includes("/public/motion/"))).toEqual([]);
  });
  it("draws no <video>, <iframe> or player element", () => {
    const offenders = files
      .filter(
        (f) =>
          /\.(tsx?|jsx?|css|html|mjs)$/.test(f) && !/\.test\.tsx?$/.test(f),
      )
      .filter((f) =>
        /<video\b|<iframe\b|hyperframes-player|createElement\(\s*["'](video|iframe)["']/i.test(
          fs.readFileSync(f, "utf8"),
        ),
      );
    expect(offenders).toEqual([]);
  });
});

#!/usr/bin/env node
// CICLO RÁPIDO DE PRÉVIA
// Fast preview loop: builds the site into the dist directory the running preview is NOT using, and only after the
// build succeeds swaps the `next start` on the preview port. The preview stays up the whole time, and no test suite
// runs here: the full gate (`npm run gate`) is for right before merge.
//
// Safety: reads only NEXT_DIST_DIR from the running process environment (never the whole environ, which holds
// tokens), and only stops a server whose working directory is this checkout.
//
// Usage: npm run iterate            (port 5176)
//        PORT=5180 npm run iterate  (another preview)
import { execFileSync, spawn } from "node:child_process";
import { existsSync, readFileSync, readlinkSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = realpathSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
);
const port = Number(process.env.PORT ?? 5176);
const host = "127.0.0.1";
const dists = [".next-a", ".next-b"];
const imagineUrl =
  process.env.NEXT_PUBLIC_IMAGINE_URL ?? "http://localhost:5175";
const nextBin = path.join(root, "node_modules/.bin/next");

// Find the pid listening on the port, if any
function listeningPid() {
  const out = execFileSync("ss", ["-ltnpH", `sport = :${port}`], {
    encoding: "utf8",
  });
  const m = out.match(/pid=(\d+)/);
  return m ? Number(m[1]) : null;
}

// Read a single variable from a process environment, never printing the rest
function envVar(pid, name) {
  const env = readFileSync(`/proc/${pid}/environ`, "latin1").split("\0");
  const line = env.find((l) => l.startsWith(`${name}=`));
  return line ? line.slice(name.length + 1) : null;
}

function cwdOf(pid) {
  try {
    return realpathSync(readlinkSync(`/proc/${pid}/cwd`));
  } catch {
    return null;
  }
}

async function waitFor(url, ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      const r = await fetch(url);
      if (r.status === 200) return true;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

const sha = execFileSync("git", ["-C", root, "rev-parse", "--short", "HEAD"], {
  encoding: "utf8",
}).trim();
const oldPid = listeningPid();
const oldDist = oldPid ? envVar(oldPid, "NEXT_DIST_DIR") : null;
const dist = dists.find((d) => d !== oldDist) ?? dists[0];

if (oldPid && cwdOf(oldPid) !== root) {
  console.error(
    `port ${port} is served from another checkout (pid ${oldPid}); refusing to touch it`,
  );
  process.exit(1);
}

const env = {
  ...process.env,
  NEXT_DIST_DIR: dist,
  NEXT_PUBLIC_IMAGINE_URL: imagineUrl,
};
const t0 = Date.now();
console.log(
  `build ${sha} -> ${dist} (preview on ${oldDist ?? "none"} stays up)`,
);
try {
  execFileSync(nextBin, ["build"], {
    cwd: root,
    env,
    stdio: ["ignore", "ignore", "inherit"],
  });
} catch {
  console.error("build failed; preview left untouched");
  process.exit(1);
}
if (!existsSync(path.join(root, dist, "BUILD_ID"))) {
  console.error(`no BUILD_ID in ${dist}; preview left untouched`);
  process.exit(1);
}

// Swap: stop the old server of this checkout, start the new one detached
if (oldPid) {
  process.kill(oldPid, "SIGTERM");
  const end = Date.now() + 10000;
  while (listeningPid() && Date.now() < end)
    await new Promise((r) => setTimeout(r, 200));
}
const child = spawn(nextBin, ["start", "-H", host, "-p", String(port)], {
  cwd: root,
  env,
  detached: true,
  stdio: "ignore",
});
child.unref();

const ok = await waitFor(`http://${host}:${port}/`, 30000);
const secs = ((Date.now() - t0) / 1000).toFixed(0);
console.log(
  ok
    ? `up: http://${host}:${port} · ${sha} · ${dist} · ${secs}s`
    : `server did not answer 200 on port ${port}`,
);
process.exit(ok ? 0 : 1);

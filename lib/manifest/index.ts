// MANIFESTO DE MOTION DO SITE
// The one motion manifest of the round, copied in by scripts/sync-motion.mjs and checked once here. Server side only:
// the browser code of the rings never imports it (see lib/ring-data.ts, which hands it what to play).
import raw from "../motion-manifest.json";
import { parseManifest } from "./parse";

export const MANIFEST = parseManifest(raw);

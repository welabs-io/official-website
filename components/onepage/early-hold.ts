// CLIQUE RETIDO ANTES DA HIDRATAÇÃO
// Until the engine of the move lands (descent-run.ts), a plain click on a link to the home or to a product is held (the
// last one wins) and handed to the engine by Descent.tsx. It runs as an inline script of the site layout, while the
// HTML is parsed, so it is in place before any link hydrates. Registered in the Descent module instead (v2.2), it came
// 150 to 210 ms after the selector's link had hydrated, on the production build, because that module rides on a chunk
// of its own (measured 2026-11-26, next start on 2977a60, 3 of 3 loads): the click went to next/link as a plain swap
// with no brand opening.
import { LOCALES } from "@/lib/i18n/config";

/** The holder the inline script leaves on window; `release` stops holding and returns the held link, if any */
export type EarlyHold = { release: () => HTMLAnchorElement | null };

export const EARLY_HOLD_KEY = "__welabsDescentHold";

/**
 * Installs the holder on window. Self-contained on purpose: it is serialized into the inline script, so it may not
 * use imports or anything outside its own body.
 */
export function installEarlyHold(locales: readonly string[], key: string) {
  const w = window as unknown as Record<string, EarlyHold | undefined>;
  if (w[key]) return;
  let held: HTMLAnchorElement | null = null;
  // The pathname without its locale prefix, as stripLocale in lib/i18n/config.ts
  const strip = (pathname: string) => {
    for (const locale of locales) {
      const prefix = "/" + locale;
      if (pathname === prefix) return "/";
      if (pathname.startsWith(prefix + "/"))
        return pathname.slice(prefix.length);
    }
    return pathname;
  };
  const onEarly = (event: MouseEvent) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey) return;
    const a =
      event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>("a[href]")
        : null;
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.hash) return;
    const page = strip(url.pathname);
    if (page !== "/" && !page.startsWith("/products/")) return;
    if (url.pathname === location.pathname) return;
    event.preventDefault();
    held = a;
  };
  window.addEventListener("click", onEarly, true);
  w[key] = {
    release: () => {
      window.removeEventListener("click", onEarly, true);
      const a = held;
      held = null;
      return a;
    },
  };
}

/** The source of the inline script: the holder above, called with the locales of the site */
export const earlyHoldScript = () =>
  `(${installEarlyHold.toString()})(${JSON.stringify(LOCALES)},${JSON.stringify(EARLY_HOLD_KEY)});`;

/** Stops holding and returns the held link; null when nothing was held or the script never ran */
export function releaseEarlyHold(): HTMLAnchorElement | null {
  const w = window as unknown as Record<string, EarlyHold | undefined>;
  return w[EARLY_HOLD_KEY]?.release() ?? null;
}

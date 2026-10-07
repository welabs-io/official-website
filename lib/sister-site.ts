// SITE IRMÃO (IMAGINE APPS)
// The Imagine Apps site lives in its own repository (imagineapps-team/official-website) and is reached
// through NEXT_PUBLIC_IMAGINE_URL, inlined at build time. Without the variable the links to it are
// hidden instead of pointing at a guessed domain.
const IMAGINE_URL = (process.env.NEXT_PUBLIC_IMAGINE_URL ?? "").replace(
  /\/+$/,
  "",
);

// Absolute URL of an Imagine page, carrying the current language; null when the site is not configured.
export function imagineHref(path: string, lang?: string): string | null {
  if (!IMAGINE_URL) return null;
  return `${IMAGINE_URL}${path}${lang === "en" ? "?lang=en" : lang === "pt" ? "?lang=pt" : ""}`;
}

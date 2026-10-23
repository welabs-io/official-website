// PLATAFORMAS ONDE RODAMOS
// The four clouds the operator asked for, and nothing of the internal stack (v3, F1: plano.md sections 1.5 and 3.5; the
// copy rules in copy-rules.json fail any stack name on a page). Official marks: simple-icons 16.34.0 (CC0) for Google
// Cloud and DigitalOcean; AWS (official logo SVG) and HostDime (official logo PNG from hostdime.com.br) are not in that
// package. The strip paints every mark in one token through its alpha (a CSS mask), so the file's own colours never show.
// - `ratio`: the width over the height of what the strip shows.
// - `wordmark`: the mark already spells the name (the "aws" of AWS), so the name is not repeated beside it; it stays
//   for assistive technology. A pure symbol has its name beside it.
// - `symbol`: the mark is the left of a wider file (HostDime ships one PNG with its symbol, its name and a tagline; the
//   strip shows the first 69 of its 480 × 46 px).
// - `scale`: optical size against the common height (Google Cloud's cloud fills less of its square; HostDime's 46 px
//   PNG at 23 px is one device pixel per file pixel on a 2x screen, so its edge stays sharp).
export type PlatformLogo = {
  name: string;
  src: string;
  ratio: number;
  wordmark?: boolean;
  symbol?: boolean;
  scale?: number;
};

export const PLATFORM_LOGOS: readonly PlatformLogo[] = [
  { name: "AWS", src: "/platforms/aws.svg", ratio: 304 / 182, wordmark: true },
  {
    name: "Google Cloud",
    src: "/platforms/googlecloud.svg",
    ratio: 1,
    scale: 1.15,
  },
  { name: "DigitalOcean", src: "/platforms/digitalocean.svg", ratio: 1 },
  {
    name: "HostDime",
    src: "/platforms/hostdime.png",
    ratio: 69 / 46,
    symbol: true,
    scale: 23 / 24,
  },
];

// PLATAFORMAS ONDE RODAMOS
// The four clouds the operator asked for, and nothing of the internal stack (v3, F1: plano.md sections 1.5 and 3.5; the
// copy rules in copy-rules.json fail any stack name on a page). Monochrome official marks: simple-icons 16.34.0 (CC0) for
// Google Cloud and DigitalOcean; AWS (official logo SVG) and HostDime (official logo PNG from hostdime.com.br) are not in
// that package. `ratio` is the width over the height of what the strip shows; HostDime ships one PNG with its symbol, its
// name and a tagline, so the strip shows the symbol only (`symbol`: the first 69 of its 480 × 46 px) and the name is the
// text beside it, like every other mark.
export const PLATFORM_LOGOS = [
  { name: "AWS", src: "/platforms/aws.svg", ratio: 304 / 182 },
  { name: "Google Cloud", src: "/platforms/googlecloud.svg", ratio: 1 },
  { name: "DigitalOcean", src: "/platforms/digitalocean.svg", ratio: 1 },
  {
    name: "HostDime",
    src: "/platforms/hostdime.png",
    ratio: 69 / 46,
    symbol: true,
  },
] as const;

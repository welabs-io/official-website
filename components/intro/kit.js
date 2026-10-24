// KIT DAS ABERTURAS DE MARCA
// Shared plumbing of the five brand openings ported from the accepted motion round (control/portfolio/motion/
// portfolio-20261002: domus-intro-s2-r2, relloo-intro-s2-r3, magneto-intro-s3-r3, tuner-intro-s2, knowly-intro-s2, with the
// choreographies of _shared/vendor/*-intro). Each choreography is a pure function of time, render(t); the round drove it
// with a paused GSAP timeline and read two things from GSAP and the brand loader. The site ships neither, so this module
// gives the eases those files ask for, as plain functions, and the light palette of the site that replaces their dark
// one (the tokens of the ERP front, see shell.module.css). Nothing else of the choreographies changes: same geometry,
// same times, same eases.

// GSAP's power N is a polynomial of degree N + 1; in, out and inOut are built the GSAP way
const power = (n) => {
  const easeIn = (p) => p ** (n + 1);
  return {
    in: easeIn,
    out: (p) => 1 - (1 - p) ** (n + 1),
    inOut: (p) => (p < 0.5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2),
  };
};

// GSAP's back: an overshoot of `s` (default 1.70158)
const back = (s) => {
  const easeIn = (p) => (p ? p * p * ((s + 1) * p - s) : 0);
  return {
    in: easeIn,
    out: (p) => 1 - easeIn(1 - p),
    inOut: (p) => (p < 0.5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2),
  };
};

const sine = {
  in: (p) => 1 - Math.cos((p * Math.PI) / 2),
  out: (p) => Math.sin((p * Math.PI) / 2),
  inOut: (p) => -(Math.cos(Math.PI * p) - 1) / 2,
};

// "power3.out", "sine.inOut", "back.inOut(0.9)" -> (u) => eased u
export function parseEase(name) {
  const m = /^(\w+)\.(in|out|inOut)(?:\(([\d.]+)\))?$/.exec(name);
  if (!m) throw new Error(`intro: unknown ease ${name}`);
  const [, family, kind, arg] = m;
  if (family === "sine") return sine[kind];
  if (family === "back") return back(arg ? Number(arg) : 1.70158)[kind];
  const level = /^power(\d)$/.exec(family);
  if (!level) throw new Error(`intro: unknown ease ${name}`);
  return power(Number(level[1]))[kind];
}

// CÂMERA DAS ABERTURAS
// The close-up factor of the focus camera of every opening, before it pulls back to scale 1. The round used 1.55 to 1.7,
// which the operator read as too much zoom (2026-10-24); the five openings now share one contained factor, held at or
// under 1.2 by intro.test.ts and e2e/brand-opening.spec.ts. The objects of a scene (a symbol that shrinks onto the
// logo) keep their own scales: this is only the camera.
export const CLOSE_UP = 1.18;
// The close-up of the round, for the pieces that must keep entering from outside the frame at the smaller close-up
export const ROUND_CLOSE_UP = { domus: 1.7, relloo: 1.55, magneto: 1.55, tuner: 1.55, knowly: 1.55 };

// TEMA CLARO DAS ABERTURAS
// The dark colours of the round mapped onto the light surfaces of the site: white cards on the page, ink text; the
// amber stays the amber (what is live). The ring of each sign is read from the official light logo, so it lands in ink.
// v4 (operator, 2026-10-24): the cream and sand of v3 (#faf5ea, #f3ecdd, #d4c7ab, #1c1a16, #827968, #a39883, #e2d8c3)
// are retired; each colour is the v4 role of app/lib.css (PAPÉIS DE COR): canvas --background, surface --card, chrome
// --muted, line --border, ink --foreground, secondary text --muted-foreground, quiet mark --indicator-muted.
export const LIGHT = {
  page: "#f7f7f5",
  card: "#ffffff",
  panel: "#ffffff",
  panel2: "#efefeb",
  edge: "#e5e5e1",
  ink: "#121212",
  muted: "#55565b",
  slate: "#8a8a86",
  grid: "#e5e5e1",
  dial: "#efefeb",
};

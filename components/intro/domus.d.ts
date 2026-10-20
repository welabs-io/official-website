// TIPOS DA ABERTURA PORTADA
// The contract every ported opening module exports (domus.js, relloo.js, tuner.js, knowly.js, magneto-flow.js): mount
// the opening into a 1920x1080 root that holds `.wm` (the wrapper of the light endorsed logo) and `.role` (`.bar`,
// `.word`), and draw it at any second with render(t). SETTLED is the second the closing frame is complete.
export type IntroConfig = {
  // Text of the light logo of the product (public/brands/welabs/products/<slug>-light.svg)
  logo: string;
  // Box of the logo in logo units: the round's endorsed viewBox [x, y, w, h]
  box: readonly number[];
  safe?: number;
};
export type IntroInstance = { render(t: number): void };
export declare function mount(root: HTMLElement, cfg: IntroConfig): IntroInstance;
export declare const SETTLED: number;

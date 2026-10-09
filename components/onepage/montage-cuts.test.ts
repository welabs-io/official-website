// TESTES DOS CORTES DA MONTAGEM
// Every cut of the chain montage that has a beat map (lib/film-beats.json) never starts or ends inside a scene
// transition of its film, starts at most 0.1 s before an action, and keeps its reading pauses short: a pause inside a
// cut is allowed only as reading time of a result already on screen (at most 1.6 s). Chain films have no beat map and
// are checked by eye on the contact sheet of the cuts.
import { describe, expect, it } from "vitest";
import beats from "@/lib/film-beats.json";
import montage from "@/lib/home-montage.json";
import { MONTAGE_SLIDES } from "@/lib/motion-slides";
import { flatten } from "./ring-playback";

const SLACK = 0.1;
const EPS = 1e-6;
const MAX_READING_PAUSE = 1.6;
type Pair = readonly number[];
const overlap = (a0: number, a1: number, b: Pair) =>
  Math.max(0, Math.min(a1, b[1]) - Math.max(a0, b[0]));

describe("montage cuts follow the beat map", () => {
  const films = beats.films as Record<
    string,
    {
      actions: (number | string)[][];
      holds: number[][];
      transitions: number[][];
    }
  >;
  const cuts = montage.steps
    .flatMap((step, i) =>
      step.segments.map((segment, j) => ({
        ...segment,
        label: `${i + 1}.${j + 1}`,
      })),
    )
    .filter((cut) => films[cut.film]);

  it("the cuts with a beat map are the ones of the individual films", () => {
    expect(cuts.length).toBeGreaterThanOrEqual(3);
  });

  it.each(cuts)(
    "cut $label ($film $start-$end) starts at an action and ends after one",
    (cut) => {
      const film = films[cut.film];
      const startsOnAction = film.actions.some(
        (a) =>
          cut.start >= (a[0] as number) - SLACK - EPS &&
          cut.start <= (a[1] as number),
      );
      const endsAfterAction = film.actions.some(
        (a) => cut.end >= (a[1] as number) - EPS,
      );
      expect(startsOnAction, "starts inside or just before an action").toBe(
        true,
      );
      expect(endsAfterAction, "ends after an action closes").toBe(true);
    },
  );

  it.each(cuts)(
    "cut $label has no scene transition inside and only reading pauses",
    (cut) => {
      const film = films[cut.film];
      for (const transition of film.transitions)
        expect(overlap(cut.start, cut.end, transition)).toBeLessThanOrEqual(
          EPS,
        );
      for (const hold of film.holds)
        expect(overlap(cut.start, cut.end, hold)).toBeLessThanOrEqual(
          MAX_READING_PAUSE + EPS,
        );
    },
  );

  it("every cut holds its last frame for the explicit holdAfter (2 s) before the push", () => {
    expect(montage.holdAfter).toBe(2);
    const flat = flatten(MONTAGE_SLIDES, montage.swap);
    expect(flat).toHaveLength(9);
    for (const segment of flat) {
      expect(segment.hold).toBe(montage.holdAfter);
      // The push (and its lead) happens after the hold, never inside the clip time
      expect(segment.lead).toBe(segment.transition?.duration);
    }
  });

  it("cuts whose action was still settling keep their extended end", () => {
    const end = (film: string, start: number) =>
      montage.steps
        .flatMap((s) => s.segments)
        .find((c) => c.film === film && c.start === start)?.end ?? 0;
    // "Atendida por Bruno" is fully in at 24.3; the recibo de volta is in at 30.5
    expect(
      end("crm-omnichannel-inbox-ludic2-logos-r4-s1", 19.75),
    ).toBeGreaterThanOrEqual(24.4);
    expect(
      end("welabs-chain-journey-define-logos-r6-s1", 25.3),
    ).toBeGreaterThanOrEqual(30.6);
  });

  it("the beat map has no hold shorter than the minimum", () => {
    for (const film of Object.values(films))
      for (const hold of film.holds)
        expect(hold[1] - hold[0]).toBeGreaterThanOrEqual(
          beats.rules.minHold - EPS,
        );
  });
});

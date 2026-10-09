// TESTES DOS CORTES DA MONTAGEM
// Every clip of the chain montage follows the beat map of its film (lib/film-beats.json): it starts at most 0.1 s before
// the first action of a beat, ends at most 0.1 s after that action closes, never starts inside a scene transition and
// never holds a pause (a hold overlap is only allowed within the 0.1 s slack at each end).
import { describe, expect, it } from "vitest";
import beats from "@/lib/film-beats.json";
import montage from "@/lib/home-montage.json";

const SLACK = 0.1;
const EPS = 1e-6;
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
  const clips = montage.steps.flatMap((step, i) =>
    step.segments.map((segment, j) => ({
      ...segment,
      label: `${i + 1}.${j + 1}`,
    })),
  );

  it.each(clips)(
    "clip $label ($film $start-$end) starts and ends on an action",
    (clip) => {
      const film = films[clip.film];
      expect(film, clip.film).toBeDefined();
      const startsOnAction = film.actions.some(
        (a) =>
          clip.start >= (a[0] as number) - SLACK - EPS &&
          clip.start <= (a[0] as number) + EPS,
      );
      const endsOnAction = film.actions.some(
        (a) =>
          clip.end >= (a[1] as number) - EPS &&
          clip.end <= (a[1] as number) + SLACK + EPS,
      );
      expect(startsOnAction, "starts at the first action of a beat").toBe(true);
      expect(endsOnAction, "ends right after an action closes").toBe(true);
    },
  );

  it.each(clips)(
    "clip $label has no hold and no scene transition inside",
    (clip) => {
      const film = films[clip.film];
      for (const hold of film.holds)
        expect(overlap(clip.start, clip.end, hold)).toBeLessThanOrEqual(
          SLACK + EPS,
        );
      for (const transition of film.transitions)
        expect(overlap(clip.start, clip.end, transition)).toBeLessThanOrEqual(
          EPS,
        );
    },
  );

  it("the beat map has no hold shorter than the minimum", () => {
    for (const film of Object.values(films))
      for (const hold of film.holds)
        expect(hold[1] - hold[0]).toBeGreaterThanOrEqual(
          beats.rules.minHold - EPS,
        );
  });
});

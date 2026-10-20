// TESTES DAS CENAS NATIVAS DA HOME
// The three outcomes of the story the home shows ("O que muda na operação") render on the server in their settled
// frame, use every action of their script (and only those: asking for an action the script lacks throws), carry no live
// region, no image and no video, and keep their words inside the copy rules. Shown still (MiniScene): an illustration
// hidden from assistive technology, marked so the word counters treat its text as interface.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { copyViolation } from "@/lib/content/rules";
import { SCRIPT } from "@/lib/scenes/script";
import { STORY, WINDOW_TITLES } from "@/lib/scenes/story";
import { MiniScene } from "./MiniScene";
import { SceneBody } from "./SceneBody";

const html = (i: number) =>
  renderToStaticMarkup(<SceneBody scene={SCRIPT[i]} />);

describe("scene components", () => {
  it.each(SCRIPT.map((s, i) => [s.id, i] as const))(
    "%s uses every action of its script, in the settled phase",
    (_, i) => {
      const markup = html(i);
      expect(markup).toContain('data-phase="end"');
      for (const action of SCRIPT[i].actions)
        expect(markup, action.id).toContain(`data-act="${action.id}"`);
      // Only actions of this script appear
      const used = new Set(
        [...markup.matchAll(/data-act="([a-z]+)"/g)].map((m) => m[1]),
      );
      for (const id of used)
        expect(SCRIPT[i].actions.map((a) => a.id)).toContain(id);
    },
  );

  it("draws no image in the body (only the logo in the bar), no video and no live region", () => {
    for (let i = 0; i < SCRIPT.length; i++) {
      const markup = html(i);
      expect(markup).not.toMatch(/<video|<canvas|aria-live/);
      // Every image is the product logo inside the frame bar: cut the bars out and none is left
      const withoutBars = markup.replace(
        /<div class="[^"]*" data-frame-bar="">.*?<\/b>/g,
        "",
      );
      expect(withoutBars).not.toMatch(/<img/);
      expect(markup).toMatch(
        /data-frame-bar="">.*?<img[^>]*alt=""[^>]*aria-hidden="true"/,
      );
    }
  });

  it("a scene asking for an action the script does not have fails loudly", () => {
    const scene = { ...SCRIPT[0], actions: [] };
    expect(() => renderToStaticMarkup(<SceneBody scene={scene} />)).toThrow(
      /no action/,
    );
  });

  it("every sentence of the story respects the copy rules, and no window says a word of the inside", () => {
    const strings: string[] = [];
    const walk = (value: unknown) => {
      if (typeof value === "string") strings.push(value);
      else if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === "object")
        Object.values(value).forEach(walk);
    };
    walk(STORY);
    walk(WINDOW_TITLES);
    expect(strings.length).toBeGreaterThan(30);
    for (const s of strings) expect(copyViolation(s), s).toBeNull();
    expect(strings.join(" ")).not.toMatch(/Cômodos|Funil/);
  });

  it("the outcomes show what the home says they show", () => {
    const all = SCRIPT.map((_, i) => html(i)).join(" ");
    for (const text of [
      STORY.thread,
      STORY.kb.source,
      STORY.confirm,
      "Pedido 1234",
    ])
      expect(all, text).toContain(text);
  });

  it("every scene marks exactly one key element and repeats no check mark in its text", () => {
    SCRIPT.forEach((_, i) => {
      const markup = html(i);
      expect(markup.match(/data-key=""/g), `scene ${i}`).toHaveLength(1);
      expect(markup, `scene ${i}`).not.toMatch(/✓/);
    });
  });
});

describe("still scene", () => {
  it("is an illustration hidden from assistive technology, closed by the end marker the counters read", () => {
    const markup = renderToStaticMarkup(<MiniScene id="s4" phone />);
    expect(markup).toMatch(/data-mini="s4"[^>]*aria-hidden="true"/);
    expect(markup).toContain("data-mini-end");
    expect(markup).toContain('data-phase="end"');
  });
});

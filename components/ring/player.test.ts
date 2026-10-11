// TESTES DO PLAYER
// Every player of the page is created from the same attributes and none of them has the controls attribute.
import { describe, expect, it } from "vitest";
import { playerAttributes } from "./player";

describe("player attributes", () => {
  it("autoplay and muted, never controls", () => {
    const attributes = playerAttributes("/motion/pieces/x/index.html");
    expect(attributes).toHaveProperty("autoplay");
    expect(attributes).toHaveProperty("muted");
    expect(attributes).toHaveProperty("disable-click-to-play");
    expect(attributes).not.toHaveProperty("controls");
  });
  it("a clip becomes range-start and range-end", () => {
    const attributes = playerAttributes("/x", [4, 16]);
    expect(attributes["range-start"]).toBe("4");
    expect(attributes["range-end"]).toBe("16");
    expect(attributes).not.toHaveProperty("controls");
  });
  it("a preloaded player has no autoplay and still no controls", () => {
    const attributes = playerAttributes("/x", [4, 16], false);
    expect(attributes).not.toHaveProperty("autoplay");
    expect(attributes).toHaveProperty("muted");
    expect(attributes).not.toHaveProperty("controls");
  });
  it("loops a single qualified range without changing multi-segment playback", () => {
    expect(playerAttributes("/x", [21.5, 28.8], true, 1, true)).toHaveProperty(
      "loop",
    );
    expect(playerAttributes("/x", [21.5, 28.8])).not.toHaveProperty("loop");
  });
});

// TESTES DO PLAYER
// Every player of the page is created from the same attributes and none of them has the controls attribute.
import { describe, expect, it } from "vitest";
import { SEQUENCE_OPTIONS, playerAttributes } from "./player";

describe("player attributes", () => {
  it("autoplay and muted, never controls", () => {
    const attributes = playerAttributes("/motion/pieces/x/index.html");
    expect(attributes).toHaveProperty("autoplay");
    expect(attributes).toHaveProperty("muted");
    expect(attributes).not.toHaveProperty("controls");
  });
  it("a clip becomes range-start and range-end", () => {
    const attributes = playerAttributes("/x", [4, 16]);
    expect(attributes["range-start"]).toBe("4");
    expect(attributes["range-end"]).toBe("16");
    expect(attributes).not.toHaveProperty("controls");
  });
  it("the sequence player is mounted without controls", () => {
    expect(SEQUENCE_OPTIONS.controls).toBe(false);
  });
});

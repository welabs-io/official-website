// TESTES DE NAVEGAÇÃO E CONTINUIDADE
// Exercise the real ring controller and Playback with DOM elements and a controlled browser clock.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PRODUCTS } from "@/lib/products";
import {
  MONTAGE_SLIDES,
  PRODUCT_SLIDES,
  heroSlides,
} from "@/lib/motion-slides";
import {
  Playback,
  READY_TIMEOUT_MS,
  flatten,
  type FlatSegment,
} from "./ring-playback";
import { run } from "./ring-run";

// AMBIENTE CONTROLADO DO NAVEGADOR
class TestElement extends EventTarget {
  dataset: Record<string, string> = {};
  attributes = new Map<string, string>();
  children: TestElement[] = [];
  parent: TestElement | null = null;
  hidden = false;
  textContent = "";
  id = "";
  style = {
    cssText: "",
    opacity: "",
    transitionDuration: "",
    transition: "",
    transform: "",
    setProperty: vi.fn(),
  };

  constructor(public tagName = "div") {
    super();
  }
  appendChild(child: TestElement) {
    child.parent = this;
    this.children.push(child);
    return child;
  }
  remove() {
    if (this.parent)
      this.parent.children = this.parent.children.filter(
        (child) => child !== this,
      );
    this.parent = null;
  }
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  removeAttribute(name: string) {
    this.attributes.delete(name);
  }
  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }
  getBoundingClientRect() {
    return { width: 620, height: 349 };
  }
  focus = vi.fn();
  contains(element: TestElement): boolean {
    return (
      element === this || this.children.some((child) => child.contains(element))
    );
  }
  matches(selector: string): boolean {
    return selector.split(",").some((part) => {
      const value = part.trim();
      const attribute = value.match(/^\[data-([a-z-]+)\]$/);
      if (attribute)
        return (
          attribute[1].replace(/-([a-z])/g, (_, letter: string) =>
            letter.toUpperCase(),
          ) in this.dataset
        );
      return value === this.tagName;
    });
  }
  closest(selector: string): TestElement | null {
    return this.matches(selector)
      ? this
      : (this.parent?.closest(selector) ?? null);
  }
  querySelectorAll(selector: string): TestElement[] {
    return this.children.flatMap((child) => [
      ...(child.matches(selector) ? [child] : []),
      ...child.querySelectorAll(selector),
    ]);
  }
  querySelector(selector: string): TestElement | null {
    return this.querySelectorAll(selector)[0] ?? null;
  }
}

class TestPlayer extends TestElement {
  currentTime = 0;
  paused = true;
  playbackRate = 1;
  play = vi.fn(() => {
    this.paused = false;
  });
  pause = vi.fn(() => {
    this.paused = true;
  });
  seek = vi.fn((time: number) => {
    this.currentTime = time;
  });
}

const playerMock = vi.hoisted(() => ({
  createPlayer: vi.fn(),
  ensurePlayer: vi.fn(),
}));
vi.mock("./player", () => ({
  createPlayer: playerMock.createPlayer,
  ensurePlayer: playerMock.ensurePlayer,
  hideLoader: () => {},
  piece: (id: string) => id,
}));

let players: TestPlayer[];
const element = (data?: [string, string], tag?: string) => {
  const node = new TestElement(tag);
  if (data) node.dataset[data[0]] = data[1];
  return node;
};
const emit = (
  host: TestElement,
  type: string,
  fields: Record<string, unknown> = {},
) => {
  const event = new Event(type, { cancelable: true });
  for (const [name, value] of Object.entries(fields))
    Object.defineProperty(event, name, { value });
  host.dispatchEvent(event);
  return event;
};
const ring = () => {
  const root = element(["navigation", "true"]);
  root.id = "products-ring";
  const stage = root.appendChild(element(["ring", "products"]));
  const selectors: TestElement[] = [];
  const captions: TestElement[] = [];
  const tiles: TestElement[] = [];
  PRODUCTS.forEach((product, index) => {
    const tile = stage.appendChild(element(["tile", ""]));
    tile.appendChild(element(["layers", ""]));
    tile.appendChild(element(["select", String(index)], "button"));
    tiles.push(tile);
    const logo = root.appendChild(element(["slug", product.slug]));
    selectors.push(
      logo.appendChild(element(["product", product.slug], "button")),
    );
    captions.push(root.appendChild(element(["caption", product.slug])));
  });
  const previous = root.appendChild(element(["step", "-1"], "button"));
  const next = root.appendChild(element(["step", "1"], "button"));
  const announcement = root.appendChild(element(["announcement", ""]));
  return {
    root,
    stage,
    tiles,
    selectors,
    captions,
    previous,
    next,
    announcement,
  };
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
  players = [];
  playerMock.createPlayer
    .mockReset()
    .mockImplementation((_src, range: [number, number], autoplay: boolean) => {
      const player = new TestPlayer();
      player.currentTime = range[0];
      player.paused = !autoplay;
      players.push(player);
      return player;
    });
  playerMock.ensurePlayer.mockReset().mockResolvedValue(undefined);
  vi.stubGlobal("Element", TestElement);
  vi.stubGlobal("document", {
    createElement: (tag: string) => new TestElement(tag),
  });
  vi.stubGlobal("window", {
    setInterval,
    clearInterval,
    setTimeout,
    clearTimeout,
    dispatchEvent: vi.fn(),
  });
  vi.stubGlobal(
    "CustomEvent",
    class extends Event {
      detail: unknown;
      constructor(type: string, options: { detail: unknown }) {
        super(type);
        this.detail = options.detail;
      }
    },
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

// NAVEGAÇÃO INDEPENDENTE DO PLAYER
describe("content navigation", () => {
  it("forms the identity once and preserves the selected logo for reading without loading another product", async () => {
    const { root, tiles } = ring();
    root.dataset.rotate = "false";
    const controller = run(root as unknown as HTMLElement, "products");
    controller.play();
    await Promise.resolve();
    players.forEach((player) => emit(player, "ready"));
    expect(playerMock.createPlayer.mock.calls[0][4]).toBe(false);
    expect(players).toHaveLength(1);
    players[0].currentTime = PRODUCT_SLIDES[0].segments[0].range[1] - 0.02;
    vi.advanceTimersByTime(1200);
    expect(tiles[0].dataset.phase).toBe("intro");
    expect(players[0].paused).toBe(true);
    vi.advanceTimersByTime(12000);
    expect(root.dataset.active).toBe("0");
    expect(root.dataset.playback).toBe("films");
    expect(players).toHaveLength(1);
    controller.pause();
    controller.play();
    expect(players[0].paused).toBe(true);
    controller.select(0);
    await Promise.resolve();
    expect(players).toHaveLength(2);
    expect(players[1].currentTime).toBe(0);
    controller.destroy();
  });

  it("updates the shared tile from complete identity to clean film before an intra-slide early return", async () => {
    const { root, stage, tiles } = ring();
    stage.children = stage.children.slice(0, 1);
    const controller = run(root as unknown as HTMLElement, "hero", "domus");
    controller.play();
    await Promise.resolve();
    players.forEach((player) => emit(player, "ready"));
    expect(tiles[0].dataset.phase).toBe("intro");
    expect(players[0].parent!.dataset.motionPhase).toBe("intro");
    players[0].currentTime = heroSlides("domus")[0].segments[0].range[1] - 0.02;
    vi.advanceTimersByTime(1200);
    expect(root.dataset.active).toBe("0");
    expect(tiles[0].dataset.phase).toBe("film");
    expect(players[1].parent!.dataset.motionPhase).toBe("film");
    controller.destroy();
  });

  it("enables native range looping for a single home preview", async () => {
    const { root, stage, tiles } = ring();
    stage.children = stage.children.slice(0, 1);
    root.dataset.navigation = "false";
    root.dataset.presentation = "single";
    const controller = run(root as unknown as HTMLElement, "preview", "domus");
    controller.play();
    await Promise.resolve();
    expect(tiles[0].dataset.phase).toBe("film");
    expect(playerMock.createPlayer.mock.calls[0][4]).toBe(true);
    expect(playerMock.createPlayer.mock.calls[0][1]).toEqual([14.1, 20.8]);
    controller.destroy();
  });

  it("keeps the chain in one visible pane while its narrative and product-map event advance", async () => {
    const root = element(["navigation", "false"]);
    root.id = "chain-ring";
    root.dataset.presentation = "single";
    const stage = root.appendChild(element(["ring", "chain"]));
    const cuts = flatten(MONTAGE_SLIDES);
    const tiles = cuts.map((_cut, index) => {
      const tile = stage.appendChild(element(["tile", ""]));
      const poster = tile.appendChild(element(["poster", ""], "img"));
      poster.setAttribute("src", `cover-${index}`);
      tile.appendChild(element(["layers", ""]));
      return tile;
    });
    const controller = run(root as unknown as HTMLElement, "chain");
    controller.play();
    await Promise.resolve();
    players.forEach((player) => emit(player, "ready"));
    players[0].currentTime = cuts[0].range[1] - 0.02;
    vi.advanceTimersByTime(1200);
    expect(root.dataset.active).toBe("1");
    expect(tiles[0].dataset.pos).toBe("0");
    expect(tiles[1].dataset.pos).toBe("1");
    expect(tiles[0].querySelector("[data-poster]")!.getAttribute("src")).toBe(
      "cover-1",
    );
    expect(
      tiles
        .slice(1)
        .every(
          (tile) => tile.querySelector("[data-layers]")!.children.length === 0,
        ),
    ).toBe(true);
    const events = vi
      .mocked(window.dispatchEvent)
      .mock.calls.map(([event]) => (event as CustomEvent).detail);
    expect(events.at(-1)).toMatchObject({
      ring: "chain-ring",
      fromIndex: 0,
      toIndex: 1,
      products: MONTAGE_SLIDES.flatMap((slide) => slide.segments)[1].products,
    });
    controller.destroy();
  });

  it("selects product logos, captions and neighbours without starting a player", () => {
    const { root, tiles, selectors, captions, announcement } = ring();
    const controller = run(root as unknown as HTMLElement, "products");
    emit(root, "click", { target: selectors[3] });
    expect(root.dataset.active).toBe("3");
    expect(tiles[3].dataset.pos).toBe("0");
    expect(selectors[3].attributes.get("aria-pressed")).toBe("true");
    expect(captions.map((caption) => caption.hidden)).toEqual([
      true,
      true,
      true,
      false,
      true,
    ]);
    expect(announcement.textContent).toContain(PRODUCTS[3].line);
    emit(root, "click", { target: tiles[4].querySelector("button") });
    expect(root.dataset.active).toBe("4");
    expect(playerMock.ensurePlayer).not.toHaveBeenCalled();
    controller.destroy();
  });

  it("wraps both ways through arrows and keyboard, and ignores editable targets", () => {
    const { root, previous, next } = ring();
    const controller = run(root as unknown as HTMLElement, "products");
    emit(root, "click", { target: previous });
    expect(root.dataset.active).toBe("4");
    emit(root, "click", { target: next });
    expect(root.dataset.active).toBe("0");
    const right = emit(root, "keydown", { key: "ArrowRight", target: root });
    expect(right.defaultPrevented).toBe(true);
    expect(root.dataset.active).toBe("1");
    emit(root, "keydown", { key: "ArrowLeft", target: root });
    expect(root.dataset.active).toBe("0");
    emit(root, "keydown", {
      key: "ArrowRight",
      target: element(undefined, "input"),
    });
    expect(root.dataset.active).toBe("0");
    controller.destroy();
    emit(root, "click", { target: next });
    expect(root.dataset.active).toBe("0");
  });

  it("accepts horizontal touch swipes, keeps vertical scrolling and suppresses the synthetic click", () => {
    const { root, stage, next } = ring();
    const controller = run(root as unknown as HTMLElement, "products");
    emit(stage, "pointerdown", {
      pointerType: "touch",
      clientX: 200,
      clientY: 100,
    });
    emit(stage, "pointerup", { clientX: 195, clientY: 210 });
    expect(root.dataset.active).toBe("0");
    emit(stage, "pointerdown", {
      pointerType: "touch",
      clientX: 200,
      clientY: 100,
    });
    emit(stage, "pointerup", { clientX: 120, clientY: 110 });
    expect(root.dataset.active).toBe("1");
    emit(root, "click", { target: next });
    expect(root.dataset.active).toBe("1");
    controller.destroy();
  });

  it("retains functional navigation and cover rotation after the player script fails", async () => {
    const { root, selectors } = ring();
    playerMock.ensurePlayer.mockRejectedValueOnce(new Error("blocked"));
    const controller = run(root as unknown as HTMLElement, "products");
    controller.play();
    await Promise.resolve();
    expect(root.dataset.playback).toBe("covers");
    emit(root, "click", { target: selectors[2] });
    expect(root.dataset.active).toBe("2");
    vi.advanceTimersByTime(4400);
    expect(root.dataset.active).toBe("3");
    controller.pause();
    vi.advanceTimersByTime(10000);
    expect(root.dataset.active).toBe("3");
    controller.destroy();
  });
});

// FOCO NOS LINKS DE DETALHE
describe("detail focus", () => {
  it("keeps a focused caption visible until blur, then resumes while a persistent selector has focus", async () => {
    const { root, captions, selectors } = ring();
    const link = captions[0].appendChild(element(undefined, "a"));
    playerMock.ensurePlayer.mockRejectedValueOnce(new Error("blocked"));
    const controller = run(root as unknown as HTMLElement, "products");
    controller.play();
    await Promise.resolve();
    emit(root, "focusin", { target: link });
    vi.advanceTimersByTime(15000);
    expect(root.dataset.active).toBe("0");
    expect(captions[0].hidden).toBe(false);
    emit(root, "focusout", { target: link, relatedTarget: selectors[0] });
    emit(root, "focusin", { target: selectors[0] });
    vi.advanceTimersByTime(4400);
    expect(root.dataset.active).toBe("1");
    controller.destroy();
  });

  it("continues the selected film when a persistent logo button receives focus", async () => {
    const { root, selectors } = ring();
    const controller = run(root as unknown as HTMLElement, "products");
    controller.play();
    await Promise.resolve();
    emit(players[0], "ready");
    emit(root, "focusin", { target: selectors[3] });
    expect(players[0].pause).not.toHaveBeenCalled();
    emit(root, "click", { target: selectors[3] });
    await Promise.resolve();
    expect(root.dataset.active).toBe("3");
    expect(players[2].paused).toBe(false);
    controller.destroy();
  });
});

// LIMITES DE ESPERA E RETOMADA
const segments: FlatSegment[] = [0, 1].map((slide) => ({
  slide,
  id: `film-${slide}`,
  range: [0, 4],
  rate: 1,
  lead: 0.7,
  hold: 0,
}));
const playback = (onUnavailable = vi.fn()) => {
  const hosts = [element(), element()];
  const onSwap = vi.fn();
  const instance = new Playback({
    flat: segments,
    layers: () => hosts as unknown as HTMLElement[],
    start: 0,
    single: true,
    tiles: true,
    tileBySlide: true,
    onSlide: () => {},
    onSwap,
    onUnavailable,
  });
  instance.start();
  return { instance, hosts, onSwap, onUnavailable };
};
describe("runtime continuity", () => {
  it("uses the authored horizontal and vertical pushes in a shared two-cut frame", () => {
    const host = element();
    const onSwap = vi.fn();
    const cuts: FlatSegment[] = segments.map((segment, index) => ({
      ...segment,
      lead: index === 0 ? 0.7 : 0.3,
      transition: {
        type: index === 0 ? "push-left" : "push-up",
        duration: index === 0 ? 0.7 : 0.3,
      },
    }));
    const instance = new Playback({
      flat: cuts,
      layers: () => [host, host] as unknown as HTMLElement[],
      start: 0,
      single: true,
      tiles: false,
      onSlide: () => {},
      onSwap,
    });
    instance.start();
    players.forEach((player) => emit(player, "ready"));
    vi.advanceTimersByTime(160);
    const firstLayer = players[0].parent!;
    const secondLayer = players[1].parent!;
    players[0].currentTime = 3.3;
    vi.advanceTimersByTime(160);
    expect(onSwap).toHaveBeenCalledOnce();
    expect(firstLayer.style.transform).toBe("translate(-100%,0)");
    expect(secondLayer.style.transform).toBe("translate(0,0)");
    expect(secondLayer.style.transition).toContain("0.7s");
    vi.advanceTimersByTime(900);
    expect(players).toHaveLength(3);
    emit(players[2], "ready");
    vi.advanceTimersByTime(160);
    players[1].currentTime = 3.8;
    vi.advanceTimersByTime(160);
    expect(onSwap).toHaveBeenCalledTimes(2);
    expect(secondLayer.style.transform).toBe("translate(0,-100%)");
    expect(players[2].parent!.style.transform).toBe("translate(0,0)");
    expect(players[2].parent!.style.transition).toContain("0.3s");
    instance.destroy();
    expect(host.children).toHaveLength(0);
  });

  it("never hands off to an unready frame and bounds the wait at eight seconds", () => {
    const { instance, onSwap, onUnavailable, hosts } = playback();
    emit(players[0], "ready");
    vi.advanceTimersByTime(160);
    players[0].currentTime = 3.9;
    vi.advanceTimersByTime(40);
    expect(players[0].paused).toBe(true);
    expect(onSwap).not.toHaveBeenCalled();
    vi.advanceTimersByTime(READY_TIMEOUT_MS - 200);
    expect(onUnavailable).toHaveBeenCalledExactlyOnceWith("ready");
    instance.destroy();
    expect(hosts.map((host) => host.children.length)).toEqual([0, 0]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("detects a ready composition whose time never advances", () => {
    const { instance, onUnavailable } = playback();
    players.forEach((player) => emit(player, "ready"));
    vi.advanceTimersByTime(READY_TIMEOUT_MS);
    expect(onUnavailable).toHaveBeenCalledExactlyOnceWith("stalled");
    instance.destroy();
  });

  it("suspends and resumes the same active composition and excludes hidden time from readiness deadlines", () => {
    const { instance, onUnavailable } = playback();
    emit(players[0], "ready");
    players[0].currentTime = 2;
    vi.advanceTimersByTime(40);
    instance.pause();
    expect(players[0].paused).toBe(true);
    vi.advanceTimersByTime(30000);
    instance.resume();
    expect(players[0].currentTime).toBe(2);
    expect(players[0].play).toHaveBeenCalledOnce();
    expect(players).toHaveLength(2);
    vi.advanceTimersByTime(40);
    expect(onUnavailable).not.toHaveBeenCalled();
    instance.destroy();
  });
});

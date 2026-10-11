// TESTES DA PRIMEIRA INTENÇÃO
// Exercise the interval between hydration and asynchronous controller readiness without a player or viewport callback.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bootstrapNavigation } from "./navigation-bootstrap";

class TestNode extends EventTarget {
  dataset: Record<string, string> = {};
  children: TestNode[] = [];
  constructor(public tag = "button") {
    super();
  }
  // Node's boolean capture-removal overload differs from browsers; normalize the fixture only.
  override removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean,
  ) {
    super.removeEventListener(
      type,
      callback,
      typeof options === "boolean" ? { capture: options } : options,
    );
  }
  closest(selector: string): TestNode | null {
    if (selector.includes(this.tag)) return this;
    for (const key of ["step", "select", "product"])
      if (key in this.dataset && selector.includes(`[data-${key}]`))
        return this;
    return null;
  }
  contains(node: TestNode) {
    return node === this || this.children.includes(node);
  }
  querySelectorAll(selector: string): TestNode[] {
    return this.children.filter((node) =>
      selector.includes("[data-tile]")
        ? "tile" in node.dataset
        : "product" in node.dataset,
    );
  }
}

const fixture = () => {
  const root = new TestNode("div");
  root.dataset.navigation = "true";
  const selectors = ["domus", "relloo", "magneto", "tuner", "knowly"].map(
    (slug) => {
      const node = new TestNode();
      node.dataset.product = slug;
      return node;
    },
  );
  const tiles = selectors.map(() => {
    const node = new TestNode();
    node.dataset.tile = "";
    return node;
  });
  root.children = [...selectors, ...tiles];
  const emit = (type: string, target: TestNode, key?: string) => {
    const event = new Event(type, { cancelable: true });
    Object.defineProperty(event, "target", { value: target });
    if (key) Object.defineProperty(event, "key", { value: key });
    root.dispatchEvent(event);
    return event;
  };
  const ready = {
    play: vi.fn(),
    pause: vi.fn(),
    destroy: vi.fn(),
    select: vi.fn(),
  };
  const request = vi.fn();
  const navigation = bootstrapNavigation(
    root as unknown as HTMLElement,
    request,
  );
  return { root, selectors, emit, ready, request, navigation };
};

beforeEach(() => vi.stubGlobal("Element", TestNode));
afterEach(() => vi.unstubAllGlobals());

describe("initial content intention", () => {
  it("replays the first product click after hydration even while the chunk is pending", () => {
    const { selectors, emit, ready, request, navigation } = fixture();
    emit("click", selectors[1]);
    expect(request).toHaveBeenCalledOnce();
    expect(ready.select).not.toHaveBeenCalled();
    navigation.flush(ready);
    expect(ready.select).toHaveBeenCalledExactlyOnceWith(1);
    expect(ready.play).not.toHaveBeenCalled();
    navigation.destroy();
  });
  it("preserves a rapid keyboard sequence and prevents unintended page scrolling", () => {
    const { root, emit, ready, navigation } = fixture();
    const first = emit("keydown", root, "ArrowRight");
    emit("keydown", root, "ArrowRight");
    emit("keydown", root, "ArrowLeft");
    expect(first.defaultPrevented).toBe(true);
    navigation.flush(ready);
    expect(ready.select).toHaveBeenCalledExactlyOnceWith(1);
    navigation.destroy();
  });
  it("passes normal events to the ready controller and releases pending listeners on unmount", () => {
    const { selectors, emit, ready, request, navigation } = fixture();
    navigation.flush(ready);
    emit("click", selectors[3]);
    expect(request).not.toHaveBeenCalled();
    navigation.destroy();
    emit("click", selectors[1]);
    expect(request).not.toHaveBeenCalled();
  });
});

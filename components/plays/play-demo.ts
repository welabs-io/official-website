// DEMONSTRAÇÃO SOZINHA DAS INTERAÇÕES
// v3 (F3, plano.md 2.4 and 4.3; the motion contract of .claude/skills/welabs-site-motion): a play and the message of the
// home no longer wait for a click ("Nada ainda.", the empty outline of the Domus). While one is on screen it drives
// itself through its demo, the native controls listed in `data-demo` (PlayForm in parts.tsx, HomeMessage in
// components/template/Home.tsx) one after the other: each one is checked and announced with a `change` event (so
// play-run.ts orders the Relloo and clears the Magneto as it does for a visitor), the next one waits until the beats of
// the state have played (the CSS animations of the block) plus a short gap; after the last one the whole result holds
// about a second, the block resets (a form resets, any other block unchecks its controls) and the demo starts again.
// A gesture takes over: the first pointer or key event of the visitor stops the demo and clears it, so the visitor's own
// choice is what plays; every choice of the visitor plays its beats, holds about a second, and then the block resets and
// the demo resumes by itself. Nothing runs off screen, and under reduced motion the block shows its final frame (the
// whole demo applied at once, no animation). The record of a play is announced to assistive technology only while the
// visitor drives it, never during the demo.
const FIRST = 500;
const GAP = 500;
const HOLD = 1100;
// Longest wait for the beats of a state (the send of the message is the longest, 6.7 s), a guard against an animation
// that never finishes
const BEATS_MAX = 8000;

const wait = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));

// The beats a state started: every running animation of the block, then nothing
async function beatsOf(root: HTMLElement) {
  // One frame, so the animations of the state just reached exist
  await new Promise<void>((done) => requestAnimationFrame(() => done()));
  const running = root
    .getAnimations({ subtree: true })
    .filter((a) => a.playState === "running")
    .map((a) => a.finished.catch(() => undefined));
  await Promise.race([Promise.all(running), wait(BEATS_MAX)]);
}

function drive(root: HTMLElement, reduced: MediaQueryList) {
  const ids = (root.dataset.demo ?? "").split(/\s+/).filter(Boolean);
  const log = root.querySelector<HTMLElement>("[aria-live]");
  let mode: "demo" | "user" = "demo";
  let visible = false;
  // A change the demo itself announces, not one of the visitor
  let driving = false;
  // Every new action takes a new token: a continuation that finds another token stops
  let token = 0;

  const announce = (on: boolean) =>
    log?.setAttribute("aria-live", on ? "polite" : "off");

  const input = (id: string) =>
    root.querySelector<HTMLInputElement>(`#${CSS.escape(id)}`) ??
    document.getElementById(id);

  const set = (id: string, checked: boolean) => {
    const el = input(id);
    if (!(el instanceof HTMLInputElement) || el.checked === checked) return;
    el.checked = checked;
    driving = true;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    driving = false;
  };

  const reset = () => {
    if (root instanceof HTMLFormElement) root.reset();
    else ids.forEach((id) => set(id, false));
  };

  // The demo from the first frame: reset, then each control after the beats of the one before
  const demo = async () => {
    const mine = ++token;
    mode = "demo";
    announce(false);
    reset();
    if (reduced.matches) {
      ids.forEach((id) => set(id, true));
      return;
    }
    await wait(FIRST);
    for (const id of ids) {
      if (mine !== token) return;
      set(id, true);
      await beatsOf(root);
      await wait(GAP);
    }
    if (mine !== token) return;
    await wait(HOLD - GAP);
    if (mine === token && visible) demo();
  };

  // After a choice of the visitor: its beats, the hold, then the demo again
  const giveBack = async (beats: boolean) => {
    const mine = ++token;
    if (beats) await beatsOf(root);
    await wait(HOLD);
    if (mine === token && visible) demo();
  };

  const onGesture = (event: Event) => {
    if (event instanceof KeyboardEvent && event.key === "Tab") return;
    if (mode === "demo") {
      mode = "user";
      announce(true);
      reset();
    }
    giveBack(false);
  };
  const onChange = () => {
    if (!driving && mode === "user") giveBack(true);
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      // Half of the block, or half of the window when the block is taller than it (a phone)
      const need =
        Math.min(entry.boundingClientRect.height, window.innerHeight) * 0.5;
      const now = entry.isIntersecting && entry.intersectionRect.height >= need;
      if (now === visible) return;
      visible = now;
      if (visible) demo();
      else token++;
    },
    { threshold: Array.from({ length: 11 }, (_, i) => i / 10) },
  );
  io.observe(root);
  root.addEventListener("pointerdown", onGesture, true);
  root.addEventListener("keydown", onGesture, true);
  root.addEventListener("change", onChange);
  const onMotion = () => visible && demo();
  reduced.addEventListener("change", onMotion);
  return () => {
    token++;
    io.disconnect();
    root.removeEventListener("pointerdown", onGesture, true);
    root.removeEventListener("keydown", onGesture, true);
    root.removeEventListener("change", onChange);
    reduced.removeEventListener("change", onMotion);
  };
}

// Every block with a demo, on the page now and on every route that comes later (the slot of a product changes)
export function installDemos() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const stops = new Map<HTMLElement, () => void>();
  const scan = () => {
    document.querySelectorAll<HTMLElement>("[data-demo]").forEach((root) => {
      if (!stops.has(root)) stops.set(root, drive(root, reduced));
    });
    for (const [root, stop] of stops)
      if (!root.isConnected) {
        stop();
        stops.delete(root);
      }
  };
  scan();
  const mo = new MutationObserver(scan);
  mo.observe(document.body, { childList: true, subtree: true });
  return () => {
    mo.disconnect();
    stops.forEach((stop) => stop());
    stops.clear();
  };
}

"use client";
// KIT DE CENAS: COMPONENTE E HOOK
// One component owns the continuity of every scene: it reads visibility and reduced motion from the lib's hooks,
// connects the clock (timeline.ts) only while the scene is on screen and motion is allowed, and hands the scene a
// `scene` object to render from. The scene itself never touches a timer, an observer or a media query.
// The bridge clock -> React is useSyncExternalStore: its `subscribe` changes identity with `active`, so React
// disconnects the clock when the scene leaves the screen and reconnects it when it comes back (no useEffect).
// The frame is the lib's Card with a local chrome bar (the lib's DeviceFrame paints red/yellow/green window dots,
// off the brand: dist/ui/index.js DeviceFrame). Its height follows the content of the settled frame: a hidden copy of
// the last step sits in the same grid cell as the live one, so the window never jumps while steps come and go.
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/lib/ui";
import { useInView, useReducedMotion } from "@/components/lib/scene";
import {
  SceneTimeline,
  sceneView,
  type SceneSnapshot,
  type SceneStep,
} from "./timeline";
import k from "./scene-kit.module.css";

export type { SceneStep } from "./timeline";

// The three easing tokens of the site (components/onepage/shell.module.css, app/lib.css), for style props and motion
export const SCENE_EASE = {
  out: "var(--ease-out)",
  inOut: "var(--ease-in-out)",
  spring: "var(--ease-spring)",
} as const;

export type SceneApi = SceneSnapshot & {
  // The scene is at this step or past it
  reached: (id: string) => boolean;
  // The scene is exactly at this step
  is: (id: string) => boolean;
  // A human event: pauses autoplay and plays from `id` (bind it to the onClick of a scene control)
  take: (id?: string) => void;
  // Back to the first step under autoplay
  restart: () => void;
  // The clock runs (on screen and motion allowed)
  active: boolean;
  reduced: boolean;
  // The hidden copy that sizes the window (a scene may skip ids or handlers there)
  ghost: boolean;
};

const noop = () => {};

const SceneContext = createContext<SceneApi | null>(null);

// The scene object of the nearest Scene, for controls rendered deep inside it
export function useSceneApi(): SceneApi {
  const api = use(SceneContext);
  if (!api) throw new Error("useSceneApi must be called inside <Scene>");
  return api;
}

// A stable clock for a list of steps (create it outside Scene when a toolbar must drive it, as the lab does)
export function useSceneTimeline(steps: readonly SceneStep[]): SceneTimeline {
  const [timeline] = useState(() => new SceneTimeline(steps));
  return timeline;
}

const apiOf = (
  timeline: SceneTimeline,
  view: SceneSnapshot,
  flags: { active: boolean; reduced: boolean; ghost: boolean },
): SceneApi => ({
  ...view,
  ...flags,
  reached: (id) => view.index >= timeline.indexOf(id),
  is: (id) => view.id === id,
  take: flags.ghost ? noop : timeline.take,
  restart: flags.ghost ? noop : timeline.restart,
});

type SceneProps = {
  // Name of the scene (data-scene, the lab's address)
  id: string;
  // Accessible name of the window
  label: string;
  // Chrome bar: the product and the screen of the product (a breadcrumb), and the scene's own tools at its end
  product: string;
  title: string;
  tools?: ReactNode;
  // Either the steps, or a clock made with useSceneTimeline
  steps?: readonly SceneStep[];
  timeline?: SceneTimeline;
  children: (scene: SceneApi) => ReactNode;
  className?: string;
};

export function Scene({
  id,
  label,
  product,
  title,
  steps,
  timeline: external,
  children,
  className,
  tools,
}: SceneProps) {
  const [own] = useState(() => external ?? new SceneTimeline(steps ?? []));
  const timeline = external ?? own;
  const reduced = useReducedMotion();
  const [inView, ref] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const active = inView && !reduced;

  // Connected only while active: leaving the screen or asking for reduced motion clears every timer of the clock
  const subscribe = useCallback(
    (notify: () => void) => (active ? timeline.connect(notify) : noop),
    [timeline, active],
  );
  const live = useSyncExternalStore(
    subscribe,
    timeline.getSnapshot,
    timeline.getFinalSnapshot,
  );
  const view = reduced ? sceneView(timeline, true) : live;

  const api = useMemo(
    () => apiOf(timeline, view, { active, reduced, ghost: false }),
    [timeline, view, active, reduced],
  );
  const ghost = useMemo(
    () =>
      apiOf(timeline, timeline.getFinalSnapshot(), {
        active: false,
        reduced,
        ghost: true,
      }),
    [timeline, reduced],
  );

  return (
    <Card
      flush
      data-theme="welabs"
      className={`${k.frame} ${className ?? ""}`}
      role="figure"
      aria-label={label}
    >
      <div className={k.chrome}>
        <span className={k.product}>{product}</span>
        <ChevronRight className={k.chevron} strokeWidth={1.75} aria-hidden="true" />
        <span className={k.title}>{title}</span>
        {tools ? <span className={k.tools}>{tools}</span> : null}
      </div>
      <div
        ref={ref}
        className={k.stage}
        data-scene={id}
        data-step={view.id}
        data-phase={view.mode}
        data-on={active}
        data-reduced={reduced}
      >
        <div className={k.ghost} aria-hidden="true" inert>
          {children(ghost)}
        </div>
        <div className={k.live}>
          <SceneContext value={api}>{children(api)}</SceneContext>
        </div>
      </div>
    </Card>
  );
}

"use client";
// A CADEIA LIGADA À ROLAGEM
// The chain of the v4 home (brief-v4, artboard Chain, 2026-10-23): one message crosses the five products and settles as
// the order in the Domus while the page scrolls. The scroll only walks the steps (the band is never pinned, the scroll
// is never taken over, there is no progress bar): over ~0.9 of a viewport the stations light in turn, the trace already
// run turns ink, the one the message is on now is amber with its bead, the rest stay grey; the caption of the live
// station types under them; scrolling back undoes it. The step is read from the stage's place in the window in a ref
// callback (passive scroll and resize, one frame at a time, no effect). The server draws the settled order (no script,
// a still page). On a phone the stations stack and the traces drop from one to the next (the Connector draws only the
// route the layout allows).
import { Check } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "@/components/lib/ui";
import {
  Connector,
  type ConnectorState,
} from "@/components/scene-kit/Connector";
import { TypeIn, typeDuration } from "@/components/scene-kit/TypeIn";
import { CHAIN_ORDER, chainRecord, chainStations } from "@/lib/content";
import { useMessages } from "@/lib/i18n/provider";
import { productAlt, productBySlug, productLogo } from "@/lib/products";
import c from "./chain.module.css";

// The step after the last station: the order settled in the Domus, its record open
export const CHAIN_SETTLED = CHAIN_ORDER.length;
// Where the walk starts (the stage's top at this share of the window) and how much scroll it takes (share of the window)
const START = 0.7;
const SPAN = 0.9;

// The step the scroll is at, from the stage's place in the window
export function chainStep(top: number, viewport: number) {
  const p = (viewport * START - top) / (viewport * SPAN);
  if (p < 0) return 0;
  if (p >= 1) return CHAIN_SETTLED;
  return Math.min(CHAIN_ORDER.length - 1, Math.floor(p * CHAIN_ORDER.length));
}

// State of the trace from station i to station i + 1 at a step
const traceState = (i: number, step: number): ConnectorState =>
  i < step - 1 ? "active" : i === step - 1 ? "live" : "rest";

export function Chain() {
  const m = useMessages();
  const STATIONS = chainStations(m);
  const record = chainRecord(m);
  const [step, setStep] = useState<number>(CHAIN_SETTLED);

  const ref = useCallback((stage: HTMLDivElement | null) => {
    if (!stage) return undefined;
    let frame = 0;
    const measure = () => {
      frame = 0;
      setStep(chainStep(stage.getBoundingClientRect().top, window.innerHeight));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const settled = step === CHAIN_SETTLED;
  const current = STATIONS[Math.min(step, STATIONS.length - 1)];
  const lines = current.caption;

  return (
    <>
      <div
        ref={ref}
        className={c.stage}
        data-chain=""
        data-step={step}
        data-mini="chain"
      >
        <ol className={c.stations}>
          {STATIONS.map((s, i) => {
            const state = i < step ? "done" : i === step ? "live" : "next";
            return (
              <li
                key={s.product}
                className={c.station}
                data-station={s.product}
                data-state={state}
                data-focus={
                  i === step ||
                  (settled && i === STATIONS.length - 1) ||
                  undefined
                }
              >
                <span className={c.stationTop}>
                  <img
                    src={productLogo(s.product, "light", "row", 30)}
                    alt={productAlt(s.product, "row")}
                    width={1005}
                    height={550}
                    className={c.stationLogo}
                  />
                  <span className={c.status} aria-hidden="true">
                    {state === "done" ? <Check /> : null}
                  </span>
                </span>
                <span className={c.stationText}>
                  <span className={c.stationLabel}>{s.label}</span>
                  <span className={c.stationSub}>
                    {state === "done"
                      ? s.done
                      : state === "live"
                        ? s.now
                        : s.next}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
        {STATIONS.slice(1).map((s, i) => (
          <Connector
            key={`curve-${s.product}`}
            from={`[data-station="${STATIONS[i].product}"]`}
            to={`[data-station="${s.product}"]`}
            inset={0}
            gap={6}
            state={traceState(i, step)}
          />
        ))}
        {STATIONS.slice(1).map((s, i) => (
          <Connector
            key={`drop-${s.product}`}
            from={`[data-station="${STATIONS[i].product}"]`}
            to={`[data-station="${s.product}"]`}
            route="drop"
            inset={0}
            gap={6}
            state={traceState(i, step)}
          />
        ))}
        {settled ? (
          <Connector
            from='[data-station="domus"]'
            to="[data-record]"
            route="drop"
            inset={0}
            gap={6}
            state="active"
          />
        ) : null}

        <div className={c.detail}>
          <div className={c.caption} aria-live="polite">
            <span className={c.captionProduct}>
              {productBySlug(current.product)!.name}
            </span>
            <p className={c.phrase}>
              {lines.map((line, j) => (
                <span
                  key={`${step}-${j}`}
                  className={j ? c.phraseQuiet : c.phraseLine}
                >
                  <TypeIn
                    text={line}
                    delay={lines
                      .slice(0, j)
                      .reduce((ms, l) => ms + typeDuration(l), 0)}
                    caret={j === lines.length - 1}
                  />
                </span>
              ))}
            </p>
            {settled ? (
              <p className={c.closing}>{m.home.chain.closing}</p>
            ) : step > 0 ? (
              <ul className={c.chips}>
                {STATIONS.slice(0, step).map((s) => (
                  <li key={s.product}>
                    <Badge
                      variant="secondary"
                      appearance="solid"
                      className={c.chip}
                    >
                      <Check aria-hidden="true" />
                      {s.chip}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className={c.aside}>
            {step === 0 ? (
              <p className={c.bubble}>
                <Badge
                  variant="secondary"
                  appearance="solid"
                  className={c.bubbleChannel}
                >
                  {m.home.chain.bubbleChannel}
                </Badge>
                {/* The message is the one the Relloo frame shows arriving (home.frames.relloo) */}
                <span className={c.bubbleText}>
                  {m.home.frames.relloo.incoming}
                </span>
                <span className={c.bubbleTime}>
                  {m.home.frames.relloo.time}
                </span>
              </p>
            ) : null}
            {settled ? (
              <div className={c.record} data-record="">
                <span className={c.recordHead}>
                  <span className={c.recordTitle}>{record.title}</span>
                  <span className={c.recordWho}>{record.who}</span>
                  <Badge
                    variant="success"
                    appearance="soft"
                    className={c.recordTag}
                  >
                    {record.tag}
                  </Badge>
                </span>
                <ul className={c.recordLines}>
                  {record.lines.map((l) => (
                    <li key={l.product} className={c.recordLine}>
                      <Check aria-hidden="true" className={c.recordCheck} />
                      <span className={c.recordProduct}>{l.product}</span>
                      {l.text}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <span data-mini-end="" hidden />
    </>
  );
}

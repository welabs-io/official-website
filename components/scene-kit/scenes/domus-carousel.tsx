"use client";
// CENA DO DOMUS: CARROSSEL EM QUATRO QUADROS
// The approved frames V3Domus-1..4 (canvas Claude Design, rows v3), one step or group of steps each: (1) the whole
// management of the company, every area in one place, and the tile that makes a new type of record; (2) the new type,
// "Vistoria", with its fields, becomes a screen ready to use; (3) the assistant, asked in words, proposes the Vistoria
// 318, a person confirms it and it lands in the list (undo at hand); (4) the record ties the other products (the flow
// goes on by itself, the visit is announced, the opportunity moves, the memory keeps it) and the frame ends on the
// question and the call to action. The four frames share one grid cell, so the window keeps the height of the tallest
// and a frame never cuts to the next: the leaving one slides out on the in-out curve, the coming one slides in on the
// out curve, and what is born inside it lands with the spring. Every piece reveals by a transition of its own state
// (`data-in`), so a frame plays again each time it comes back. Amber only on what is live in the current frame (the
// new type's tile, the new screen, the flow that goes on), green for what is done. The continuity is the kit's
// (components/scene-kit/Scene.tsx); the connector is the kit's (components/scene-kit/Connector.tsx).
import type { CSSProperties, ReactNode } from "react";
import {
  Building2,
  Calendar,
  Check,
  ClipboardCheck,
  History,
  Link,
  MapPin,
  MessagesSquare,
  Plus,
  RadioTower,
  Sparkles,
  Undo2,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { ActionButton, Badge, RowButton } from "@/components/lib/ui";
import { CONTACT_PATH } from "@/components/onepage/contact";
import { localizePath } from "@/lib/i18n/config";
import { MODULE_IDS, type ModuleId } from "@/lib/content/home";
import { fmt } from "@/lib/i18n/format";
import { useI18n } from "@/lib/i18n/provider";
import type { SceneMessages } from "@/lib/i18n/types";
import { Connector } from "../Connector";
import { FrameIndicator } from "../FrameIndicator";
import { Scene, type SceneApi, type SceneStep } from "../Scene";
import { TypeIn, typeDuration } from "../TypeIn";
import type { SceneTimeline } from "../timeline";
import p from "../parts.module.css";
import d from "./domus-carousel.module.css";

// ROTEIRO DA CENA
// Four frames, twelve steps (12.9 s): each frame holds 2.1 to 3.8 s, every step stays under the 2 s a human take may
// hold still; the record lands in the list ("created") before the connector ties it ("linked"), so the trace is
// measured on the row in its place; the last step holds 1.8 s, so the call to action reads before the loop goes back
// v4 (Stage.dc.html, brief-v4): the request to the assistant types in once its panel has come in (ASK_DELAY_MS), so
// "ask" holds the panel's entry, the typing (18 ms per character) and a short read. One loop: 14.4 s.
// The typing time follows the length of the request, which is text of the dictionary, so the steps are built from it
const ASK_DELAY_MS = 280;
export function domusSteps(copy: SceneMessages<"domus">): readonly SceneStep[] {
  return [
    { id: "areas", hold: 1300 },
    { id: "new", hold: 800 },
    { id: "type", hold: 900 },
    { id: "fields", hold: 900 },
    { id: "screen", hold: 1500 },
    { id: "ask", hold: ASK_DELAY_MS + typeDuration(copy.ask) + 1300 },
    { id: "proposal", hold: 1100 },
    { id: "created", hold: 700 },
    { id: "linked", hold: 1000 },
    { id: "record", hold: 900 },
    { id: "links", hold: 1000 },
    { id: "cta", hold: 1800 },
  ];
}

// The steps each frame holds, in the order of the frames (the title and the label of each are copy.frames)
const FRAME_STEPS = [
  ["areas", "new"],
  ["type", "fields", "screen"],
  ["ask", "proposal", "created", "linked"],
  ["record", "links", "cta"],
] as const;

const frameOf = (step: string) =>
  Math.max(
    0,
    FRAME_STEPS.findIndex((steps) =>
      (steps as readonly string[]).includes(step),
    ),
  );

// CONTEÚDO DA CENA
// The areas are the real modules of lib/content/home.ts MODULE_IDS (standard + made to measure: 18), not the frame's
// unconfirmed "14"; ten are named in the frame's order (by stable id, never by name) and the rest are summed in one tile
const PRODUCT = "Welabs Domus";
const ALL_AREA_IDS: readonly ModuleId[] = [
  ...MODULE_IDS.standard,
  ...MODULE_IDS.custom,
];
const CUSTOM = new Set<ModuleId>(MODULE_IDS.custom);
const NAMED: readonly ModuleId[] = [
  "finance",
  "tax",
  "contracts",
  "people",
  "tickets",
  "legal",
  "approvals",
  "sales",
  "purchasing",
  "inventory",
];
const REST_IDS = ALL_AREA_IDS.filter((id) => !NAMED.includes(id));

// The fields of the new type (the frame 2 rows; the contact is a company, so its glyph is a building, never a person);
// the label of each is copy.typeFields at the same position
const TYPE_FIELD_ICONS: readonly LucideIcon[] = [MapPin, Calendar, Building2];

// The list of frame 3: the new record on top (it lands at "created"), then the two done before it; the "when" of each
// is copy.list.visits at the same position
const VISITS = [
  { id: "318", tone: "scheduled", fresh: true },
  { id: "317", tone: "done", fresh: false },
  { id: "316", tone: "done", fresh: false },
] as const;

// The neighbours of frame 4: the Domus glyphs of each product (Workflow for a flow, RadioTower for a channel,
// MessagesSquare for a conversation, History for the memory); the flow is the one live piece. The brand is the name,
// the line is copy.neighbours[slug]
const NEIGHBOURS = [
  { side: "w", slug: "magneto", name: "Magneto", icon: Workflow, live: true },
  { side: "w", slug: "tuner", name: "Tuner", icon: RadioTower, live: false },
  {
    side: "e",
    slug: "relloo",
    name: "Relloo",
    icon: MessagesSquare,
    live: false,
  },
  { side: "e", slug: "knowly", name: "Knowly", icon: History, live: false },
] as const;

// The order of a piece among its siblings, for the stagger of its reveal (a custom property read by the sheet)
const order = (i: number) => ({ "--i": i }) as CSSProperties;

// STATUS (MINIDOT)
// The status of a record: the 8 px dot before the label, no fill; scheduled in ink, done in green
function Status({
  tone,
  children,
}: {
  tone: "scheduled" | "done";
  children: ReactNode;
}) {
  return (
    <span className={d.status} data-tone={tone} data-axis-pair="">
      <span className={d.statusDot} data-dot="" aria-hidden="true" />
      {children}
    </span>
  );
}

// QUADRO 1: AS ÁREAS DA EMPRESA
// The count of the real modules, the legend of the two floors, the named areas, the sum of the others and the tile
// that makes a new type (a control: it plays the scene from the new type)
function AreasFrame({ scene, on }: { scene: SceneApi; on: boolean }) {
  const { m } = useI18n();
  const copy = m.scenes.domus;
  const names = m.home.domus.modules;
  const lit = on && scene.reached("new");
  // The first three areas of the sum, lowercased and joined, the sentence capitalised (as the frame writes it)
  const restLine = fmt(copy.restLine, {
    names: REST_IDS.slice(0, 3)
      .map((id) => names[id])
      .join(", "),
  })
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
  return (
    <div className={d.areas}>
      <div className={d.areasHead} data-areas-head="">
        <span className={d.count} data-in={scene.reached("areas")}>
          <b className={d.stat}>{ALL_AREA_IDS.length}</b>
          <span className={d.countText}>{copy.countText}</span>
        </span>
        <span className={d.legend}>
          <span className={d.legendItem}>
            <span
              className={d.swatch}
              data-tone="standard"
              aria-hidden="true"
            />
            {m.home.domus.standard}
          </span>
          <span className={d.legendItem}>
            <span className={d.swatch} data-tone="custom" aria-hidden="true" />
            {m.home.domus.custom}
          </span>
        </span>
      </div>
      <ul className={d.grid}>
        {NAMED.map((id, i) => (
          <li
            key={id}
            className={d.area}
            data-area=""
            data-tone={CUSTOM.has(id) ? "custom" : "standard"}
            data-in={scene.reached("areas")}
            style={order(i)}
          >
            {names[id]}
          </li>
        ))}
        <li
          className={d.area}
          data-area=""
          data-tone="rest"
          data-in={scene.reached("areas")}
          style={order(NAMED.length)}
        >
          <span className={d.restText}>
            <b>{fmt(copy.rest, { count: REST_IDS.length })}</b>
            <span>{restLine}</span>
          </span>
        </li>
        <li
          className={d.newTile}
          data-area=""
          data-lit={lit}
          data-in={scene.reached("areas")}
          style={order(NAMED.length + 1)}
        >
          <RowButton
            icon={<Plus />}
            markClassName={`${p.mark} ${p.markLg} ${p.markSquare} ${d.newMark}`}
            data-state={lit ? "active" : "idle"}
            // A row: its mark centres on the label's two lines (measured through data-axis, not on the first line)
            data-row=""
            data-axis="new"
            onClick={() => scene.take("type")}
          >
            <span className={d.newLabel}>{copy.newType}</span>
          </RowButton>
        </li>
      </ul>
    </div>
  );
}

// QUADRO 2: O TIPO NOVO VIRA TELA
// The new type with its fields (each lands at "fields"), and the screen it gets, live in amber, tied by the connector
function TypeFrame({ scene, on }: { scene: SceneApi; on: boolean }) {
  const { m } = useI18n();
  const copy = m.scenes.domus;
  const screen = scene.reached("screen");
  return (
    <div className={d.typeRow}>
      <div className={d.sheet} data-type="" data-in={scene.reached("type")}>
        <div className={d.sheetHead} data-axis="type">
          <span
            className={`${p.mark} ${p.markLg} ${p.markSquare} ${d.ink}`}
            aria-hidden="true"
          >
            <ClipboardCheck />
          </span>
          <span className={d.sheetHeadText}>
            <b className={d.typeName}>{copy.type}</b>
            <Badge variant="neutral" appearance="soft" className={d.badge}>
              {m.home.domus.custom}
            </Badge>
          </span>
        </div>
        {TYPE_FIELD_ICONS.map((Icon, i) => (
          <span
            key={i}
            className={d.typeLine}
            data-in={scene.reached("fields")}
            style={order(i)}
          >
            <Icon aria-hidden="true" />
            {copy.typeFields[i]}
          </span>
        ))}
      </div>
      <div
        className={d.screen}
        data-screen=""
        data-in={screen}
        data-live={on && screen}
      >
        <div className={d.screenHead}>
          <b>{copy.screen}</b>
          <Badge
            variant="success"
            appearance="soft"
            className={`${p.seal} ${d.badge}`}
          >
            <Check aria-hidden="true" />
            {copy.ready}
          </Badge>
        </div>
        <div className={d.screenCols}>
          {copy.typeFields.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className={d.screenRow}
            data-first={row === 0}
            aria-hidden="true"
          >
            {TYPE_FIELD_ICONS.map((_, i) => (
              <span key={i} className={d.bar} />
            ))}
          </div>
        ))}
      </div>
      {on && screen && !scene.ghost ? (
        <Connector from="[data-type]" to="[data-screen]" inset={0} gap={8} />
      ) : null}
    </div>
  );
}

// QUADRO 3: O ASSISTENTE CRIA O REGISTRO
// The list of visits on the canvas and the assistant beside it: the context of the screen, the request in words, the
// proposal and its confirmation; once confirmed the record lands on top of the list and the connector ties the two
function AssistantFrame({ scene, on }: { scene: SceneApi; on: boolean }) {
  const { m } = useI18n();
  const copy = m.scenes.domus;
  const created = scene.reached("created");
  return (
    <div className={d.assist}>
      <div className={d.canvasSide}>
        <div className={d.list} data-list="">
          <div className={d.listHead}>
            <b>{copy.screen}</b>
          </div>
          <div className={d.listCols} data-cols="">
            <span data-cell="0">{copy.list.cols[0]}</span>
            <span data-cell="1">{copy.list.cols[1]}</span>
            <span data-cell="2">{copy.list.cols[2]}</span>
          </div>
          {VISITS.map((v, i) => (
            <div
              key={v.id}
              className={d.listRow}
              data-row={v.id}
              data-fresh={v.fresh}
              data-in={v.fresh ? created : true}
              data-lit={v.fresh && on && created}
            >
              <b data-cell="0">{v.id}</b>
              <span data-cell="1">{copy.list.visits[i]}</span>
              <span data-cell="2">
                <Status tone={v.tone}>
                  {v.tone === "done" ? copy.done : copy.scheduled}
                </Status>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className={d.panel} data-assistant="" data-in={scene.reached("ask")}>
        <span className={d.panelHead} data-axis="assistant">
          <span
            className={`${p.mark} ${p.markSm} ${p.markSquare} ${d.ink}`}
            aria-hidden="true"
          >
            <Sparkles />
          </span>
          <b>{copy.assistant}</b>
        </span>
        <Badge
          variant="neutral"
          appearance="soft"
          className={`${p.seal} ${d.context}`}
        >
          <Link aria-hidden="true" />
          {copy.context}
        </Badge>
        {/* v4: the request types in, once per loop, its whole text reserved (keyed by the loop, so a take within it
            does not type it again) */}
        <p className={d.ask} data-in={scene.reached("ask")}>
          {scene.reached("ask") ? (
            <TypeIn key={scene.cycle} text={copy.ask} delay={ASK_DELAY_MS} />
          ) : (
            copy.ask
          )}
        </p>
        <div className={d.proposal} data-in={scene.reached("proposal")}>
          <span className={p.paneHead}>{copy.proposalHead}</span>
          <span className={`${p.stack} ${d.proposalBox}`}>
            <b>{copy.record}</b>
            <span>{copy.recordLine}</span>
          </span>
        </div>
        <span className={d.confirm} data-in={scene.reached("proposal")}>
          <ActionButton
            icon={<Check />}
            emphasis="primary"
            size="md"
            onClick={() => scene.take("created")}
          >
            {copy.confirm}
          </ActionButton>
        </span>
        <div
          className={d.created}
          data-created=""
          data-in={created}
          data-axis="created"
        >
          <span
            className={`${p.mark} ${p.markXs} ${d.doneMark}`}
            aria-hidden="true"
          >
            <Check />
          </span>
          <span className={d.createdText}>
            <b>{copy.created}</b>
            {/* Undo takes the scene back to the proposal, as the record is only a draft until it stays */}
            <ActionButton
              icon={<Undo2 />}
              emphasis="outline"
              size="md"
              onClick={() => scene.take("proposal")}
            >
              {copy.undo}
            </ActionButton>
          </span>
        </div>
      </div>
      {on && scene.reached("linked") && !scene.ghost ? (
        <Connector
          from="[data-created]"
          to='[data-row="318"]'
          route="elbow"
          inset={0}
          gap={8}
        />
      ) : null}
    </div>
  );
}

// QUADRO 4: O REGISTRO LIGA OS OUTROS PRODUTOS
// The record in the middle and its four neighbours (two each side, tied by the connector at their own line), then the
// question and the lib's primary button to the contact section of the home
function CenterFrame({ scene, on }: { scene: SceneApi; on: boolean }) {
  const { m, locale } = useI18n();
  const copy = m.scenes.domus;
  const links = scene.reached("links");
  return (
    <div className={d.center}>
      <div className={d.hub}>
        <div
          className={d.record}
          data-record=""
          data-in={scene.reached("record")}
        >
          <span className={d.recordHead} data-axis="record">
            <span
              className={`${p.mark} ${p.markLg} ${p.markSquare} ${d.ink}`}
              aria-hidden="true"
            >
              <ClipboardCheck />
            </span>
            <span className={d.recordTitle}>
              <b>{copy.record}</b>
              <Status tone="scheduled">{copy.scheduled}</Status>
            </span>
          </span>
          {copy.recordLines.map((l, i) => (
            <span key={i} className={d.recordLine}>
              <span>{l.label}</span>
              <b>{l.value}</b>
            </span>
          ))}
          {/* The ports of the connector: the line of each neighbour on the record's two sides */}
          <span className={d.port} data-port="w0" aria-hidden="true" />
          <span className={d.port} data-port="w1" aria-hidden="true" />
          <span className={d.port} data-port="e0" aria-hidden="true" />
          <span className={d.port} data-port="e1" aria-hidden="true" />
        </div>
        {(["w", "e"] as const).map((side) => (
          <div key={side} className={d.side} data-side={side}>
            {NEIGHBOURS.filter((n) => n.side === side).map((n, i) => {
              const Icon = n.icon;
              return (
                <span
                  key={n.slug}
                  className={d.neighbour}
                  data-neighbour={`${side}${i}`}
                  data-in={links}
                  data-live={n.live && on && links}
                  data-axis="neighbour"
                  style={order(i)}
                >
                  <span
                    className={`${p.mark} ${p.markMd} ${p.markSquare} ${d.ink}`}
                    aria-hidden="true"
                  >
                    <Icon />
                  </span>
                  <span className={p.stack}>
                    <b>{n.name}</b>
                    <span>{copy.neighbours[n.slug]}</span>
                  </span>
                </span>
              );
            })}
          </div>
        ))}
        {on && links && !scene.ghost
          ? (["w0", "w1", "e0", "e1"] as const).map((port) => (
              <Connector
                key={port}
                from={`[data-port="${port}"]`}
                to={`[data-neighbour="${port}"]`}
                inset={0}
                gap={8}
              />
            ))
          : null}
      </div>
      <div className={d.ctaBand} data-in={scene.reached("cta")}>
        <b className={d.question}>{copy.question}</b>
        <ActionButton
          icon={<Calendar />}
          emphasis="primary"
          size="md"
          href={localizePath(locale, CONTACT_PATH)}
        >
          {m.common.cta}
        </ActionButton>
      </div>
    </div>
  );
}

const FRAME_VIEWS = [AreasFrame, TypeFrame, AssistantFrame, CenterFrame];

function DomusCarouselView({ scene }: { scene: SceneApi }) {
  const frames = useI18n().m.scenes.domus.frames;
  const current = frameOf(scene.id);
  return (
    <div className={d.root} data-frame={current + 1}>
      {FRAME_VIEWS.map((View, i) => {
        const pos = i < current ? "past" : i === current ? "current" : "future";
        return (
          <section
            key={FRAME_STEPS[i][0]}
            className={d.frame}
            data-pos={pos}
            aria-label={frames[i].label}
            aria-hidden={pos !== "current" || undefined}
            inert={pos !== "current"}
          >
            <View scene={scene} on={pos === "current"} />
          </section>
        );
      })}
    </div>
  );
}

export function DomusCarousel({ timeline }: { timeline?: SceneTimeline }) {
  const copy = useI18n().m.scenes.domus;
  return (
    <Scene
      id="domus-carousel"
      label={copy.label}
      product={PRODUCT}
      title={(scene) => copy.frames[frameOf(scene.id)].title}
      tools={(scene) => (
        <FrameIndicator
          scene={scene}
          frames={FRAME_STEPS}
          names={copy.frameNames}
        />
      )}
      steps={domusSteps(copy)}
      timeline={timeline}
    >
      {(scene) => <DomusCarouselView scene={scene} />}
    </Scene>
  );
}

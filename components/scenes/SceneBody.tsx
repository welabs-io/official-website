// CENAS DA CADEIA (COMPOSIÇÕES)
// The seven scenes of the story of Marina and the order 1234, each a product window assembled from the scene
// components. The animation comes from the script of the scene (`actFor`); the words from lib/scenes/story.ts. Server
// markup only. `phase` is the settled frame by default ("end"): the stage rewrites it on the client. Every scene has
// exactly one key element (`data-key`, 18 to 22 px); everything else is interface text of 11 to 13 px.
import { actFor } from "@/lib/scenes/act";
import type { SceneScript } from "@/lib/scenes/script";
import { STORY } from "@/lib/scenes/story";
import { ApprovalFlow } from "./ApprovalFlow";
import { ChatPhone } from "./ChatPhone";
import { ConfirmToast } from "./ConfirmToast";
import { CardSheet, CardStatus, CrmFunnelCard } from "./CrmFunnelCard";
import { HouseRooms } from "./HouseRooms";
import { Glyph, GLYPHS, ROOM_GLYPHS } from "./icons";
import { InboxUnified } from "./InboxUnified";
import { SceneWindow } from "./SceneWindow";
import { SourcePanel } from "./SourcePanel";
import styles from "./scenes.module.css";

const { card, stages, times } = STORY;
const cardCopy = { title: card.title, order: card.order };
const { owner, deadline, history, followup } = card.facts;
const FACT_ICONS = [GLYPHS.user, GLYPHS.clock, GLYPHS.history, GLYPHS.calendar];
const factRows = (action: string) => [
  ...[owner, deadline, history, followup].map(({ label, value }, i) => ({
    label,
    value,
    action,
    icon: FACT_ICONS[i],
  })),
  // The fact the house fills in the next scene, still missing
  { label: card.pending, value: "", icon: GLYPHS.truck, pending: true },
  // Who asked and where, already known from the inbox
  ...card.origin.map(({ label, value }, i) => ({
    label,
    value,
    icon: i === 0 ? GLYPHS.user : GLYPHS.chat,
  })),
];

export function SceneBody({
  scene,
  phase = "end",
}: {
  scene: SceneScript;
  phase?: "start" | "play" | "end";
}) {
  const act = actFor(scene);
  const body = (() => {
    switch (scene.id) {
      // Domus and Relloo: the full house and the empty funnel glued to its wall
      case "s0":
        return (
          <SceneWindow product="domus" meta={STORY.houseMeta}>
            <div className={styles.page}>
              <p className={`${styles.pageTitle} ${styles.key}`} data-key="">
                {STORY.house}
              </p>
              <div className={`${styles.duo} ${styles.duoHouse}`}>
                <HouseRooms
                  act={act}
                  rooms={STORY.rooms}
                  metas={STORY.roomMeta}
                  enter="rooms"
                />
                <CrmFunnelCard
                  act={act}
                  title={STORY.funnel}
                  meta="Relloo"
                  stages={stages}
                  stage={null}
                  card={cardCopy}
                  rootAct={act("funnel", "in")}
                />
              </div>
            </div>
          </SceneWindow>
        );
      // Tuner: the call and the message of Marina become one conversation
      case "s1":
        return (
          <SceneWindow product="tuner">
            <div className={styles.full}>
              <InboxUnified
                act={act}
                title={STORY.inboxTitle}
                person={STORY.person}
                current={{
                  name: STORY.person,
                  preview: STORY.ask,
                  time: times.ask,
                }}
                others={STORY.inbox}
                meta={card.order}
                items={[
                  {
                    channel: STORY.channels.chat,
                    tone: "ok",
                    icon: GLYPHS.chat,
                    from: STORY.you,
                    text: STORY.before,
                    time: times.before,
                  },
                  {
                    channel: STORY.channels.voice,
                    tone: "info",
                    icon: GLYPHS.phone,
                    text: STORY.call,
                    time: times.call,
                    action: "call",
                    wave: true,
                  },
                  {
                    channel: STORY.channels.chat,
                    tone: "ok",
                    icon: GLYPHS.chat,
                    text: STORY.ask,
                    time: times.ask,
                    action: "ask",
                    typing: 0.45,
                    isKey: true,
                  },
                ]}
                mark={STORY.thread}
                reply={STORY.reply}
                action="merge"
              />
            </div>
          </SceneWindow>
        );
      // Relloo: the card is born in Novo, gets its facts and moves to Em análise
      case "s2":
        return (
          <SceneWindow product="relloo" meta={card.order}>
            <div className={`${styles.duo} ${styles.duoFunnel}`}>
              <CrmFunnelCard
                act={act}
                title={STORY.funnel}
                meta={`${STORY.others.length + 1} abertos`}
                stages={stages}
                stage={1}
                card={cardCopy}
                owner={owner.value}
                others={STORY.others}
                born="born"
                facts="facts"
                moves={[{ action: "review", rows: 1 }]}
                keyTitle
              />
              <CardSheet
                act={act}
                title={card.details}
                meta={card.order}
                rows={factRows("facts")}
              />
            </div>
          </SceneWindow>
        );
      // Domus: three rooms hand the address, the order and the Saturday window to the card
      case "s3":
        return (
          <SceneWindow product="domus" meta={card.order}>
            <div className={`${styles.duo} ${styles.duoHouse}`}>
              <HouseRooms
                act={act}
                rooms={STORY.rooms}
                metas={STORY.roomMeta}
                lit={STORY.handed.map((h) => h.room)}
                litAction="handoff"
              />
              <CardSheet
                act={act}
                offset={0.1}
                head={
                  <div className={styles.cardHead}>
                    <b className={styles.key} data-key="">
                      {card.title}
                    </b>
                    <span className={styles.cardHeadMeta}>
                      <span>{card.order}</span>
                      <span className={styles.pillInfo}>
                        <i className={styles.dot} data-tone="info" />
                        {stages[1]}
                      </span>
                    </span>
                  </div>
                }
                rows={[
                  {
                    label: owner.label,
                    value: owner.value,
                    icon: GLYPHS.user,
                  },
                  {
                    label: deadline.label,
                    value: deadline.value,
                    icon: GLYPHS.clock,
                  },
                  {
                    label: history.label,
                    value: history.value,
                    icon: GLYPHS.history,
                  },
                  ...STORY.handed.map(({ room, label, value }) => ({
                    label,
                    value,
                    action: "card",
                    icon: ROOM_GLYPHS[room],
                    from: room,
                    fresh: true,
                  })),
                ]}
              />
            </div>
          </SceneWindow>
        );
      // Knowly: the line of the policy becomes the answer, with its source
      case "s4":
        return (
          <SceneWindow product="knowly">
            <SourcePanel
              act={act}
              question={STORY.ask}
              doc={STORY.kb}
              answer={{
                label: STORY.kb.label,
                text: STORY.kb.answer,
                detail: STORY.kb.detail,
                source: STORY.kb.source,
              }}
              docAction="doc"
              hitAction="hit"
              answerAction="answer"
              related={{
                title: STORY.kb.related,
                questions: STORY.kb.questions,
              }}
            />
          </SceneWindow>
        );
      // Magneto: the rule in three steps, the Gestora approves, the card goes to Resolvido
      case "s5":
        return (
          <SceneWindow product="magneto" meta={card.order}>
            <div className={`${styles.duo} ${styles.duoFlow}`}>
              <ApprovalFlow
                act={act}
                rule={STORY.approval.rule}
                title={STORY.approval.title}
                meta={STORY.approval.meta}
                steps={STORY.approval.steps}
                stepsMeta={STORY.approval.stepsMeta}
                manager={STORY.approval.manager}
                managerName={STORY.approval.managerName}
                button={STORY.approval.button}
                approved={[STORY.approval.approved, times.approved]}
                actions={{ rule: "rule", approve: "approve", finish: "finish" }}
              />
              <CardStatus
                act={act}
                card={cardCopy}
                stages={stages}
                start={1}
                steps={[
                  { stage: 2, action: "rule" },
                  { stage: 3, action: "finish" },
                ]}
              >
                <dl className={styles.facts}>
                  {[
                    { ...owner, icon: GLYPHS.user },
                    { ...deadline, icon: GLYPHS.clock },
                    { ...STORY.handed[2], icon: GLYPHS.truck },
                    {
                      label: STORY.approval.manager,
                      value: STORY.approval.managerName,
                      icon: GLYPHS.check,
                    },
                    { ...card.origin[0], icon: GLYPHS.chat },
                  ].map((row) => (
                    <div key={row.label} className={styles.fact}>
                      <dt>
                        <Glyph d={row.icon} size={14} />
                        {row.label}
                      </dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </CardStatus>
            </div>
          </SceneWindow>
        );
      // Domus and Tuner: the result returns to the room Pedidos and Marina is told
      case "s6":
        return (
          <SceneWindow product="domus">
            <div className={`${styles.duo} ${styles.duoHousePhone}`}>
              <HouseRooms
                act={act}
                rooms={STORY.rooms}
                metas={STORY.roomMeta}
                result={{
                  room: "Pedidos",
                  lines: STORY.roomDone,
                  action: "home",
                }}
              />
              <ChatPhone
                act={act}
                contact={STORY.contact}
                channel={STORY.channels.chat}
                items={[
                  {
                    kind: "bubble",
                    side: "in",
                    text: STORY.before,
                    time: times.before,
                  },
                  {
                    kind: "call",
                    text: STORY.call,
                    time: times.call,
                  },
                  {
                    kind: "bubble",
                    side: "out",
                    text: STORY.ask,
                    time: times.ask,
                    ticks: true,
                    readAction: "toast",
                  },
                  {
                    kind: "bubble",
                    side: "in",
                    text: STORY.received,
                    time: times.confirm,
                    action: "received",
                  },
                ]}
              >
                <ConfirmToast
                  act={act}
                  text={STORY.confirm}
                  meta={STORY.confirmMeta}
                  action="toast"
                />
              </ChatPhone>
            </div>
          </SceneWindow>
        );
    }
  })();
  return (
    <div
      className={`scn ${styles.scene}`}
      data-scene={scene.id}
      data-phase={phase}
    >
      {body}
    </div>
  );
}

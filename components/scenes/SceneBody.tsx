// CENAS DA CADEIA (COMPOSIÇÕES)
// The seven scenes of the story of Marina and the order 1234, each a product window assembled from the scene
// components. The animation comes from the script of the scene (`actFor`); the words from lib/scenes/story.ts. Server
// markup only. `phase` is the settled frame by default ("end"): the stage rewrites it on the client.
import { actFor } from "@/lib/scenes/act";
import type { SceneScript } from "@/lib/scenes/script";
import { STORY } from "@/lib/scenes/story";
import { ApprovalFlow } from "./ApprovalFlow";
import { ChatPhone } from "./ChatPhone";
import { ConfirmToast } from "./ConfirmToast";
import { CardSheet, CardStatus, CrmFunnelCard } from "./CrmFunnelCard";
import { HouseRooms } from "./HouseRooms";
import { InboxUnified } from "./InboxUnified";
import { SceneWindow } from "./SceneWindow";
import { SourcePanel } from "./SourcePanel";
import styles from "./scenes.module.css";

const { card, stages } = STORY;
const cardCopy = { title: card.title, order: card.order };
const factRows = (action: string) =>
  Object.values(card.facts).map(({ label, value }) => ({
    label,
    value,
    action,
  }));

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
          <SceneWindow product="domus">
            <div className={`${styles.duo} ${styles.duoHouse}`}>
              <HouseRooms act={act} rooms={STORY.rooms} enter="rooms" />
              <CrmFunnelCard
                act={act}
                stages={stages}
                stage={null}
                card={cardCopy}
                rootAct={act("funnel", "in")}
              />
            </div>
          </SceneWindow>
        );
      // Tuner: the call and the message of Marina become one conversation
      case "s1":
        return (
          <SceneWindow product="tuner">
            <div className={styles.duo}>
              <ChatPhone
                act={act}
                person={STORY.person}
                channel={STORY.channels.chat}
                items={[
                  {
                    kind: "call",
                    text: STORY.call,
                    chip: STORY.channels.voice,
                    action: "call",
                  },
                  {
                    kind: "bubble",
                    side: "out",
                    text: STORY.ask,
                    action: "ask",
                    typing: 0.45,
                    ticks: true,
                    focal: true,
                  },
                ]}
              />
              <InboxUnified
                act={act}
                person={STORY.person}
                channels={[STORY.channels.voice, STORY.channels.chat]}
                items={[
                  { channel: STORY.channels.voice, text: STORY.call },
                  {
                    channel: STORY.channels.chat,
                    text: STORY.ask,
                    focal: true,
                  },
                ]}
                mark={STORY.thread}
                action="merge"
              />
            </div>
          </SceneWindow>
        );
      // Relloo: the card is born in Novo, gets its facts and moves to Em análise
      case "s2":
        return (
          <SceneWindow product="relloo">
            <div className={`${styles.duo} ${styles.duoFunnel}`}>
              <CrmFunnelCard
                act={act}
                stages={stages}
                stage={1}
                card={cardCopy}
                born="born"
                moves={[{ action: "review", rows: 1 }]}
              />
              <CardSheet act={act} rows={factRows("facts")} />
            </div>
          </SceneWindow>
        );
      // Domus: three rooms hand the address, the order and the Saturday window to the card
      case "s3":
        return (
          <SceneWindow product="domus">
            <div className={`${styles.duo} ${styles.duoHouse}`}>
              <HouseRooms
                act={act}
                rooms={STORY.rooms}
                lit={STORY.handed.map((h) => h.room)}
                litAction="handoff"
              />
              <div className={styles.handed}>
                <p className={styles.handedCard} data-focal="">
                  <b>{card.title}</b>
                  <span>{card.order}</span>
                </p>
                <CardSheet
                  act={act}
                  offset={0.1}
                  rows={STORY.handed.map(({ label, value }) => ({
                    label,
                    value,
                    action: "card",
                  }))}
                />
              </div>
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
              title={STORY.kb.title}
              lines={STORY.kb.lines}
              hit={STORY.kb.hit}
              answer={STORY.kb.answer}
              docAction="doc"
              hitAction="hit"
              answerAction="answer"
            />
          </SceneWindow>
        );
      // Magneto: the rule in three steps, the Gestora approves, the card goes to Resolvido
      case "s5":
        return (
          <SceneWindow product="magneto">
            <div className={styles.stack}>
              <ApprovalFlow
                act={act}
                rule={STORY.approval.rule}
                manager={STORY.approval.manager}
                steps={STORY.approval.steps}
                button={STORY.approval.button}
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
              />
            </div>
          </SceneWindow>
        );
      // Domus and Tuner: the result returns to the room Pedidos and Marina is told
      case "s6":
        return (
          <SceneWindow product="domus">
            <div className={`${styles.duo} ${styles.duoHouse}`}>
              <HouseRooms
                act={act}
                rooms={STORY.rooms}
                result={{
                  room: "Pedidos",
                  lines: ["Pedido 1234", "sábado ✓"],
                  action: "home",
                }}
              />
              <ChatPhone
                act={act}
                person={STORY.person}
                channel={STORY.channels.chat}
                items={[
                  {
                    kind: "bubble",
                    side: "out",
                    text: STORY.ask,
                    ticks: true,
                  },
                ]}
              >
                <ConfirmToast
                  act={act}
                  text={STORY.confirm}
                  received={STORY.received}
                  action="toast"
                  receivedAction="received"
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

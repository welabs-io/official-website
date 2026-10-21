// CENAS DO EFEITO (COMPOSIÇÕES)
// The three scenes of the story of the order 1234 that the home shows as outcomes ("O que muda na
// operação"), each a product window assembled from the scene components: the call and the message become one contact
// (Tuner), the answer comes with its source (Knowly), the order comes back confirmed (Domus). The animation comes from
// the script of the scene (`actFor`); the words from lib/scenes/story.ts. Server markup only. `phase` is the settled
// frame by default ("end"). Every scene has exactly one key element (`data-key`, 18 to 22 px); everything else is
// interface text of 11 to 13 px.
import { actFor } from "@/lib/scenes/act";
import type { SceneScript } from "@/lib/scenes/script";
import { STORY } from "@/lib/scenes/story";
import { ChatPhone } from "./ChatPhone";
import { ConfirmToast } from "./ConfirmToast";
import { HouseRooms } from "./HouseRooms";
import { LudicChannels } from "./LudicChannels";
import { SceneWindow } from "./SceneWindow";
import { SourcePanel } from "./SourcePanel";
import styles from "./scenes.module.css";

const { times } = STORY;

export function SceneBody({
  scene,
  phase = "end",
  replay,
}: {
  scene: SceneScript;
  phase?: "start" | "play" | "end";
  // v2.1: seconds of the scene, when it plays again and again while on screen (components/scenes/replay.ts)
  replay?: number;
}) {
  const act = actFor(scene);
  const body = (() => {
    switch (scene.id) {
      // Tuner: the call and the message of the contact become one conversation (the phone and the inbox talk)
      case "s1":
        return (
          <SceneWindow
            product="tuner"
            receive={act("ask", "pulse", { offset: 0.14, length: 0.14 })}
          >
            <LudicChannels act={act} />
          </SceneWindow>
        );
      // Knowly: the line of the policy becomes the answer, with its source
      case "s4":
        return (
          <SceneWindow
            product="knowly"
            receive={act("hit", "pulse", { offset: 0.1, length: 0.18 })}
          >
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
      // Domus and Tuner: the result returns to the room Pedidos and the contact is told
      case "s6":
        return (
          <SceneWindow
            product="domus"
            receive={act("home", "pulse", { offset: 0.04, length: 0.18 })}
          >
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
      data-replay={replay}
    >
      {body}
    </div>
  );
}

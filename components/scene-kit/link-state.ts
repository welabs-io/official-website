// ESTADO DE UM CONECTOR NA CENA
// brief-v4 (connectors): inside a scene a link rests grey once it is drawn; only the link that moves now (the step that
// draws it) is in ink. `linkState(scene, step)` is that state for the Connector of `step`: "active" while the scene is
// exactly at it, "rest" after. Under reduced motion (the settled frame) every link rests.
import type { ConnectorState } from "./Connector";
import type { SceneApi } from "./Scene";

export const linkState = (
  scene: Pick<SceneApi, "is" | "reduced">,
  step: string,
): ConnectorState => (!scene.reduced && scene.is(step) ? "active" : "rest");

// AÇÕES DO ROTEIRO COMO ATRIBUTOS
// Turns the script of one scene into the `act` function the components call: `act("rooms", "pop", { index, count })`
// returns `data-act`, `data-fx` and the custom properties CSS reads. The numbers are the script's; asking for an action
// the script does not list throws, so a scene can never animate with a time nobody wrote down.
import type { Act, ActProps } from "./types";
import type { SceneScript } from "./script";

const sec = (n: number) => `${Math.round(n * 1000) / 1000}s`;

// Longest length of one item of a staggered action
const ITEM = 0.3;

export function actFor(scene: SceneScript): Act {
  return (id, fx, options = {}): ActProps => {
    const action = scene.actions.find((a) => a.id === id);
    if (!action) throw new Error(`scene ${scene.id} has no action "${id}"`);
    const { index = 0, count = 1, offset = 0, length } = options;
    const window = action.dur - offset;
    const item = length ?? (count > 1 ? Math.min(ITEM, window / 2) : window);
    const step = count > 1 ? (window - item) / (count - 1) : 0;
    return {
      "data-act": id,
      "data-fx": fx,
      style: {
        "--at": sec(action.at + offset),
        "--d": sec(item),
        "--i": index,
        "--st": sec(step),
      } as React.CSSProperties,
    };
  };
}

// `act` for scenes drawn outside the stage (a single frame with no script): every element stays in its settled state
export const stillAct: Act = (id, fx): ActProps => ({
  "data-act": id,
  "data-fx": fx,
  style: {},
});

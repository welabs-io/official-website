// VEZ DO GIRO
// Starts the arc of a swap: the stage carries `data-turn`, and flipping it between "a" and "b" restarts the lift of the tile
// that takes the centre and the dip of the one that leaves (components/ring/rotation.css). Two identical keyframes with
// different names are what make a CSS animation restart without a reflow.
export function turn(stage: HTMLElement) {
  stage.dataset.turn = stage.dataset.turn === "a" ? "b" : "a";
}

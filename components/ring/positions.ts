// POSIÇÕES DO CARROSSEL CIRCULAR
// Position of a tile around the ring: 0 centre, -1 and 1 neighbours, 2 and -2 hidden behind.
export function ringPosition(index: number, active: number, count: number) {
  // With two tiles the other one is always the next: it waits on the right and swaps with the centre
  if (count === 2) return index === active ? 0 : 1;
  const half = Math.floor(count / 2);
  return ((index - active + count + half) % count) - half;
}

// Everything past the first neighbour sits hidden behind, on its own side
export const placeOf = (position: number) =>
  Math.max(-2, Math.min(2, position));

// Only the tiles within two places of the centre carry their cover images; the others have them hidden (display none),
// so the browser never downloads the covers of a long ring until the ring comes close to them. Two places, not one: the
// tile at +2 is invisible but is the next neighbour, so its cover must already be in when the swap brings it to +1
// (a swap never shows an empty frame; e2e/cover.spec.ts measures it)
export const isNear = (position: number) => position >= -2 && position <= 2;

// Which cover of a tile is on display at a position, so worth fetching at once (it mirrors ring.module.css): a tile with a
// settled cover ("end") shows it everywhere but at -2 and shows the entry cover ("start") only at the centre; a tile
// without one shows the entry cover. A cover that is on display is set to load eagerly: a lazy image of a tile that is
// scaled down and faded out can still be loading when the swap brings it in
export const coverShown = (
  position: number,
  cover: "start" | "end",
  hasEnd: boolean,
) => {
  if (!isNear(position)) return false;
  if (cover === "end") return position !== -2;
  return !hasEnd || position === 0;
};

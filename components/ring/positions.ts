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

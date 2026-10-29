// Whether the Leave War tab is CURRENTLY on screen — a tiny signal, DELIBERATELY
// separate from the Leave War store.
//
// The Matrix background fill needs to know two things the store must not carry:
// while the tab is hidden it draws only a small window (so returning to it wakes
// a small grid, not the whole year — owner, 5 Sep 26, choosing "shrink when I
// leave, rebuild on return" once measurement showed the browser spends ~1.4s
// re-styling the full-year grid every time it is revealed); while it is shown it
// fills to the whole year for smooth scrolling. If this flag lived on the store,
// flipping it would bump the store version and RE-RENDER the entire ~25k-node
// grid on every tab show — the very cost the memo firewall (LeaveWarPage) and
// this whole feature exist to avoid. So it is its own listener set: the fill
// effect subscribes and updates a ref, no React render involved.

let onScreen = false
const listeners = new Set<() => void>()

export function isLwOnScreen(): boolean {
  return onScreen
}

export function setLwOnScreen(next: boolean): void {
  if (next === onScreen) return
  onScreen = next
  listeners.forEach(fn => fn())
}

/* LEAVING THE LEAVE WAR, said to every listener even when the grid was already off screen (the fresh read's finding 1,
   29 Oct 26): while the Balances or Approvals page stands in the grid's place the flag is already false, so the leave
   changed nothing and a window armed over that page ("Really reset?", a Delete) was never told — it came back armed, one
   tap from acting. Every listener that only reads the flag sees no change in it (the fill returns on an unchanged false). */
export function lwLeft(): void {
  onScreen = false
  listeners.forEach(fn => fn())
}

export function subLwScreen(fn: () => void): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

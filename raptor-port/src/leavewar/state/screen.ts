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

export function subLwScreen(fn: () => void): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

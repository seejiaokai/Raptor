/* A WINDOW OPEN AT A PICK IS READ ONLY UNDER ITS BAND (batch 1's second half §16 D2, §9 F7; his D2323 — the approved
   drawings docs/mock/2026-11-22-msq-b1-screens/img/f7a-*.png and f7b-*.png, drawn by draw-f.mjs f7): every control of the
   window under the band is greyed and does nothing; the window's title strip with its ✕, and the band with its Close,
   stay live, so "close this to go on" can be done. Used by the Leave War's window frame (leavewar/ui/Sheet.tsx) and the
   Input window (ui/InputWindow.tsx) — each window writes its own body, so this works on the DOM it draws, not on its
   markup: every part of the window that holds no live part is made `inert` (no press, no focus, no key — the browser's own
   lock), marked `data-heldro` for the greyed look (ui/scheduler/17-save-status.css), and put back as it was when the band
   goes. A part drawn later (a row added, a question shown) is caught by a watch on the window, so nothing new slips out of
   the lock — and a live part drawn later (the ✕'s own question) is left live. */
const MARK = 'data-heldro'

/** lock `root` read only except the parts matching `live` (a selector); returns the undo */
export function holdReadOnly(root: HTMLElement, live: string): () => void {
  const set = new Set<Element>()
  const isLive = (e: Element) => e.matches(live)
  const apply = () => {
    /* a part locked earlier that now is, or holds, a live part (a question shown inside it): unlocked first */
    for (const e of [...set]) {
      if (!e.isConnected || isLive(e) || e.querySelector(live)) { unlock(e); set.delete(e) }
      /* its own window took `inert` off it (React, as a form stops being read only — the night's security read): the hold
         still stands, so the part stays locked */
      else if (!e.hasAttribute('inert')) e.setAttribute('inert', '')
    }
    const walk = (node: Element) => {
      for (const c of Array.from(node.children)) {
        if (isLive(c)) continue
        if (c.querySelector(live)) { walk(c); continue }
        if (c.hasAttribute(MARK)) continue
        if (c.hasAttribute('inert')) continue          // locked by its own window already: left as it is
        c.setAttribute('inert', ''); c.setAttribute(MARK, ''); set.add(c)
      }
    }
    walk(root)
  }
  const unlock = (e: Element) => { e.removeAttribute('inert'); e.removeAttribute(MARK) }
  apply()
  const watch = typeof MutationObserver === 'function' ? new MutationObserver(apply) : null
  watch?.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['inert'] })
  return () => { watch?.disconnect(); for (const e of set) unlock(e); set.clear() }
}

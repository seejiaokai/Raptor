/* SWAP ONLY THE CHANGED BLOCKS OF A CHANGED DAY (owner, 6 Sep 26 — the drop
   round: "make the drop snappier"). The two weeks repaint by comparing each
   day's fresh markup string with the last one written and rewriting the days
   that differ (ViewWeek/EditWeek). A day is ~1,500 elements, and rewriting it
   whole for one new puck was most of the drop's redraw on a slow laptop:
   re-parsing the string, re-styling every element of the day and laying the
   subtree out from scratch (~160 ms of a ~600 ms drop task at 4× CPU). The
   day's markup has a stable shape — <section class="day"> holding a head, an
   optional sign-off strip and a <div class="day-body"> whose children are the
   warnings box and one block per schedule section (.dsec on the edit week,
   the bare section wrappers on the view week) — so the swap compares at THAT
   grain and replaces only the blocks whose markup changed. A drop into one
   programme row rewrites one ~150-element block; the other blocks keep their
   nodes.

   HOW THE COMPARISON STAYS HONEST. The live DOM is decorated after every
   repaint (highlights.ts hangs me/sel/hl/dim/wfoc classes on pucks, .armed and
   .oktake rings on slots, dnd's .dragover), so a block's live outerHTML is not
   a fair witness of what was WRITTEN. The witness is the canonical form: the
   block's outerHTML as the browser serialises the freshly PARSED markup,
   before anything decorates it — taken from the <template> the new string is
   parsed into (chunksOf), or re-derived from the previous string on demand
   (chunksOfHTML) when a whole-week rebuild did not keep any. Two canonical
   strings equal ⇒ the block was written identically both times ⇒ the live
   node (decorations and all) is the right node to keep; refreshHighlights
   re-hangs its classes after every repaint exactly as it did when the whole
   day was fresh.

   THE FALLBACK IS THE OLD BEHAVIOUR. Any shape mismatch — a different number
   of top-level children (a sign-off strip appearing), a different number of
   blocks (a section added or removed, a preview banner), a live child list
   that no longer matches what was written (anything else having inserted or
   removed a child), a day that is not a <section> at all — replaces the whole
   day node in one go, as `outerHTML =` always did. Index-based matching is
   therefore never trusted across a structural change: blocks are matched by
   position only when both the previous canonical list and the live child
   list agree on the count, and the fallback costs exactly what today costs. */

export type BodyChunk = { attrs: string; kids: string[] }
export type DayChunks = { attrs: string; kids: (string | BodyChunk)[] }

const kidsOf = (el: Element): Element[] => Array.from(el.children)
function attrsOf(el: Element): string {
  const a: string[] = []
  for (let i = 0; i < el.attributes.length; i++) a.push(el.attributes[i]!.name + '=' + el.attributes[i]!.value)
  return a.join('')
}
/* the canonical chunk list of a day element — call it on a node the browser
   has just parsed (a <template>'s child, or a section right after an
   innerHTML write) and never on a decorated live node */
export function chunksOf(sec: Element): DayChunks {
  return {
    attrs: attrsOf(sec),
    kids: kidsOf(sec).map(c => c.classList.contains('day-body')
      ? { attrs: attrsOf(c), kids: kidsOf(c).map(x => x.outerHTML) }
      : c.outerHTML),
  }
}
export function parseDay(html: string): Element | null {
  const tpl = document.createElement('template')
  tpl.innerHTML = html
  return tpl.content.firstElementChild
}
export function chunksOfHTML(html: string): DayChunks | null {
  const el = parseDay(html)
  return el ? chunksOf(el) : null
}
/* set the live element's attributes to the parsed one's — the section's own
   class list (today/dok/preview) and data-day are the only things that live
   here, and a runtime-added class on the section would have been lost by the
   whole-node replacement too */
function syncAttrs(live: Element, next: Element) {
  for (let i = live.attributes.length - 1; i >= 0; i--) {
    const n = live.attributes[i]!.name
    if (!next.hasAttribute(n)) live.removeAttribute(n)
  }
  for (let i = 0; i < next.attributes.length; i++) {
    const a = next.attributes[i]!
    if (live.getAttribute(a.name) !== a.value) live.setAttribute(a.name, a.value)
  }
}
/* does the freshly parsed shape line up, block for block, with BOTH what was
   previously written and what is live now? Only then are blocks matched by
   position. */
function fits(live: Element, next: Element, prev: DayChunks | null, chunks: DayChunks): boolean {
  if (!prev || live.tagName !== next.tagName) return false
  if (prev.kids.length !== chunks.kids.length) return false
  const lk = kidsOf(live)
  if (lk.length !== chunks.kids.length) return false
  return chunks.kids.every((k, i) => {
    const p = prev.kids[i]!, l = lk[i]!
    if (typeof k === 'string') return typeof p === 'string'
    return typeof p !== 'string' && p.kids.length === k.kids.length
      && l.classList.contains('day-body') && l.children.length === k.kids.length
  })
}
/* Rewrite `live` to show `html`. Returns the canonical chunks of what is now
   on screen, for the caller to keep as `prev` for the next repaint. `prev` is
   the chunks the caller kept from the last write of this day (null after a
   whole-week rebuild that kept none — pass chunksOfHTML(previousString), or
   null to force the whole-node fallback). */
export function swapDay(live: Element, html: string, prev: DayChunks | null): DayChunks {
  const next = parseDay(html)
  if (!next) { live.outerHTML = html; return { attrs: '', kids: [] } }
  const chunks = chunksOf(next)
  if (!fits(live, next, prev, chunks)) { live.replaceWith(next); return chunks }
  if (chunks.attrs !== prev!.attrs) syncAttrs(live, next)
  const lk = kidsOf(live), nk = kidsOf(next)
  chunks.kids.forEach((k, i) => {
    const p = prev!.kids[i]!, l = lk[i]!, n = nk[i]!
    if (typeof k === 'string') { if (k !== p) l.replaceWith(n); return }
    const pb = p as BodyChunk
    if (k.attrs !== pb.attrs) syncAttrs(l, n)
    const lb = kidsOf(l), nb = kidsOf(n)
    k.kids.forEach((s, j) => { if (s !== pb.kids[j]) lb[j]!.replaceWith(nb[j]!) })
  })
  return chunks
}

/* THE BLOCK HOLDING THE CARET IS LEFT STANDING — EVERY OTHER BLOCK IS WRITTEN (W15, the Codex stack check, 5 Oct 26).
   "Never repaint under the caret" was kept by repainting nothing at all while a text box had it. That was a moment
   when Tab left the text boxes after two or three of them; with the Tab route a scheduler can type through a whole day,
   and for all of that time the day's warning list, its count, "N pending" and the sign-off strip stood still — a
   warning made by a Tab commit was not in the list (D509 says it is).
   Same comparison, same grain, as swapDay above; the one difference is `keep`, the element with the caret: a block
   that contains it is not replaced, and the chunk handed back for it is the PREVIOUS one — so what comes back still
   describes what is on screen, and the ordinary swap that runs when the caret leaves finds that block different and
   writes it then. A change that would need the whole day replaced (a shape mismatch — swapDay's fallback) writes
   nothing while the caret is in that day: `held` says something is still owed, either way. A day that does not hold
   the caret is swapped the ordinary way. */
export function swapDayAround(live: Element, html: string, prev: DayChunks | null, keep: Element): { chunks: DayChunks | null; held: boolean } {
  const holds = (el: Element) => el === keep || el.contains(keep)
  if (!holds(live)) return { chunks: swapDay(live, html, prev), held: false }
  const next = parseDay(html)
  if (!next || !prev) return { chunks: prev, held: true }
  const chunks = chunksOf(next)
  /* THE WARNINGS BOX COMES AND GOES (the Tab-route reader's second pass, 6 Oct 26). A day with nothing to warn about
     draws no box, so its FIRST warning — and the clearing of its last — changes the day's block count; that sent the
     whole day to the hold below, the very case this function exists for. The box is always the day-body's first block
     and never holds a caret: put it in (a copy of the freshly parsed one) or take it out, tell `prev` the same, and
     the ordinary block-for-block pass then sees a day that lines up. */
  const bodyOf = (el: Element) => kidsOf(el).find(c => c.classList.contains('day-body')) || null
  const boxOf = (b: Element | null) => (b && b.firstElementChild && b.firstElementChild.classList.contains('dwbox')) ? b.firstElementChild : null
  const lb = bodyOf(live), nb = bodyOf(next), lw = boxOf(lb), nw = boxOf(nb)
  if (lb && nb && !!lw !== !!nw && !(lw && holds(lw))) {
    const at = kidsOf(live).indexOf(lb), pb = prev.kids[at]
    if (pb && typeof pb !== 'string' && pb.kids.length === lb.children.length) {
      if (nw) { lb.prepend(nw.cloneNode(true)); prev = { attrs: prev.attrs, kids: prev.kids.map((k, i) => i === at ? { attrs: pb.attrs, kids: [nw.outerHTML, ...pb.kids] } : k) } }
      else { lw!.remove(); prev = { attrs: prev.attrs, kids: prev.kids.map((k, i) => i === at ? { attrs: pb.attrs, kids: pb.kids.slice(1) } : k) } }
    }
  }
  if (!fits(live, next, prev, chunks)) return { chunks: prev, held: true }
  if (chunks.attrs !== prev.attrs) syncAttrs(live, next)
  let held = false
  const lk = kidsOf(live), nk = kidsOf(next)
  const shown: DayChunks = { attrs: chunks.attrs, kids: [] }
  chunks.kids.forEach((k, i) => {
    const p = prev.kids[i]!, l = lk[i]!, n = nk[i]!
    if (typeof k === 'string') {
      if (k === p) { shown.kids.push(k); return }
      if (holds(l)) { held = true; shown.kids.push(p); return }
      l.replaceWith(n); shown.kids.push(k); return
    }
    const pb = p as BodyChunk
    if (k.attrs !== pb.attrs) syncAttrs(l, n)
    const lb = kidsOf(l), nb = kidsOf(n)
    shown.kids.push({ attrs: k.attrs, kids: k.kids.map((s, j) => {
      if (s === pb.kids[j]) return s
      if (holds(lb[j]!)) { held = true; return pb.kids[j]! }
      lb[j]!.replaceWith(nb[j]!); return s
    }) })
  })
  return { chunks: shown, held }
}
/* run a write that may move things above the caret, and put the page back so the box he is typing in stays where it
   was on screen (Chromium's own scroll anchoring usually has already; Safari has none) */
export function holdingPlace(caret: Element, write: () => void): void {
  const y0 = caret.getBoundingClientRect().top
  write()
  if (!caret.isConnected) return
  const dy = caret.getBoundingClientRect().top - y0
  if (!dy) return
  let sc: Element | null = caret.parentElement
  while (sc && !(sc.scrollHeight > sc.clientHeight && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement
  const owner = sc || document.scrollingElement
  if (owner && typeof (owner as any).scrollBy === 'function') owner.scrollBy({ top: dy, behavior: 'instant' as ScrollBehavior })
}

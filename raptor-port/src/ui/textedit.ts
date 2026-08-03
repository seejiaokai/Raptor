/* In-place text editing — the reference's focusout/keydown handlers and the
   deferred commit, verbatim logic. Every string commits through txtSet (the
   funnel), Enter commits everywhere (including sim notes), Escape restores
   the model value, and contenteditable drift is healed in place from the
   model rather than by a rebuild. */
import { DAYS } from '../engine/data'
import { txtGet, txtSet, TIME_TXT } from '../engine/slots'
import { markEdit } from '../engine/publish'
import { validate } from '../engine/validate'
import { afterSchedMutate } from '../state/view'
import { fmtTxt, intimesInner, areaText, atimeText } from './html'

let SCRATCH: any = null
function sameInner(el: any, want: any) {
  if (el.innerHTML === want) return true
  if (!SCRATCH) SCRATCH = document.createElement('div')
  SCRATCH.innerHTML = want
  return el.innerHTML === SCRATCH.innerHTML
}

/* Committing inside focusout would tear out the element the user is tabbing
   INTO — so validate now, and run the full mutate epilogue a macrotask later,
   only once focus has left every text field (the reference's txtCommit). */
let TXTQ = 0
function txtCommit() {
  validate()
  if (TXTQ) return; TXTQ = 1
  setTimeout(() => {
    TXTQ = 0
    const a = document.activeElement as any
    if (a && a.closest && (a.closest('[data-txt]') || a.isContentEditable)) return
    afterSchedMutate()
  }, 0)
}

const heal = (el: any, want: any) => { if (el.children.length || el.textContent !== want) el.textContent = want }

export function routeFocusOut(e: FocusEvent) {
  const t = e.target as HTMLElement
  if (!t || !t.closest) return
  const tx = t.closest('[data-txt]') as HTMLElement | null
  if (tx) {
    const p = tx.dataset.txt!
    if (txtSet(p, tx.textContent)) { markEdit(); txtCommit() }
    else { const v = txtGet(p); heal(tx, TIME_TXT.test(p) ? fmtTxt(v) : String(v == null ? '' : v)) }
    return
  }
  const it = t.closest('[data-intimes]') as HTMLElement | null
  if (it) {
    const [di, gi] = it.dataset.intimes!.split('|'); const w = DAYS[+di!].waves[+gi!]
    const nv = [...it.querySelectorAll('span')].map(s => s.textContent!.trim()).filter(Boolean)
    if (nv.join('|') !== (w.intimes || []).join('|')) { w.intimes = nv; markEdit(`it:${di}.${gi}`); txtCommit() }
    const want = intimesInner(w); if (!sameInner(it, want)) it.innerHTML = want
    return
  }
  /* the typed stores text ("bombs…") — opts.bombs lives outside the txt-key
     grammar, so it commits here exactly as the reference's focusout did */
  const bo = t.closest('[data-bombs]') as HTMLElement | null
  if (bo) {
    const [di, gi, li, ai] = bo.dataset.bombs!.split('.')
    const a = DAYS[+di!].waves[+gi!].formations[+li!].aircraft[+ai!]
    a.opts = a.opts || {}; const nv = bo.textContent!.trim()
    if (nv !== (a.opts.bombs || '')) { a.opts.bombs = nv; markEdit(`st:${di}.${gi}.${li}.${ai}`); txtCommit() }
    heal(bo, a.opts.bombs || '')
    return
  }
  /* the AREA / AREA-TIME strip under a formation — like bombs, these live
     outside the txt-key grammar and commit here, as the reference did */
  const ar = t.closest('[data-area]') as HTMLElement | null
  if (ar) {
    const [di, gi, li] = ar.dataset.area!.split('.')
    const f = DAYS[+di!].waves[+gi!].formations[+li!]
    const nv = ar.textContent!.trim()
    if (nv !== (f.area != null ? f.area : '')) { f.area = nv; markEdit(`ar:${di}.${gi}.${li}`); txtCommit() }
    heal(ar, areaText(f))
    return
  }
  const at = t.closest('[data-atime]') as HTMLElement | null
  if (at) {
    const [di, gi, li] = at.dataset.atime!.split('.')
    const f = DAYS[+di!].waves[+gi!].formations[+li!]
    const nv = at.textContent!.trim()
    if (nv !== (f.atime != null ? f.atime : '')) { f.atime = nv; markEdit(`at:${di}.${gi}.${li}`); txtCommit() }
    heal(at, atimeText(f))
  }
}

export function routeKeyDown(e: KeyboardEvent) {
  const t = e.target as HTMLElement
  const tx = t && t.closest && t.closest('[data-txt]') as HTMLElement | null
  if (!tx) return
  /* Enter commits a one-line text field instead of inserting a line break;
     Escape abandons the edit and puts the model value back. Enter commits in
     the sim-notes block too — txtSet collapses the break anyway. */
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); tx.blur() }
  else if (e.key === 'Escape') {
    const v = txtGet(tx.dataset.txt); e.preventDefault()
    tx.textContent = TIME_TXT.test(tx.dataset.txt!) ? fmtTxt(v) : String(v == null ? '' : v); tx.blur()
  }
}

/* the EditWeek effect asks this before swapping day markup: never repaint
   under the caret (the reference's txtCommit guard, as a predicate) */
export function editingText() {
  const a = document.activeElement as any
  return !!(a && a.closest && (a.closest('[data-txt]') || a.isContentEditable))
}

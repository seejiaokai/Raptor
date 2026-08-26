/* In-place text editing — the reference's focusout/keydown handlers and the
   deferred commit, verbatim logic. Every string commits through txtSet (the
   funnel), Enter commits everywhere (including sim notes), Escape restores
   the model value, and contenteditable drift is healed in place from the
   model rather than by a rebuild. */
import { DAYS } from '../engine/data'
import { txtGet, txtSet, TIME_TXT } from '../engine/slots'
import { inpById, inpTimeText } from '../engine/inputs'
import { setInpField } from './inputedit'
import { markEdit } from '../engine/publish'
import { storesText } from '../engine/stores'
import { validate } from '../engine/validate'
import { afterSchedMutate } from '../state/view'
import * as view from '../state/view'
import { notify } from '../state/store'
import { canEditSched } from '../state/auth'
import { fmtTxt, intimeLineHTML, areaText, atimeText } from './html'

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
  /* editMode() (store.ts) drives whether html.ts renders contenteditable="true"
     at all, but a field already focused when a session changes underneath it
     (logout while mid-edit) still fires this handler on blur. Every text
     mutation in this file — data-txt, intimes, bombs, area, atime — funnels
     through this one function before any of them touch the model, so one
     check at the top closes all five without scattering it across branches. */
  if (!canEditSched()) return
  const t = e.target as HTMLElement
  if (!t || !t.closest) return
  const tx = t.closest('[data-txt]') as HTMLElement | null
  if (tx) {
    const p = tx.dataset.txt!
    if (txtSet(p, tx.textContent)) { markEdit(); txtCommit() }
    else { const v = txtGet(p); heal(tx, TIME_TXT.test(p) ? fmtTxt(v) : String(v == null ? '' : v)) }
    return
  }
  /* an INPUT's times and remarks (owner, 10 Aug 26). Outside the data-txt
     grammar on purpose: an input is not schedule data, it has no funnel key,
     and its write is not a schedule write — setInpField goes through
     writeInputsBatch and the accepted-row relink instead of txtSet/markEdit.
     A refusal (an unreadable time, an end before its start) heals the cell
     from the model, exactly as a rejected txtSet does. */
  const ip = t.closest('[data-inp]') as HTMLElement | null
  if (ip) {
    const [id, field] = ip.dataset.inp!.split('.')
    const inp = inpById(id)
    if (!inp) return                       // deleted or undone from under the caret
    const ok = setInpField(inp, field as any, ip.textContent)
    if (ok) txtCommit()
    else heal(ip, field === 'rmks' ? (inp.remarks || '') : inpTimeText(inp, field))
    return
  }
  /* ONE in-time line commits itself (owner's iPhone, 21 Aug 26). The block
     used to be a single contenteditable scraped span-by-span, and iOS WebKit
     broke it twice over: a ✕ button inside the editable region was not
     reliably tappable, and typing after a deletion let WebKit clone a span so
     the scrape read the same text twice. Each line is its own contenteditable
     span now — whatever WebKit does INSIDE it, the commit reads that one
     span's textContent and nothing else.
     READ BEFORE THE ASSIGNMENT — this and the three below are the fields that
     live outside the txt-key grammar, so they write the model themselves and
     call markEdit by hand instead of going through txtSet. That is why they
     used to leave the edit log empty: markEdit logs only when handed both
     values (editlog.ts), and none of them passed any. */
  const il = t.closest('[data-itline]') as HTMLElement | null
  if (il) {
    const [di, gi, ixs] = il.dataset.itline!.split('|'); const ix = +ixs!
    const w = DAYS[+di!].waves[+gi!]
    const lines = w.intimes || []
    if (lines[ix] == null) return              // deleted or undone from under the caret
    const nv = (il.textContent || '').trim()
    const itWas = lines.join(', ')
    if (!nv) {
      /* clearing a line's text still deletes it, as the old block did — and
         its DOM pair goes NOW, so the ✕ buttons beside it keep their true
         positions until the deferred repaint lands (interactions.ts resolves
         a ✕ by position, exactly for this window) */
      w.intimes = lines.filter((_: any, i: number) => i !== ix)
      markEdit(`it:${di}.${gi}`, itWas, w.intimes.join(', '))
      const btn = il.nextElementSibling
      if (btn && (btn as HTMLElement).matches && (btn as HTMLElement).matches('[data-itdel]')) btn.remove()
      il.remove()
      txtCommit()
      return
    }
    if (nv !== lines[ix]) {
      w.intimes = lines.map((v: any, i: number) => i === ix ? nv : v)
      markEdit(`it:${di}.${gi}`, itWas, w.intimes.join(', '))
      txtCommit()
    }
    const want = intimeLineHTML(nv); if (!sameInner(il, want)) il.innerHTML = want
    return
  }
  /* the typed stores text ("bombs…") — opts.bombs lives outside the txt-key
     grammar, so it commits here exactly as the reference's focusout did */
  const bo = t.closest('[data-bombs]') as HTMLElement | null
  if (bo) {
    const [di, gi, li, ai] = bo.dataset.bombs!.split('.')
    const a = DAYS[+di!].waves[+gi!].formations[+li!].aircraft[+ai!]
    a.opts = a.opts || {}; const nv = bo.textContent!.trim()
    /* the WHOLE stores load either side, not just the bombs text: the chips and
       this box share one address (`st:` is per-aircraft, because the amendment
       mark is), so a log row naming only half of it would carry the same label
       as a chip toggle and contradict it. storesText is the engine's own
       rendering of that cell — see stores.ts. */
    const stWas = storesText(a.opts)
    if (nv !== (a.opts.bombs || '')) {
      a.opts.bombs = nv; markEdit(`st:${di}.${gi}.${li}.${ai}`, stWas, storesText(a.opts))
      /* the save CONFIRM (owner, 26 Aug 26 — "no indication or feedback…
         idk if it's saved or not"): the box saves on blur with nothing
         shown, so a commit that changed the load pulses the box green.
         Class on the live node NOW for the frames before the repaint,
         registry (state/view.ts STSAVED) so the rebuilt span keeps it —
         the deferred repaint would otherwise swallow the flash. Only a
         CHANGED commit flashes: tabbing through an untouched box saved
         nothing and must not claim it did. */
      view.noteStSaved(bo.dataset.bombs!)
      bo.classList.remove('stsaved'); void bo.offsetWidth; bo.classList.add('stsaved')
      txtCommit()
    }
    heal(bo, a.opts.bombs || '')
    return
  }
  /* the AREA / AREA-TIME strip under a formation — like bombs, these live
     outside the txt-key grammar and commit here, as the reference did */
  /* COMPARE AGAINST WHAT THE CELL IS SHOWING, not against the model field
     (owner, 6 Aug 26). These two are the only cells whose displayed value is
     DERIVED — area codes off the aircraft, the window off the formation's
     TO–LD — so `f.area`/`f.atime` are null while the cell already reads
     "D1415 · AA2NS" and "1240-1405". Comparing the text to '' therefore said
     "changed" for a cell nobody had touched: clicking in and straight back
     out, or tabbing through, wrote the derived value into the model as if a
     scheduler had typed it.
     That was never only cosmetic, though the dashed "edited" hint is what
     gets noticed. The write FREEZES the cell: `atimeText` prefers the stored
     value, so once it exists the strip stops following TO–LD, and moving the
     take-off leaves the airspace window silently wrong. It also puts a
     no-op change into the next amendment.
     areaText/atimeText are the same functions the builder renders with, which
     is what keeps this honest — a real edit still differs from them and still
     commits, and clearing a cell still stores '' rather than reverting. */
  const ar = t.closest('[data-area]') as HTMLElement | null
  if (ar) {
    const [di, gi, li] = ar.dataset.area!.split('.')
    const f = DAYS[+di!].waves[+gi!].formations[+li!]
    const nv = ar.textContent!.trim()
    /* areaText(f) is what the cell is SHOWING, derived or stored (see the long
       comment above), so it is also the honest "before" for the log */
    const arWas = areaText(f)
    if (nv !== arWas) { f.area = nv; markEdit(`ar:${di}.${gi}.${li}`, arWas, nv); txtCommit() }
    heal(ar, areaText(f))
    return
  }
  const at = t.closest('[data-atime]') as HTMLElement | null
  if (at) {
    const [di, gi, li] = at.dataset.atime!.split('.')
    const f = DAYS[+di!].waves[+gi!].formations[+li!]
    const nv = at.textContent!.trim()
    const atWas = atimeText(f)
    if (nv !== atWas) { f.atime = nv; markEdit(`at:${di}.${gi}.${li}`, atWas, nv); txtCommit() }
    heal(at, atimeText(f))
  }
}

export function routeKeyDown(e: KeyboardEvent) {
  const t = e.target as HTMLElement
  /* an input's cells get the same two keys as every other text cell — Enter
     commits (by blurring, which runs the branch above), Escape puts the model
     value back. They are not data-txt keys, so they are restored from the
     input rather than through txtGet. */
  const ic = t && t.closest && t.closest('[data-inp]') as HTMLElement | null
  if (ic) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ic.blur() }
    else if (e.key === 'Escape') {
      const [id, field] = ic.dataset.inp!.split('.')
      const inp = inpById(id); e.preventDefault()
      if (inp) ic.textContent = field === 'rmks' ? (inp.remarks || '') : inpTimeText(inp, field)
      ic.blur()
    }
    return
  }
  /* THE BOARD'S OWN BOXES GET THE SAME TWO KEYS (20 Aug 26). They were plain
     <input>s until the wrapping pass, and an <input> commits on Enter by
     itself — firing `change`, which is the board's write path. A <textarea>
     does not: Enter inserts a line break there, so without this branch the
     very change that made the boxes wrap would also have made Enter stop
     saving. Blurring commits through the same `change` the input fired, so
     the write path is untouched.
     Escape now restores too, which the board never had — a typed-but-unwanted
     value could only be undone by retyping it. `data-bfld` restores through
     `txtGet` (it is a funnel key); `data-ifld` is an INPUT's own field, which
     has no funnel key, so it is left to blur and let boardChange's own revert
     branch put the model value back. */
  const bx = t && t.closest && t.closest('[data-bfld],[data-ifld]') as HTMLElement | null
  if (bx && (bx as any).tagName === 'TEXTAREA') {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); bx.blur() }
    else if (e.key === 'Escape') {
      e.preventDefault()
      const k = (bx as any).dataset.bfld
      if (k) { const v = txtGet(k); (bx as any).value = String(v == null ? '' : v) }
      bx.blur()
    }
    return
  }
  /* an IN-TIME line gets the same two keys (21 Aug 26, with the per-line
     rework): Enter commits by blurring into the branch above, Escape puts the
     model's line back — including a line mid-mangle on a phone keyboard. */
  const il = t && t.closest && t.closest('[data-itline]') as HTMLElement | null
  if (il) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); il.blur() }
    else if (e.key === 'Escape') {
      e.preventDefault()
      const [di, gi, ix] = il.dataset.itline!.split('|')
      const v = (DAYS[+di!].waves[+gi!].intimes || [])[+ix!]
      il.innerHTML = intimeLineHTML(v == null ? '' : v)
      il.blur()
    }
    return
  }
  /* THE THREE FORMATION-STRIP CELLS OUTSIDE THE TXT GRAMMAR GET THE SAME TWO
     KEYS (owner, 26 Aug 26 — "there's no feedback when adding config in the
     free text", reported twice: pressing Enter in the stores box only
     inserted an invisible line break in the contenteditable span — no
     commit, no save flash, nothing. This file's own header says "Enter
     commits everywhere", and these three were the gap). Enter blurs into
     routeFocusOut's own branch, which IS the write path — and, for the
     stores box, what fires the .stsaved confirm. Escape restores what the
     cell was SHOWING: the model's bombs text, or the derived
     areaText/atimeText — the same functions the builder renders with (see
     the derived-cells comment in routeFocusOut for why the model field
     alone is the wrong restore). */
  const fx = t && t.closest && t.closest('[data-bombs],[data-area],[data-atime]') as HTMLElement | null
  if (fx) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); fx.blur() }
    else if (e.key === 'Escape') {
      e.preventDefault()
      const d = (fx as any).dataset
      if (d.bombs) {
        const [di, gi, li, ai] = d.bombs.split('.')
        const a = DAYS[+di!].waves[+gi!].formations[+li!].aircraft[+ai!]
        fx.textContent = (a.opts && a.opts.bombs) || ''
      } else {
        const [di, gi, li] = (d.area || d.atime).split('.')
        const f = DAYS[+di!].waves[+gi!].formations[+li!]
        fx.textContent = d.area ? areaText(f) : atimeText(f)
      }
      fx.blur()
    }
    return
  }
  const tx = t && t.closest && t.closest('[data-txt]') as HTMLElement | null
  /* Escape outside a text field puts an armed slot down — the reference's
     global escape hatch (ref 4201), lost in the port. Inside a text field
     Escape keeps its restore-the-text meaning below. */
  if (!tx) {
    if (e.key === 'Escape' && view.ARM) { view.disarmSlot(); notify() }
    return
  }
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
  return !!(a && a.closest && (a.closest('[data-txt]') || a.closest('[data-inp]') || a.isContentEditable))
}

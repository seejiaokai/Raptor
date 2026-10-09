/* THE "?" BESIDE AN INPUT'S TYPE — what each kind means, opened on demand.

   MOVED HERE WHOLE from ui/InputsPage.tsx on 10 Oct 26 (owner D729 — the design vet's V1: "the Inputs list's own add
   form goes and one '+ Input' button … opens the same window the calendar opens"). The legend lived ONLY in that form —
   it is the one place that says ATT B may still stand a duty — so with the form gone it stands beside Type in the
   input's own window on the Inputs page (ui/inputedit.tsx), for a new input and a saved one alike.

   The legend the owner asked for: a button by the type field saying what each abbreviation means. Generated from
   INPUT_META so it cannot describe a rule the engine does not apply — which is the whole reason the table exists.
   It is an anchored popover rather than a modal: it is a reference card, not a task. */
import { useEffect, useRef, useState } from 'react'
import { INPUT_TYPES, TYPE_GROUPS, inpMeta, inputRuleText, typeGroup } from '../engine/inputs'

/* The cost sentence is inputRuleText (engine/inputs) — the SAME source the
   Logic page's type matrix reads, so this legend and the rule book cannot tell
   different stories. It used to hand-write its own shorter copy here; a guard
   test now fails if either surface stops reading the shared source. */
function typeRule(t: string) {
  return inputRuleText(t)
}
/* "Training — training" says nothing twice. A code only earns a spelt-out
   name when it IS an abbreviation, the same test offWord makes. */
function typeName(t: string) {
  const n = ((inpMeta(t) || {}).name || '')
  return n.toLowerCase() === t.toLowerCase() ? '' : n
}
/* the rule the most of a group shares, or '' when they genuinely differ */
function groupRule(ts: string[]) {
  const n: any = {}
  ts.forEach(t => { const r = typeRule(t); n[r] = (n[r] || 0) + 1 })
  const best = Object.keys(n).sort((a, b) => n[b] - n[a])[0] || ''
  return n[best] > 1 ? best : ''
}
export function TypeLegend() {
  const [open, setOpen] = useState(false)
  const box = useRef<any>(null)
  /* mousedown rather than click, for the same reason the date window uses it:
     a click that starts inside and ends outside must not close the popover */
  useEffect(() => {
    if (!open) return
    const away = (e: any) => { if (box.current && !box.current.contains(e.target)) setOpen(false) }
    /* Escape closes the card and NOTHING ELSE: it stands in the input's window now, whose own Escape closes the window
       and loses what was typed. The window listens on the document as the key goes DOWN the page; this listens on the
       window object itself, which the key reaches first, and stops it there. */
    const esc = (e: any) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false) } }
    document.addEventListener('mousedown', away)
    window.addEventListener('keydown', esc, true)
    return () => { document.removeEventListener('mousedown', away); window.removeEventListener('keydown', esc, true) }
  }, [open])
  return <span className="tylegend" ref={box}>
    <button type="button" className={'tylegend-b' + (open ? ' on' : '')} id="inTypeHelp"
      aria-expanded={open} title="What do these mean?" onClick={() => setOpen(o => !o)}>?</button>
    {open && <div className="tylegend-pop" id="inTypePop">
      <div className="tylegend-h">What each type means</div>
      {TYPE_GROUPS.map((g: any) => {
        const ts = INPUT_TYPES.filter((t: string) => typeGroup(t) === g.k)
        /* Most of a group shares one rule — eight identical lines under Leave
           is noise a reader has to look past to find the one that differs. So
           the shared rule goes on the GROUP, and a row prints its own only
           when it is an exception (OL, OD, ATT B). */
        const common = groupRule(ts)
        return <div key={g.k} className="tylegend-g">
          <div className="tylegend-gt">{g.t}</div>
          {common && <div className="tylegend-gr">{common}</div>}
          {ts.map((t: string) => {
            const r = typeRule(t)
            return <div key={t} className="tylegend-r">
              <b>{t}</b><span>{typeName(t)}{r !== common && <i>{r}</i>}</span>
            </div>
          })}
        </div>
      })}
    </div>}
  </span>
}

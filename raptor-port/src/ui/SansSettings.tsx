/* THE SANS CALENDAR'S SETTINGS — the window behind its gear (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.5 "The gear", §3.9).

   Owner, D618 (7 Oct 26): "allow the admin to click on a setting icon at the top of the calendar to set the yellow amber
   and red for the calendar to show globally" — one setting for the squadron, three figures, by how many more are
   needed (pilots and WSOs added together), starting at 1 / 3 / 5. D628 / D639: the SANS late cut-off, as a number of
   days or as a weekday of a number of weeks before, behind THIS calendar's own gear (the Inputs calendar has its own).
   D675: the window that sets each date's flying is called "Calendar" on screen — its door here reads "Calendar…".

   A WINDOW ON THE SHELL (D641): it drags, and the calendar behind it still works. Admins only — the window itself is
   the gate, as Days' is: asked for by anyone else it draws nothing and is not left asked for. Mounted once (ui/App.tsx)
   and opened by ui/pops.ts SANSSET, so the Logic page's row can open this same window (D639: one setting, two ways in).

   NOTHING IS SAVED UNTIL SAVE. The figures typed are a draft; Cancel, ✕ and Escape throw it away. Save checks BOTH
   halves before it writes either — a bad cut-off never leaves the colours half-saved — then writes only what changed:
   the colours by their own command (state/flyplan.ts saveTones), the cut-off through the commit the Logic page uses
   (state/cutoff.ts saveCut). Each is one Undo step.

   A WORKED DATE sits under the cut-off — "For the week of Mon 19 Oct, commitments are due by the end of Wed 7 Oct." —
   from the draft, so he sees what a choice means before he saves it. ("How this works" on the calendar states the rule
   only, D646; the date an entry missed is said by its LATE tag.) */
import { useEffect, useState } from 'react'
import { adminOfUnit } from '../state/perms'
import { notify } from '../state/store'
import { getTones, saveTones, type FlySave } from '../state/flyplan'
import { validTones } from '../state/flyplan-model'
import { cutProblem, forgetWin, getCut, openWinFor, saveCut, winStale, winUnit, type CutRule } from '../state/cutoff'
import { CALMONTH } from '../state/view'
import { FloatWin } from './FloatWindow'
import { bringForward, openBeside } from './winorder'
import { SANSSET, setDaysWin, setSansSet } from './pops'
import { CutFields } from './CutFields'
import { cutDraftOf, cutRuleOf } from './cutdraft'
import { useVersion } from './useStore'
import { useGuardWork } from './guard'

export function SansSettings({ unit }: { unit?: string } = {}) {
  useVersion()
  /* …and it goes with its page's squadron (state/cutoff.ts winStale — the fix round of 22 Nov 26) */
  const refused = SANSSET && (!adminOfUnit(unit ?? winUnit('sans')) || (unit === undefined && winStale('sans')))
  useEffect(() => { if (refused) setSansSet(false) }, [refused])
  /* THE SQUADRON IT EDITS (the reshape plan §3.2 A-ii; the host's ruling of 21 Nov 26): the page it was opened from —
     `unit` when handed in, else what its door named (state/cutoff.ts openWinFor: a calendar's gear its own squadron),
     else the pick (the Logic page's doors name none). It forgets the door's squadron once closed, so the next opening that
     names none is the pick's again; keyed by it, so a draft never carries over to another squadron. */
  useEffect(() => { if (!SANSSET) forgetWin('sans') })
  if (!SANSSET || refused) return null
  const u = unit ?? winUnit('sans')
  return <Body key={u} unit={u} />
}

/* a typed figure: a whole number, or NaN for anything that is not one — so "x" and "" are refused, never read as 0 */
const num = (v: string): number => (/^\d+$/.test(v.trim()) ? +v.trim() : NaN)

function Body({ unit }: { unit: string }) {
  const [tones] = useState(() => getTones(unit))
  const [cut] = useState(() => getCut('sans', unit))
  const [yellow, setYellow] = useState(String(tones.yellowFrom))
  const [amber, setAmber] = useState(String(tones.amberFrom))
  const [red, setRed] = useState(String(tones.redFrom))
  /* the cut-off's draft and its fields are one body with the Inputs calendar's window (ui/CutFields.tsx) */
  const [cutDraft0] = useState(() => cutDraftOf(cut))
  const [cutDraft, setCutDraft] = useState(cutDraft0)
  const [err, setErr] = useState('')
  /* ANYTHING CHANGED SINCE IT OPENED: the guard counts the window then; unchanged, it closes by itself at a pick with the
     Calendar (ui/guard.ts — his D2654 E1) */
  useGuardWork('sansset', yellow !== String(tones.yellowFrom) || amber !== String(tones.amberFrom) || red !== String(tones.redFrom)
    || JSON.stringify(cutDraft) !== JSON.stringify(cutDraft0))

  const close = () => { setSansSet(false); notify() }
  const rule: CutRule = cutRuleOf(cutDraft)

  const save = () => {
    const t = { yellowFrom: num(yellow), amberFrom: num(amber), redFrom: num(red) }
    if (!validTones(t)) return setErr('Use whole numbers of 1 or more, each above the last: yellow, then amber, then red.')
    const bad = cutProblem('sans', rule)
    if (bad) return setErr(bad)
    const done = (r: FlySave) => {
      if (!r.ok) return setErr(r.message || 'The colours could not be saved. Try again.')
      const c = saveCut('sans', rule, unit)
      if (!c.ok) return setErr(c.message || 'The cut-off could not be saved. Try again.')
      close()
    }
    const same = t.yellowFrom === tones.yellowFrom && t.amberFrom === tones.amberFrom && t.redFrom === tones.redFrom
    const r: FlySave = same ? { ok: true } : saveTones(t, unit)
    if (r.pending) void r.pending.then(done); else done(r)
  }
  const openDays = () => {
    const now = new Date(), m = CALMONTH || { y: now.getFullYear(), m: now.getMonth() + 1 }
    /* beside this window, never over it (F9's rule, met at every Calendar door — the bug check of 3 Nov 26, W1 S21.4pre) */
    openBeside('days', 'sansset')
    openWinFor('days', unit)
    setDaysWin(`${m.y}-${String(m.m).padStart(2, '0')}-01`); notify(); bringForward('days')
  }
  const box = (id: string, label: string, tone: string, v: string, set: (s: string) => void) => (
    <label className="sset-row">
      <span className={'sset-sw t-' + tone} aria-hidden="true" />
      <span className="sset-lbl">{label}</span>
      <input className="sset-num" data-testid={id} inputMode="numeric" autoComplete="off" value={v} aria-label={label}
        onChange={e => { set(e.target.value); setErr('') }} />
    </label>
  )

  return (
    <FloatWin id="sansset" title="SANS calendar settings" sub="admins only" testid="win-sansset" className="sanswin" onClose={close}>
      <form className="sset" onSubmit={e => { e.preventDefault(); save() }}>
        <div className="sset-sec">Calendar</div>
        <div className="sset-line">
          <button type="button" className="abtn" data-testid="sset-days" onClick={openDays}>Calendar…</button>
          <span className="sset-hint">Day flying, night flying or no fly for each date, and the year’s holidays.</span>
        </div>

        <div className="sset-sec">Day colours · by how many more are needed</div>
        {box('sset-yellow', 'Yellow from', 'yellow', yellow, setYellow)}
        {box('sset-amber', 'Amber from', 'amber', amber, setAmber)}
        {box('sset-red', 'Red from', 'red', red, setRed)}
        <p className="sset-hint">Pilots and WSOs still needed, added together. A day that needs nobody has no colour.</p>

        <div className="sset-sec">Late cut-off for SANS commitments</div>
        <CutFields set="sans" prefix="sset" draft={cutDraft} onChange={d => { setCutDraft(d); setErr('') }} noun="commitments" />

        {err && <p className="sset-err" data-testid="sset-err" role="alert">{err}</p>}
        <div className="sset-foot">
          <button type="button" className="abtn" data-testid="sset-cancel" onClick={close}>Cancel</button>
          <button type="submit" className="abtn primary" data-testid="sset-save">Save</button>
        </div>
      </form>
    </FloatWin>
  )
}

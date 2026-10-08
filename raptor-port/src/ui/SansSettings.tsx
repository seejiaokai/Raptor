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
import { isAdmin } from '../state/perms'
import { notify } from '../state/store'
import { getTones, saveTones, type FlySave } from '../state/flyplan'
import { validTones } from '../state/flyplan-model'
import { cutExample, cutProblem, getCut, saveCut, type CutRule } from '../state/cutoff'
import { CALMONTH } from '../state/view'
import { FloatWin } from './FloatWindow'
import { WD_LONG, isoToday } from './daysfmt'
import { SANSSET, setDaysWin, setSansSet } from './pops'
import { dayWord } from './sanscal-model'
import { useVersion } from './useStore'

export function SansSettings() {
  useVersion()
  const refused = SANSSET && !isAdmin()
  useEffect(() => { if (refused) setSansSet(false) }, [refused])
  if (!SANSSET || refused) return null
  return <Body />
}

/* a typed figure: a whole number, or NaN for anything that is not one — so "x" and "" are refused, never read as 0 */
const num = (v: string): number => (/^\d+$/.test(v.trim()) ? +v.trim() : NaN)

function Body() {
  const [tones] = useState(getTones)
  const [cut] = useState(() => getCut('sans'))
  const [yellow, setYellow] = useState(String(tones.yellowFrom))
  const [amber, setAmber] = useState(String(tones.amberFrom))
  const [red, setRed] = useState(String(tones.redFrom))
  const [mode, setMode] = useState<0 | 1>(cut.mode)
  const [lead, setLead] = useState(String(cut.lead))
  const [wd, setWd] = useState(cut.wd)
  const [weeks, setWeeks] = useState(cut.weeks)
  const [err, setErr] = useState('')

  const close = () => { setSansSet(false); notify() }
  const rule: CutRule = { mode, lead: num(lead), wd, weeks }
  const shown = cutProblem('sans', rule) ? null : cutExample(rule, isoToday())

  const save = () => {
    const t = { yellowFrom: num(yellow), amberFrom: num(amber), redFrom: num(red) }
    if (!validTones(t)) return setErr('Use whole numbers of 1 or more, each above the last: yellow, then amber, then red.')
    const bad = cutProblem('sans', rule)
    if (bad) return setErr(bad)
    const done = (r: FlySave) => {
      if (!r.ok) return setErr(r.message || 'The colours could not be saved. Try again.')
      const c = saveCut('sans', rule)
      if (!c.ok) return setErr(c.message || 'The cut-off could not be saved. Try again.')
      close()
    }
    const same = t.yellowFrom === tones.yellowFrom && t.amberFrom === tones.amberFrom && t.redFrom === tones.redFrom
    const r: FlySave = same ? { ok: true } : saveTones(t)
    if (r.pending) void r.pending.then(done); else done(r)
  }
  const openDays = () => {
    const now = new Date(), m = CALMONTH || { y: now.getFullYear(), m: now.getMonth() + 1 }
    setDaysWin(`${m.y}-${String(m.m).padStart(2, '0')}-01`); notify()
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
        <div className="sset-seg" role="group" aria-label="The cut-off is set as">
          <button type="button" className={'sset-opt' + (mode === 0 ? ' lit' : '')} data-testid="sset-mode-days" aria-pressed={mode === 0} onClick={() => { setMode(0); setErr('') }}>Days before</button>
          <button type="button" className={'sset-opt' + (mode === 1 ? ' lit' : '')} data-testid="sset-mode-wd" aria-pressed={mode === 1} onClick={() => { setMode(1); setErr('') }}>A weekday</button>
        </div>
        {mode === 0 ? (
          <label className="sset-row">
            <span className="sset-lbl">Days before the week starts</span>
            <input className="sset-num" data-testid="sset-lead" inputMode="numeric" autoComplete="off" value={lead} aria-label="Days before the week starts"
              onChange={e => { setLead(e.target.value); setErr('') }} />
          </label>
        ) : (
          <div className="sset-pair">
            <select data-testid="sset-wd" aria-label="Weekday" value={wd} onChange={e => { setWd(+e.target.value); setErr('') }}>
              {WD_LONG.map((w, i) => <option key={w} value={i}>{w}</option>)}
            </select>
            <select data-testid="sset-weeks" aria-label="Weeks before" value={weeks} onChange={e => { setWeeks(+e.target.value); setErr('') }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n === 1 ? 'the week before' : `${n} weeks before`}</option>)}
            </select>
          </div>
        )}
        {shown && <p className="sset-example" data-testid="sset-example">For the week of {dayWord(shown.week)}, commitments are due by the end of {dayWord(shown.due)}.</p>}

        {err && <p className="sset-err" data-testid="sset-err" role="alert">{err}</p>}
        <div className="sset-foot">
          <button type="button" className="abtn" data-testid="sset-cancel" onClick={close}>Cancel</button>
          <button type="submit" className="abtn primary" data-testid="sset-save">Save</button>
        </div>
      </form>
    </FloatWin>
  )
}

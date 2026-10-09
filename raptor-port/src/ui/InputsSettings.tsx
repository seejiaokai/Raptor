/* THE INPUTS CALENDAR'S SETTINGS — the window behind its gear (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.6 "The gear: Days · Late cut-off (Inputs' own)",
   §3.9, and §3.13's switch).

   Owner, D639 (7 Oct 26): the late cut-off is "set behind each calendar's own settings gear … and the Logic page lists
   both" — one setting, two ways in; the Inputs cut-off starts at today's figure, 14 days before the input's week, so
   nothing changes for Inputs until an admin changes it. D628: a number of days, or a weekday of a number of weeks
   before. D654 / D655 (reading 6): members may file duties and commitments for other people "for now" — ONE switch
   puts it back to admins only. D675: the door to the window that sets each date's flying reads "Calendar…".

   A WINDOW ON THE SHELL (D641): it drags, and the calendar behind it still works. Admins only — the window itself is
   the gate, as the SANS calendar's is: asked for by anyone else it draws nothing and is not left asked for. Mounted
   once (ui/App.tsx) and opened by ui/pops.ts INPSET, so the Logic page's rows open this same window.

   NOTHING IS SAVED UNTIL SAVE. What is chosen is a draft; Cancel, ✕ and Escape throw it away. Save checks the cut-off
   before it writes anything — a bad figure never leaves the switch half-saved — then writes only what changed: the
   cut-off through the commit the Logic page uses (state/cutoff.ts, the INPUTS set — the SANS calendar's own is not
   touched), the switch by its own command (state/memberfile.ts). Each is one Undo step, so each can be taken back
   alone.

   SWITCHED OFF, nothing already filed is removed or altered: a member files for himself only, and his right over what
   he had filed for others goes with it (the man and an admin still change those) — state/perms.ts reads the switch
   live at every question. */
import { useEffect, useState } from 'react'
import { isAdmin, membersFileOn } from '../state/perms'
import { notify } from '../state/store'
import { cutProblem, getCut, saveCut } from '../state/cutoff'
import { setMembersFile, type SwitchSave } from '../state/memberfile'
import { CALMONTH } from '../state/view'
import { CutFields, cutDraftOf, cutRuleOf } from './CutFields'
import { FloatWin, bringForward } from './FloatWindow'
import { INPSET, setDaysWin, setInpSet } from './pops'
import { useVersion } from './useStore'

export function InputsSettings() {
  useVersion()
  const refused = INPSET && !isAdmin()
  useEffect(() => { if (refused) setInpSet(false) }, [refused])
  if (!INPSET || refused) return null
  return <Body />
}

function Body() {
  const [cut, setCut] = useState(() => cutDraftOf(getCut('inputs')))
  const [was] = useState(membersFileOn)
  const [members, setMembers] = useState(was)
  const [err, setErr] = useState('')

  const close = () => { setInpSet(false); notify() }
  const save = () => {
    const rule = cutRuleOf(cut)
    const bad = cutProblem('inputs', rule)
    if (bad) return setErr(bad)
    const c = saveCut('inputs', rule)
    if (!c.ok) return setErr(c.message || 'The cut-off could not be saved. Try again.')
    const done = (r: SwitchSave) => {
      if (!r.ok) return setErr(r.message || 'The setting could not be saved. Try again.')
      close()
    }
    const r: SwitchSave = members === was ? { ok: true } : setMembersFile(members)
    if (r.pending) void r.pending.then(done); else done(r)
  }
  const openDays = () => {
    const now = new Date(), m = CALMONTH || { y: now.getFullYear(), m: now.getMonth() + 1 }
    setDaysWin(`${m.y}-${String(m.m).padStart(2, '0')}-01`); notify(); bringForward('days')
  }

  return (
    <FloatWin id="inputsset" title="Inputs calendar settings" sub="admins only" testid="win-inputsset" className="sanswin" onClose={close}>
      <form className="sset" onSubmit={e => { e.preventDefault(); save() }}>
        <div className="sset-sec">Calendar</div>
        <div className="sset-line">
          <button type="button" className="abtn" data-testid="iset-days" onClick={openDays}>Calendar…</button>
          <span className="sset-hint">Day flying, night flying or no fly for each date, and the year’s holidays.</span>
        </div>

        <div className="sset-sec">Late cut-off for inputs</div>
        <CutFields set="inputs" prefix="iset" draft={cut} onChange={d => { setCut(d); setErr('') }} noun="inputs" />
        <p className="sset-hint">An input last changed after its cut-off is marked LATE. Downchits and upchits are never late.</p>

        <div className="sset-sec">Filing for other people</div>
        <label className="sset-check">
          <input type="checkbox" data-testid="iset-memberfile" checked={members} onChange={e => { setMembers(e.target.checked); setErr('') }} />
          <span>Members may file duties and commitments for other people</span>
        </label>
        <p className="sset-hint">Off, a member files for himself only. On or off, never leave, medical or SANS availability — those are filed by the person himself or by an admin.</p>

        {err && <p className="sset-err" data-testid="iset-err" role="alert">{err}</p>}
        <div className="sset-foot">
          <button type="button" className="abtn" data-testid="iset-cancel" onClick={close}>Cancel</button>
          <button type="submit" className="abtn primary" data-testid="iset-save">Save</button>
        </div>
      </form>
    </FloatWin>
  )
}

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
import { adminOfUnit } from '../state/perms'
import { notify } from '../state/store'
import { cutProblem, forgetWin, getCut, openWinFor, saveCut, winStale, winUnit } from '../state/cutoff'
import { membersFileOf, setMembersFile, type SwitchSave } from '../state/memberfile'
import { CALMONTH } from '../state/view'
import { CutFields } from './CutFields'
import { cutDraftOf, cutRuleOf } from './cutdraft'
import { FloatWin } from './FloatWindow'
import { bringForward, openBeside } from './winorder'
import { INPSET, setDaysWin, setInpSet } from './pops'
import { useVersion } from './useStore'
import { useGuardWork } from './guard'

export function InputsSettings({ unit }: { unit?: string } = {}) {
  useVersion()
  /* …and it goes with its page's squadron (state/cutoff.ts winStale — the fix round of 22 Nov 26): opened from 142's gear,
     it closes once the page is another squadron's (his move at midnight, a master admin's pick), nothing saved */
  const refused = INPSET && (!adminOfUnit(unit ?? winUnit('inputs')) || (unit === undefined && winStale('inputs')))
  useEffect(() => { if (refused) setInpSet(false) }, [refused])
  /* THE SQUADRON IT EDITS (the reshape plan §3.2 A-ii; the host's ruling of 21 Nov 26): the page it was opened from —
     `unit` when handed in, else what its door named (state/cutoff.ts openWinFor: a calendar's gear its own squadron),
     else the pick (the Logic page's doors name none). It forgets the door's squadron once closed, so the next opening that
     names none is the pick's again; keyed by it, so a draft never carries over to another squadron. */
  useEffect(() => { if (!INPSET) forgetWin('inputs') })
  if (!INPSET || refused) return null
  const u = unit ?? winUnit('inputs')
  return <Body key={u} unit={u} />
}

function Body({ unit }: { unit: string }) {
  const [cut0] = useState(() => cutDraftOf(getCut('inputs', unit)))
  const [cut, setCut] = useState(cut0)
  /* the window's own squadron's switch, as its cut-off is (the fix round of 22 Nov 26 — state/memberfile.ts membersFileOf) */
  const [was] = useState(() => membersFileOf(unit))
  const [members, setMembers] = useState(was)
  const [err, setErr] = useState('')
  /* ANYTHING CHANGED SINCE IT OPENED: the guard counts the window then; unchanged, it closes by itself at a pick with the
     Calendar (ui/guard.ts — his D2654 E1) */
  useGuardWork('inputsset', JSON.stringify(cut) !== JSON.stringify(cut0) || members !== was)

  const close = () => { setInpSet(false); notify() }
  const save = () => {
    const rule = cutRuleOf(cut)
    const bad = cutProblem('inputs', rule)
    if (bad) return setErr(bad)
    const c = saveCut('inputs', rule, unit)
    if (!c.ok) return setErr(c.message || 'The cut-off could not be saved. Try again.')
    const done = (r: SwitchSave) => {
      if (!r.ok) return setErr(r.message || 'The setting could not be saved. Try again.')
      close()
    }
    const r: SwitchSave = members === was ? { ok: true } : setMembersFile(members, unit)
    if (r.pending) void r.pending.then(done); else done(r)
  }
  const openDays = () => {
    const now = new Date(), m = CALMONTH || { y: now.getFullYear(), m: now.getMonth() + 1 }
    /* beside this window, never over it (F9's rule, met at every Calendar door — the bug check of 3 Nov 26, W1 S21.3f) */
    openBeside('days', 'inputsset')
    openWinFor('days', unit)
    setDaysWin(`${m.y}-${String(m.m).padStart(2, '0')}-01`); notify(); bringForward('days')
  }

  return (
    <FloatWin id="inputsset" title="Inputs calendar settings" sub="admins only" testid="win-inputsset" className="sanswin" onClose={close}>
      <form className="sset" onSubmit={e => { e.preventDefault(); save() }}>
        <div className="sset-sec">Calendar</div>
        <div className="sset-line">
          <button type="button" className="abtn" data-testid="iset-days" onClick={openDays}>Calendar…</button>
          {/* ONE SHORT LINE A SETTING (owner D729 — the design vet's V5, 10 Oct 26; D726: "I don't like too wordy
              interface"): each of the three helper lines here says what it said, in fewer words — as drawn,
              docs/mock/img/inputs-vet/desk-gear-drawn.png. The worked example under the cut-off stays: it is what
              makes "14" clear. */}
          <span className="sset-hint">Day, night or no-fly dates, and holidays.</span>
        </div>

        <div className="sset-sec">Late cut-off for inputs</div>
        <CutFields set="inputs" prefix="iset" draft={cut} onChange={d => { setCut(d); setErr('') }} noun="inputs" />
        <p className="sset-hint">Later than this is LATE. Medical is never late.</p>

        <div className="sset-sec">Filing for other people</div>
        <label className="sset-check">
          <input type="checkbox" data-testid="iset-memberfile" checked={members} onChange={e => { setMembers(e.target.checked); setErr('') }} />
          <span>Members may file duties for others</span>
        </label>
        <p className="sset-hint">Never leave, medical or SANS.</p>

        {err && <p className="sset-err" data-testid="iset-err" role="alert">{err}</p>}
        <div className="sset-foot">
          <button type="button" className="abtn" data-testid="iset-cancel" onClick={close}>Cancel</button>
          <button type="submit" className="abtn primary" data-testid="iset-save">Save</button>
        </div>
      </form>
    </FloatWin>
  )
}

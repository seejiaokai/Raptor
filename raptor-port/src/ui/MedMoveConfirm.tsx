/* THE QUESTION A DRAGGED OR REASSIGNED MEDICAL WAITS ON (the absence-record re-test, AB4, 26 Sep 26 — Fable F4 and
   Astra A, found independently by both plan reviews).

   The owner's rule (27 Aug 26): a different-type medical overlap is put to the filer — who holds the shared days, NO
   default — and an upchit's effects are put to him on its summary sheet, BEFORE anything is written. The edit window
   and the Inputs table always asked. The Inputs calendar's chip drag and the schedule's reassign (the Unavailable
   row's person) did not: they wrote straight through commitInputEdit, whose trim plan resolved the clash with its
   safety default, silently.

   Those two doors now hand the move here (pops.MEDMOVE) instead of writing it, and this puts up the SAME two sheets,
   with the same Save bodies the Inputs table's edit uses (inputedit.tsx commitEditMedChoices / commitEditUpchit), so
   the three doors cannot answer one question two ways. Mounted at App level, like the edit window, so it opens over
   whatever surface the gesture was on — the calendar, the week or the board. Cancel writes nothing. */
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { notify } from '../state/store'
import { MEDMOVE, setMedMove } from './pops'
import { MedClashConfirm } from './MedClashConfirm'
import { UpchitConfirm } from './UpchitConfirm'
import { commitEditMedChoices, commitEditUpchit, fmtDay, ordISO } from './inputedit'
import { dateOrd } from '../engine/inputs'
import { useVersion } from './useStore'

export function MedMoveConfirm() {
  useVersion()
  const m = MEDMOVE
  if (!m) return null
  const done = () => { setMedMove(null); notify() }
  /* re-resolved at Save by its iid — an undo under the open sheet may have reminted the rows */
  const row = () => INPUTS.find((x: any) => x.iid === m.iid)
  const finish = (write: (r: any) => boolean) => {
    const r = row()
    if (!r) { HOOKS.toast('That input is no longer there — nothing was changed', 'warn'); return done() }
    /* a refusal inside the commit has already said why; only the gesture's own success words are said here. A DRAG
       says where it LANDED, read off the row once written (W2's re-walk, 26 Sep 26): keeping the other medical's days
       moves this one's start, and "Moved to <the drop day>" named a day it no longer covers */
    if (write(r)) {
      const now = m.via === 'drag' ? row() : null
      const o = now ? dateOrd(now.date, now.yr) : null
      const said = now && o != null ? 'Moved to ' + fmtDay(ordISO(o)) : m.said
      if (said) HOOKS.toast(said, 'ok')
    }
    done()
  }
  if (m.ask.kind === 'up') {
    return <UpchitConfirm who={m.ask.who} dateLabel={m.ask.dateLabel} effects={m.ask.effects}
      onCancel={done} onSave={removals => finish(r => commitEditUpchit(r, m.draft, removals))} />
  }
  return <MedClashConfirm who={m.ask.who} newType={m.ask.newType} span={m.ask.span}
    clashes={m.ask.clashes} aOrd={m.ask.a} bOrd={m.ask.b}
    onCancel={done} onSave={(choices, keepTail) => finish(r => commitEditMedChoices(r, m.draft, m.ask, choices, keepTail))} />
}

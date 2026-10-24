// The Leave War suite's setup ([ARCH-STACK] step 4). Approved and filed leave
// is a Raptor Input now, not a war cell — so before every test Raptor's INPUTS
// go back to the pristine seed plus the Leave War seed's approved / filed leave
// (SEED_ABSENCES, under the SEED person ids), and every `initStore()` installs
// the absence door and re-reads the Inputs into the war. Resetting INPUTS per
// TEST (not per initStore) keeps a reload test's filed leave across its
// second initStore, exactly as the app's persisted Inputs do.
import { beforeEach } from 'vitest'
import '../testing/marks-guard'   // every validate() this suite runs is checked too ([WARN-HIDE-KEPT])
import { INPUTS, inpId } from '../engine/inputs'
import { SEED_ABSENCES, seedWars, setMemberTodayForTests, warHolding } from './engine'
import { inputRowFor } from './absences'
import { _setInitHook } from './state/store'
import { installAbsenceDoor, syncAbsences } from './sync'

const PRISTINE = JSON.stringify(INPUTS)
const wars = seedWars()

beforeEach(() => {
  /* A MEMBER NEVER BIDS BEFORE TODAY (D1211) — and the suite's bids sit on fixed 2026 dates that the real calendar has
     passed. Pinned far back, so "today" decides nothing unless a test sets it on purpose (the D1211 tests do). */
  setMemberTodayForTests('2000-01-01')
  /* the browser's own storage holds view conveniences a test may set — the Manning fold, the admin's "Approve what I
     enter" (D1258, D1302): each test starts with none, as a fresh device does */
  try { localStorage.clear() } catch { /* none here */ }
  INPUTS.length = 0
  for (const r of JSON.parse(PRISTINE)) INPUTS.push(r)
  for (const a of SEED_ABSENCES) {
    const war = warHolding(wars, a.date)
    const row = inputRowFor({ person: a.person, code: a.code, from: a.date, to: a.endDate ?? a.date, lw: a.lw && war ? war.period.id : undefined, mod: '2026-01-01' })
    inpId(row)
    INPUTS.push(row)
  }
})

_setInitHook(() => {
  installAbsenceDoor()
  syncAbsences()
})

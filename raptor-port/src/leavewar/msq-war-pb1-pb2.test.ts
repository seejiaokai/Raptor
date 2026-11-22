// @vitest-environment jsdom
/* PB1 AND PB2 — A POSTING'S LINES FOR EVERY ONE OF ITS SQUADRON'S ADMINS OF TODAY, A PLAN HOLDER INCLUDED (the reshape
   plan, docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §19, with §6.2 step 6; his D2202: "while an admin holds
   Plan of another squadron, his bell carries that squadron's admin lines, on by default").
   - PB1: the posting take-back (Kestrel's "Undo post out") strikes the line of an admin holding Plan of 149, as it does a
     149 admin's — it read the reader's home alone;
   - PB2: the "off the manpower" line, which each admin's bell works out from the postings, is worked out for a Plan holder
     too — the loaded war's from its postings, another squadron's from its stored ones.
   No repro file: written here red first (red on e89c7833a, before helper "war"'s A5 change). The world:
   test-support/msq-world.ts — Wed 15 Jul 26; Hunter (142's admin, person `prowler`) given Plan of 149 by Saber. */
import { describe, expect, it, vi } from 'vitest'
import { worldUnit } from './state/store'
import { postOut, undoPostOut } from './sync'
import { setGrant, unitsLoad } from '../state/units'
import { NOTICES, noticesFor } from '../state/notices'
import { markNoticeRead } from '../state/noticeseen'
import { useMsqWorld, signInAs, ACCT, PID } from '../test-support/msq-world'

useMsqWorld()

const planOf149 = () => {
  signInAs('saber')
  expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok, 'Saber gives Hunter Plan of 149').toBe(true)
}
const poLines = (to: string, who: string, k = 'po') => NOTICES.filter(n => n.to === to && (n.what || []).some((p: any) => p.k === k && p.who === who))

describe('PB1 — the posting take-back strikes a Plan holder’s line too', () => {
  it('Osprey posted out today by Kestrel: Hunter (Plan of 149) told; he reads it; Kestrel’s Undo post out takes it back from him', () => {
    planOf149()
    signInAs('kestrel')
    expect(worldUnit()).toBe('u149')
    expect(postOut(PID.osprey, '2026-07-15', 'overseas'), 'posted out from today: it runs at once').toBe(true)
    const told = poLines(PID.hunter, PID.osprey)
    expect(told.length, 'Hunter, holding Plan of 149, is told (D2202)').toBe(1)
    signInAs('hunter')
    expect(markNoticeRead(told[0]!.id), 'Hunter reads it').toBe(true)
    signInAs('kestrel')
    expect(undoPostOut(PID.osprey), 'Kestrel’s Undo post out').toBe(true)
    expect(poLines(PID.hunter, PID.osprey).length, 'his line is taken back').toBe(0)
    expect(poLines(PID.hunter, PID.osprey, 'poback').length, 'and, read, says "taken back"').toBe(1)
  })
})

describe('PB2 — the "off the manpower" line reaches a Plan holder', () => {
  it('a 149 posting with nothing to run, its date come: Hunter (Plan of 149, 142 loaded) has the line; a 142 member not', () => {
    planOf149()
    signInAs('kestrel')
    expect(postOut(PID.osprey, '2026-07-16', 'none')).toBe(true)
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0)); unitsLoad()
    signInAs('hunter')
    expect(worldUnit(), '142’s war loaded').toBe('u142')
    expect(noticesFor(PID.hunter).some(n => n.id === `po:${PID.osprey}:2026-07-16`), 'Hunter’s bell works it out from 149’s stored postings').toBe(true)
    expect(noticesFor(PID.ranger).some(n => n.id === `po:${PID.osprey}:2026-07-16`), 'Ranger, 142’s member, has none').toBe(false)
    signInAs('kestrel')
    expect(noticesFor(PID.kestrel).some(n => n.id === `po:${PID.osprey}:2026-07-16`), '(control) Kestrel has it, 149 loaded').toBe(true)
  })
  it('the loaded war’s own posting: Hunter (Plan of 149) has the line while 149 is the war loaded', () => {
    planOf149()
    signInAs('kestrel')
    expect(postOut(PID.osprey, '2026-07-16', 'none')).toBe(true)
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0)); unitsLoad()
    signInAs('kestrel')
    expect(noticesFor(PID.hunter).some(n => n.id === `po:${PID.osprey}:2026-07-16`)).toBe(true)
  })
})

// @vitest-environment jsdom
/* opus1 — the Inputs calendar's settings window, opened from 142's gear by Hunter at 23:57 the night before his move to
   149, saved after midnight: the cut-off is written to the window's squadron (142, where he is no longer an admin) and
   the members' switch to the page's (149) — one window, two squadrons; and a refused cut-off reads as saved. */
import { describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs, moveMan, pastMidnight, on, PID } from '../test-support/msq-world'
import { openWinFor, winUnit, saveCut, getCut } from '../state/cutoff'
import { setInpSet, INPSET } from './pops'
import { UNIT } from '../engine/unitview'
import { unitSetting } from '../engine/hooks'
import { membersFileOn } from '../state/perms'
import { setMembersFile } from '../state/memberfile'

useMsqWorld()

describe('opus1 — Inputs settings window across Hunter\'s midnight', () => {
  it('the window edits one squadron, and a refused cut-off is not reported saved', () => {
    on(15, 23, 57)
    signInAs('saber'); expect(moveMan(PID.hunter, 'u149')).toMatchObject({ ok: true })
    signInAs('hunter')
    expect(UNIT).toBe('u142')
    openWinFor('inputs', 'u142'); setInpSet(true)      // 142's Inputs calendar gear (ui/InputsPage.tsx)
    pastMidnight()
    expect(UNIT, 'entered 149').toBe('u149')
    expect(INPSET, 'the window still open (not held, not closed)').toBe(true)
    const u = winUnit('inputs')
    expect(u, "the window's squadron").toBe('u142')
    /* Save (ui/InputsSettings.tsx Body.save): the cut-off for `u`, the switch by the page's squadron */
    const before142 = JSON.stringify(unitSetting('u142', 'rules', null))
    const c = saveCut('inputs', { mode: 0, lead: 9, wd: 0, weeks: 1 }, u)
    const stored = JSON.stringify(unitSetting('u142', 'rules', null)) !== before142
    expect.soft(c.ok, 'cut-off reported saved').toBe(stored)
    const sw149 = unitSetting('u149', 'memberfile', null)
    setMembersFile(!membersFileOn())
    expect.soft(unitSetting('u149', 'memberfile', null), "149's switch untouched by 142's window").toEqual(sw149)
    void getCut
  })
})

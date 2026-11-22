// @vitest-environment jsdom
/* opus1 — the Inputs calendar's settings window, opened from 142's gear by Hunter at 23:57 the night before his move to
   149, saved after midnight: the cut-off was written to the window's squadron (142, where he is no longer an admin) and
   the members' switch to the page's (149) — one window, two squadrons; and a refused cut-off read as saved.
   RE-SHAPED by the fix helper (22 Nov 26): the reader's proof pinned the fault's own state ("the window still open") and
   called the switch with no squadron. It now asks what the fix gives: the window, drawn, closes with its page's squadron;
   a refused cut-off says so; and the switch named for the window's squadron never writes the page's. */
import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'
import { useMsqWorld, signInAs, moveMan, pastMidnight, on, PID } from '../test-support/msq-world'
import { openWinFor, forgetWin, winUnit, saveCut } from '../state/cutoff'
import { setInpSet, INPSET } from './pops'
import { UNIT } from '../engine/unitview'
import { unitSetting } from '../engine/hooks'
import { membersFileOf, setMembersFile } from '../state/memberfile'
import { notify } from '../state/store'
import { InputsSettings } from './InputsSettings'
import { _resetFloatWins } from './winorder'

useMsqWorld()
afterEach(() => { cleanup(); setInpSet(false); forgetWin('inputs'); _resetFloatWins() })

describe('opus1 — Inputs settings window across Hunter\'s midnight', () => {
  it('a refused cut-off is not reported saved, and the switch named for 142 never writes 149', () => {
    on(15, 23, 57)
    signInAs('saber'); expect(moveMan(PID.hunter, 'u149')).toMatchObject({ ok: true })
    signInAs('hunter')
    expect(UNIT).toBe('u142')
    openWinFor('inputs', 'u142'); setInpSet(true)      // 142's Inputs calendar gear (ui/InputsPage.tsx)
    pastMidnight()
    expect(UNIT, 'entered 149').toBe('u149')
    const u = winUnit('inputs')
    expect(u, "the window's squadron").toBe('u142')
    const before142 = JSON.stringify(unitSetting('u142', 'rules', null))
    const c = saveCut('inputs', { mode: 0, lead: 9, wd: 0, weeks: 1 }, u)
    expect(JSON.stringify(unitSetting('u142', 'rules', null)), 'nothing stored in 142').toBe(before142)
    expect(c, 'the refused cut-off says so').toEqual({ ok: false, message: 'This change could not be saved.' })
    const sw149 = unitSetting('u149', 'memberfile', null)
    const r = setMembersFile(!membersFileOf(u), u)
    expect(r.ok, "142's switch is not his to flip any more").toBe(false)
    expect(unitSetting('u149', 'memberfile', null), "149's switch untouched by 142's window").toEqual(sw149)
  })
  it('the window itself, drawn, closes when its page becomes another squadron\'s', () => {
    on(15, 23, 57)
    signInAs('saber'); expect(moveMan(PID.hunter, 'u149')).toMatchObject({ ok: true })
    signInAs('hunter')
    const v = render(<InputsSettings />)
    act(() => { openWinFor('inputs', 'u142'); setInpSet(true); notify() })
    expect(v.queryByTestId('win-inputsset'), 'control: open on 142').not.toBeNull()
    act(() => { pastMidnight(); notify() })
    expect(v.queryByTestId('win-inputsset'), 'gone with 142').toBeNull()
    expect(INPSET, 'and not left asked for').toBe(false)
  })
})

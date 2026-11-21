// @vitest-environment jsdom
/* oilOpenOn BY DAY (the reshape plan, docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §3.2 A-i — Fable F10,
   Opus M6): each asked day of an input is the squadron's whose its people are on THAT day, never its first day's for every
   day. A duty over a weekend across Ranger's move: Sat 18 Jul is 142's to answer, Sun 19 Jul 149's.
   Written red first (helper "war"): on the input's first day alone both days were 142's and 149's list was empty. */
import { describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { oilOpenOn } from './sync'
import { setHome, homeOn } from '../state/units'
import { useMsqWorld, signInAs, on, PID } from '../test-support/msq-world'

useMsqWorld()

describe('oilOpenOn asks each day of its own squadron', () => {
  it('Ranger’s duty Fri 17 – Mon 20 Jul, his move to 149 counting from Sun 19 Jul: 142 answers Sat 18, 149 Sun 19', () => {
    on(18)
    signInAs('saber')
    expect(setHome(PID.ranger, 'u149').ok).toBe(true)
    expect(homeOn(PID.ranger, '2026-07-18')).toBe('u142')
    expect(homeOn(PID.ranger, '2026-07-19')).toBe('u149')
    INPUTS.push({ person: PID.ranger, date: 'Jul 17', endDate: 'Jul 20', yr: 2026, allday: true, type: 'Duty', acc: 'g', remarks: '', mod: '', iid: 'iDUTYBYDAY' } as any)
    const days = (unit: string) => oilOpenOn('2026-07-18', '2026-07-19', unit).filter(o => o.iid === 'iDUTYBYDAY').flatMap(o => o.days)
    expect(days('u142'), '142’s list: the day he is 142’s').toEqual(['2026-07-18'])
    expect(days('u149'), '149’s list: the day he is 149’s').toEqual(['2026-07-19'])
    expect(oilOpenOn('2026-07-18', '2026-07-19').filter(o => o.iid === 'iDUTYBYDAY').flatMap(o => o.days), 'every squadron’s: both').toEqual(['2026-07-18', '2026-07-19'])
  })
})

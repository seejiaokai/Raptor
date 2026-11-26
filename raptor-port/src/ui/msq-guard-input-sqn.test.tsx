// @vitest-environment jsdom
/* PART F — A SQUADRON'S INPUTS ARE SEEN AND CHANGED ONLY ON THAT SQUADRON, AND THE INPUT WINDOW RECORDS THE INPUT'S OWN
   SQUADRON (the guard rail's plan, docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §5.6; his D2621).
   Step 0 (K0) writes only the three PINS of §5.6 — F14, F18, F19 — each seen passing on today's code: what the build of
   part F must keep. The rest of §5.6 (F0–F17 but F14) is written red first in the step that builds it.
   The world: three squadrons (test-support/msq-world.ts withThird — his D2630): Hunter 142's admin with Plan of 149 and
   View of 150; Ranger 142's member with View of 149 and of 150; Kestrel 149's admin; Mako 150's own admin; Saber the
   master admin. Wed 15 Jul 26 unless a test moves the clock. */
import { describe, it, expect, afterEach } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'
import { withThird, signInAs, PID, ACCT, at, pastMidnight, moveMan } from '../test-support/msq-world'
import { commitNewInput } from './inputedit'
import { inputsPageRows } from './InputsPage'
import { InputEditor } from './InputWindow'
import { INPEDIT, setInpEdit } from './pops'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { UNIT } from '../engine/unitview'
import { notify, writeInputsBatch } from '../state/store'
import { pageUnit } from '../state/perms'
import { enterForLine } from '../state/belltap'
import { saveAccess } from '../state/accounts'
import { setHome, unitsLoad, homeOn, todayIso } from '../state/units'
import { pickSquadron } from '../state/pick'
import { setPage } from '../state/view'
import { oilPendingFor } from '../leavewar/sync'
import { NOTICES, noticesFor, noticeLive } from '../state/notices'
import { unreadFor, isUnread } from '../state/noticeseen'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()
afterEach(() => { cleanup(); setInpEdit(null) })

/* a filing through the Inputs page's own door (ui/inputedit.tsx commitNewInput), its new row found by its id */
function file(draft: Record<string, unknown>): any {
  const before = new Set(INPUTS.map((r: any) => r.iid))
  expect(commitNewInput({ allday: true, half: '', sTime: '', eTime: '', remarks: '', sans: null, docIds: [], ...draft }), `filed: ${JSON.stringify(draft)}`).toBe(true)
  const row = INPUTS.find((r: any) => !before.has(r.iid))
  expect(row, 'the new row').toBeTruthy()
  return row
}
const listed = (iid: string) => inputsPageRows().some((r: any) => r.iid === iid)
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const dead = (el: Element | null) => !!el && !!el.closest('[inert]')

describe('F14 (pin) — a moved man still sees his old inputs where he is', () => {
  it('pin: Ranger moved 142 → 149, no right in 142: his old 142 inputs listed on his 149 page, the OIL question still his, the window live, the bell entering nothing; given View of 142, still listed', async () => {
    /* his own weekend duty on 142, filed before the move — its OIL question unanswered (the "OIL?" tag's premise) */
    signInAs('ranger')
    const duty = file({ person: PID.ranger, type: 'Duty', start: '2026-07-18', end: '2026-07-18', title: 'Weekend duty' })
    expect(oilPendingFor(PID.ranger).map(h => h.iid), 'the premise: his OIL question waits').toContain(duty.iid)
    const appt = INPUTS.find((r: any) => r.person === PID.ranger && r.type === 'Appointment') as any
    expect(appt, 'the premise: his seeded 142 appointment').toBeTruthy()
    /* moved by Saber, counting from Thu 16 Jul; the clock past midnight by the app's own wake */
    signInAs('saber')
    expect(moveMan(PID.ranger, 'u149').ok).toBe(true)
    await act(async () => { pastMidnight() })
    signInAs('ranger')
    expect(homeOn(PID.ranger, todayIso()), 'he is 149\'s today').toBe('u149')
    expect(pageUnit('own'), 'his own pages are 149\'s').toBe('u149')
    expect(UNIT).toBe('u149')
    /* his move ended every right he held (D2203): none in 142 */
    expect(enterForLine('u142'), 'his pages may not be 142\'s').toBe('no')
    expect(UNIT, 'the bell\'s entry moved nothing').toBe('u149')
    expect(listed(duty.iid), 'his old 142 duty listed on his 149 page').toBe(true)
    expect(listed(appt.iid), 'his old 142 appointment listed on his 149 page').toBe(true)
    expect(oilPendingFor(PID.ranger).map(h => h.iid), 'the OIL question still his to answer (the "OIL?" tag\'s source)').toContain(duty.iid)
    /* the window opens live on his 149 page: no band, Save pressable */
    setPage('inputs')
    render(<InputEditor />)
    await act(async () => { setInpEdit(duty); notify() })
    expect(INPEDIT?.iid).toBe(duty.iid)
    expect($('[data-testid="inped-moveband"]'), 'no band over it').toBeNull()
    expect($('#inpEditSave'), 'its Save drawn').not.toBeNull()
    expect(dead($('#inpEditSave')), 'its Save live').toBe(false)
    await act(async () => { setInpEdit(null); notify() })
    /* then given View of 142 by 142's own admin: still listed on his own page (the reading of §5.1) */
    signInAs('hunter')
    expect(saveAccess(ACCT.ranger, { grants: { u142: 'view' } }), 'View of 142 given by Hunter').toBeNull()
    signInAs('ranger')
    expect(pageUnit('own')).toBe('u149')
    expect(listed(duty.iid), 'still listed with View of 142').toBe(true)
    expect(listed(appt.iid)).toBe(true)
  })
  it.todo('F14\'s "its OIL answer saves" and the drawn "OIL?" button — not written at K0: the answer is pressed through the OIL card (ui/OilConfirm.tsx), which this step did not mount; the pin above holds the question still his (oilPendingFor) and the window live')
})

describe('F18 (pin) — the rule does not reach his home page', () => {
  it('pin: Hunter, Plan of 149, a move to 149 saved for 1 Dec, files leave for 5 Dec on 142\'s page: listed on 142\'s page after the save, and with 149 picked', async () => {
    at('2026-11-30')
    unitsLoad()
    expect(moveMan(PID.hunter, 'u149').ok, 'his move saved by Saber, counting from Tue 1 Dec').toBe(true)
    signInAs('hunter')
    expect(homeOn(PID.hunter, '2026-11-30')).toBe('u142')
    expect(homeOn(PID.hunter, '2026-12-01')).toBe('u149')
    expect(pageUnit('own')).toBe('u142')
    const lv = file({ person: PID.hunter, type: 'LL', start: '2026-12-05', end: '2026-12-05' })
    expect(listed(lv.iid), 'listed on 142\'s page after the save').toBe(true)
    await act(async () => { await pickSquadron('u149') })
    expect(UNIT).toBe('u149')
    expect(pageUnit('own'), 'a Plan holder\'s pages follow his pick').toBe('u149')
    expect(listed(lv.iid), 'listed on 149\'s page too: it touches 149 on its day').toBe(true)
  })
  it('pin: Saber, home 142, a move to 149 saved for 1 Dec, files leave for 5 Dec on 142\'s page: the same', async () => {
    at('2026-11-30')
    unitsLoad()
    /* nobody moves himself (his D2249) and a master admin's squadron is a master admin's to change (D2205): Kestrel is
       made a master admin first, by Saber, through Admin → Users' one Save — the one road to move Saber in this world */
    signInAs('saber')
    expect(saveAccess(ACCT.kestrel, { master: true }), 'Kestrel made a master admin').toBeNull()
    signInAs('kestrel')
    const mv = setHome(PID.saber, 'u149')
    expect(mv.ok, JSON.stringify(mv)).toBe(true)
    unitsLoad()
    signInAs('saber')
    expect(homeOn(PID.saber, '2026-12-01')).toBe('u149')
    expect(pageUnit('own')).toBe('u142')
    const lv = file({ person: PID.saber, type: 'LL', start: '2026-12-05', end: '2026-12-05' })
    expect(listed(lv.iid), 'listed on 142\'s page after the save').toBe(true)
    await act(async () => { await pickSquadron('u149') })
    expect(UNIT).toBe('u149')
    expect(pageUnit('own'), 'a master admin\'s pages follow his pick').toBe('u149')
    expect(listed(lv.iid), 'listed on 149\'s page too').toBe(true)
  })
})

describe('F19 (pin) — N9 cannot happen', () => {
  it('pin: Hunter files an input for two 149 men holding Plan of 149; the Plan ended, the line about it is in no list of his bell and lights nothing; Plan given again, it stays out', () => {
    signInAs('hunter')
    const osp = PID.osprey
    const mate = Object.keys(PEOPLE).find(k => { const p: any = (PEOPLE as any)[k]; return k !== osp && k !== PID.kestrel && !p.archived && !p.deleted && !p.special && homeOn(k, todayIso()) === 'u149' })
    expect(mate, 'the premise: a second 149 man').toBeTruthy()
    const row = file({ person: osp, type: 'Training', start: '2026-07-27', end: '2026-07-27', title: 'Sim refresher' })
    /* the second man, written into the same record through the inputs' one write (as the window's Person list adds him) */
    expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === row.iid) as any).people.push({ p: mate, by: PID.hunter, at: Date.now() }) })).toBe(true)
    /* Kestrel, 149's own admin, changes it: Hunter, its filer, is told */
    signInAs('kestrel')
    expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === row.iid) as any).remarks = 'Kestrel changed it' })).toBe(true)
    const toHim = () => NOTICES.filter(n => n.to === PID.hunter && n.iid === row.iid)
    expect(toHim().length, 'the premise: a line about it written to Hunter').toBeGreaterThan(0)
    signInAs('hunter')
    expect(toHim().every(n => noticesFor(PID.hunter).some(x => x.id === n.id)), 'the premise: on his bell while he holds Plan').toBe(true)
    expect(toHim().some(n => isUnread(n, PID.hunter)), 'the premise: unread, lighting his bell').toBe(true)
    /* the Plan ended, by Saber (Plan is a master admin's to give and take) */
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'none' } })).toBeNull()
    signInAs('hunter')
    expect(toHim().some(n => noticesFor(PID.hunter).some(x => x.id === n.id)), 'in no list of his bell').toBe(false)
    /* the one body the list, the unread count and the bell's light all read (state/notices.ts noticeLive): a line it
       leaves out is neither listed, counted nor lit, and with nothing listed there is nothing to tap */
    expect(toHim().some(n => noticeLive(n)), 'it lights nothing: no line of it is live').toBe(false)
    expect(unreadFor(PID.hunter), 'his unread count is only what his list holds').toBe(noticesFor(PID.hunter).filter(n => isUnread(n, PID.hunter)).length)
    /* Plan given again the next day: a line written before the new right began stays out */
    at('2026-07-16'); unitsLoad()
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    signInAs('hunter')
    expect(toHim().some(n => noticesFor(PID.hunter).some(x => x.id === n.id)), 'stays out once Plan is given again').toBe(false)
  })
})

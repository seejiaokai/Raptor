// @vitest-environment jsdom
/* PART F — A SQUADRON'S INPUTS ARE SEEN AND CHANGED ONLY ON THAT SQUADRON, AND THE INPUT WINDOW RECORDS THE INPUT'S OWN
   SQUADRON (the guard rail's plan, docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §5.6; his D2621).
   Step 0 (K0) writes only the three PINS of §5.6 — F14, F18, F19 — each seen passing on today's code: what the build of
   part F must keep. The rest of §5.6 (F0–F17 but F14) is written red first in the step that builds it.
   The world: three squadrons (test-support/msq-world.ts withThird — his D2630): Hunter 142's admin with Plan of 149 and
   View of 150; Ranger 142's member with View of 149 and of 150; Kestrel 149's admin; Mako 150's own admin; Saber the
   master admin. Wed 15 Jul 26 unless a test moves the clock. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { act, cleanup, render, fireEvent } from '@testing-library/react'
import { withThird, third, signInAs, PID, ACCT, at, pastMidnight, moveMan } from '../test-support/msq-world'
import { commitNewInput } from './inputedit'
import { inputsPageRows } from './InputsPage'
import { InputEditor } from './InputWindow'
import { INPEDIT, OILASK, OILLIST, setInpEdit, setOilList } from './pops'
import { INPUTS, inputSquadrons, idsOf } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { UNIT } from '../engine/unitview'
import { notify, writeInputsBatch } from '../state/store'
import { pageUnit, ownPageMayBe, myUnit } from '../state/perms'
import { enterForLine } from '../state/belltap'
import { saveAccess } from '../state/accounts'
import { setHome, unitsLoad, homeOn, todayIso } from '../state/units'
import { pickSquadron } from '../state/pick'
import { setPage, CURPAGE, setInpView, setInpMode, setCalMonth } from '../state/view'
import { oilPendingFor } from '../leavewar/sync'
import { NOTICES, noticesFor, noticeLive } from '../state/notices'
import { unreadFor, isUnread } from '../state/noticeseen'
import { docBackend } from '../state/docs'
import { HOOKS } from '../engine/hooks'
import { guardWords, whatIsOpen } from './guard'
import { rawEnter } from '../test-support/raw-entry'
import { MM, OPEN, app, doing, press, settle, tap, topPick, goTracker, chartEdit, guardTeardown, note, nothingHeld, tid } from '../test-support/msq-guard-testkit'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()
afterEach(async () => {
  /* (the app drawn by the step-K9 tests below — the testkit's own page, and every window it leaves set) */
  await guardTeardown()
  ;(window as any).matchMedia = MM
  ;(document as any).elementFromPoint = undefined
  cleanup(); setInpEdit(null)
  document.getElementById('toastEl')?.remove()
})

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

/* ======================= STEP K9 (§10 step 7) — the list and the doors, written first and seen failing =======================
   His D2621 (a squadron's inputs are seen and changed only on that squadron; a bell line about such an input brings its
   squadron into view first), D2403 (the OIL list's card), D2729 Q8 (a moved master admin's old inputs follow the view he is
   in). EVERY PRESS IS THE WHOLE SEQUENCE ON THE REAL CONTROLS — the bell (#notifyBell), a card of the OIL list, the squadron
   button and its row, "+ Input", a calendar's day, Add — the app drawn whole (the testkit's app()). Two belts, named so, set
   a state no press reaches: the OIL list standing over a squadron that is not its own (by a raw entry, as B25 sets it). */
const drawn = (iid: string) => !!document.querySelector(`[data-iid="${iid}"]`)
const said = (): string[] => (HOOKS.toast as any).mock.calls.map((c: any[]) => String(c[0]))
/* the phone layout: the Inputs page's own width (max-width:820px) and the Tracker's, as the browser answers it */
function phoneSize() {
  ;(window as any).matchMedia = (m: string) => ({ matches: /max-width:\s*(820|1050)px/.test(m), media: m, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false })
}
/** his own weekend Duty on Sat 18 Jul, filed on his own page, its OIL question unanswered — the bell's tap goes to it */
async function ownWeekendDuty(who: 'hunter' | 'saber' = 'hunter'): Promise<any> {
  const d = file({ person: PID[who], type: 'Duty', start: '2026-07-18', end: '2026-07-18', title: 'Weekend duty' })
  expect(oilPendingFor(PID[who]).map(h => h.iid), 'the premise: his one OIL question waiting is this duty').toEqual([d.iid])
  await doing(() => {})
  return d
}
/** the Tracker's question, up */
const asked = async (num: string) => {
  const { C } = await import('../test-support/msq-guard-testkit')
  await vi.waitFor(() => expect(C.dlg?.msg, 'the Tracker\'s question').toContain(`Save them before switching to ${num}?`), { timeout: 5000, interval: 10 })
}
/** the window as he meets it: no band over it, its Save live */
function live() {
  expect($('[data-testid="inped-moveband"]'), 'no band over the window').toBeNull()
  expect($('#inpEditSave'), 'its Save drawn').not.toBeNull()
  expect(dead($('#inpEditSave')), 'its Save live').toBe(false)
}
const barSays = () => $('#sqnMenuBtn')?.textContent || ''
/** Add pressed — and, for a kind that asks for its document, "No document" on the question that follows */
async function addIt() {
  await press($('#inpEditSave'), 'Add')
  if (tid('docconf')) await press(tid('docconf-nodoc'), '"No document"')
}

describe('F0 — the input\'s own squadron has no clause for who is named (§5.2)', () => {
  it('inputSqn: Hunter\'s own 142 input, the page 149 → 142; an input naming men of both, the page 149 → 149 (and 142 → 142); a new input → its page\'s; asked from 150, his own 142 input → 142', async () => {
    const { inputSqn } = await import('../state/inputsqn')
    signInAs('hunter')
    const own = file({ person: PID.hunter, type: 'OL', start: '2026-07-20', end: '2026-07-20' })
    expect(inputSqn(own, 'u149')).toBe('u142')
    const both = file({ person: PID.hunter, type: 'Training', start: '2026-07-21', end: '2026-07-21', title: 'Shared' })
    expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === both.iid) as any).people.push({ p: PID.osprey, by: PID.hunter, at: Date.now() }) })).toBe(true)
    expect(inputSquadrons(both).slice().sort(), 'the premise: it touches both').toEqual(['u142', 'u149'])
    expect(inputSqn(both, 'u149')).toBe('u149')
    expect(inputSqn(both, 'u142')).toBe('u142')
    expect(inputSqn({ _new: true, person: PID.hunter }, 'u149')).toBe('u149')
    expect(inputSqn(own, third.u150), 'never "his" squadron: the input\'s own').toBe('u142')
  })
  it.todo('F0\'s letOpenOn half (null for all three; the moved man\'s old 142 input on his 149 page → 149) — step K10\'s: letOpenOn is the root\'s alone (§5.2) and is built with it')
})

describe('F1 — the bell\'s OIL tap brings the input\'s squadron into view (D2621)', () => {
  it('Hunter (Plan of 149), 149 picked, his own 142 weekend duty unanswered, the bell pressed: 142 in view, then Inputs, then the window — 142\'s, live, its OIL question up, the bar reading 142', async () => {
    await app('hunter')
    const d = await ownWeekendDuty()
    await topPick('u149')
    expect([UNIT, pageUnit('own')], 'the premise: his pages follow his Plan to 149').toEqual(['u149', 'u149'])
    const seen: string[] = []
    const { subscribe } = await import('../state/store')
    const un = subscribe(() => { if (INPEDIT && !seen.length) seen.push(`${UNIT} ${CURPAGE}`) })
    await press($('#notifyBell'), 'the bell')
    un()
    expect([UNIT, CURPAGE, INPEDIT?.iid]).toEqual(['u142', 'inputs', d.iid])
    expect(said(), 'its OIL question put with the window (the window takes it into its own sheet)').toContain('Weekend/PH work — confirm your OIL')
    expect(seen, 'the window set only once 142 and its Inputs page are in view').toEqual(['u142 inputs'])
    expect(barSays(), 'the bar reads 142').toContain('142')
    live()
    nothingHeld()
  })
  it('(pin, today\'s too — the page door\'s landing, step K6: his own pages stay 142\'s while he views 150) the same with 150 picked, which he only views: 142 in view, Inputs, the window', async () => {
    await app('hunter')
    const d = await ownWeekendDuty()
    await topPick(third.u150)
    expect(UNIT).toBe(third.u150)
    await press($('#notifyBell'), 'the bell')
    expect([UNIT, CURPAGE, INPEDIT?.iid]).toEqual(['u142', 'inputs', d.iid])
    expect(said(), 'its OIL question put with the window (the window takes it into its own sheet)').toContain('Weekend/PH work — confirm your OIL')
    live()
  })
})

describe('F2 — …and is refused with a window open (D2627 A8)', () => {
  it('Hunter on 149 with an Input window open: the bell refused — "…then press the bell again.", 149, the open window kept, no OIL question, no toast but the note', async () => {
    await app('hunter')
    await ownWeekendDuty()
    await topPick('u149')
    await OPEN.inputedit!.open()
    const open = INPEDIT
    const w = whatIsOpen()
    expect(w?.row.id, 'the premise: the window counts').toBe('inputedit')
    const words = guardWords(w!.reason, w!.row, 'bell', '')
    expect(words, 'the premise: the bell\'s words, read from the tables').toBeTruthy()
    expect(words!.endsWith('press the bell again.'), 'the bell\'s own ending [ruled]').toBe(true)
    const t0 = said().length
    await press($('#notifyBell'), 'the bell')
    expect([UNIT, INPEDIT, OILASK]).toEqual(['u149', open, null])
    expect(note()).toBe(words)
    expect(said().slice(t0).filter(t => !t.startsWith('Blocked:')), 'no toast but the note').toEqual([])
    nothingHeld()
  })
})

describe('F3 — …and waits for the Tracker\'s question', () => {
  it('unsaved chart edits on 149: the question first; Stay → nothing opens, 149; pressed again, Discard → 142, Inputs, the window', async () => {
    await app('hunter')
    const d = await ownWeekendDuty()
    await topPick('u149')
    await goTracker()
    await chartEdit()
    await press($('#notifyBell'), 'the bell')
    await asked('142')
    await press($('#dlgCancel'), 'Stay')
    expect([UNIT, INPEDIT, OILASK], 'Stay: nothing opens').toEqual(['u149', null, null])
    await press($('#notifyBell'), 'the bell again')
    await asked('142')
    await press($('#dlgAlt'), 'Discard them')
    await settle()
    expect([UNIT, CURPAGE, INPEDIT?.iid]).toEqual(['u142', 'inputs', d.iid])
    expect(said(), 'its OIL question put with the window (the window takes it into its own sheet)').toContain('Weekend/PH work — confirm your OIL')
  })
})

describe('F5 — a card of the OIL list: its squadron, its page, then the window (D2403)', () => {
  const card = (x: any) => tid(`odl-row-${x.iid}`)?.querySelector('.icard-who') ?? tid(`odl-row-${x.iid}`)
  /* the list of 142's Saturday standing while 149 is in view — by a raw entry, a belt: reached by no press since D2403
     (a pick is refused while the list is open) and D2627 A19 (a holiday's line brings its squadron first) */
  async function listOver149(d: any) {
    await doing(() => setOilList({ from: '2026-07-18', to: '2026-07-18', name: 'Holiday', unit: 'u142' }))
    expect(tid(`odl-row-${d.iid}`), 'the premise: the card is drawn').not.toBeNull()
    await doing(() => { rawEnter('u149') })
    expect([UNIT, pageUnit('own'), !!OILLIST], 'the premise: 142\'s list over 149').toEqual(['u149', 'u149', true])
  }
  it('Hunter on 149, 142\'s list over it, nothing else open: the card brings 142 into view, then Inputs, then the window', async () => {
    await app('hunter')
    const d = await ownWeekendDuty()
    await listOver149(d)
    const seen: string[] = []
    const { subscribe } = await import('../state/store')
    const un = subscribe(() => { if (INPEDIT && !seen.length) seen.push(`${UNIT} ${CURPAGE}`) })
    await press(card(d), 'the card')
    un()
    expect([UNIT, CURPAGE, INPEDIT?.iid]).toEqual(['u142', 'inputs', d.iid])
    expect(seen, 'INPEDIT set only once 142\'s Inputs page is shown').toEqual(['u142 inputs'])
    live()
  })
  it('…with a change not saved: refused — 149, no window (the card\'s door says no note: K6\'s difference 1)', async () => {
    await app('hunter')
    const d = await ownWeekendDuty()
    await listOver149(d)
    await OPEN.unsaved!.open()
    await press(card(d), 'the card')
    expect([UNIT, INPEDIT, OILASK]).toEqual(['u149', null, null])
    nothingHeld()
  })
  it('…with unsaved chart edits on 149: the Tracker\'s question; Stay → nothing opens; the card again, Discard → 142, Inputs, the window', async () => {
    await app('hunter')
    const d = await ownWeekendDuty()
    await topPick('u149')
    await goTracker()
    await chartEdit()
    await doing(() => setOilList({ from: '2026-07-18', to: '2026-07-18', name: 'Holiday', unit: 'u142' }))
    expect(tid(`odl-row-${d.iid}`), 'the premise: 142\'s list over 149\'s Tracker').not.toBeNull()
    await press(card(d), 'the card')
    await asked('142')
    await press($('#dlgCancel'), 'Stay')
    expect([UNIT, INPEDIT], 'Stay: nothing opens').toEqual(['u149', null])
    await press(card(d), 'the card again')
    await asked('142')
    await press($('#dlgAlt'), 'Discard them')
    await settle()
    expect([UNIT, CURPAGE, INPEDIT?.iid]).toEqual(['u142', 'inputs', d.iid])
  })
})

describe('F7 — the calendar\'s just-saved row does not follow him to another squadron (§5.4)', () => {
  it('Hunter saves an input from 142\'s calendar day, closes the day, picks 149 and opens the same date: no card of it; back on 142, there', async () => {
    await app('hunter')
    await doing(() => { setPage('inputs'); setInpView('cal'); setInpMode('member'); setCalMonth({ y: 2026, m: 7 }) })
    await tap($('[data-icday="2026-07-29"]'), 'Wed 29 Jul on 142\'s calendar')
    await press($('#icPopAdd'), 'the day\'s "+ Input"')
    const had = new Set(INPUTS.map((r: any) => r.iid))
    await addIt()
    const x = INPUTS.find((r: any) => !had.has(r.iid)) as any
    expect(x, 'the premise: his OL saved').toBeTruthy()
    expect(idsOf(x), 'his own').toEqual([PID.hunter])
    await press(tid('win-inputsday-x'), 'the day\'s ✕')
    await topPick('u149')
    expect(UNIT).toBe('u149')
    await doing(() => { setInpView('cal'); setCalMonth({ y: 2026, m: 7 }) })
    await tap($('[data-icday="2026-07-29"]'), 'Wed 29 Jul on 149\'s calendar')
    expect(tid('win-inputsday'), 'the premise: the day is open').not.toBeNull()
    expect(drawn(x.iid), 'no card or bar of his 142 OL on 149').toBe(false)
    await press(tid('win-inputsday-x'), 'the day\'s ✕')
    await topPick('u142')
    await tap($('[data-icday="2026-07-29"]'), 'Wed 29 Jul on 142\'s calendar')
    expect(drawn(x.iid), 'on 142, there').toBe(true)
  })
})

describe('F11 — a document chosen late (§5.4)', () => {
  /* Ranger, moved by Saber to 149 counting from tomorrow, opens his own 142 appointment on 142's Inputs page */
  async function rangersWindow() {
    signInAs('saber')
    expect(moveMan(PID.ranger, 'u149').ok).toBe(true)
    signInAs('ranger')
    setPage('inputs')
    render(<InputEditor />)
    const appt = INPUTS.find((r: any) => r.person === PID.ranger && r.type === 'Appointment') as any
    await act(async () => { setInpEdit(appt); notify() })
    expect(INPEDIT?.iid).toBe(appt.iid)
    return appt
  }
  const choose = async () => {
    const box = document.querySelector('.docfield input[type="file"]') as HTMLInputElement
    expect(box, 'the premise: the Document file box').not.toBeNull()
    const f = new File(['scan'], 'scan.png', { type: 'image/png' })
    await act(async () => { fireEvent.change(box, { target: { files: [f] } }) })
  }
  it('a file box\'s change on a window held by the midnight clock: nothing stored, the window\'s list unchanged', async () => {
    await rangersWindow()
    await act(async () => { pastMidnight() })
    expect($('[data-testid="inped-moveband"]'), 'the premise: held by his move at midnight').not.toBeNull()
    const n0 = docBackend.impl.size, chips0 = document.querySelectorAll('.docchip').length
    await choose()
    expect(docBackend.impl.size, 'nothing new in the document store').toBe(n0)
    expect(document.querySelectorAll('.docchip').length, 'the window\'s list unchanged').toBe(chips0)
  })
  it('(pin, today\'s too) on a live window: stored and listed, as today', async () => {
    await rangersWindow()
    const n0 = docBackend.impl.size, chips0 = document.querySelectorAll('.docchip').length
    await choose()
    expect(docBackend.impl.size).toBe(n0 + 1)
    expect(document.querySelectorAll('.docchip').length).toBe(chips0 + 1)
  })
})

describe('F13 — his own inputs are off another squadron\'s page (D2621)', () => {
  /* Hunter's four of his own on 142 — a duty with its OIL question waiting, two OL, a Training — and one naming him with a
     149 man */
  async function fiveOfHis() {
    const four = [
      file({ person: PID.hunter, type: 'Duty', start: '2026-07-18', end: '2026-07-18', title: 'Weekend duty' }),
      file({ person: PID.hunter, type: 'OL', start: '2026-07-20', end: '2026-07-20' }),
      file({ person: PID.hunter, type: 'OL', start: '2026-07-22', end: '2026-07-22' }),
      file({ person: PID.hunter, type: 'Training', start: '2026-07-21', end: '2026-07-21', title: 'Sim refresher' }),
    ]
    const shared = file({ person: PID.hunter, type: 'Training', start: '2026-07-23', end: '2026-07-23', title: 'Shared brief' })
    expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === shared.iid) as any).people.push({ p: PID.osprey, by: PID.hunter, at: Date.now() }) })).toBe(true)
    expect(inputSquadrons(shared).slice().sort(), 'the premise: the shared one touches both').toEqual(['u142', 'u149'])
    expect(oilPendingFor(PID.hunter).map(h => h.iid), 'the premise: the duty\'s OIL question waits').toContain(four[0].iid)
    await doing(() => {})
    return { four, shared }
  }
  it('149 picked: the rows before the filters, the List (a desktop\'s rows), the month and the opened day hold the shared one and none of the four; 142 picked: all five', async () => {
    await app('hunter')
    const { four, shared } = await fiveOfHis()
    await topPick('u149')
    expect(listed(shared.iid), 'the shared one listed on 149').toBe(true)
    for (const r of four) expect(listed(r.iid), `${r.type} ${r.date} not listed on 149`).toBe(false)
    await doing(() => { setPage('inputs'); setInpView('table'); setInpMode('member') })
    expect(drawn(shared.iid), 'the shared one drawn on 149\'s List').toBe(true)
    for (const r of four) expect(drawn(r.iid), `${r.type} ${r.date} not drawn on 149's List`).toBe(false)
    expect(document.querySelectorAll('[data-oilask]').length, 'no "OIL?" button on 149\'s List (the one waiting is his 142 duty)').toBe(0)
    await doing(() => { setInpView('cal'); setCalMonth({ y: 2026, m: 7 }) })
    for (const r of four) expect(drawn(r.iid), `no bar of ${r.type} ${r.date} on 149's month`).toBe(false)
    await tap($('[data-icday="2026-07-18"]'), 'Sat 18 Jul on 149\'s calendar')
    expect(drawn(four[0].iid), 'not in 149\'s opened day').toBe(false)
    await press(tid('win-inputsday-x'), 'the day\'s ✕')
    await topPick('u142')
    for (const r of [...four, shared]) expect(listed(r.iid), `${r.type} ${r.date} listed on 142`).toBe(true)
    await doing(() => { setInpView('table') })
    for (const r of [...four, shared]) expect(drawn(r.iid), `${r.type} ${r.date} drawn on 142's List`).toBe(true)
  })
  it('…a phone\'s day groups the same: none of the four on 149\'s List', async () => {
    phoneSize()
    await app('hunter')
    const { four, shared } = await fiveOfHis()
    await topPick('u149')
    await doing(() => { setPage('inputs'); setInpView('table'); setInpMode('member') })
    expect(drawn(shared.iid), 'the shared one\'s card').toBe(true)
    for (const r of four) expect(drawn(r.iid), `no card of ${r.type} ${r.date}`).toBe(false)
  })
  it('the invariant: for every seeded person and every squadron he can pick other than his home that day, no row the page lists has an own squadron his pages could be, other than the page\'s own', async () => {
    const { inputSqn } = await import('../state/inputsqn')
    const { units } = await import('../state/units')
    signInAs('hunter')
    await fiveOfHis()
    for (const who of ['saber', 'hunter', 'ranger', 'kestrel', 'osprey', 'mako'] as const) {
      signInAs(who)
      const home = myUnit(todayIso())
      for (const u of units().map(x => String(x.id))) {
        if (u === home) continue
        try { await act(async () => { await pickSquadron(u) }) } catch { continue }
        const page = pageUnit('own')
        if (page === home) continue
        for (const r of inputsPageRows()) {
          const s = inputSqn(r, page)
          expect(s === page || !ownPageMayBe(s), `${who} on ${page}: ${r.type} ${r.date} is ${s}'s, a page of his`).toBe(true)
        }
      }
    }
  })
})

describe('F15 — a master admin who moved: his old inputs follow the view he is in (D2729 Q8)', () => {
  /* Saber files his own weekend duty on 142 on Fri 17 Jul; on Sat 18 Kestrel, made a master admin by him, moves him to 149
     counting from Sun 19 (nobody moves himself, D2249; a master admin's squadron is a master admin's to change, D2205); on
     Sun 19 he is 149's, the duty still 142's */
  async function savedMove(): Promise<any> {
    at('2026-07-17'); unitsLoad()
    signInAs('saber')
    const d = file({ person: PID.saber, type: 'Duty', start: '2026-07-18', end: '2026-07-18', title: 'Weekend duty' })
    expect(saveAccess(ACCT.kestrel, { master: true }), 'Kestrel made a master admin').toBeNull()
    at('2026-07-18'); unitsLoad()
    signInAs('kestrel')
    const mv = setHome(PID.saber, 'u149')
    expect(mv.ok, JSON.stringify(mv)).toBe(true)
    at('2026-07-19'); unitsLoad()
    expect(homeOn(PID.saber, '2026-07-19'), 'the premise: 149\'s on Sun 19').toBe('u149')
    expect(inputSquadrons(d), 'the premise: the duty is 142\'s').toEqual(['u142'])
    return d
  }
  it('the admin view: off his 149 page, on 142\'s page; the bell\'s tap for it brings 142 into view first', async () => {
    const d = await savedMove()
    await app('saber')
    expect([UNIT, pageUnit('own')], 'the premise: on his 149 page').toEqual(['u149', 'u149'])
    expect(listed(d.iid), 'off his 149 page in the admin view').toBe(false)
    await topPick('u142')
    expect(listed(d.iid), 'on 142\'s page').toBe(true)
    await topPick('u149')
    expect(oilPendingFor(PID.saber).map(h => h.iid), 'the premise: its OIL question his').toEqual([d.iid])
    await press($('#notifyBell'), 'the bell')
    expect([UNIT, CURPAGE, INPEDIT?.iid]).toEqual(['u142', 'inputs', d.iid])
    live()
  })
  it('(pin, today\'s too — in the member view his own pages are his home\'s, where every input naming him is listed) the member view: listed on his own 149 page, the window live there', async () => {
    const d = await savedMove()
    await app('saber')
    await press($('#roleBadge'), 'his name badge')
    expect(pageUnit('own'), 'the premise: the member view, his own pages 149\'s').toBe('u149')
    expect(listed(d.iid), 'listed on his 149 page').toBe(true)
    await doing(() => { setPage('inputs'); setInpEdit(d) })
    live()
  })
})

describe('F16 — a new input filed from another squadron\'s page shows where it belongs', () => {
  it('Hunter on 149 files an input for a 149 man from the calendar\'s day: listed on 149, not on 142; his own name is not offered', async () => {
    await app('hunter')
    await topPick('u149')
    await doing(() => { setPage('inputs'); setInpView('cal'); setInpMode('member'); setCalMonth({ y: 2026, m: 7 }) })
    await tap($('[data-icday="2026-07-29"]'), 'Wed 29 Jul on 149\'s calendar')
    await press($('#icPopAdd'), 'the day\'s "+ Input"')
    const values = [...document.querySelectorAll<HTMLOptionElement>('#inpEditPerson option')].map(o => o.value)
    expect(values, 'his own name not offered').not.toContain(PID.hunter)
    expect(values, 'the 149 man offered').toContain(PID.osprey)
    await act(async () => { fireEvent.change($('#inpEditPerson')!, { target: { value: PID.osprey } }) })
    const had = new Set(INPUTS.map((r: any) => r.iid))
    await addIt()
    const x = INPUTS.find((r: any) => !had.has(r.iid)) as any
    expect(x && idsOf(x), 'filed for the 149 man').toEqual([PID.osprey])
    expect(listed(x.iid), 'listed on 149').toBe(true)
    await press(tid('win-inputsday-x'), 'the day\'s ✕')
    await topPick('u142')
    expect(listed(x.iid), 'not on 142').toBe(false)
  })
})

describe('F17 — the just-saved row does not follow him to another squadron (Opus F-e)', () => {
  /* Hunter on 142's List, its Person filter on another 142 man, saves his own Thu 16 Jul duty through "+ Input": pinned
     at the List's head though the filter hides it */
  async function pinnedDuty(): Promise<any> {
    await doing(() => { setPage('inputs'); setInpView('table'); setInpMode('member') })
    const other = Object.keys(PEOPLE).find(id => { const p: any = (PEOPLE as any)[id]; return id !== PID.hunter && !p.special && !p.archived && homeOn(id, todayIso()) === 'u142' })!
    await act(async () => { fireEvent.change($('#inFPerson')!, { target: { value: other } }) })
    await press($('#inNew'), '"+ Input"')
    await act(async () => { fireEvent.change($('#inpEditType')!, { target: { value: 'Duty' } }) })
    await press($('#inpEdCal [data-iso="2026-07-16"]'), 'Thu 16 Jul in the window\'s calendar')
    const had = new Set(INPUTS.map((r: any) => r.iid))
    await addIt()
    const x = INPUTS.find((r: any) => !had.has(r.iid)) as any
    expect(x && idsOf(x), 'the premise: his own duty saved').toEqual([PID.hunter])
    expect(drawn(x.iid), 'pin, today\'s too: on 142 with no pick it is pinned in view though the filter hides it').toBe(true)
    return x
  }
  it('he picks 149: 149\'s List holds no row of it; back on 142 it is listed', async () => {
    await app('hunter')
    const x = await pinnedDuty()
    await topPick('u149')
    expect(UNIT).toBe('u149')
    expect(drawn(x.iid), 'no row of his 142 duty on 149\'s List').toBe(false)
    expect(listed(x.iid)).toBe(false)
    await topPick('u142')
    expect(listed(x.iid), 'back on 142: listed').toBe(true)
  })
  it('…the same at a phone\'s size', async () => {
    phoneSize()
    await app('hunter')
    const x = await pinnedDuty()
    await topPick('u149')
    expect(drawn(x.iid), 'no card of his 142 duty on 149\'s List').toBe(false)
  })
  it('…the same by a bell line to 149 (an input of a 149 man, its window then closed)', async () => {
    await app('hunter')
    const x = await pinnedDuty()
    const osp = INPUTS.find((r: any) => inputSquadrons(r).join() === 'u149') as any
    expect(osp, 'the premise: an input of 149\'s alone').toBeTruthy()
    const n: any = { id: 'k9l1', to: PID.hunter, by: null, at: Date.now(), iid: String(osp.iid), name: 'x', day: '2026-07-15', what: [{ k: 'in' }], u: 'u149' }
    NOTICES.push(n)
    await doing(() => {})
    await press($('#notifyBell'), 'the bell')
    await press(tid(`bell-line-${n.id}`), 'the 149 line')
    expect([UNIT, CURPAGE, INPEDIT?.iid], 'the premise: 149, Inputs, its window').toEqual(['u149', 'inputs', osp.iid])
    await press(tid('win-inputedit-x'), 'the window\'s ✕')
    expect(drawn(x.iid), 'no row of his 142 duty on 149\'s List').toBe(false)
  })
})

describe('INPUT_DOORS — every door into an input\'s window says whether it brings the input\'s squadron first (§5.2, §5.3, R5 (a))', () => {
  it('each "home" door\'s file asks enterForLine; every file asking enterForLine of an input\'s own squadron (inputSqn) is a "home" door\'s', async () => {
    const { INPUT_DOORS } = await import('../state/inputsqn')
    const { readFileSync, readdirSync } = await import('node:fs')
    const files = (readdirSync('src', { recursive: true }) as string[]).map(p => String(p).split('\\').join('/'))
      .filter(p => /\.(ts|tsx|js|jsx)$/.test(p) && !/\.test\./.test(p) && !p.startsWith('test-support/'))
    const src = (rel: string) => readFileSync(`src/${rel}`, 'utf8')
    for (const d of INPUT_DOORS.filter(x => x.home)) expect(src(d.where), `${d.id} — ${d.where} asks enterForLine`).toMatch(/enterForLine\(/)
    const asking = files.filter(p => /enterForLine\(inputSqn\(/.test(src(p))).sort()
    expect(asking, 'the files that bring an input\'s own squadron first').toEqual(['ui/OilDayList.tsx', 'ui/topstate.ts'])
    for (const p of asking) expect(INPUT_DOORS.some(x => x.home && x.where === p), `${p} is a "home" door of INPUT_DOORS`).toBe(true)
  })
})

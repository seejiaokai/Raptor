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
import { withThird, third, signInAs, signOut, PID, ACCT, at, pastMidnight, moveMan } from '../test-support/msq-world'
import { commitNewInput, askOilIfPending } from './inputedit'
import { inputsPageRows } from './InputsPage'
import { InputEditor } from './InputWindow'
import { INPEDIT, OILASK, OILLIST, DOCVIEW, setInpEdit, setOilList, setOilAsk } from './pops'
import { INPUTS, inputSquadrons, idsOf, inputUnitOf, inputOnDay, inputsOnDay, isDownchit } from '../engine/inputs'
import { medDownAsOf, pendingUpchits, medEpisode } from '../engine/medical'
import { PEOPLE } from '../engine/people'
import { UNIT } from '../engine/unitview'
import { notify, writeInputsBatch, switchRoleView } from '../state/store'
import { pageUnit, ownPageMayBe, myUnit, me } from '../state/perms'
import { inputSqn, letOpenOn, letReadOnly, holderOf, isOpenMedical, lifeOf, filedOn, foreignInput } from '../state/inputsqn'
import { globalUndo, globalRedo } from '../undo/timeline'
import { fileStraight } from '../leavewar/state/store'
import { enterForLine } from '../state/belltap'
import { saveAccess, addAccount } from '../state/accounts'
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
import { MM, OPEN, app, doing, press, settle, tap, topPick, goTracker, goLeaveWar, chartEdit, guardTeardown, note, nothingHeld, tid } from '../test-support/msq-guard-testkit'
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
  it('letOpenOn (step K10 — the root\'s alone): null for all three; the moved man\'s old 142 input on his 149 page → 149; an input he only filed for others → null', async () => {
    const { letOpenOn } = await import('../state/inputsqn')
    signInAs('hunter')
    const own = file({ person: PID.hunter, type: 'OL', start: '2026-07-20', end: '2026-07-20' })
    const both = file({ person: PID.hunter, type: 'Training', start: '2026-07-21', end: '2026-07-21', title: 'Shared' })
    expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === both.iid) as any).people.push({ p: PID.osprey, by: PID.hunter, at: Date.now() }) })).toBe(true)
    const forOsprey = file({ person: PID.osprey, type: 'Training', start: '2026-07-22', end: '2026-07-22', title: 'Filed by Hunter' })
    expect(letOpenOn(own, 'u149', PID.hunter), 'his own 142 input on 149: his pages can be 142\'s, and 149 is not his home').toBeNull()
    expect(letOpenOn(own, third.u150, PID.hunter), '…nor on 150, which he only views').toBeNull()
    expect(letOpenOn(INPUTS.find((x: any) => x.iid === both.iid), 'u149', PID.hunter), 'an input naming men of both, on 149: 149\'s own already').toBeNull()
    expect(letOpenOn({ _new: true, person: PID.hunter }, 'u149', PID.hunter), 'a new input: its page\'s').toBeNull()
    expect(letOpenOn(forOsprey, 'u142', PID.hunter), 'an input he only filed for others is never let (it does not name him)').toBeNull()
    /* Ranger, moved 142 → 149 with no right in 142: his old 142 duty, live where he is (D2621) */
    signInAs('ranger')
    const duty = file({ person: PID.ranger, type: 'Duty', start: '2026-07-15', end: '2026-07-15', title: 'Duty officer' })
    signInAs('saber')
    expect(moveMan(PID.ranger, 'u149').ok).toBe(true)
    await act(async () => { pastMidnight() })
    signInAs('ranger')
    expect(inputSquadrons(duty), 'the premise: 142\'s').toEqual(['u142'])
    expect(ownPageMayBe('u142'), 'the premise: his pages may never be 142\'s').toBe(false)
    expect(letOpenOn(duty, 'u149', PID.ranger), 'the moved man\'s old input, on his 149 page').toBe('u149')
    /* (asked of another page it names that page — so it is asked ONCE, when the window's note is taken: F12) */
    expect(letOpenOn(duty, third.u150, PID.ranger)).toBe(third.u150)
    expect(letOpenOn(duty, 'u142', PID.ranger), 'on 142\'s page it is 142\'s own').toBeNull()
  })
  it('letOpenOn — K0\'s settlement of §5.5\'s home-page row: his own input of the squadron he moves to, on his own home page that day → that page; on its own squadron\'s page → null (its own already)', async () => {
    const { letOpenOn, inputSqn } = await import('../state/inputsqn')
    at('2026-11-30')
    unitsLoad()
    expect(moveMan(PID.hunter, 'u149').ok, 'his move saved by Saber, counting from Tue 1 Dec').toBe(true)
    signInAs('hunter')
    const lv = file({ person: PID.hunter, type: 'LL', start: '2026-12-05', end: '2026-12-05' })
    expect(inputSqn(lv, 'u142'), 'the premise: 149\'s on its day').toBe('u149')
    expect(myUnit(todayIso()), 'the premise: 142 is his home today').toBe('u142')
    expect(letOpenOn(lv, 'u142', PID.hunter), 'his own, on his home page today').toBe('u142')
    expect(letOpenOn(lv, 'u149', PID.hunter), 'on 149\'s page it is 149\'s own').toBeNull()
    expect(letOpenOn(lv, third.u150, PID.hunter), 'never on a page that is not his home').toBeNull()
  })
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

/* ======================= STEP K10 (§10 step 8) — part F's root: the window records the input's own squadron =======================
   The plan §5.2 (the note takes `inputSqn` and `letOpenOn`, once), §5.5 (every door into the window, its last column
   settled by a press before the root is switched on), §5.6 (F4, F8, F10, F12). THE DOORS ARE PRESSED ON THE REAL CONTROLS
   (the app drawn whole — the testkit's app()); what each press opened is judged by the root's own two answers, the very
   ones the window's note takes (`bornHeld`), so the answer stands whether or not the root is switched on. */
/** the page the window stands on, as the window works it out (ui/InputWindow.tsx `pageSqn`: a saved input's window on the
 *  Inputs page stands on his own pages' squadron, anywhere else on the schedule in view's) */
const windowPage = (): string => (CURPAGE === 'inputs' ? pageUnit('own') : UNIT)
/** the root's verdict on the window a press just opened: '' — its note would let it stand live on the page, or open it
 *  there read only (step K10-a's `letReadOnly`, the K10 root plan §4.2 item 1: the window stands on `let ?? (ro ? at :
 *  unit)`); else what it is ("u142's input on u149's page" — a window born held) */
/* (asked optionally: on the code before step K10-a there is no `letReadOnly`, and a window it would open read only is born
   held there — the very failure the re-pointed findings and M2 are seen red for, never a missing function's TypeError) */
const readOnlyThere = (r: any, p: string): boolean => (letReadOnly as any)?.(r, p, me()) === true
function bornHeld(): string {
  const r = INPEDIT, p = windowPage()
  if (!r || r._new) return ''
  const own = inputSqn(r, p)
  return own === p || letOpenOn(r, p, me()) === p || readOnlyThere(r, p) ? '' : `${own}'s input on ${p}'s page`
}
const shut = async () => { await doing(() => { setInpEdit(null); setOilAsk(null) }) }
const rowIds = (): string[] => [...document.querySelectorAll('#inBody tr[data-iid]')].map(e => (e as HTMLElement).dataset.iid!)
const theList = async () => { await doing(() => { setPage('inputs'); setInpView('table'); setInpMode('member') }) }

describe('§5.5 — the doors into the Input window, each pressed (step K10): what each opens', () => {
  it('a row of the Inputs List — Hunter (Plan of 149) on 149\'s List: every row drawn, pressed, opens a window its note lets stand live', async () => {
    await app('hunter')
    await topPick('u149')
    await theList()
    const ids = rowIds()
    expect(ids.length, 'the premise: 149\'s List draws rows').toBeGreaterThan(0)
    for (const iid of ids) {
      await press($(`#inBody tr[data-iid="${iid}"]`), `the row ${iid}`)
      expect(String(INPEDIT?.iid), `the row ${iid} opened its window`).toBe(iid)
      expect(bornHeld(), `the row ${iid}`).toBe('')
      await shut()
    }
  })
  it('…a moved man\'s calendar — Ranger moved 142 → 149, no right in 142: his old 142 duty\'s card, on his 149 calendar\'s Wed 15 Jul, opens where he is, let open there (D2621)', async () => {
    signInAs('ranger')
    const duty = file({ person: PID.ranger, type: 'Duty', start: '2026-07-15', end: '2026-07-15', title: 'Duty officer' })
    signInAs('saber')
    expect(moveMan(PID.ranger, 'u149').ok).toBe(true)
    await act(async () => { pastMidnight() })
    await app('ranger')
    await doing(() => { setPage('inputs'); setInpView('cal'); setInpMode('member'); setCalMonth({ y: 2026, m: 7 }) })
    expect(pageUnit('own'), 'the premise: his own pages are 149\'s').toBe('u149')
    await tap($('[data-icday="2026-07-15"]'), 'Wed 15 Jul on his 149 calendar')
    await press(document.querySelector(`[data-testid="win-inputsday"] [data-popiid="${duty.iid}"] [data-testid="idy-open"]`), 'his old duty\'s card')
    expect(String(INPEDIT?.iid)).toBe(String(duty.iid))
    expect(inputSqn(duty, 'u149'), 'the old duty is 142\'s — the let case, not the page\'s own').toBe('u142')
    expect(bornHeld()).toBe('')
  })
  it('…his home page with a move saved ahead (K0\'s settlement): Hunter, a move to 149 saved for 1 Dec, his leave for 5 Dec on his 142 List — let open there', async () => {
    at('2026-11-30')
    unitsLoad()
    expect(moveMan(PID.hunter, 'u149').ok).toBe(true)
    signInAs('hunter')
    const lv = file({ person: PID.hunter, type: 'LL', start: '2026-12-05', end: '2026-12-05' })
    await app('hunter')
    await theList()
    expect(pageUnit('own'), 'the premise: his home page').toBe('u142')
    await press($(`#inBody tr[data-iid="${lv.iid}"]`), 'his leave\'s row')
    expect(String(INPEDIT?.iid)).toBe(String(lv.iid))
    expect(inputSqn(lv, 'u142'), 'the premise: 149\'s on its day').toBe('u149')
    expect(bornHeld(), 'let open on his own home page').toBe('')
  })
  it('a card of the Inputs calendar\'s day — Hunter on 149\'s calendar, Tue 14 and Fri 17 Jul: every card pressed', async () => {
    await app('hunter')
    await topPick('u149')
    await doing(() => { setPage('inputs'); setInpView('cal'); setInpMode('member'); setCalMonth({ y: 2026, m: 7 }) })
    let n = 0
    for (const iso of ['2026-07-14', '2026-07-17']) {
      await tap($(`[data-icday="${iso}"]`), `${iso} on 149's calendar`)
      expect(tid('win-inputsday'), `the premise: ${iso} is open`).not.toBeNull()
      const ids = [...document.querySelectorAll('[data-testid="win-inputsday"] .icard[data-popiid]')].map(e => (e as HTMLElement).dataset.popiid!)
      for (const iid of ids) {
        await press(document.querySelector(`[data-testid="win-inputsday"] [data-popiid="${iid}"] [data-testid="idy-open"]`), `the card ${iid}`)
        expect(String(INPEDIT?.iid), `the card ${iid} opened its window`).toBe(iid)
        n++; expect(bornHeld(), `the card ${iid}`).toBe('')
        await shut()
      }
      await press(tid('win-inputsday-x'), 'the day\'s ✕')
    }
    expect(n, 'the premise: cards were pressed and opened').toBeGreaterThan(0)
  })
  it('a line of a SANS day — Hunter on 142\'s SANS calendar, Wed 15 Jul: every line pressed (the day lists its own squadron\'s lines)', async () => {
    await app('hunter')
    await doing(() => { setPage('inputs'); setInpView('cal'); setInpMode('sans'); setCalMonth({ y: 2026, m: 7 }) })
    await tap($('[data-icday="2026-07-15"]'), 'Wed 15 Jul on 142\'s SANS calendar')
    const n = document.querySelectorAll('[data-testid="sd-open"]').length
    expect(n, 'the premise: the day lists SANS lines').toBeGreaterThan(0)
    for (let i = 0; i < n; i++) {
      await press(document.querySelectorAll('[data-testid="sd-open"]')[i]!, `the line ${i}`)
      expect(INPEDIT, `the line ${i} opened its window`).toBeTruthy()
      expect(bornHeld(), `the line ${i}`).toBe('')
      await shut()
    }
  })
  it('a bell line where his pages may never be the line\'s squadron — Ranger moved 142 → 149: a line about his old 142 duty opens it where he is, let open there', async () => {
    signInAs('ranger')
    const duty = file({ person: PID.ranger, type: 'Duty', start: '2026-07-15', end: '2026-07-15', title: 'Duty officer' })
    signInAs('saber')
    expect(moveMan(PID.ranger, 'u149').ok).toBe(true)
    await act(async () => { pastMidnight() })
    const n: any = { id: 'k10l1', to: PID.ranger, by: null, at: Date.now(), iid: String(duty.iid), name: 'Duty', day: '2026-07-15', what: [{ k: 'in' }], u: 'u142' }
    NOTICES.push(n)
    await app('ranger')
    await press($('#notifyBell'), 'the bell')
    await press(tid(`bell-line-${n.id}`), 'the line')
    expect([UNIT, CURPAGE, String(INPEDIT?.iid)], 'the premise: his 149 page, the window').toEqual(['u149', 'inputs', String(duty.iid)])
    expect(bornHeld()).toBe('')
  })
  it('the bell\'s own OIL tap — Hunter, 149 picked, his 142 weekend duty: 142 brought into view first, its window its own (F1\'s road)', async () => {
    await app('hunter')
    const d = await ownWeekendDuty()
    await topPick('u149')
    await press($('#notifyBell'), 'the bell')
    expect([UNIT, String(INPEDIT?.iid)]).toEqual(['u142', String(d.iid)])
    expect(bornHeld()).toBe('')
  })
  it('a card of the OIL list — Hunter on 142, its list of Sat 18 Jul: the card opens his duty, its own (F5 holds the road over another squadron)', async () => {
    await app('hunter')
    const d = await ownWeekendDuty()
    await doing(() => setOilList({ from: '2026-07-18', to: '2026-07-18', name: 'Holiday', unit: 'u142' }))
    await press(tid(`odl-row-${d.iid}`)?.querySelector('.icard-who') ?? tid(`odl-row-${d.iid}`), 'the card')
    expect([UNIT, CURPAGE, String(INPEDIT?.iid)]).toEqual(['u142', 'inputs', String(d.iid)])
    expect(bornHeld()).toBe('')
  })
  it('the OIL question raised after a change on the schedule — its opener (ui/inputedit.tsx askOilIfPending), asked of every input 149\'s week draws: each window its note lets stand live', async () => {
    /* (its callers — the row door's and oilFirst's "should the two ever disagree" paths, and a time typed on a row by
       someone who may not edit the schedule — are reached by no ordinary press; each hands the opener an input of the
       schedule in view found again by its id, so the opener is asked of every input 149's week draws) */
    signInAs('hunter')
    const sat = file({ person: PID.osprey, type: 'Duty', start: '2026-07-18', end: '2026-07-18', title: 'Weekend duty' })
    await app('hunter')
    await topPick('u149')
    await doing(() => setPage('editsched'))
    const { inputsOn } = await import('../engine/inputs')
    const { DAYS } = await import('../engine/data')
    const seen = new Set<string>()
    for (const d of DAYS as any[]) if (d) for (const r of inputsOn(d.dt) as any[]) seen.add(String(r.iid))
    expect([...seen], 'the premise: 149\'s Saturday duty is on the week').toContain(String(sat.iid))
    let asked = 0
    for (const iid of seen) {
      const r = INPUTS.find((x: any) => String(x.iid) === iid)
      await doing(() => { if (askOilIfPending(r)) asked++ })
      if (INPEDIT) expect(bornHeld(), `the input ${iid}`).toBe('')
      await shut()
    }
    expect(asked, 'the premise: the Saturday duty asks').toBeGreaterThan(0)
  })
  it('a label on the week — Hunter, 149 picked, Edit Schedule: every input label the week draws, pressed', async () => {
    await app('hunter')
    await topPick('u149')
    await doing(() => setPage('editsched'))
    const ids = [...new Set([...document.querySelectorAll('[data-inpedit]')].map(e => (e as HTMLElement).dataset.inpedit!))]
    expect(ids.length, 'the premise: the week draws input labels').toBeGreaterThan(0)
    for (const k of ids) {
      await press([...document.querySelectorAll('[data-inpedit]')].find(e => (e as HTMLElement).dataset.inpedit === k) ?? null, `the label ${k}`)
      expect(INPEDIT, `the label ${k} opened its window`).toBeTruthy()
      expect(bornHeld(), `the label ${k}`).toBe('')
      await shut()
    }
  })
  it('the OIL question of what was just filed from the Leave War — Hunter, 149 picked, an OD for a 149 man on Sat 18 Jul filed on 149\'s war: its window its own', async () => {
    await app('hunter')
    await topPick('u149')
    await goLeaveWar()
    const before = new Set(INPUTS.map((r: any) => r.iid))
    await doing(() => { expect(fileStraight([{ personId: PID.osprey, date: '2026-07-18' }], 'OD').done, 'filed on the war').toBe(1) })
    await settle()
    const x = INPUTS.find((r: any) => !before.has(r.iid)) as any
    expect(x, 'the premise: the OD saved').toBeTruthy()
    expect(String(INPEDIT?.iid), 'the premise: its OIL question\'s window').toBe(String(x.iid))
    expect(bornHeld()).toBe('')
  })
})

/* RE-POINTED AT STEP K10-a (the K10 root plan §7.1 FIND-1, FIND-2), every assertion of the two finding pins kept but the
   last, which named the root's old verdict ("born held") and now names his answer: D2834 / D2845 for the Medical tab (a
   record still open when its man moves goes with him — 149's), D2835 for the bell line (the View-only presser reads it
   read only, today's look). */
describe('§5.5 — the two doors step K10 found, answered by his D2834, D2845 and D2835 (step K10-a): neither opens a window born held', () => {
  it('FIND-1 — D2834/D2845: "Edit input" in the document viewer, from the Medical tab: Saber (a master admin), 149 picked, a man moved 142 → 149 — his still-open OML\'s card on 149\'s Medical tab opens it as 149\'s, its note\'s answers live', async () => {
    /* Nasty's OML of 6–9 Jul (seeded, 142's), no upchit: moved to 149 by Saber, counting from Thu 16 Jul */
    const oml = INPUTS.find((r: any) => r.person === 'nasty' && r.type === 'OML') as any
    expect(oml && inputSquadrons(oml), 'the premise: his OML is 142\'s').toEqual(['u142'])
    signInAs('saber')
    expect(moveMan('nasty', 'u149').ok).toBe(true)
    await act(async () => { pastMidnight() })
    await app('saber')
    await topPick('u149')
    await doing(() => { setPage('inputs'); setInpView('med') })
    /* (the tab opens "as of" the app's own today, the demo week's Mon 13 Jul — 142's for him then; its "as of" moved to
       Thu 16 Jul, his first day as 149's, by its own calendar) */
    await press($('#medCalBtn'), 'the tab\'s "as of"')
    await press($('[data-medday="2026-07-16"]'), 'Thu 16 Jul')
    const card = $(`.medcard[data-medcard="${oml.iid}"]`)
    expect(card, 'his 142 OML\'s card stands on 149\'s Medical tab (the tab lists the men on its roster on the day)').not.toBeNull()
    await press(card, 'the card')
    await press($('#docViewEdit'), '"Edit input"')
    expect([UNIT, CURPAGE, String(INPEDIT?.iid)], 'the window of his OML, on 149\'s page').toEqual(['u149', 'inputs', String(oml.iid)])
    /* (his D2834: "anything that's outstanding that is not closed will need to be transferred with the person" — the OML,
       still pending, is 149's now: the window's note takes 149, the page's own) */
    expect(inputSqn(INPEDIT, 'u149'), 'the note\'s own squadron: 149, its holder').toBe('u149')
    expect(bornHeld(), 'not born held: the page\'s own').toBe('')
    live()
  })
  it('FIND-1 — D2834/D2845: …Kestrel (149\'s admin) reads it read only — the window\'s own mirror of the gate, which judges it by its days — and closes it with "Upchit": her Upchit dated on the move day is saved, 149\'s, and Nasty leaves Pending Upchit', async () => {
    const oml = INPUTS.find((r: any) => r.person === 'nasty' && r.type === 'OML') as any
    signInAs('saber')
    expect(moveMan('nasty', 'u149').ok).toBe(true)
    await act(async () => { pastMidnight() })
    await app('kestrel' as any)
    expect(pageUnit('own'), 'the premise: her own pages are 149\'s').toBe('u149')
    await doing(() => { setPage('inputs'); setInpView('med') })
    await press($('#medCalBtn'), 'the tab\'s "as of"')
    await press($('[data-medday="2026-07-16"]'), 'Thu 16 Jul')
    const card = () => $(`.med-pend .medcard[data-medcard="${oml.iid}"]`)
    expect(card(), 'his OML under Pending Upchit on 149\'s tab').not.toBeNull()
    await press(card(), 'the card')
    await press($('#docViewEdit'), '"Edit input"')
    expect([UNIT, CURPAGE, String(INPEDIT?.iid)]).toEqual(['u149', 'inputs', String(oml.iid)])
    expect(bornHeld(), 'not born held: 149\'s, its holder').toBe('')
    expect(tid('inped-ro'), 'read only for her (the window\'s own `foreign` test: she is an admin of none of its days\' squadrons)').not.toBeNull()
    expect($('#inpEditSave'), 'no Save offered').toBeNull()
    expect(foreignInput(oml), 'the predicate letReadOnly shares with the window says the same').toBe(true)
    await shut()
    /* "Upchit", from the same card: dated on Thu 16 Jul (the viewer seeds the demo's notional today, 13 Jul — the K10 root
       plan §3.1: a date before the move would touch 142 and is the gate's to refuse, `[XFER]`'s) */
    await press(card(), 'the card again')
    await press($('#docViewUpchit'), '"Upchit"')
    expect(INPEDIT?._ctx, 'the premise: the upchit\'s own window').toBe('up')
    await press($('#inpEditUpDate'), 'the upchit\'s date box')
    await press(tid('dcal-day-2026-07-16'), 'Thu 16 Jul')
    const before = new Set(INPUTS.map((r: any) => r.iid))
    await press($('#inpEditSave'), 'Add')
    for (let i = 0; i < 3; i++) {
      if (tid('upconf-save')) await press(tid('upconf-save'), 'the upchit sheet\'s Save')
      else if (tid('docconf')) await press(tid('docconf-nodoc'), '"No document"')
    }
    const up = INPUTS.find((r: any) => !before.has(r.iid) && r.type === 'Upchit') as any
    expect(up, 'her Upchit saved').toBeTruthy()
    expect(inputSquadrons(up), '149\'s').toEqual(['u149'])
    expect(card(), 'Nasty off Pending Upchit on 149\'s tab').toBeNull()
    expect(pendingUpchits(20260716).some((e: any) => e.row.iid === oml.iid), 'off the tab\'s own Pending list').toBe(false)
  })
  it('FIND-2 — D2835, the View-only presser: a bell line whose squadron is no longer the input\'s: Hunter (Plan of 149) filed a Training for Osprey; Osprey moved to 150 before its day; the line enters 149 and the root\'s answer is read only, not born held', async () => {
    signInAs('hunter')
    const row = file({ person: PID.osprey, type: 'Training', start: '2026-07-27', end: '2026-07-27', title: 'Sim refresher' })
    signInAs('kestrel')
    expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === row.iid) as any).remarks = 'Kestrel changed it' })).toBe(true)
    const line = NOTICES.find(n => n.to === PID.hunter && n.iid === row.iid) as any
    expect(line, 'the premise: Hunter, its filer, told').toBeTruthy()
    signInAs('saber')
    expect(moveMan(PID.osprey, third.u150).ok, 'Osprey moved to 150, counting from Thu 16 Jul').toBe(true)
    await act(async () => { pastMidnight() })
    expect(inputSquadrons(INPUTS.find((x: any) => x.iid === row.iid)), 'the premise: the Training is 150\'s now').toEqual([third.u150])
    await app('hunter')
    expect(noticesFor(PID.hunter).some(x => x.id === line.id), 'the premise: the line is still on his bell').toBe(true)
    await press($('#notifyBell'), 'the bell')
    await press(tid(`bell-line-${line.id}`), 'the line')
    expect([UNIT, CURPAGE, String(INPEDIT?.iid)], 'the line\'s own squadron, 149, its Inputs page, the window').toEqual(['u149', 'inputs', String(row.iid)])
    expect(inputSqn(INPEDIT, 'u149'), 'the premise: still 150\'s (its day is ahead: nothing carried)').toBe(third.u150)
    expect(readOnlyThere(INPEDIT, 'u149'), 'read only on 149 (letReadOnly case 3: his pages may never be 150\'s, it does not name him, he could change nothing of it)').toBe(true)
    expect(bornHeld(), 'not born held').toBe('')
  })
})

describe('F8 (pin) — an input naming men of both squadrons is live and listed on both pages', () => {
  it('pin: Hunter\'s Training shared with Osprey: listed on 142\'s page and on 149\'s; its window live on both', async () => {
    signInAs('hunter')
    const both = file({ person: PID.hunter, type: 'Training', start: '2026-07-21', end: '2026-07-21', title: 'Shared' })
    expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === both.iid) as any).people.push({ p: PID.osprey, by: PID.hunter, at: Date.now() }) })).toBe(true)
    await app('hunter')
    await theList()
    expect(listed(both.iid), 'listed on 142\'s page').toBe(true)
    await doing(() => setInpEdit(INPUTS.find((x: any) => x.iid === both.iid)))
    live(); expect(bornHeld()).toBe('')
    await shut()
    await topPick('u149')
    expect(listed(both.iid), 'listed on 149\'s page').toBe(true)
    await doing(() => setInpEdit(INPUTS.find((x: any) => x.iid === both.iid)))
    live(); expect(bornHeld()).toBe('')
  })
})

describe('K0\'s settlement (§5.5\'s home-page row) — his own input of the squadron he moves to, on his own home page, is that page\'s', () => {
  it('Saber, home 142, a move to 149 saved for 1 Dec: his leave for 5 Dec opened on his 142 home page — live, saved there; then on 149\'s page, where it touches 149 — live (F18\'s window half)', async () => {
    at('2026-11-30')
    unitsLoad()
    signInAs('saber')
    expect(saveAccess(ACCT.kestrel, { master: true }), 'Kestrel made a master admin').toBeNull()
    signInAs('kestrel')
    expect(setHome(PID.saber, 'u149').ok).toBe(true)
    unitsLoad()
    signInAs('saber')
    const lv = file({ person: PID.saber, type: 'LL', start: '2026-12-05', end: '2026-12-05' })
    expect(inputSqn(lv, 'u142'), 'the premise: 149\'s on its day').toBe('u149')
    await app('saber')
    await theList()
    expect(pageUnit('own'), 'the premise: his 142 home page').toBe('u142')
    await doing(() => setInpEdit(INPUTS.find((x: any) => x.iid === lv.iid)))
    live(); expect(bornHeld()).toBe('')
    await act(async () => { fireEvent.change($('#inpEditRmk')!, { target: { value: 'K0 kept' } }) })
    await press($('#inpEditSave'), 'Save')
    expect((INPUTS.find((x: any) => x.iid === lv.iid) as any).remarks, 'saved there').toBe('K0 kept')
    await shut()
    await topPick('u149')
    expect(pageUnit('own')).toBe('u149')
    await doing(() => setInpEdit(INPUTS.find((x: any) => x.iid === lv.iid)))
    live(); expect(bornHeld()).toBe('')
  })
})

/* ======================= STEP K10-a — under his D2834, D2845, D2846, D2847 (the K10 root plan §7.1) =======================
   docs/superpowers/plans/2026-11-28-msq-s1-k10-root-plan.md. A ONE-MAN record still open when its man moves squadron goes
   with him (D2834: "anything that's outstanding that is not closed will need to be transferred with the person"); one
   closed before the move stays (D2846: "an upchit given by the old squadron"); his leave across the move is the new
   squadron's (D2847); 149's admin closes a carried downchit when the paper comes in (D2845). Built here: `holderOf` (its
   settle day, the episode's own upchit, the filing day), `inputSqn` holder-first, `lifeOf`, `letOpenOn`'s case 2 narrowed,
   `letReadOnly` cases 3 and 4, and the Medical tab's Upchit Complete listed by the upchit's filing day. THE ROOT ITSELF
   STAYS OFF (K10-d): a window's held answer is judged here, as in §5.5 above, by the root's own answers (`bornHeld`).
   The days: Wed 15 Jul unless a test moves the clock; a move saved on a day counts from the next (D2119). */
const D = (d: number) => `2026-07-${String(d).padStart(2, '0')}`
const ordOf = (iso: string) => +iso.slice(0, 4) * 10000 + +iso.slice(5, 7) * 100 + +iso.slice(8, 10)
/** Nasty's seeded OML of 6–9 Jul (state/demoseed.ts DEMO_MED — 142's, no upchit: Pending Upchit) */
const nastyOml = (): any => INPUTS.find((r: any) => r.person === 'nasty' && r.type === 'OML')
/** a move of `pid` to `unit`, saved on `iso` by Saber (a master admin), counting from the next day */
function moveOn(iso: string, pid: string, unit: string) {
  at(iso); unitsLoad()
  signInAs('saber')
  expect(moveMan(pid, unit).ok, `${pid} moved to ${unit}, saved on ${iso}`).toBe(true)
}
/** a filing through the Inputs page's own door on `iso`, by `who` — the clock set first, so its saved-at moment is that day */
function fileOn(iso: string, who: string, draft: Record<string, unknown>): any {
  at(iso); unitsLoad()
  signInAs(who)
  return file(draft)
}
const upchitOn = (iso: string, who: string, dated: string) => fileOn(iso, who, { person: 'nasty', type: 'Upchit', start: dated, end: dated })
/** Ranger's leave of Tue 14 – Sat 18 Jul, filed by him on Wed 15 Jul */
const rangerLeave = () => fileOn(D(15), 'ranger', { person: PID.ranger, type: 'LL', start: D(14), end: D(18) })

describe('H1 — holderOf: the squadron that holds a one-man record now, only where a move of his has carried it (D2834; the plan §2.1)', () => {
  it('Nasty\'s OML of 6–9 Jul, still pending: moved 142 → 149 (from 16 Jul) — null on the 15th (the move saved, not yet run), 149 on the 16th and 17th; moved on to 150 (from 20 Jul) while still pending — 149 on the 19th, 150 on the 20th and 21st (it follows him while open)', () => {
    const oml = nastyOml()
    expect(oml && inputSquadrons(oml), 'the premise: 142\'s').toEqual(['u142'])
    expect(holderOf(oml, D(15)), 'no move').toBeNull()
    moveOn(D(15), 'nasty', 'u149')
    expect(holderOf(oml, D(15)), 'the move saved ahead: not carried until its day').toBeNull()
    expect(holderOf(oml, D(16)), 'the move day').toBe('u149')
    expect(holderOf(oml, D(17))).toBe('u149')
    at(D(17))
    expect(holderOf(oml), 'today, by the clock').toBe('u149')
    expect(isOpenMedical(oml, D(17)), 'open').toBe(true)
    moveOn(D(19), 'nasty', third.u150)
    expect(holderOf(oml, D(19))).toBe('u149')
    expect(holderOf(oml, D(20)), 'his second move\'s day').toBe(third.u150)
    expect(holderOf(oml, D(21))).toBe(third.u150)
  })
  it('…and back to 142 (from 20 Jul) while still pending: 149 on the 17th, null on the 21st — his first squadron\'s again, nothing carried', () => {
    const oml = nastyOml()
    moveOn(D(15), 'nasty', 'u149')
    expect(holderOf(oml, D(17))).toBe('u149')
    moveOn(D(19), 'nasty', 'u142')
    expect(holderOf(oml, D(19))).toBe('u149')
    expect(holderOf(oml, D(21)), 'back on 142, the squadron of its first day').toBeNull()
  })
  it('…closed by an upchit Kestrel (149\'s admin) files on 18 Jul, then moved on to 150: 149 before it was filed (open), 149 for good after (it stays where it was closed — D2845)', () => {
    const oml = nastyOml()
    moveOn(D(15), 'nasty', 'u149')
    const up = upchitOn(D(18), 'kestrel', D(18))
    expect(filedOn(up), 'its filing day: its saved-at moment').toBe(D(18))
    expect(holderOf(oml, D(17)), 'the day before it was filed: still open, his').toBe('u149')
    expect(isOpenMedical(oml, D(17))).toBe(true)
    moveOn(D(19), 'nasty', third.u150)
    expect(holderOf(oml, D(18)), 'the filing day').toBe('u149')
    expect(holderOf(oml, D(19))).toBe('u149')
    expect(holderOf(oml, D(21)), 'after his move to 150: kept by 149').toBe('u149')
    expect(isOpenMedical(oml, D(21)), 'closed').toBe(false)
    expect(holderOf(up, D(21)), 'an upchit is never carried: by its own day').toBeNull()
  })
  it('…an upchit dated 17 Jul but filed on 10 Jul, before the move (given by the old squadron — D2846; the filing day decides, the planner\'s reading R1): null on the 10th, 15th, 16th, 17th and 21st', () => {
    const oml = nastyOml()
    const up = upchitOn(D(10), 'saber', D(17))
    expect(filedOn(up)).toBe(D(10))
    moveOn(D(15), 'nasty', 'u149')
    for (const d of [10, 15, 16, 17, 21]) expect(holderOf(oml, D(d)), `on ${D(d)}`).toBeNull()
    expect(isOpenMedical(oml, D(16)), 'closed before the move').toBe(false)
  })
  it('…replaced: the OML of 6–9 Jul by an ATT C of 12–13 Jul (a separate later episode); an upchit Kestrel files on 17 Jul closes the ATT C, never the OML (Astra 5): the OML null throughout, the ATT C 149 from the move day', () => {
    const oml = nastyOml()
    const attc = fileOn(D(11), 'saber', { person: 'nasty', type: 'ATT C', start: D(12), end: D(13) })
    moveOn(D(15), 'nasty', 'u149')
    upchitOn(D(17), 'kestrel', D(17))
    for (const d of [15, 16, 17, 18]) expect(holderOf(oml, D(d)), `the OML on ${D(d)} — replaced, read by its days`).toBeNull()
    expect(isOpenMedical(oml, D(15)), 'replaced: not open').toBe(false)
    expect(holderOf(attc, D(15)), 'the ATT C before the move').toBeNull()
    expect(holderOf(attc, D(16)), 'the ATT C on the move day: open, carried').toBe('u149')
    expect(holderOf(attc, D(17)), 'closed by 149\'s upchit, filed after the move').toBe('u149')
    expect(holderOf(attc, D(18))).toBe('u149')
  })
  it('Ranger\'s leave of 14–18 Jul across his move to 149 (from 16 Jul): null on the 15th (saved ahead), 149 on the 16th, 17th and 19th — then moved on to 150 (from 20 Jul): still 149 on the 21st (kept — D2847, Astra 4)', () => {
    const lv = rangerLeave()
    moveOn(D(15), PID.ranger, 'u149')
    expect(holderOf(lv, D(15))).toBeNull()
    for (const d of [16, 17, 19]) expect(holderOf(lv, D(d)), `on ${D(d)}`).toBe('u149')
    moveOn(D(19), PID.ranger, third.u150)
    expect(holderOf(lv, D(21)), 'after his move to 150').toBe('u149')
  })
  it('…or back to 142 (from 20 Jul): still 149 on the 21st (kept)', () => {
    const lv = rangerLeave()
    moveOn(D(15), PID.ranger, 'u149')
    moveOn(D(19), PID.ranger, 'u142')
    expect(holderOf(lv, D(21))).toBe('u149')
  })
  it('never carried: an input of several people (R8), a new input, one whose first day is ahead, and a record his move did not run across', () => {
    signInAs('hunter')
    const both = file({ person: PID.hunter, type: 'Training', start: D(14), end: D(14), title: 'Shared' })
    expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === both.iid) as any).people.push({ p: PID.ranger, by: PID.hunter, at: Date.now() }) })).toBe(true)
    const ahead = fileOn(D(15), 'ranger', { person: PID.ranger, type: 'LL', start: D(27), end: D(27) })
    const before = fileOn(D(15), 'ranger', { person: PID.ranger, type: 'LL', start: D(14), end: D(14) })
    moveOn(D(15), PID.ranger, 'u149')
    expect(holderOf(INPUTS.find((x: any) => x.iid === both.iid), D(17)), 'several people').toBeNull()
    expect(holderOf({ _new: true, person: PID.ranger, type: 'LL' }, D(17)), 'a new input').toBeNull()
    expect(holderOf(ahead, D(17)), 'its first day ahead: 149\'s by its days already').toBeNull()
    expect(holderOf(before, D(17)), 'wholly before the move: stays (D2847)').toBeNull()
  })
})

describe('H2 (pin) — holderOf reads nothing of who is signed in or looking (the plan §2.4)', () => {
  it('every H1 kind of record, and inputSqn and lifeOf with it on 142\'s, 149\'s and 150\'s pages: the same answer signed in as Saber, Hunter, Kestrel, Nasty, Ranger, Osprey, Mako and nobody, in the admin view and the member view', async () => {
    signInAs('saber')
    expect(addAccount('nasty', 'nasty', 'main'), 'a sign-in for Nasty (an admin-added account takes any password)').toBeNull()
    const oml = nastyOml()
    const lv = rangerLeave()
    const ll = INPUTS.find((r: any) => r.person === 'nasty' && r.type === 'LL')
    expect(ll, 'the premise: Nasty\'s seeded LL of 14 Jul').toBeTruthy()
    signInAs('hunter')
    const both = file({ person: PID.hunter, type: 'Training', start: D(21), end: D(21), title: 'Shared' })
    expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === both.iid) as any).people.push({ p: PID.osprey, by: PID.hunter, at: Date.now() }) })).toBe(true)
    moveOn(D(15), 'nasty', 'u149')
    moveOn(D(15), PID.ranger, 'u149')
    at(D(17)); unitsLoad()
    const recs = [oml, lv, ll, INPUTS.find((x: any) => x.iid === both.iid)]
    const pages = ['u142', 'u149', third.u150]
    const answer = () => JSON.stringify(recs.map(r => [holderOf(r), lifeOf(r).slice().sort(), ...pages.map(p => inputSqn(r, p))]))
    signOut()
    const base = answer()
    expect(holderOf(oml), 'the premise: Nasty\'s OML carried').toBe('u149')
    expect(holderOf(lv), 'the premise: Ranger\'s leave carried').toBe('u149')
    for (const who of ['saber', 'hunter', 'kestrel', 'nasty', 'ranger', 'osprey', 'mako']) {
      signInAs(who)
      expect(me(), `${who} signed in`).toBeTruthy()
      expect(answer(), who).toBe(base)
      if (['saber', 'hunter', 'kestrel', 'mako'].includes(who)) {
        await act(async () => { await switchRoleView() })
        expect(answer(), `${who}, the member view`).toBe(base)
        await act(async () => { await switchRoleView() })
      }
    }
  })
})

describe('H3 — inputSqn puts a carried record\'s holder first (the plan §2.2)', () => {
  it('Nasty\'s carried OML → 149 on 142\'s, 149\'s and 150\'s pages; Ranger\'s carried leave → 149 on 142\'s page and on 149\'s (F0\'s assertions, above, unchanged)', () => {
    const oml = nastyOml()
    const lv = rangerLeave()
    moveOn(D(15), 'nasty', 'u149')
    moveOn(D(15), PID.ranger, 'u149')
    at(D(17)); unitsLoad()
    for (const p of ['u142', 'u149', third.u150]) expect(inputSqn(oml, p), `Nasty's OML on ${p}'s page`).toBe('u149')
    expect(inputSqn(lv, 'u142'), 'Ranger\'s leave on 142\'s page — it touches 142, but it went with him').toBe('u149')
    expect(inputSqn(lv, 'u149')).toBe('u149')
  })
})

describe('H4 (pin) — "open" agrees with the Medical tab, record by record (Opus 9)', () => {
  it('a medical record is open by holderOf\'s rule ⇔ it is in the episode of an entry the tab lists under Medically Down or Pending Upchit that day: every seeded medical record, every day of the demo fortnight (13–26 Jul), unmoved and with Nasty moved', () => {
    const check = (label: string) => {
      const meds = INPUTS.filter((r: any) => isDownchit(r.type))
      expect(meds.length, 'the premise: the seeded medical records').toBeGreaterThan(2)
      for (let d = 13; d <= 26; d++) {
        const iso = D(d), o = ordOf(iso)
        const listed = new Set<any>()
        for (const e of [...medDownAsOf(o), ...pendingUpchits(o)]) for (const x of medEpisode(e.row)) listed.add(x)
        for (const r of meds) expect(isOpenMedical(r, iso), `${label}: ${r.person}'s ${r.type} of ${r.date} on ${iso}`).toBe(listed.has(r))
      }
    }
    check('unmoved')
    moveOn(D(15), 'nasty', 'u149')
    check('Nasty moved to 149')
  })
})

describe('H5 (pin) — the engine\'s readers and the save gate read neither inputSqn nor holderOf (the plan §5, §10 risk 4)', () => {
  it('Nasty\'s OML: its squadrons, its days on 142\'s and 149\'s rosters, 142\'s Unavailable list of 6–9 Jul and its first day\'s squadron — the same before and after his move', () => {
    const oml = nastyOml()
    const read = () => JSON.stringify({
      sq: inputSquadrons(oml), unit: inputUnitOf(oml),
      on: [6, 7, 8, 9].map(d => [inputOnDay(oml, 'u142', D(d)), inputOnDay(oml, 'u149', D(d))]),
      list: [6, 7, 8, 9].map(d => inputsOnDay('u142', D(d)).includes(oml)),
    })
    const was = read()
    expect(JSON.parse(was).list, 'the premise: on 142\'s Unavailable list those days').toEqual([true, true, true, true])
    moveOn(D(15), 'nasty', 'u149')
    at(D(17)); unitsLoad()
    /* (the doors asked, as a press asks them — what they answer is H3's) */
    for (const p of ['u142', 'u149', third.u150]) inputSqn(oml, p)
    expect(read(), 'the engine\'s readers unchanged').toBe(was)
  })
  it('no file of the engine, the Leave War or the save gate (state/perms.ts) imports state/inputsqn.ts', async () => {
    const { readFileSync, readdirSync } = await import('node:fs')
    const under = (dir: string) => (readdirSync(`src/${dir}`, { recursive: true }) as string[]).map(p => `${dir}/${String(p).split('\\').join('/')}`)
      .filter(p => /\.(ts|tsx|js|jsx)$/.test(p) && !/\.test\./.test(p))
    const files = [...under('engine'), ...under('leavewar'), 'state/perms.ts']
    expect(files.length, 'the premise: files read').toBeGreaterThan(20)
    const importing = files.filter(p => /^\s*import[^\n]*inputsqn['"]/m.test(readFileSync(`src/${p}`, 'utf8')))
    expect(importing).toEqual([])
  })
})

describe('H6 — letOpenOn\'s case 2 narrowed to the list\'s width (K9\'s aheadAt; D2729 Q8 — the plan §4.3)', () => {
  it('a moved master admin\'s old 142 duty on his new 149 home page → null (it was let there, then held at the root)', async () => {
    signInAs('saber')
    const duty = file({ person: PID.saber, type: 'Duty', start: D(15), end: D(15), title: 'Duty officer' })
    expect(saveAccess(ACCT.kestrel, { master: true }), 'Kestrel made a master admin').toBeNull()
    signInAs('kestrel')
    expect(setHome(PID.saber, 'u149').ok, 'Saber moved to 149, counting from Thu 16 Jul').toBe(true)
    unitsLoad()
    await act(async () => { pastMidnight() })
    signInAs('saber')
    expect(myUnit(todayIso()), 'the premise: 149 is his home today').toBe('u149')
    expect(inputSqn(duty, 'u149'), 'the premise: his duty is 142\'s').toBe('u142')
    expect(ownPageMayBe('u142'), 'the premise: a master admin\'s pages may be 142\'s (case 1 does not let it)').toBe(true)
    expect(letOpenOn(duty, 'u149', PID.saber), 'not let on his 149 home page').toBeNull()
  })
  it('K0\'s settlement unchanged by the narrowing: Saber, home 142, a move to 149 saved for 1 Dec — his leave of 5 Dec on his 142 home page → 142', () => {
    at('2026-11-30'); unitsLoad()
    signInAs('saber')
    expect(saveAccess(ACCT.kestrel, { master: true }), 'Kestrel made a master admin').toBeNull()
    signInAs('kestrel')
    expect(setHome(PID.saber, 'u149').ok, 'a move to 149 saved for Tue 1 Dec').toBe(true)
    unitsLoad()
    signInAs('saber')
    expect(myUnit(todayIso()), 'the premise: 142 his home today').toBe('u142')
    const lv = file({ person: PID.saber, type: 'LL', start: '2026-12-05', end: '2026-12-05' })
    expect(inputSqn(lv, 'u142'), 'the premise: 149\'s on its day').toBe('u149')
    expect(letOpenOn(lv, 'u142', PID.saber), 'his own, of the squadron he moves to, on his home page').toBe('u142')
  })
})

describe('H7 — letReadOnly: the window opens read only on a page that is not the record\'s own (the plan §4.3 cases 3 and 4)', () => {
  it('case 3 — Hunter (Plan of 149, View of 150) and Osprey\'s Training, Osprey since moved to 150: read only on 149; on 150 its own, not read only by this', async () => {
    signInAs('hunter')
    const row = file({ person: PID.osprey, type: 'Training', start: '2026-07-27', end: '2026-07-27', title: 'Sim refresher' })
    signInAs('saber')
    expect(moveMan(PID.osprey, third.u150).ok).toBe(true)
    await act(async () => { pastMidnight() })
    signInAs('hunter')
    expect(inputSqn(row, 'u149'), 'the premise: 150\'s').toBe(third.u150)
    expect(lifeOf(row), 'the premise: 149 is not in its life (case 4 does not reach it)').not.toContain('u149')
    expect(letReadOnly(row, 'u149', PID.hunter)).toBe(true)
    expect(letReadOnly(row, third.u150, PID.hunter), 'its own page').toBe(false)
  })
  it('case 4 — Nasty\'s carried OML (moved to 149 from 16 Jul): read only on 142\'s page (in its life, not its holder); on 149\'s, its holder, not read only by this', () => {
    const oml = nastyOml()
    moveOn(D(15), 'nasty', 'u149')
    at(D(17)); unitsLoad()
    signInAs('saber')
    expect(lifeOf(oml).slice().sort()).toEqual(['u142', 'u149'])
    expect(letReadOnly(oml, 'u142', PID.saber)).toBe(true)
    expect(letReadOnly(oml, 'u149', PID.saber)).toBe(false)
    expect(letReadOnly(oml, third.u150, PID.saber), '150 is not in its life').toBe(false)
  })
  it('case 4 — moved twice (149 from 16 Jul, 150 from 20 Jul), still pending: read only on 149 (between the moves) and on 142; not on 150, its holder', () => {
    const oml = nastyOml()
    moveOn(D(15), 'nasty', 'u149')
    moveOn(D(19), 'nasty', third.u150)
    at(D(21)); unitsLoad()
    signInAs('saber')
    expect(inputSqn(oml, 'u149'), 'the premise: 150\'s, its holder').toBe(third.u150)
    expect(letReadOnly(oml, 'u149', PID.saber), 'the squadron between his moves (Astra 3, Opus 3)').toBe(true)
    expect(letReadOnly(oml, 'u142', PID.saber)).toBe(true)
    expect(letReadOnly(oml, third.u150, PID.saber)).toBe(false)
  })
  it('case 4 — a move to 149 saved ahead (from 16 Jul), the OML pending, today 15 Jul: read only on 149 (a squadron he is moving into); on 142, still its own, not read only by this', () => {
    const oml = nastyOml()
    moveOn(D(15), 'nasty', 'u149')
    signInAs('saber')
    expect(inputSqn(oml, 'u149'), 'the premise: 142\'s until the move runs').toBe('u142')
    expect(letReadOnly(oml, 'u149', PID.saber)).toBe(true)
    expect(letReadOnly(oml, 'u142', PID.saber)).toBe(false)
  })
  it('Ranger\'s carried leave on 142\'s List: read only (case 4); a two-squadron input (F8): false on both pages; an OML closed before the move (its upchit filed on 10 Jul): false on 149 (not in its life)', () => {
    const lv = rangerLeave()
    signInAs('hunter')
    const both = file({ person: PID.hunter, type: 'Training', start: D(21), end: D(21), title: 'Shared' })
    expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === both.iid) as any).people.push({ p: PID.osprey, by: PID.hunter, at: Date.now() }) })).toBe(true)
    const oml = nastyOml()
    upchitOn(D(10), 'saber', D(10))
    moveOn(D(15), PID.ranger, 'u149')
    moveOn(D(15), 'nasty', 'u149')
    at(D(17)); unitsLoad()
    signInAs('hunter')
    expect(letReadOnly(lv, 'u142', PID.hunter), 'Ranger\'s carried leave on 142\'s List').toBe(true)
    const b = INPUTS.find((x: any) => x.iid === both.iid)
    expect(letReadOnly(b, 'u142', PID.hunter), 'F8 on 142').toBe(false)
    expect(letReadOnly(b, 'u149', PID.hunter), 'F8 on 149').toBe(false)
    expect(inputSqn(oml, 'u149'), 'the premise: the closed OML stays 142\'s').toBe('u142')
    expect(letReadOnly(oml, 'u149', PID.hunter), 'closed before the move: not in its life').toBe(false)
  })
})

/** the Medical tab's "as of" moved to `iso` by its own calendar (every day of these tests is in July 2026) */
async function asOfDay(iso: string) {
  await press($('#medCalBtn'), 'the tab\'s "as of"')
  await press($(`[data-medday="${iso}"]`), `the as-of day ${iso}`)
}
const medTab = async () => { await doing(() => { setPage('inputs'); setInpView('med') }) }

describe('M1 — Upchit Complete lists an upchit by the roster on its filing day (D2846; the plan §3.1)', () => {
  it('Nasty\'s upchit filed on 10 Jul, before his move to 149: on 142\'s tab only, as of 13 Jul and as of 17 Jul', async () => {
    const up = upchitOn(D(10), 'saber', D(10))
    moveOn(D(15), 'nasty', 'u149')
    at(D(17)); unitsLoad()
    await app('saber')
    await medTab()
    const onTab = () => !!$(`.med-done .medcard[data-medcard="${up.iid}"]`)
    for (const d of [17, 13]) { await asOfDay(D(d)); expect(onTab(), `on 142's tab as of ${D(d)}`).toBe(true) }
    await topPick('u149')
    await medTab()
    for (const d of [17, 13]) { await asOfDay(D(d)); expect(onTab(), `not on 149's tab as of ${D(d)}`).toBe(false) }
  })
  /* (two tests: one upchit closes the OML, and a second for the same period is refused — "already closed") */
  it('…one filed after the move: Kestrel\'s, filed on 17 Jul dated 17 Jul — on 149\'s tab only, as of 17 Jul', async () => {
    moveOn(D(15), 'nasty', 'u149')
    const a = upchitOn(D(17), 'kestrel', D(17))
    await app('saber')
    await medTab()
    const onTab = () => !!$(`.med-done .medcard[data-medcard="${a.iid}"]`)
    await asOfDay(D(17))
    expect(onTab(), 'not on 142\'s tab').toBe(false)
    await topPick('u149')
    await medTab()
    await asOfDay(D(17))
    expect(onTab(), 'on 149\'s tab').toBe(true)
  })
  it('…a backdated certificate (D2845): filed on 17 Jul, after the move, dated 14 Jul — on 149\'s tab only, as of 15 Jul and as of 17 Jul', async () => {
    moveOn(D(15), 'nasty', 'u149')
    const b = upchitOn(D(17), 'saber', D(14))
    expect(new Date(b.at).getDate(), 'the premise: saved on 17 Jul').toBe(17)
    expect(inputSquadrons(b), 'the premise: 142\'s by its date').toEqual(['u142'])
    await app('saber')
    await medTab()
    const onTab = () => !!$(`.med-done .medcard[data-medcard="${b.iid}"]`)
    for (const d of [15, 17]) { await asOfDay(D(d)); expect(onTab(), `not on 142's tab as of ${D(d)}`).toBe(false) }
    await topPick('u149')
    await medTab()
    for (const d of [15, 17]) { await asOfDay(D(d)); expect(onTab(), `on 149's tab as of ${D(d)}`).toBe(true) }
  })
})

/** every card of every section of the Medical tab, and every page of its viewer's pager, then "Edit input": the number of
 *  windows opened, each judged by the root's own answers (`bornHeld`) */
async function everyCard(label: string, seen: Set<string>): Promise<number> {
  const cards = () => [...document.querySelectorAll('#medView .medcard')] as HTMLElement[]
  const count = cards().length
  let n = 0
  for (let i = 0; i < count; i++) {
    await press(cards()[i]!, `${label}: card ${i}`)
    expect(DOCVIEW, `${label}: card ${i} opened the viewer`).toBeTruthy()
    const pages = +((($('.docview-count')?.textContent) || '1 of 1').split(' of ')[1] || 1)
    await press($('#docViewClose'), 'the viewer\'s ✕')
    for (let pg = 0; pg < pages; pg++) {
      await press(cards()[i]!, `${label}: card ${i}`)
      for (let k = 0; k < pg; k++) await press($('#docViewNext'), 'the pager\'s next')
      await press($('#docViewEdit'), '"Edit input"')
      expect(INPEDIT, `${label}: card ${i}, page ${pg + 1} opened its window`).toBeTruthy()
      seen.add(`${windowPage()}:${String(INPEDIT?.iid)}`)
      expect(bornHeld(), `${label}: card ${i}, page ${pg + 1} (${String(INPEDIT?.iid)})`).toBe('')
      n++
      await shut()
    }
  }
  return n
}
/** 142's, 149's and 150's tabs, each as of every day named: every card pressed (Saber, a master admin, picks each) */
async function sweep(days: number[]): Promise<Set<string>> {
  const seen = new Set<string>()
  let n = 0
  await app('saber')
  for (const u of ['u142', 'u149', third.u150]) {
    if (UNIT !== u) await topPick(u)
    await medTab()
    expect(pageUnit('own'), `the premise: ${u}'s tab`).toBe(u)
    for (const d of days) { await asOfDay(D(d)); n += await everyCard(`${u} as of ${D(d)}`, seen) }
  }
  expect(n, 'the premise: windows opened').toBeGreaterThan(0)
  return seen
}

describe('M2 — every card of the Medical tab opens a window that is not born held (the plan §3.1, §10 risk 2)', () => {
  it('Nasty unmoved (today 15 Jul): 142\'s, 149\'s and 150\'s tabs as of 13, 15 and 17 Jul', async () => {
    const seen = await sweep([13, 15, 17])
    expect(seen.has(`u142:${nastyOml().iid}`), 'the premise: his OML pressed on 142\'s tab').toBe(true)
  })
  it('Nasty moved to 149 (from 16 Jul; today 17 Jul): as of 13, 15 (a day before the move) and 17 Jul', async () => {
    moveOn(D(15), 'nasty', 'u149')
    at(D(17)); unitsLoad()
    const seen = await sweep([13, 15, 17])
    expect(seen.has(`u149:${nastyOml().iid}`), 'his OML pressed on 149\'s tab (finding 1\'s press)').toBe(true)
    expect(seen.has(`u142:${nastyOml().iid}`), 'and on 142\'s, as of a day before the move').toBe(true)
  })
  it('Nasty moved twice (149 from 16 Jul, 150 from 20 Jul; today 21 Jul): as of 13, 15, 18 (between the moves) and 21 Jul', async () => {
    moveOn(D(15), 'nasty', 'u149')
    moveOn(D(19), 'nasty', third.u150)
    at(D(21)); unitsLoad()
    const seen = await sweep([13, 15, 18, 21])
    for (const u of ['u142', 'u149', third.u150]) expect(seen.has(`${u}:${nastyOml().iid}`), `his OML pressed on ${u}'s tab`).toBe(true)
  })
  it('Nasty\'s move to 149 saved ahead (from 16 Jul; today 15 Jul): as of 13, 15 and 17 Jul (a day after the saved move)', async () => {
    moveOn(D(15), 'nasty', 'u149')
    const seen = await sweep([13, 15, 17])
    expect(seen.has(`u149:${nastyOml().iid}`), 'his OML pressed on 149\'s tab, as of a day after the saved move').toBe(true)
  })
})

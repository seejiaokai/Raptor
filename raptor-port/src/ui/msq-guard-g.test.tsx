// @vitest-environment jsdom
/* "+ ADD A PERSON" AT THE TOP OF ADMIN → USERS — the guard rail's step K2a (the plan,
   docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §18.3, and §21.1's block "Step 0 — this part read against
   his answers", rows Q10 and Q1, which win over §18.3; the brief docs/superpowers/briefs/2026-11-26-msq-s1-k2a-brief.md).
   His rulings: D2599, D2628, D2655 (one "+ Add a person" button beside Filter, the form in place, "Add person" and
   "Cancel" at its foot); D2652 N13 i (the button in the page's top row, above "Waiting for access"); D2726 (never two add
   buttons on screen at once — the opener is not on the page while the form is open, the form headed "ADD A PERSON",
   D2729 Q10); D2729 Q1 (no Home squadron box — a new man joins the squadron in view); D2644 (the pair the same size and
   aligned, as the app's own Save · Cancel).
   G3 — the place: the top row, the form under it, the foot block gone. G4 — Cancel and Escape shut it empty and bring the
   opener back; an add leaves it open and empty; no Home squadron box anywhere. G5 — Quals' "+ Add person". G6 — an add
   is the same call as today's.
   Written FIRST and seen failing on the code as it stood (the form always open at the page's foot, no opener, no Cancel,
   the Home squadron box for an admin of more than one squadron). The world: three squadrons (withThird — his D2630).
   Wed 15 Jul 26, 09:00. The app is drawn whole and pressed. jsdom draws no layout: what is on one row on a phone and how
   wide the search grows are the browser's to measure (the e2e of step K12), not this file's. */
import { describe, it, expect, afterEach } from 'vitest'
import { render, act, fireEvent, cleanup } from '@testing-library/react'
import { withThird, third, signInAs, worlds, PID } from '../test-support/msq-world'
import { INPUTS, idsOf, inputSquadrons } from '../engine/inputs'
import { NOTICES } from '../state/notices'
import { setBellSquadron } from '../state/bellsqn'
import { App } from './App'
import { HOOKS } from '../engine/hooks'
import { UNIT } from '../engine/unitview'
import { PEOPLE, nameToId, isSpecial } from '../engine/people'
import { notify, switchRoleViewRaw } from '../state/store'
import { isAdmin, mayViewAsMember, pageUnit } from '../state/perms'
import { setPage, CURPAGE, setInpMode, setInpView, setCalMonth } from '../state/view'
import { pickSquadron } from '../state/pick'
import { homeOn, todayIso } from '../state/units'
import { addPersonAndAccount, accountByName } from '../state/accounts'
import { effectiveToday } from '../state/person-delete'
import { readForeign } from '../leavewar/state/foreign'
import { boxValue, pickDate } from './datecal-testkit'
import { whatIsOpen, closeShown, guardWords, guardRow, GUARD_LEADS, GUARD_ENDINGS } from './guard'
import { VCONF, ruleFmt } from '../engine/rules'
import { LGEDIT, setLgEdit } from '../state/auth'
import { setOilList, INPEDIT } from './pops'
import { tap } from '../test-support/msq-guard-testkit'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()
let page: ReturnType<typeof render> | null = null
afterEach(() => {
  if (page) { page.unmount(); page = null }
  cleanup()
})

const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => [...document.querySelectorAll<HTMLElement>(sel)]
const settle = async () => { await act(async () => { await Promise.resolve(); await Promise.resolve() }) }
async function press(el: Element | null, what = 'the control') {
  expect(el, `${what} is drawn`).not.toBeNull()
  await act(async () => { fireEvent.pointerDown(el!); fireEvent.mouseDown(el!); fireEvent.mouseUp(el!); fireEvent.click(el!) })
  await settle()
}
async function type(sel: string, value: string) {
  expect($(sel), `${sel} is drawn`).not.toBeNull()
  await act(async () => { fireEvent.change($(sel)!, { target: { value } }) })
}
const toasts = (): string[] => (HOOKS.toast as any).mock.calls.map((c: any[]) => String(c[0]))
/* the app, signed in, on Admin → Users — on the squadron `unit` when given (picked through the app's own door first) */
async function users(who: 'hunter' | 'saber' = 'saber', unit?: string) {
  signInAs(who)
  page = render(<App />)
  await settle()
  if (unit) { await act(async () => { await pickSquadron(unit) }); await settle() }
  await act(async () => { setPage('admin'); notify() })
  await settle()
  expect($('#admUsers'), 'Admin → Users is drawn').not.toBeNull()
}
const users$ = () => $('#admUsers')!
const opener = () => $('#accAddOpen')
const form = () => $('#accAddBlock')
const headingOf = (text: RegExp) => [...users$().querySelectorAll<HTMLElement>('h4')].find(h => text.test(h.textContent || '')) ?? null
/* a before b in the page's order */
const before = (a: Element, b: Element) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
/* every field of the form as it stands — the role box only while a sign-in is typed (no account, no role) */
function fields() {
  const v = (sel: string) => ($(sel) as HTMLInputElement | HTMLSelectElement | null)?.value ?? null
  return {
    cs: v('#accAddCs'), ini: v('#accAddIni'), seat: v('#accAddSeat'), cat: v('#accAddCat'), name: v('#accAddName'),
    role: v('#accAddRole'), postIn: $('#accAddPostIn') ? boxValue($('#accAddPostIn')!) : null,
  }
}
const FRESH = () => ({ cs: '', ini: '', seat: '', cat: '', name: '', role: null, postIn: effectiveToday() })
/* every field typed or changed: callsign, initials, seat, CAT, the sign-in, the role (Admin), the post-in date */
async function fillAll() {
  await type('#accAddCs', 'Nova')
  await type('#accAddIni', 'NV')
  await type('#accAddSeat', 'FCP')
  await type('#accAddCat', 'B')
  await type('#accAddName', 'nova@mail')
  await type('#accAddRole', 'admin')
  /* (outside act: each of its presses must draw before the next — the calendar opens, then its day is tapped) */
  pickDate($('#accAddPostIn')!, '2026-07-20')
  await settle()
  expect(fields(), 'the premise: every field changed').toEqual({
    cs: 'Nova', ini: 'NV', seat: 'FCP', cat: 'B', name: 'nova@mail', role: 'admin', postIn: '2026-07-20' })
}
async function esc(at: Element | null = document.activeElement) {
  await act(async () => { fireEvent.keyDown((at as HTMLElement | null) ?? document.body, { key: 'Escape' }) })
  await settle()
}

describe('G3 — "+ Add a person" in the page\'s top row, the form under it (D2652 N13 i, D2726, D2729 Q10)', () => {
  it('the search, Filter and "+ Add a person" are one row at the very top, above "Waiting for access"; no form until pressed', async () => {
    await users()
    const top = $('#accTop')
    expect(top, 'the page\'s top row').not.toBeNull()
    expect(users$().firstElementChild, 'the top row is the first thing on Admin → Users').toBe(top)
    const inRow = [$('#accFind'), $('#accFilter'), opener()]
    inRow.forEach((el, i) => expect(el && top!.contains(el), `${['the search', 'Filter', '+ Add a person'][i]} in the top row`).toBe(true))
    expect(before(inRow[0]!, inRow[1]!) && before(inRow[1]!, inRow[2]!), 'the search, then Filter, then the button').toBe(true)
    expect(opener()!.textContent).toBe('+ Add a person')
    const waiting = headingOf(/^Waiting for access$/)
    expect(waiting, '"Waiting for access" is drawn').not.toBeNull()
    expect(before(top!, waiting!), 'the top row above "Waiting for access"').toBe(true)
    expect(form(), 'no form on the page until the button is pressed').toBeNull()
    expect($('#accAddCs'), 'no callsign box either').toBeNull()
    expect(headingOf(/add a person/i), 'no "Add a person" block at the page\'s foot').toBeNull()
  })
  it('pressed: the form under the top row, above "Waiting for access", headed "ADD A PERSON", the callsign box focused — and the opener gone', async () => {
    await users()
    await press(opener(), '+ Add a person')
    const f = form()
    expect(f, 'the form is drawn').not.toBeNull()
    const waiting = headingOf(/^Waiting for access$/)!
    expect(before($('#accTop')!, f!) && before(f!, waiting), 'under the top row, above "Waiting for access"').toBe(true)
    const head = f!.querySelector('h4')
    expect(head, 'the form has a heading').not.toBeNull()
    expect(head!.textContent!.toUpperCase()).toBe('ADD A PERSON')
    expect(head!.className, 'in the page\'s own section-heading look, as "Waiting for access"').toBe(waiting.className)
    expect(document.activeElement && document.activeElement.id, 'the callsign box has the keys (a desktop)').toBe('accAddCs')
    expect(opener(), 'the opener is not on the page while the form is open').toBeNull()
    expect($$('#admUsers button').filter(b => /add a person/i.test(b.textContent || '')), 'no second add button').toEqual([])
    /* the foot: "Add person" and "Cancel", one pair, as an opened row's Save and Cancel (D2644) */
    const add = $('#accAdd'), cancel = $('#accAddCancel')
    expect(add!.textContent).toBe('Add person')
    expect(cancel!.textContent).toBe('Cancel')
    expect(add!.parentElement, 'the two in one row of buttons').toBe(cancel!.parentElement)
    expect(add!.parentElement!.className, 'the row of buttons an opened row\'s Save and Cancel stand in').toBe('acc-acts')
    expect(add!.className).toBe('abtn primary')
    expect(cancel!.className).toBe('abtn')
    expect(add!.getAttribute('style'), 'no width of its own: the pair is the same size as the app\'s').toBeNull()
    expect(before($('#accAddNote')!, add!), 'the note above the pair, as drawn').toBe(true)
    await type('#accAddName', 'nova@mail')
    expect($('#accAdd')!.textContent, 'a sign-in typed: today\'s second wording').toBe('Add person and sign-in')
    expect(headingOf(/add a person/i), 'one "Add a person" heading only — none at the foot').toBe(head)
  })
})

describe('G4 — Cancel and Escape shut it empty; an add leaves it open and empty; no Home squadron box (D2729 Q10, Q1)', () => {
  it('every field changed, then Cancel: the form gone, the opener back with the keys on it; opened again, a fresh form', async () => {
    await users()
    await press(opener())
    await fillAll()
    await press($('#accAddCancel'), 'Cancel')
    expect(form(), 'the form is gone').toBeNull()
    expect(opener(), 'the opener is back').not.toBeNull()
    expect(document.activeElement, 'the keys back on the opener').toBe(opener())
    await press(opener())
    expect(fields(), 'every field as a fresh form\'s').toEqual(FRESH())
    await type('#accAddName', 'x@mail')
    expect(($('#accAddRole') as HTMLSelectElement).value, 'the role starts again on Member').toBe('main')
  })
  /* (K2b — §18.3's G4 once the guard's table exists; the second-press clause stays struck, D2729 Q10) */
  it('a callsign typed: the guard names the addperson row; after Cancel, and opened again fresh, nothing', async () => {
    await users()
    await press(opener())
    expect(whatIsOpen(), 'opened, nothing in it').toBeNull()
    await type('#accAddCs', 'Nova')
    expect(whatIsOpen()).toMatchObject({ reason: 'row', row: { id: 'addperson' } })
    await press($('#accAddCancel'), 'Cancel')
    expect(whatIsOpen(), 'after Cancel').toBeNull()
    await press(opener())
    expect(fields(), 'the premise: a fresh form').toEqual(FRESH())
    expect(whatIsOpen(), 'opened again, fresh').toBeNull()
  })
  it('every field changed, then Escape: the same as Cancel', async () => {
    await users()
    await press(opener())
    await fillAll()
    ;($('#accAddCs') as HTMLInputElement).focus()
    await esc()
    expect(form(), 'the form is gone').toBeNull()
    expect(opener(), 'the opener is back').not.toBeNull()
    expect(document.activeElement, 'the keys back on the opener').toBe(opener())
    await press(opener())
    expect(fields(), 'every field as a fresh form\'s').toEqual(FRESH())
    await type('#accAddName', 'x@mail')
    expect(($('#accAddRole') as HTMLSelectElement).value, 'the role starts again on Member').toBe('main')
  })
  it('nothing else shuts it: a press on the page, the search typed in, the Filter opened and shut', async () => {
    await users()
    await press(opener())
    await type('#accAddCs', 'Nova')
    await press(headingOf(/^Waiting for access$/), 'a heading on the page')
    await type('#accFind', 'sa')
    await press($('#accFilter'), 'Filter')
    await esc($('#accFilter'))
    expect($('#accFilterPanel'), 'the Filter answered the Escape').toBeNull()
    expect(form(), 'the form still open').not.toBeNull()
    expect(fields().cs, 'its typing kept').toBe('Nova')
    expect(opener(), 'and no opener').toBeNull()
  })
  it('after a successful add the form clears and stays open, for the next person', async () => {
    await users()
    await press(opener())
    await type('#accAddCs', 'Nova')
    await type('#accAddSeat', 'FCP')
    await type('#accAddCat', 'B')
    await press($('#accAdd'), 'Add person')
    expect(nameToId('Nova'), 'Nova was added').toBeTruthy()
    expect(form(), 'the form stays open').not.toBeNull()
    expect(fields(), 'and empty').toEqual(FRESH())
    expect(opener(), 'still no opener').toBeNull()
  })
  const noHomeBox = async (who: 'hunter' | 'saber', unit: string | undefined, label: string) => {
    await users(who, unit)
    expect(UNIT, `the premise: ${label} in view`).toBe(unit ?? 'u142')
    await press(opener())
    expect($('#accAddHome'), `no Home squadron box — ${who} on ${label}`).toBeNull()
    expect([...form()!.querySelectorAll('label')].map(l => l.textContent), 'no "Home squadron" field').not.toContain('Home squadron')
    page!.unmount(); page = null; cleanup()
  }
  it('no Home squadron box for Hunter on 142 and on 149', async () => {
    await noHomeBox('hunter', undefined, '142')
    await noHomeBox('hunter', 'u149', '149')
  })
  it('no Home squadron box for Saber on 142, on 149 and on 150', async () => {
    await noHomeBox('saber', undefined, '142')
    await noHomeBox('saber', 'u149', '149')
    await noHomeBox('saber', third.u150, '150')
  })
  it('a man added on 149\'s page is 149\'s — his home and his first stint 149\'s', async () => {
    await users('saber', 'u149')
    await press(opener())
    await type('#accAddCs', 'Nova')
    await type('#accAddSeat', 'FCP')
    await type('#accAddCat', 'B')
    await press($('#accAdd'))
    const pid = nameToId('Nova')
    expect(pid, 'Nova was added').toBeTruthy()
    expect(homeOn(pid!, todayIso())).toBe('u149')
    expect((readForeign(worlds.u149!, pid!) as any).post?.from, 'his post-in on 149\'s Leave War').toBe(effectiveToday())
  })
})

describe('G5 — Quals\' "+ Add person" lands on Admin → Users with the form open (D2628 C11)', () => {
  it('Admin → Users, the form open, the callsign box ready, the opener absent', async () => {
    signInAs('saber')
    page = render(<App />)
    await settle()
    await act(async () => { setPage('quals'); notify() })
    await settle()
    await press($('#qAddToggle'), 'Quals\' "+ Add person"')
    await settle()
    expect(CURPAGE).toBe('admin')
    expect($('#admUsers')!.classList.contains('on'), 'Users chosen').toBe(true)
    expect(form(), 'the form open').not.toBeNull()
    expect(document.activeElement && document.activeElement.id, 'the callsign box ready (a desktop)').toBe('accAddCs')
    expect(opener(), 'the opener absent').toBeNull()
    await press($('#accAddCancel'))
    expect(opener(), 'Cancel brings it back').not.toBeNull()
    expect(form()).toBeNull()
  })
  /* the form opened for Quals stays folded once Cancel folds it — a redraw with the same request does not open it again —
     and a second press of Quals' "+ Add person" (a new request) opens it again, the callsign box ready (the code check's
     fix, 26 Nov 26: the opening moved from an effect to the draw; this pins that nothing a person sees changed) */
  it('Cancel folds it for good until Quals asks again; a second ask opens it again, the callsign box ready', async () => {
    signInAs('saber')
    page = render(<App />)
    await settle()
    await act(async () => { setPage('quals'); notify() })
    await settle()
    await press($('#qAddToggle'), 'Quals\' "+ Add person"')
    await settle()
    expect(form(), 'the form open').not.toBeNull()
    await press($('#accAddCancel'))
    expect(form(), 'folded by Cancel').toBeNull()
    await act(async () => { notify() })
    await settle()
    expect(form(), 'a redraw does not open it again').toBeNull()
    expect(opener(), 'the opener stays').not.toBeNull()
    await act(async () => { setPage('quals'); notify() })
    await settle()
    await press($('#qAddToggle'), 'Quals\' "+ Add person", a second time')
    await settle()
    expect(CURPAGE).toBe('admin')
    expect(form(), 'the second ask opens it').not.toBeNull()
    expect(document.activeElement && document.activeElement.id, 'the callsign box ready again').toBe('accAddCs')
  })
})

describe('G6 — an add is the same call as today\'s, with the same notes (but for the home: the squadron in view)', () => {
  /* The form's add and the door called straight with the arguments the form gave it before this step (the Home squadron
     box untouched — today's `picked` undefined): each makes the same man, the same sign-in and the same first stint, and
     the form says today's words */
  it('with a sign-in: the same person, account and stint as the door\'s own call; today\'s words said', async () => {
    await users()
    await press(opener())
    await type('#accAddName', 'nova@mail')
    await type('#accAddRole', 'admin')
    await type('#accAddCs', 'Nova')
    await type('#accAddIni', 'NV')
    await type('#accAddSeat', 'RCP')
    await type('#accAddCat', 'C')
    pickDate($('#accAddPostIn')!, '2026-07-20')
    await settle()
    await press($('#accAdd'))
    expect(toasts()).toContain('Nova added — nova@mail can sign in now')
    const twinBad = addPersonAndAccount('twin@mail', { cs: 'Twin', ini: 'TW', seat: 'RCP', cat: 'C' }, 'admin', '2026-07-20')
    expect(twinBad, 'the door\'s own call went through').toBeNull()
    const a = nameToId('Nova')!, b = nameToId('Twin')!
    /* (his callsign, his initials and his place in the A-to-Z order — `ord`, set from the callsign — are the name's) */
    const strip = (p: any) => { const { cs, initials, ord, ...rest } = p; return rest }
    expect(strip((PEOPLE as any)[a]), 'the same person but for his name').toEqual(strip((PEOPLE as any)[b]))
    expect(homeOn(a, todayIso())).toBe(homeOn(b, todayIso()))
    expect(homeOn(a, todayIso()), 'the squadron in view').toBe('u142')
    const ka: any = accountByName('nova@mail'), kb: any = accountByName('twin@mail')
    /* (`seenFrom` is the newest bell line when the account was made — the twin, made second, sees Nova's own line; an
       order of the two adds, not a difference of the call) */
    const acct = (k: any) => ({ ...k, id: 0, name: 0, pid: 0, seenFrom: 0 })
    expect(acct(ka), 'the same account but for its name').toEqual(acct(kb))
    const stint = (pid: string) => { const s: any = (readForeign(worlds.u142!, pid) as any).post; return s ? { ...s, id: 0, callsign: 0 } : null }
    expect(stint(a), 'his first stint on 142\'s Leave War').not.toBeNull()
    expect(stint(a), 'the same first stint but for his name').toEqual(stint(b))
    expect(stint(a).from).toBe('2026-07-20')
  })
  it('with no sign-in: today\'s words, and no account', async () => {
    await users()
    await press(opener())
    await type('#accAddCs', 'Nova')
    await type('#accAddSeat', 'FCP')
    await type('#accAddCat', 'B')
    await press($('#accAdd'))
    expect(toasts()).toContain('Nova added to the roster — set flight and quals on the Quals page')
    expect(nameToId('Nova')).toBeTruthy()
  })
  it('a refused add says today\'s reason and leaves the form as typed, open', async () => {
    await users()
    await press(opener())
    await type('#accAddCs', 'Nova')
    await press($('#accAdd'))
    expect(toasts().length, 'a reason said').toBeGreaterThan(0)
    expect(nameToId('Nova'), 'nobody made').toBeFalsy()
    expect(fields().cs, 'the typing kept').toBe('Nova')
    expect(form()).not.toBeNull()
  })
})

/* G1 — A PICK ENDS LOGIC'S AND QUALS' EDIT MODE (the plan §18.1; his D2627 A4; D2729 Q2: words in "Add qualification" refuse
   under their own lead and are kept) — step K4, written first and seen failing on the code as it stood (the pick left both
   modes on, on the next squadron's page). Every pick is the bar's whole press: the Schedules button, then the row. Saber —
   the master admin, every page following his pick (D2197) — so Logic and Quals show the squadron picked. */
describe('G1 — a pick ends Logic\'s and Quals\' edit mode (D2627 A4)', () => {
  async function onPage(p: 'logic' | 'quals') {
    signInAs('saber')
    page = render(<App />)
    await settle()
    await act(async () => { setPage(p); notify() })
    await settle()
  }
  async function pickBy(u: string) {
    await press($('#sqnMenuBtn'), 'the Schedules button')
    await press($(`#sqnMenu .sqm-row[data-unit="${u}"]`), `the row of ${u}`)
  }
  const shown = (sel: string) => { const b = $(sel) as HTMLButtonElement | null; return !!b && !b.hidden }
  afterEach(async () => {
    setLgEdit(false)
    await act(async () => { closeShown() })
  })

  it('Logic: Crew rest changed 12h → 13h in 142\'s edit mode, 149 picked — 142 keeps 13h, 149 reads 12h and opens with Edit, not Done; on to 150 and back to 142: not in edit mode', async () => {
    await onPage('logic')
    await press($('#lgEdit'), 'Logic\'s ✎ Edit')
    const box = $('input[data-lgset="crewRest"]') as HTMLInputElement
    expect(box, 'Crew rest\'s box').not.toBeNull()
    expect(VCONF.crewRest, 'the premise: 12h').toBe(720)
    await act(async () => { box.value = ruleFmt('crewRest', 780); fireEvent.change(box); fireEvent.blur(box) })
    await act(async () => { await new Promise(r => setTimeout(r, 5)) })
    expect(VCONF.crewRest, 'the premise: 13h on 142').toBe(780)
    await pickBy('u149')
    expect(UNIT).toBe('u149')
    expect({ rest: VCONF.crewRest, edit: shown('#lgEdit'), done: shown('#lgDone'), mode: !!LGEDIT }, '149').toEqual({ rest: 720, edit: true, done: false, mode: false })
    await pickBy(third.u150)
    await pickBy('u142')
    expect({ rest: VCONF.crewRest, edit: shown('#lgEdit'), done: shown('#lgDone'), mode: !!LGEDIT }, 'back on 142').toEqual({ rest: 780, edit: true, done: false, mode: false })
  })

  it('Quals: a tick made in 142\'s edit mode, 149 picked — the tick kept on 142, 149 opens with Edit, not Done; on to 150 and back: not in edit mode', async () => {
    await onPage('quals')
    await press($('#qEdit'), 'Quals\' ✎ Edit')
    const cell = [...document.querySelectorAll<HTMLElement>('td.qcell[data-q]')].find(c => !c.classList.contains('qro') && !c.classList.contains('na'))
    expect(cell, 'a cell he may tick').toBeTruthy()
    const q = cell!.dataset.q!, before = cell!.innerHTML
    await press(cell!, 'a qualification cell')
    const after = $(`td.qcell[data-q="${q}"]`)!.innerHTML
    expect(after, 'the premise: the tick made').not.toBe(before)
    await pickBy('u149')
    expect(UNIT).toBe('u149')
    expect({ edit: shown('#qEdit'), done: shown('#qSave') }, '149 opens with Edit').toEqual({ edit: true, done: false })
    await pickBy(third.u150)
    await pickBy('u142')
    expect({ edit: shown('#qEdit'), done: shown('#qSave') }, 'back on 142').toEqual({ edit: true, done: false })
    expect($(`td.qcell[data-q="${q}"]`)!.innerHTML, 'the tick saved in 142\'s record').toBe(after)
  })

  it('a pick refused for an open window: the mode still on', async () => {
    await onPage('logic')
    await press($('#lgEdit'), 'Logic\'s ✎ Edit')
    await act(async () => { setOilList({ from: '2026-07-18', to: '2026-07-18', name: 'Holiday' }); notify() })
    await settle()
    expect(whatIsOpen()?.row.id, 'the premise: the OIL list counts').toBe('oilday')
    await pickBy('u149')
    expect(UNIT, 'refused').toBe('u142')
    expect({ done: shown('#lgDone'), mode: !!LGEDIT }, 'still in edit mode').toEqual({ done: true, mode: true })
    await act(async () => { setOilList(null); notify() })
  })

  it('"LOW LEVEL" typed in Add qualification, then a pick: refused under its own lead, the words in the box, the mode on; the box cleared, the pick again: through, and 149\'s Quals opens with Edit and an empty box (D2729 Q2)', async () => {
    await onPage('quals')
    await press($('#qEdit'), 'Quals\' ✎ Edit')
    await press($('#qEditQuals'), 'Edit quals')
    await type('#qNewQual', 'LOW LEVEL')
    await settle()
    expect(whatIsOpen()?.row.id, 'the premise').toBe('qualsnew')
    const words = guardWords('row', guardRow('qualsnew')!, 'pick', 'u149')
    expect(words).toBe(`Blocked: ${GUARD_LEADS.newQual}, then ${GUARD_ENDINGS.pick('149')}`)
    await pickBy('u149')
    expect(UNIT, 'refused').toBe('u142')
    expect((document.getElementById('toastEl')?.textContent || '').trim(), 'its own lead').toBe(words)
    expect(($('#qNewQual') as HTMLInputElement).value, 'the words kept').toBe('LOW LEVEL')
    expect(shown('#qSave'), 'the mode on').toBe(true)
    await type('#qNewQual', '')
    await settle()
    await pickBy('u149')
    expect(UNIT, 'through').toBe('u149')
    expect({ edit: shown('#qEdit'), done: shown('#qSave') }).toEqual({ edit: true, done: false })
    await press($('#qEdit'), '✎ Edit')
    await press($('#qEditQuals'), 'Edit quals')
    expect(($('#qNewQual') as HTMLInputElement).value, 'an empty box').toBe('')
  })

  /* G1's bell-line sentence (§18.1, Opus F-d) — step K6's, the bell's door: a line's entering run ends the modes as a pick
     does (state/belltap.ts enterForLine → closeShown), the typed box kept in 142's record. Saber, 149's lines switched on in
     his bell (a master admin's other squadrons are off by default — D2198), presses the bell, then a line of a 149 input. */
  it('"13h" typed in a Logic box and, without leaving it, a bell line to 149 pressed: 149 reads 12h and opens with Edit, not Done; back on 142 it reads 13h, not in edit mode', async () => {
    await onPage('logic')
    expect(setBellSquadron('u149', true), 'the premise: 149\'s lines on his bell').toBe(true)
    await press($('#lgEdit'), 'Logic\'s ✎ Edit')
    const box = $('input[data-lgset="crewRest"]') as HTMLInputElement
    expect(box, 'Crew rest\'s box').not.toBeNull()
    expect(VCONF.crewRest, 'the premise: 12h').toBe(720)
    await act(async () => { box.focus(); box.value = ruleFmt('crewRest', 780); fireEvent.change(box) })
    const inp = INPUTS.find((r: any) => r.person && (PEOPLE as any)[r.person] && homeOn(String(r.person), todayIso()) === 'u149') as any
    expect(inp, 'the premise: an input of 149').toBeTruthy()
    const n: any = { id: 'g1bell', to: PID.saber, by: null, at: Date.now(), iid: String(inp.iid), name: 'x', day: '2026-07-15', what: [{ k: 'in' }], u: 'u149' }
    NOTICES.push(n)
    try {
      await press($('#notifyBell'), 'the bell')
      await press($(`[data-testid="bell-line-${n.id}"]`), 'the 149 line')
      expect(UNIT, 'the line went through').toBe('u149')
      expect({ rest: VCONF.crewRest, mode: !!LGEDIT }, '149').toEqual({ rest: 720, mode: false })
      /* (a beat later too: nothing still waiting lands on 149's rules) */
      await act(async () => { await new Promise(r => setTimeout(r, 5)) })
      expect(VCONF.crewRest, '149, a beat later').toBe(720)
      /* the line opened the input's own window on 149's Inputs; shut by its ✕, so the pick back is not refused for it */
      expect($('[data-testid="win-inputedit-x"]'), 'the premise: the input\'s window').not.toBeNull()
      await press($('[data-testid="win-inputedit-x"]'), 'the window\'s ✕')
      await act(async () => { setPage('logic'); notify() })
      await settle()
      expect({ edit: shown('#lgEdit'), done: shown('#lgDone') }, '149\'s Logic opens with Edit').toEqual({ edit: true, done: false })
      await pickBy('u142')
      expect({ rest: VCONF.crewRest, edit: shown('#lgEdit'), done: shown('#lgDone'), mode: !!LGEDIT }, 'back on 142').toEqual({ rest: 780, edit: true, done: false, mode: false })
    } finally {
      NOTICES.splice(NOTICES.indexOf(n), 1)
      setBellSquadron('u149', false)
    }
  })
})

/* G2 — THE VIEW SWITCH ENDS QUALS' EDIT MODE TOO (the plan §18.1; his D2627 A4) — step K5, written first and seen failing on
   the code as it stood (P1 5, pressed: "Done" stayed in the member view). Every switch is the name badge's own press. Saber
   on his own 142. Logic's mode was already ended by the switch (state/store.ts, setLgEdit(false)): its half is a pin. */
describe('G2 — the switch to the member view ends Quals\' edit mode (D2627 A4); Logic\'s at the same switch is a pin', () => {
  async function onPage(p: 'logic' | 'quals') {
    signInAs('saber')
    page = render(<App />)
    await settle()
    await act(async () => { setPage(p); notify() })
    await settle()
  }
  const badge = () => press($('#roleBadge'), 'the name badge')
  const shown = (sel: string) => { const b = $(sel) as HTMLButtonElement | null; return !!b && !b.hidden }
  afterEach(async () => {
    setLgEdit(false)
    await act(async () => { closeShown() })
    if (!isAdmin() && mayViewAsMember()) await act(async () => { switchRoleViewRaw() })
  })

  it('Quals in edit mode, a tick made, the badge pressed: no "Done" in the member view; back in the admin view Quals shows Edit, the tick kept', async () => {
    await onPage('quals')
    await press($('#qEdit'), 'Quals\' ✎ Edit')
    const cell = [...document.querySelectorAll<HTMLElement>('td.qcell[data-q]')].find(c => !c.classList.contains('qro') && !c.classList.contains('na'))
    expect(cell, 'a cell he may tick').toBeTruthy()
    const q = cell!.dataset.q!, before = cell!.innerHTML
    await press(cell!, 'a qualification cell')
    const after = $(`td.qcell[data-q="${q}"]`)!.innerHTML
    expect(after, 'the premise: the tick made').not.toBe(before)
    expect(shown('#qSave'), 'the premise: "Done" drawn').toBe(true)
    await badge()
    expect(isAdmin(), 'the member view').toBe(false)
    expect(CURPAGE, 'still on Quals').toBe('quals')
    expect(shown('#qSave'), 'no "Done" in the member view').toBe(false)
    await badge()
    expect(isAdmin(), 'back in the admin view').toBe(true)
    expect({ edit: shown('#qEdit'), done: shown('#qSave') }, 'Quals shows Edit').toEqual({ edit: true, done: false })
    expect($(`td.qcell[data-q="${q}"]`)!.innerHTML, 'the tick saved').toBe(after)
  })

  it('(pin, today\'s too) Logic in edit mode, the badge pressed and pressed again: back in the admin view Logic shows Edit, not Done', async () => {
    await onPage('logic')
    await press($('#lgEdit'), 'Logic\'s ✎ Edit')
    expect(!!LGEDIT, 'the premise: in edit mode').toBe(true)
    await badge()
    expect({ admin: isAdmin(), mode: !!LGEDIT }, 'the member view, the mode ended').toEqual({ admin: false, mode: false })
    await badge()
    expect({ admin: isAdmin(), edit: shown('#lgEdit'), done: shown('#lgDone'), mode: !!LGEDIT }).toEqual({ admin: true, edit: true, done: false, mode: false })
  })
})

/* G10 — THE "WELCOME BACK" CARD ONLY ON HIS OWN SQUADRON (the plan §18.5; his D2628 C4, D2627 A18) — step K6, written first
   and seen failing on the code as it stood (the card was drawn whatever the squadron in view). Hunter — 142's admin, Plan
   of 149 — just restored: his `back` mark set as Admin → Users' Restore leaves it (leavewar/sync.ts restoreBody), he then
   signs in with 149 picked. Every pick is the bar's whole press: the Schedules button, then the row. */
describe('G10 — the "Welcome back" card only on his own squadron (D2628 C4)', () => {
  async function restoredOn149() {
    ;(PEOPLE as any)[PID.hunter].back = { at: 1 }
    signInAs('hunter')
    page = render(<App />)
    await settle()
    await pickBy('u149')
    expect(UNIT, 'the premise: 149 picked').toBe('u149')
  }
  async function pickBy(u: string) {
    await press($('#sqnMenuBtn'), 'the Schedules button')
    await press($(`#sqnMenu .sqm-row[data-unit="${u}"]`), `the row of ${u}`)
  }
  afterEach(() => { delete (PEOPLE as any)[PID.hunter].back })

  it('Hunter restored while 149 is picked: no card, his mark still set; he picks 142: the card; "Check my quals": 142\'s Quals at his row, ringed, the card spent', async () => {
    await restoredOn149()
    expect($('#welcomeBack'), '149 picked: no card').toBeNull()
    expect((PEOPLE as any)[PID.hunter].back, 'his mark waits').toBeTruthy()
    await pickBy('u142')
    expect($('#welcomeBack'), 'on 142: the card').not.toBeNull()
    await press($('#welcomeCheck'), 'Check my quals')
    expect([UNIT, CURPAGE], '142\'s Quals').toEqual(['u142', 'quals'])
    expect($$('#qtbl tr.back-hl td.qname').map(x => x.dataset.person), 'his row ringed').toEqual([PID.hunter])
    expect((PEOPLE as any)[PID.hunter].back, 'the card spent').toBeFalsy()
    expect($('#welcomeBack'), 'gone').toBeNull()
  })
  it('(pin, today\'s too) "Later" on 142: the card spent, the page and the squadron unchanged', async () => {
    await restoredOn149()
    await pickBy('u142')
    const was = CURPAGE
    await press($('#welcomeLater'), 'Later')
    expect([UNIT, CURPAGE], 'nothing moved').toEqual(['u142', was])
    expect((PEOPLE as any)[PID.hunter].back, 'the card spent').toBeFalsy()
    expect($('#welcomeBack'), 'gone').toBeNull()
  })
})

/* ======================= G11, G12 — what the Inputs pages offer on another squadron (step K9, §10 step 7) =======================
   The plan §18.6 (his D2628 C2, D2655 D12, D2646) and §18.7 (D2628 C3, D2655 D11, D2729 Q6); the section page's group 3,
   drawn and seen (D2729): the Person box reading "Pick…", Add with nobody picked saying the app's own "Pick at least one
   person", "+ Commitment" greyed with "150 has no SANS aircrew." under it, and the drag's passing note of the same words.
   Every door pressed on the real controls: the squadron button and its row, "+ Input", a calendar's day and its
   "+ Input", a drag across days, "+ Medical", "+ Commitment". */
async function appAs(who: 'hunter' | 'saber' | 'ranger', unit?: string) {
  signInAs(who)
  page = render(<App />)
  await settle()
  if (unit) {
    await press($('#sqnMenuBtn'), 'the squadron button')
    await press($(`#sqnMenu .sqm-row[data-unit="${unit}"]`), `the row of ${unit}`)
    expect(UNIT, `the premise: ${unit} picked`).toBe(unit)
  }
}
const inputsAt = async (view: 'table' | 'cal' | 'med', mode: 'member' | 'sans' = 'member') => {
  await act(async () => { setPage('inputs'); setInpMode(mode); setInpView(view); setCalMonth({ y: 2026, m: 7 }); notify() })
  await settle()
}
/* a drag across two days of a month (sanscal.test.tsx's way: the machine asks where the pointer is) */
async function dragAcross(day: (iso: string) => HTMLElement | null, from: string, to: string) {
  ;(document as any).elementFromPoint = (x: number) => (x < 100 ? day(from) : day(to))
  const base = { pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0 }
  await act(async () => {
    fireEvent.pointerDown(day(from)!, { ...base, clientX: 10, clientY: 10 })
    fireEvent.pointerMove(window, { ...base, clientX: 200, clientY: 10 })
    fireEvent.pointerUp(window, { ...base, clientX: 200, clientY: 10 })
    fireEvent.click(day(to)!)
  })
  await settle()
  ;(document as any).elementFromPoint = undefined
}
const icDay = (iso: string) => $(`[data-icday="${iso}"]`)
const scDay = (iso: string) => $(`[data-testid="sc-day-${iso}"]`)
/** the window's Person box, as he meets it on another squadron's page: empty — "Pick…" — its list that squadron's men on
 *  its roster that day and nobody else, never the presser */
function emptyPersonBox(unit: string, presser: string) {
  const sel = $('#inpEditPerson') as HTMLSelectElement | null
  expect(sel, 'the Person box').not.toBeNull()
  expect(sel!.value, 'nobody picked').toBe('')
  expect(sel!.selectedOptions[0]?.textContent, 'it reads "Pick…"').toBe('Pick…')
  const ids = [...sel!.options].map(o => o.value).filter(v => v && !isSpecial(v))
  expect(ids.length, 'the squadron\'s men offered').toBeGreaterThan(0)
  expect(ids, 'never the presser').not.toContain(presser)
  for (const id of ids) expect(homeOn(id, todayIso()), `${PEOPLE[id]?.cs} is ${unit}'s`).toBe(unit)
  return ids
}
const cancelWin = async () => { await press($('#inpEditCancel'), 'Cancel'); expect(INPEDIT).toBeNull() }

describe('G11 — "+ Input" on another squadron\'s page offers only that squadron\'s men (D2628 C2, §18.6)', () => {
  it('Hunter on 149: the List\'s "+ Input", a calendar day\'s "+ Input", a drag across days and "+ Medical" each open with the Person box empty, 149\'s men, not Hunter', async () => {
    await appAs('hunter', 'u149')
    await inputsAt('table')
    await press($('#inNew'), 'the List\'s "+ Input"')
    emptyPersonBox('u149', PID.hunter); await cancelWin()
    await inputsAt('cal')
    await tap(icDay('2026-07-29'), 'Wed 29 Jul')
    await press($('#icPopAdd'), 'the day\'s "+ Input"')
    emptyPersonBox('u149', PID.hunter); await cancelWin()
    await press($('[data-testid="win-inputsday-x"]'), 'the day\'s ✕')
    await dragAcross(icDay, '2026-07-27', '2026-07-28')
    expect(INPEDIT, 'the drag opens the window').not.toBeNull()
    emptyPersonBox('u149', PID.hunter); await cancelWin()
    await inputsAt('med')
    await press($('#medNew'), '"+ Medical"')
    emptyPersonBox('u149', PID.hunter); await cancelWin()
  })
  it('Add with nobody picked says the app\'s own "Pick at least one person" and saves nothing; a 149 man picked, the input is 149\'s', async () => {
    await appAs('hunter', 'u149')
    await inputsAt('cal')
    await tap(icDay('2026-07-29'), 'Wed 29 Jul')
    await press($('#icPopAdd'), 'the day\'s "+ Input"')
    const had = new Set(INPUTS.map((r: any) => r.iid))
    const t0 = toasts().length
    await press($('#inpEditSave'), 'Add')
    expect(toasts().slice(t0), 'the app\'s own words for an empty choice').toEqual(['Pick at least one person'])
    expect(INPUTS.filter((r: any) => !had.has(r.iid)), 'nothing saved').toEqual([])
    expect(INPEDIT, 'the window stays').not.toBeNull()
    await act(async () => { fireEvent.change($('#inpEditPerson')!, { target: { value: PID.osprey } }) })
    await press($('#inpEditSave'), 'Add')
    if ($('[data-testid="docconf"]')) await press($('[data-testid="docconf-nodoc"]'), '"No document"')
    const x = INPUTS.find((r: any) => !had.has(r.iid)) as any
    expect(x && idsOf(x), 'filed for the 149 man').toEqual([PID.osprey])
    expect(inputSquadrons(x), 'it is 149\'s').toEqual(['u149'])
  })
  it('Saber on 150: 150\'s men on its roster that day and nobody else — not an archived man, not Saber', async () => {
    await appAs('saber', third.u150)
    await inputsAt('table')
    await press($('#inNew'), 'the List\'s "+ Input"')
    const ids = emptyPersonBox(third.u150, PID.saber)
    for (const id of ids) expect(PEOPLE[id]?.archived, `${PEOPLE[id]?.cs} not archived`).toBeFalsy()
    expect(ids).toContain(PID.mako)
  })
  it('(pin, today\'s too) Hunter on 142: himself, as today', async () => {
    await appAs('hunter')
    await inputsAt('table')
    await press($('#inNew'), 'the List\'s "+ Input"')
    expect(($('#inpEditPerson') as HTMLSelectElement).value).toBe(PID.hunter)
  })
  it('(pin, today\'s too) Ranger, 149 picked (his Inputs page is always his own squadron\'s): himself', async () => {
    await appAs('ranger', 'u149')
    await inputsAt('table')
    await press($('#inNew'), 'the List\'s "+ Input"')
    expect(INPEDIT?.person, 'filed for himself').toBe(PID.ranger)
  })
})

describe('G12 — "+ Commitment" on another squadron\'s SANS calendar offers only its SANS aircrew (D2628 C3, D2729 Q6, §18.7)', () => {
  /* Hunter SANS aircrew of 142 and Osprey of 149 — the Quals SANS tick's mark (PEOPLE[id].san), set as the premise */
  const sansMen = async () => { await act(async () => { (PEOPLE as any)[PID.hunter].san = true; (PEOPLE as any)[PID.osprey].san = true; notify() }) }
  it('Hunter (SANS, 142) on 149, one SANS man there: the window opens on him, Hunter not offered; saved, it counts on 149, not on 142', async () => {
    await appAs('hunter', 'u149')
    await sansMen()
    await inputsAt('cal', 'sans')
    await tap(scDay('2026-07-20'), 'Mon 20 Jul')
    const add = $('[data-testid="sd-add"]') as HTMLButtonElement
    expect(add?.disabled, '"+ Commitment" pressable').toBe(false)
    await press(add, '"+ Commitment"')
    expect(INPEDIT?.person, 'opened on 149\'s SANS man').toBe(PID.osprey)
    const offered = [...document.querySelectorAll<HTMLOptionElement>('#inpEditPerson option')].map(o => o.value)
    expect(offered, 'Hunter not offered').not.toContain(PID.hunter)
    const had = new Set(INPUTS.map((r: any) => r.iid))
    await press($('#inpEditSave'), 'Add')
    const x = INPUTS.find((r: any) => !had.has(r.iid)) as any
    expect(x && idsOf(x), 'the commitment is the 149 man\'s').toEqual([PID.osprey])
    expect(inputSquadrons(x), 'counted on 149\'s day, not on 142\'s').toEqual(['u149'])
  })
  it('Saber on 150, which has no SANS aircrew: "+ Commitment" greyed, "150 has no SANS aircrew." under it; a drag across days says it and opens nothing', async () => {
    await appAs('saber', third.u150)
    await inputsAt('cal', 'sans')
    await tap(scDay('2026-07-20'), 'Mon 20 Jul')
    expect(($('[data-testid="sd-add"]') as HTMLButtonElement)?.disabled, 'greyed').toBe(true)
    expect($('[data-testid="sd-addwhy"]')?.textContent, 'its reason under it').toBe('150 has no SANS aircrew.')
    await press($('[data-testid="win-sansday-x"]'), 'the day\'s ✕')
    const t0 = (HOOKS.toast as any).mock.calls.length
    await dragAcross(scDay, '2026-07-20', '2026-07-22')
    expect((HOOKS.toast as any).mock.calls.slice(t0), 'the passing note, where the calendar says a refused drag').toEqual([['150 has no SANS aircrew.', 'warn']])
    expect(INPEDIT, 'nothing opens').toBeNull()
  })
  it('(pin, today\'s too) on 142: Hunter, SANS, files his own', async () => {
    await appAs('hunter')
    await sansMen()
    await inputsAt('cal', 'sans')
    await tap(scDay('2026-07-20'), 'Mon 20 Jul')
    await press($('[data-testid="sd-add"]'), '"+ Commitment"')
    expect(INPEDIT?.person).toBe(PID.hunter)
  })
  it('(pin) Hunter only views 150 and never reaches its SANS calendar: with 150 picked his SANS calendar is 142\'s, his own "+ Commitment" live', async () => {
    await appAs('hunter', third.u150)
    await sansMen()
    expect(pageUnit('own'), 'his own pages stay 142\'s (a View)').toBe('u142')
    await inputsAt('cal', 'sans')
    await tap(scDay('2026-07-20'), 'Mon 20 Jul')
    expect(($('[data-testid="sd-add"]') as HTMLButtonElement)?.disabled).toBe(false)
    await press($('[data-testid="sd-add"]'), '"+ Commitment"')
    expect(INPEDIT?.person).toBe(PID.hunter)
  })
})

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
import { withThird, third, signInAs, worlds } from '../test-support/msq-world'
import { App } from './App'
import { HOOKS } from '../engine/hooks'
import { UNIT } from '../engine/unitview'
import { PEOPLE, nameToId } from '../engine/people'
import { notify } from '../state/store'
import { setPage, CURPAGE } from '../state/view'
import { pickSquadron } from '../state/pick'
import { homeOn, todayIso } from '../state/units'
import { addPersonAndAccount, accountByName } from '../state/accounts'
import { effectiveToday } from '../state/person-delete'
import { readForeign } from '../leavewar/state/foreign'
import { boxValue, pickDate } from './datecal-testkit'
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

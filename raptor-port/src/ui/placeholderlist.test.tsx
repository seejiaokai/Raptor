// @vitest-environment jsdom
/* AN INPUT FILED FOR "ALL AVAIL" / "ALL" — THE INPUTS LIST, ITS OWN TWO EDITORS, THE THREE PERSON FILTERS, AND THE SAVE
   BOUNDARY WITH NO DOOR IN FRONT OF IT (`[INPUT-ALL-AVAIL]`; owner D700, D702, D711, D712 — the plan §3.2, §3.3, §3.5,
   §3.7 and the second read's three changes, its §11: docs/superpowers/plans/2026-10-09-input-all-avail-plan.md).

   · THE LIST'S ADD FORM builds its record by hand and never passes the editor's checks — the door both first-round
     readers found open (an admin could save a several-day ALL AVAIL there).
   · THE LIST'S PENCIL EDITOR had a Person list of its own (Astra, second read): it left both placeholders out, so a filed
     ALL AVAIL input opened showing a real man's name over it, and its document question came before any refusal. THE
     PENCIL IS GONE (D718, 10 Oct 26) — a row opens the input's window, and those cases are asked of that route.
   · "EVERYONE" in the person filter is the string 'all' — the ALL placeholder's own id — in three places.
   · THE SAVE BOUNDARY (Sol, second read): a good filing's Undo and Redo do not prove a RESTORE is refused; here the
     restore's own command shape is handed each refused record, with no picker or editor in front of it.
   · THE ANSWER RULES are the existing ones, for a placeholder input exactly as for a named man's (both readers).

   RE-EXPRESSED FOR STEP 3 OF THE ONE-RULE BUILD (12 Oct 26 — the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md
   §4.1, §4.4, §4.5; owner D750, D753, D755). A placeholder may be ONE OF AN INPUT'S OWN PEOPLE now. In this file:
     · the two rules that SURVIVE — six kinds, one day (D753) — are said in the plan's shorter words ("ALL AVAIL is for
       Training, Meeting, Personal, Appointment, Duty, Event and Other", "ALL AVAIL is for one day"): the cases that pinned the old
       words pin the new ones, whole;
     · the save boundary's "a group mark" case pinned the rule those rulings ended, on a field (`grp`) the one record no
       longer has (D756): it is re-expressed where it stood;
     · TWO cases are RED and are left red — a named man's Other under Unavailable turned into a placeholder's in its
       window. They pin a behaviour step 3 broke, not one a ruling changed: see the note above them;
     · the cases added at the foot are the List, the month's bar, the opened day's card, the filters and the export
       naming an input that holds people AND a placeholder. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor, commitInput, commitInputEdit, draftOf } from './inputedit'
import { dayEntries } from './InputsCal'
import { EVERYONE, inputMatchesSearch, monthItems, personFilterId, personFilterPasses, personFilterValue } from './inputscal-model'
import { cardOf } from './inputcard-model'
import { initStore, notify, setSession, writeInputs, placeholderShapeViolation } from '../state/store'
import { schedStore } from '../state/sched-commit'
import { installGlobalUndo } from '../state/undo-wire'
import { commitAs } from '../command/commit'
import { deriveActor } from '../command/actor'
import { invariants } from '../command/harness'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { setMe } from '../state/auth'
import { INPUTS, idsOf } from '../engine/inputs'
import { voidedOil } from '../engine/oil'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
import { ELOG } from '../engine/editlog'
import { HIST } from '../state/history'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { _resetFloatWins } from './FloatWindow'
import { setInpEdit } from './pops'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const said: string[] = []
const realToast = HOOKS.toast
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const crew = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers)
const admin = 'stiff', member = 'bane'
const others = () => crew().filter(id => id !== admin && id !== member)
const live = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) }) }
const pick = async (el: Element | null, v: string) => {
  expect(el, 'select').toBeTruthy()
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(el, v); (el as HTMLElement).dispatchEvent(new Event('change', { bubbles: true })) })
}
const listUp = async () => act(async () => { setInpView('table'); notify() })
let n = 0
const put = async (over: any = {}) => {
  const row = { iid: 'pl' + (++n), person: 'allavail', by: admin, at: '2026-09-01T08:00:00.000Z', type: 'Meeting', date: 'Oct 13', yr: 2026,
    allday: false, s: 600, e: 660, remarks: 'r' + n, mod: '2026-09-01', ...over }
  let ok = false
  await act(async () => { ok = writeInputs(() => { INPUTS.push(row) }); notify() })
  expect(ok, 'the fixture is a legal record').toBe(true)
  return live(row.iid)
}
/* an input that holds PEOPLE AND A PLACEHOLDER, as the app has written one since step 3 of the one-rule build (D750,
   D756): ONE record with the list of its people, each stamped with who put him in */
const putMixed = async (ids: string[], over: any = {}) => {
  const by = over.by ?? admin, at = Date.UTC(2026, 8, 1, 8)
  const row = { iid: 'pm' + (++n), people: ids.map(p => ({ p, by, at })), by, at, type: 'Meeting', date: 'Oct 13', yr: 2026,
    allday: false, s: 600, e: 660, remarks: 'm' + n, mod: '2026-09-01', ...over }
  let ok = false
  await act(async () => { ok = writeInputs(() => { INPUTS.push(row) }); notify() })
  expect(ok, 'the fixture is a legal record').toBe(true)
  return live(row.iid)
}
const as = async (who: 'admin' | 'member') => act(async () => {
  if (who === 'admin') { setSession({ user: admin, role: 'admin' }); setMe(admin) } else { setSession({ user: member, role: 'main' }); setMe(member) }
  notify()
})
const world = () => JSON.stringify({ i: INPUTS, log: ELOG.rows.length, undo: [HIST.stack.length, HIST.ix] })
const rowEl = (iid: string) => $(`#inBody tr[data-iid="${iid}"]`)
const shown = () => $$('#inBody tr[data-iid]').map(tr => tr.getAttribute('data-iid')!)

/* THE DAY IS HELD AT TUESDAY 13 OCT 26 — the day every fixture here is dated ("Oct 13"). The List opens on a window of
   days that starts TODAY (InputsPage `initialRange`), so on the real clock these tests passed on 13 Oct 26 and went red
   the morning after, on every branch, with nothing changed: yesterday's inputs are simply not in the List. Found by the
   full check of 14 Oct 26 (docs/handpass/2026-10-14-three-builds.md) and proved on an untouched copy of the branch.
   Only the date is held (ui/adminclear.test.tsx does the same); timers run as they always did. */
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 13, 12, 0, 0))
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore()
  setSession({ user: admin, role: 'admin' }); setMe(admin)
  lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('cal'); setCalMonth({ y: 2026, m: 10 })
  said.length = 0; HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
  await act(async () => { setCalMonth({ y: 2026, m: 10 }); notify() })
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null) })
  HOOKS.toast = realToast
  host.remove(); _resetFloatWins()
  vi.useRealTimers()
})

describe('the person filter — Everyone, ALL and ALL AVAIL are three different choices, in all three places', () => {
  it('ONE body: "Everyone" keeps its value; a placeholder\'s value in a filter is its own, never its bare id', () => {
    expect(EVERYONE, 'seventeen walk scripts and three browser tests choose it by this value').toBe('all')
    expect(personFilterValue('all')).toBe('ph:all')
    expect(personFilterValue('allavail')).toBe('ph:allavail')
    expect(personFilterValue(admin), 'a named man\'s value is his id, as always').toBe(admin)
    expect(personFilterId('ph:all')).toBe('all')
    expect(personFilterId(admin)).toBe(admin)
    expect(personFilterId(EVERYONE)).toBe('')
    for (const p of ['all', 'allavail', admin]) expect(personFilterPasses(EVERYONE, p), `Everyone passes ${p}`).toBe(true)
    expect(personFilterPasses('ph:all', 'all')).toBe(true)
    expect(personFilterPasses('ph:all', 'allavail')).toBe(false)
    expect(personFilterPasses('ph:all', admin)).toBe(false)
    expect(personFilterPasses('ph:allavail', 'allavail')).toBe(true)
    expect(personFilterPasses(admin, 'all'), 'a man\'s filter never shows the ALL inputs').toBe(false)
    expect(personFilterPasses(admin, admin)).toBe(true)
  })

  it('THE LIST: Everyone shows the named inputs and both placeholders\'; ALL shows the ALL inputs alone; ALL AVAIL likewise', async () => {
    const a = await put({ person: 'allavail' }), b = await put({ person: 'all' }), c = await put({ person: others()[0] })
    await listUp()
    const sel = $('#inFPerson') as HTMLSelectElement
    expect(sel.options[0].value, 'Everyone, first, with its value').toBe('all')
    expect(sel.options[0].textContent).toBe('Everyone')
    const grp = sel.querySelector('optgroup[data-ph]') as HTMLOptGroupElement
    expect([...grp.querySelectorAll('option')].map(o => [o.getAttribute('value'), o.textContent])).toEqual([['ph:allavail', 'ALL AVAIL'], ['ph:all', 'ALL']])
    expect(shown()).toEqual(expect.arrayContaining([a.iid, b.iid, c.iid]))
    await pick(sel, 'ph:all')
    expect(shown()).toEqual([b.iid])
    expect($('#inFilterSummary')?.textContent, 'the summary chip names it as the screen does').toContain('ALL')
    await pick(sel, 'ph:allavail')
    expect(shown()).toEqual([a.iid])
    expect($('#inFilterSummary')?.textContent).toContain('ALL AVAIL')
    await pick(sel, others()[0])
    expect(shown()).toContain(c.iid)
    expect(shown()).not.toContain(a.iid); expect(shown()).not.toContain(b.iid)
    await click($('#inFiltersClear'))
    expect(($('#inFPerson') as HTMLSelectElement).value, 'Clear filters goes back to Everyone').toBe('all')
    expect(shown()).toEqual(expect.arrayContaining([a.iid, b.iid, c.iid]))
  })

  it('THE MONTH and THE OPENED DAY answer the same three ways', async () => {
    const a = await put({ person: 'allavail' }), b = await put({ person: 'all' }), c = await put({ person: others()[0] })
    const F = (fPerson: string) => ({ fPerson, fType: 'all', fSearch: '' })
    const month = (f: string) => monthItems(INPUTS, F(f)).map(i => i.rows[0].iid).filter((id: string) => [a.iid, b.iid, c.iid].includes(id)).sort()
    const day = (f: string) => dayEntries('2026-10-13', F(f)).inputs.map((r: any) => r.iid).filter((id: string) => [a.iid, b.iid, c.iid].includes(id)).sort()
    for (const read of [month, day]) {
      expect(read(EVERYONE)).toEqual([a.iid, b.iid, c.iid].sort())
      expect(read('ph:all')).toEqual([b.iid])
      expect(read('ph:allavail')).toEqual([a.iid])
      expect(read(others()[0])).toEqual([c.iid])
    }
  })

  it('a member opens on his own inputs: an ALL AVAIL input is nobody\'s "mine" (D702 — not in each man\'s own inputs)', async () => {
    const a = await put({ person: 'allavail', by: member })
    await act(async () => { root.unmount() })
    await act(async () => { setSession({ user: member, role: 'main' }); setMe(member) })
    root = createRoot(host)
    await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
    await listUp()
    expect(($('#inFPerson') as HTMLSelectElement).value).toBe(member)
    expect(shown()).not.toContain(a.iid)
    await pick($('#inFPerson'), 'all')
    expect(shown(), 'under Everyone he sees it').toContain(a.iid)
  })

  /* ADDED FOR STEP 3 (D750, D755 — the plan §4.5: "The person filter passes an input when any of its people passes, or
     its placeholder does (`ph:`)"). An input of a person AND ALL AVAIL is ONE input found two ways. */
  it('an input of a person AND ALL AVAIL is found under his name and under ALL AVAIL — never under ALL — in the List, the month and the opened day', async () => {
    const a = others()[0]
    const m = await putMixed([a, 'allavail'])
    const alone = await put({ person: 'allavail' }), his = await put({ person: a }), other = await put({ person: 'all' })
    const mine = [m.iid, alone.iid, his.iid, other.iid]
    const F = (fPerson: string) => ({ fPerson, fType: 'all', fSearch: '' })
    const month = (f: string) => monthItems(INPUTS, F(f)).map(i => i.rows[0].iid).filter((id: string) => mine.includes(id)).sort()
    const day = (f: string) => dayEntries('2026-10-13', F(f)).inputs.map((r: any) => r.iid).filter((id: string) => mine.includes(id)).sort()
    await listUp()
    const list = async (f: string) => { await pick($('#inFPerson'), f); return shown().filter(id => mine.includes(id)).sort() }
    for (const [f, want] of [[EVERYONE, mine], ['ph:allavail', [m.iid, alone.iid]], [a, [m.iid, his.iid]], ['ph:all', [other.iid]], [others()[1], []]] as Array<[string, string[]]>) {
      expect(month(f), `the month · ${f}`).toEqual([...want].sort())
      expect(day(f), `the opened day · ${f}`).toEqual([...want].sort())
      expect(await list(f), `the List · ${f}`).toEqual([...want].sort())
    }
  })

  /* …and D702's "it is not listed in each man's own inputs" is about the men BEHIND the placeholder: a man NAMED in the
     input beside it is in it (D755), so it is one of his own — while the same input is still not "mine" to a man who
     only stands behind ALL AVAIL */
  it('a member opens on his own inputs: the input he is NAMED in beside ALL AVAIL is there; one that names another man beside ALL AVAIL is not', async () => {
    const his = await putMixed([member, 'allavail']), theirs = await putMixed([others()[0], 'allavail'])
    await act(async () => { root.unmount() })
    await act(async () => { setSession({ user: member, role: 'main' }); setMe(member) })
    root = createRoot(host)
    await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
    await listUp()
    expect(($('#inFPerson') as HTMLSelectElement).value).toBe(member)
    expect(shown()).toContain(his.iid)
    expect(shown()).not.toContain(theirs.iid)
    expect(rowEl(his.iid)?.querySelector('[data-testid="in-open"]')?.textContent).toBe(`${PEOPLE[member].cs}, ALL AVAIL`)
  })
})

/* RESTATED 10 Oct 26 — THE LIST'S PENCIL EDITOR IS GONE (owner D718, D723: "the edit and cross is not needed because … u can
   click on it to edit it or delete it"). Its Person list of its own was the door Astra's read of the plan found (a filed
   ALL AVAIL input opened showing a real man's name over it). A row opens the input's WINDOW now, so each case below is
   asked of that route: the row, then the window's own Person list and Save. The claims are unchanged. */
describe('the List row, and the window it opens (the pencil editor\'s cases — Astra\'s read of the plan)', () => {
  const openRow = async (iid: string) => {
    await click(rowEl(iid)!.querySelector('[data-testid="in-open"]'))
    expect($('[data-testid="win-inputedit"]'), 'the row opened the input’s window').toBeTruthy()
  }
  const person = () => $('#inpEditPerson') as HTMLSelectElement
  const save = async () => click($('#inpEditSave'))
  it('no row carries a pencil or a cross', async () => {
    await put({ person: 'allavail' }); await put({ person: others()[0] })
    await listUp()
    expect($$('#inBody [data-edit], #inBody [data-inx], #inBody [data-save], #inBody .rmx')).toHaveLength(0)
  })
  for (const ph of ['allavail', 'all']) {
    it(`a filed ${PEOPLE[ph].cs} input reads "${PEOPLE[ph].cs}" on its row, and its window opens ON the placeholder — never a real man's name`, async () => {
      const r = await put({ person: ph })
      await listUp()
      expect(rowEl(r.iid)?.textContent).toContain(PEOPLE[ph].cs)
      await openRow(r.iid)
      expect(person(), 'the window\'s own Person list').toBeTruthy()
      expect(person().value, 'the box shows the placeholder it is filed for').toBe(ph)
      expect(person().selectedOptions[0].textContent).toBe(PEOPLE[ph].cs)
      /* saved unchanged: it is still the placeholder's */
      await save()
      expect(live(r.iid).person).toBe(ph)
    })

    /* THE RULE SURVIVES (D711 (2), D712; D753 reading 3); step 3 changed its words — "can be filed only for … or Other"
       is the plan's "is for … and Other" (§4.4). Said once, whole. */
    it(`its kind changed to a medical one is refused BEFORE the document question (${PEOPLE[ph].cs})`, async () => {
      const r = await put({ person: ph })
      await listUp()
      await openRow(r.iid)
      await pick($('#inpEditType'), 'OML')
      const was = world(); said.length = 0
      await save()
      expect(said).toEqual([`${PEOPLE[ph].cs} is for Training, Meeting, Personal, Appointment, Duty, Event and Other`])
      expect(document.body.textContent || '', 'no document prompt').not.toContain('No document')
      expect(world()).toBe(was)
      expect(live(r.iid).type).toBe('Meeting')
    })
  }

  it('an admin turns a named man\'s Meeting into an ALL AVAIL one in its window, and back', async () => {
    const r = await put({ person: others()[0] })
    await listUp()
    await openRow(r.iid)
    expect([...person().options].map(o => o.value), 'both are offered for a kind that may carry one').toEqual(expect.arrayContaining(['allavail', 'all']))
    await pick(person(), 'allavail')
    await save()
    expect(live(r.iid).person, said.join(' | ')).toBe('allavail')
    await openRow(r.iid)
    await pick(person(), others()[1])
    await save()
    expect(live(r.iid).person).toBe(others()[1])
  })

  /* ASTRA'S READ OF THE CODE (9 Oct 26): an edit keeps a request's "filed under Unavailable" — right for a man, and
     through the new Person choices it left an ALL AVAIL input under Unavailable: no row on the programme, no crowd, and
     nobody able to earn from a Yes. Turned into a placeholder's, it goes back onto the programme. */
  /* RED SINCE STEP 3 (12 Oct 26) AND LEFT RED — A PRODUCT FAULT, REPORTED, NOT RE-EXPRESSED. No ruling changed this: D750 /
     D753 / D755 say where a placeholder may stand, nothing about an input under Unavailable, and the plan's invariant
     ("never filed under Unavailable", §4.1) is exactly what the edit below used to SATISFY by taking the input back onto
     the programme (ui/inputedit.tsx commitInputEdit still does: `if (r.acc === 'u' && isPlaceholderInput(r)) delete
     r.acc`). Step 3 gave the window a new question — "may this input hold a placeholder?" (`phWhy`) — and asks it with
     the saved input's "filed under Unavailable" still on it, so the picker's line and the Save now refuse "ALL AVAIL
     cannot be filed under Unavailable — that names a real person's day" BEFORE the save that would have moved it. The
     Person list still offers the two; choosing one leaves an admin a refusal he has no press to get past in the
     window. The assertions are unchanged from before the build. */
  for (const ph of ['allavail', 'all']) {
    it(`a named man's Other filed under Unavailable, turned into ${PEOPLE[ph].cs}'s in its window: it leaves Unavailable`, async () => {
      const r = await put({ person: others()[0], type: 'Other', acc: 'u' })
      expect(live(r.iid).acc).toBe('u')
      await listUp()
      await openRow(r.iid)
      await pick(person(), ph)
      await save()
      expect(live(r.iid).person, said.join(' | ')).toBe(ph)
      expect(live(r.iid).acc, 'no longer under Unavailable').not.toBe('u')
    })
  }

  it('a leave\'s window offers no placeholder', async () => {
    const r = await put({ person: others()[0], type: 'LL', allday: true })
    await listUp()
    await openRow(r.iid)
    expect([...person().options].some(o => PEOPLE[o.value] && PEOPLE[o.value].special)).toBe(false)
  })
})

/* THE LIST'S OWN ADD FORM WENT ON 10 OCT 26 (owner D729 — the design vet's V1). It built its record by hand and asked the
   one body itself; its "+ Input" now opens the input's window, which asks that body at its own save. The three claims
   are RESTATED for that door — the List is still a place ALL AVAIL is filed from. */
describe('the List\'s "+ Input" — ALL AVAIL and ALL through the window it opens', () => {
  const formUp = async () => { await listUp(); await click($('#inNew')); expect($('[data-testid="win-inputedit"]'), 'the new input’s window').toBeTruthy() }
  const days = () => $$('#inpEdCal [data-iso]')
  /* THE RULE SURVIVES (D711 (3); D753: "offered only where the input is a single day"); step 3 changed its words — "is
     filed one day at a time" is the plan's "is for one day" (§4.4). */
  it('ALL AVAIL over a several-day range is refused in words, and nothing is saved', async () => {
    await formUp()
    await pick($('#inpEditType'), 'Duty')
    await pick($('#inpEditPerson'), 'allavail')
    await click(days()[10]); await click(days()[12])
    /* …and it says so before he presses Save: the picker's own line, under the Person list */
    expect($('[data-testid="pp-why"] span')?.textContent).toBe('ALL AVAIL is for one day')
    const was = world(); said.length = 0
    await click($('#inpEditSave'))
    expect(said).toEqual(['ALL AVAIL is for one day'])
    expect(world()).toBe(was)
  })

  /* ADDED FOR STEP 3 (D750, D753 — the plan §4.5): the List is a place ALL AVAIL is filed from BESIDE PEOPLE too. Over a
     several-day range "Several people" shows the two greyed with the reason; back on one day they are live, and the
     save is ONE record whose row names the person and then ALL AVAIL. */
  it('"Several people" from the List: greyed over a several-day range, live on one day — and the saved row names the person, then ALL AVAIL', async () => {
    const a = others()[0]
    await formUp()
    await pick($('#inpEditType'), 'Meeting')
    await pick($('#inpEditPerson'), a)
    await click($('[data-testid="pp-several"]'))
    await click(days()[12]); await click(days()[14])
    const phA = () => $('#inpEditPop [data-ph="allavail"]') as HTMLButtonElement
    expect(phA().disabled, 'three days: not offered').toBe(true)
    expect($('[data-testid="pp-phwhy"]')?.textContent).toBe('ALL AVAIL is for one day')
    /* a new pick of ONE day (a tap, and the same day again) */
    const working = days().find(d => { const iso = d.getAttribute('data-iso') || ''; const wd = new Date(iso + 'T00:00:00Z').getUTCDay(); return wd >= 1 && wd <= 5 })!
    await click(working); await click(working)
    expect(phA().disabled, 'one day: offered').toBe(false)
    expect($('[data-testid="pp-phwhy"]')).toBeNull()
    await click(phA())
    expect($('[data-testid="pp-count"]')?.textContent).toBe('1 picked + ALL AVAIL')
    const before = INPUTS.length
    await click($('#inpEditSave'))
    expect(INPUTS.length, said.join(' | ')).toBe(before + 1)
    expect(idsOf(INPUTS[0])).toEqual([a, 'allavail'])
    expect(INPUTS[0].endDate).toBeUndefined()
    expect(rowEl(INPUTS[0].iid)?.querySelector('[data-testid="in-open"]')?.textContent, 'the row').toBe(`${PEOPLE[a].cs}, ALL AVAIL`)
  })

  it('ALL AVAIL on one day is saved: one record, no group', async () => {
    await formUp()
    await pick($('#inpEditType'), 'Meeting')
    await pick($('#inpEditPerson'), 'allavail')
    const working = days().find(d => { const iso = d.getAttribute('data-iso') || ''; const wd = new Date(iso + 'T00:00:00Z').getUTCDay(); return wd >= 1 && wd <= 5 })!
    await click(working)
    const before = INPUTS.length
    await click($('#inpEditSave'))
    expect(INPUTS.length, said.join(' | ')).toBe(before + 1)
    /* ONE record whose only entry is the placeholder (the one record — D756): nobody's name beside it, no group mark */
    expect(idsOf(INPUTS[0])).toEqual(['allavail'])
    expect(INPUTS[0].grp).toBeUndefined()
    expect(INPUTS[0].endDate).toBeUndefined()
    expect(String(INPUTS[0].by)).toBe(admin)
  })

  it('a kind that may not carry one: what he picked stays shown, and a save with it still chosen is refused', async () => {
    await formUp()
    await pick($('#inpEditType'), 'Meeting')
    await pick($('#inpEditPerson'), 'all')
    await pick($('#inpEditType'), 'OD')
    expect(($('#inpEditPerson') as HTMLSelectElement).value, 'what he picked stays shown').toBe('all')
    await click(days()[10])
    const was = world(); said.length = 0
    await click($('#inpEditSave'))
    /* (the rule survives — D711 (2); its words are the plan's since step 3) */
    expect(said).toEqual(['ALL is for Training, Meeting, Personal, Appointment, Duty, Event and Other'])
    expect(world()).toBe(was)
  })
})

describe('THE SAVE BOUNDARY, with no door in front of it (Sol\'s read of the plan)', () => {
  it('the hard check is registered, and reads neither the role nor where the command came from', () => {
    expect(invariants('hard').map(i => i.id)).toContain('placeholder-input-shape')
    const env = (actor: any, origin: string, after: any) => ({ type: 'undo.restore', origin, actor, changes: [{ collection: 'inputs', id: 'x', op: 'put', before: null, after }] }) as any
    const bad = { iid: 'x', person: 'allavail', type: 'OD', date: 'Oct 13', yr: 2026 }
    /* (the rule survives; the sentence it gives is the one body's, in the plan's words since step 3 — §4.4) */
    for (const role of ['admin', 'member', 'system'])
      for (const origin of ['user', 'restore', 'projection'])
        expect(placeholderShapeViolation(env({ role, personId: admin }, origin, bad)), `${role} · ${origin}`).toContain('ALL AVAIL is for Training, Meeting, Personal, Appointment, Duty, Event and Other')
    expect(placeholderShapeViolation(env({ role: 'admin' }, 'restore', { ...bad, type: 'Duty' }))).toBeNull()
    /* ADDED FOR STEP 3 (D750, D753, D755): asked of a record that holds a placeholder BESIDE people — kept where the
       input may hold one, refused by the placeholder's own rules where it may not, whoever ran the command */
    const withPeople = (over: any) => ({ iid: 'x', people: [{ p: others()[0] }, { p: 'allavail' }], type: 'Duty', date: 'Oct 13', yr: 2026, ...over })
    for (const role of ['admin', 'member', 'system']) {
      expect(placeholderShapeViolation(env({ role, personId: admin }, 'user', withPeople({}))), role).toBeNull()
      expect(placeholderShapeViolation(env({ role, personId: admin }, 'restore', withPeople({ type: 'OD' }))), role).toContain('ALL AVAIL is for Training')
      expect(placeholderShapeViolation(env({ role, personId: admin }, 'restore', withPeople({ endDate: 'Oct 15' }))), role).toContain('ALL AVAIL is for one day')
    }
    expect(placeholderShapeViolation({ changes: [{ collection: 'inputs', id: 'x', op: 'delete', before: bad }] } as any), 'a delete is never judged').toBeNull()
    expect(placeholderShapeViolation({ changes: [{ collection: 'inputs', id: '__order', op: 'put', after: { order: [] } }] } as any)).toBeNull()
    expect(placeholderShapeViolation({ changes: [{ collection: 'people', id: 'allavail', op: 'put', after: { person: 'allavail', type: 'OD' } }] } as any), 'only inputs').toBeNull()
  })

  /* the restore's own command: the same type, origin and store write an Undo or a Redo runs (undo/timeline.ts
     restoreCommit) — handed a record no door would ever have let through */
  beforeEach(() => { installGlobalUndo() })   // registers the Undo engine's own command, as the app's boot does
  const restore = (entries: any[]) => commitAs(
    { type: 'undo.restore', scope: { module: 'inputs' } as any, apply: (txn: any) => { txn.enlist(schedStore); schedStore.write!(entries, { allowIssued: true, restore: true } as any) } },
    { actor: deriveActor(), origin: 'restore' as any })
  /* 'a wrong kind' and 'two dates': the rule survives (D711, D712, D753). The third row was ['a group mark', { grp: 'gZ',
     grpBy: admin }] — re-expressed below, after the loop: a ruling changed it and its subject is gone. */
  const refused: Array<[string, any]> = [['a wrong kind', { type: 'CSE' }], ['two dates', { endDate: 'Oct 15' }]]
  for (const ph of ['allavail', 'all'])
    for (const [name, over] of refused)
      it(`a RESTORE that would put back ${PEOPLE[ph].cs} with ${name} is rolled back whole — no record, no history line, no Undo step`, async () => {
        const r = await put({ person: ph })
        const was = world()
        let res: any
        await act(async () => { res = restore([{ collection: 'inputs', id: r.iid, op: 'put', value: { ...live(r.iid), ...over } }]) })
        expect(res.ok, 'refused at the boundary').toBe(false)
        expect(String(res.message)).toContain('placeholder-input-shape')
        expect(world()).toBe(was)
        expect(live(r.iid).type).toBe('Meeting')
      })

  /* was: 'a RESTORE that would put back ALL AVAIL / ALL with a group mark is rolled back whole'. A RULING CHANGED IT AND ITS
     SUBJECT IS GONE: "never in a group" ended with D750 / D753 / D755 (a placeholder is one of an input's own people),
     and `grp` / `grpBy` left the record with D756 (the plan §4.1) — several people share an input through its LIST.
     What a restore may and may not put back NOW, with no door in front of it: */
  for (const ph of ['allavail', 'all']) {
    const other = ph === 'all' ? 'allavail' : 'all'
    /* OLD DATA (D56, D759 reading 10): an Undo may hand back a record as it was stored before the build, retired fields
       and all. They are read by nothing, so the restore is kept — it is the one-person input it always was. */
    it(`a RESTORE of an old-shaped ${PEOPLE[ph].cs} record still carrying a retired group mark is KEPT — the mark is read by nothing`, async () => {
      const r = await put({ person: ph })
      let res: any
      await act(async () => { res = restore([{ collection: 'inputs', id: r.iid, op: 'put', value: { ...live(r.iid), grp: 'gZ', grpBy: admin, remarks: 'old shape' } }]) })
      expect(res.ok, String(res && res.message)).toBe(true)
      expect(live(r.iid).remarks).toBe('old shape')
      expect(idsOf(live(r.iid))).toEqual([ph])
    })
    it(`a RESTORE that puts ${PEOPLE[ph].cs} back BESIDE two people is KEPT (D750, D755)`, async () => {
      const r = await put({ person: ph })
      const { person: _p, ...rest } = live(r.iid)
      let res: any
      await act(async () => { res = restore([{ collection: 'inputs', id: r.iid, op: 'put', value: { ...rest, people: [{ p: others()[0] }, { p: ph }, { p: others()[1] }] } }]) })
      expect(res.ok, String(res && res.message)).toBe(true)
      expect(idsOf(live(r.iid))).toEqual([others()[0], ph, others()[1]])
    })
    const badLists: Array<[string, (rest: any) => any]> = [
      [`BOTH placeholders (D753: "ALL or ALL AVAIL, never both")`, rest => ({ ...rest, people: [{ p: others()[0] }, { p: ph }, { p: other }] })],
      [`${PEOPLE[ph].cs} beside a person over two days (D753)`, rest => ({ ...rest, people: [{ p: others()[0] }, { p: ph }], endDate: 'Oct 15' })],
      [`${PEOPLE[ph].cs} beside a person on a kind that is not one of the six (D755 (4))`, rest => ({ ...rest, people: [{ p: others()[0] }, { p: ph }], type: 'Fly with' })],
    ]
    for (const [name, make] of badLists)
      it(`a RESTORE that would put back ${name} is rolled back whole — no record, no history line, no Undo step`, async () => {
        const r = await put({ person: ph })
        const { person: _p, ...rest } = live(r.iid)
        const was = world()
        let res: any
        await act(async () => { res = restore([{ collection: 'inputs', id: r.iid, op: 'put', value: make(rest) }]) })
        expect(res.ok, 'refused at the boundary').toBe(false)
        expect(String(res.message), 'by the one hard check').toContain('placeholder-input-shape')
        expect(world()).toBe(was)
        expect(idsOf(live(r.iid)), 'it is still the placeholder\'s own input').toEqual([ph])
        expect(live(r.iid).type).toBe('Meeting')
      })
  }

  it('a restore of a GOOD placeholder record is kept', async () => {
    const r = await put({ person: 'all' })
    let res: any
    await act(async () => { res = restore([{ collection: 'inputs', id: r.iid, op: 'put', value: { ...live(r.iid), remarks: 'put back' } }]) })
    expect(res.ok, String(res && res.message)).toBe(true)
    expect(live(r.iid).remarks).toBe('put back')
  })
})

describe('the answer rules are the existing ones — for a placeholder input exactly as for a named man\'s (both readers)', () => {
  const SAT = '2026-10-17'
  for (const person of ['allavail', 'all', 'NAMED']) {
    const who = () => person === 'NAMED' ? others()[0] : person
    it(`${person}: a No survives a change of hours`, () => {
      const before = { person: who(), type: 'Duty', date: 'Oct 17', yr: 2026, allday: false, s: 540, e: 720, oil: { [SAT]: 0 } }
      const after = { ...before, s: 600, e: 1020 }
      expect((voidedOil(before, after) || {})[SAT]).toBe(0)
    })
    it(`${person}: a Yes survives a change that leaves its amount as it was; it is dropped when the amount changes`, () => {
      const before = { person: who(), type: 'Duty', date: 'Oct 17', yr: 2026, allday: false, s: 540, e: 720, oil: { [SAT]: 0.5 } }
      expect((voidedOil(before, { ...before, s: 600, e: 780 }) || {})[SAT], 'three hours moved an hour: still half a day').toBe(0.5)
      expect((voidedOil(before, { ...before, s: 480, e: 1020 }) || {})[SAT], 'nine hours now: the half-day Yes no longer fits').toBeUndefined()
    })
    it(`${person}: a change of person voids every answer`, () => {
      const before = { person: who(), type: 'Duty', date: 'Oct 17', yr: 2026, allday: false, s: 540, e: 720, oil: { [SAT]: 0.5 } }
      expect(voidedOil(before, { ...before, person: others()[1] }) || {}).toEqual({})
    })
  }

  it('through the real save: an ALL AVAIL Duty re-timed by an hour keeps the filer\'s Yes; lengthened past the full-day line, it loses it', async () => {
    const r = await put({ type: 'Duty', date: 'Oct 17', s: 540, e: 720, oil: { [SAT]: 0.5 } })
    await act(async () => { commitInputEdit(live(r.iid), { ...draftOf(live(r.iid)), sTime: '10:00', eTime: '13:00' }) })
    expect(live(r.iid).oil, said.join(' | ')).toEqual({ [SAT]: 0.5 })
    await act(async () => { commitInputEdit(live(r.iid), { ...draftOf(live(r.iid)), sTime: '08:00', eTime: '17:00' }) })
    expect((live(r.iid).oil || {})[SAT], 'asked again: the old Yes priced half a day').toBeUndefined()
  })

  /* ADDED FOR STEP 3 (D762: "one answer, for everyone in it"; D753: "the men behind it follow the OIL answer given for the
     input") — the answer rules are the same again for an input that holds people AND a placeholder, and WHO IS IN IT is
     part of what the answer was given for: a placeholder joining or leaving does not void a No, and the amount of a Yes
     is the hours', not the head-count's */
  it('through the real save: a person and ALL AVAIL, re-timed by an hour, keeps its one Yes; lengthened past the full-day line, it loses it', async () => {
    const a = others()[0]
    const r = await putMixed([a, 'allavail'], { type: 'Duty', date: 'Oct 17', s: 540, e: 720, oil: { [SAT]: 0.5 } })
    await act(async () => { commitInput(live(r.iid), { ...draftOf(live(r.iid)), sTime: '10:00', eTime: '13:00' }, [a, 'allavail']) })
    expect(live(r.iid).s, said.join(' | ')).toBe(600)
    expect(live(r.iid).oil).toEqual({ [SAT]: 0.5 })
    await act(async () => { commitInput(live(r.iid), { ...draftOf(live(r.iid)), sTime: '08:00', eTime: '17:00' }, [a, 'allavail']) })
    expect(live(r.iid).e, said.join(' | ')).toBe(1020)
    expect((live(r.iid).oil || {})[SAT], 'asked again: the old Yes priced half a day').toBeUndefined()
  })
  it('through the real save: ALL AVAIL put into an answered input, and taken out again, leaves its one answer as it was', async () => {
    const [a, b] = [others()[0], others()[1]]
    for (const ans of [0.5, 0]) {
      const r = await putMixed([a, b], { type: 'Duty', date: 'Oct 17', s: 540, e: 720, oil: { [SAT]: ans } })
      let ok = false
      await act(async () => { ok = commitInput(live(r.iid), draftOf(live(r.iid)), [a, b, 'allavail']) })
      expect(ok, said.join(' | ')).toBe(true)
      expect(live(r.iid).oil, `joined · ${ans}`).toEqual({ [SAT]: ans })
      await act(async () => { ok = commitInput(live(r.iid), draftOf(live(r.iid)), [a, b]) })
      expect(ok, said.join(' | ')).toBe(true)
      expect(live(r.iid).oil, `left · ${ans}`).toEqual({ [SAT]: ans })
    }
  })
})

/* ADDED FOR STEP 3 OF THE ONE-RULE BUILD (12 Oct 26) — THE INPUTS PAGES NAMING AN INPUT THAT HOLDS PEOPLE AND A PLACEHOLDER.
   The plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.5 "Names and counts": "a card names every named person
   A-to-Z, then 'ALL AVAIL' (D721, D727); a bar's count ('4 · Meeting') counts named people and says '+ ALL AVAIL'; the
   CSV export writes one line per named person and one for the placeholder." D724: an input of several always says who
   filed it. D755 (3): a person in it may always take himself out; D757: "ALL AVAIL stays when anyone leaves".
   The builder's cases ask the model (ui/phmember.test.tsx — namesOf, barText, the card's facts for ALL AVAIL alone);
   these read the SCREENS: the List's row, the month's bar and its tip, the opened day's card and its Delete. */
describe('the List, the month and the opened day naming an input of people AND a placeholder (D721, D724, D727, D750, D755)', () => {
  const cs = (p: string) => String(PEOPLE[p].cs)
  const az = (ids: string[]) => ids.map(cs).sort((x, y) => x.localeCompare(y, undefined, { sensitivity: 'base' }))
  const DAY = '2026-10-21', LBL = 'Oct 21'
  const openDay = async () => act(async () => { $(`#inpCal [data-icday="${DAY}"]`)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })) })
  const card = (iid: string) => $(`[data-testid="idy-row-${iid}"]`)
  const pressDelete = async (iid: string) => {
    const btn = card(iid)!.querySelector('[data-testid="idy-open"]') as HTMLElement
    await act(async () => { btn.focus(); btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true })) })
  }

  it('THE LIST: its row names every person A to Z, then the placeholder — whatever order they joined in — and it is ONE row', async () => {
    const [a, b] = [others()[0], others()[1]]
    const r = await putMixed(['allavail', b, a])
    await listUp()
    expect($$(`#inBody tr[data-iid="${r.iid}"]`), 'one row').toHaveLength(1)
    expect(rowEl(r.iid)?.querySelector('[data-testid="in-open"]')?.textContent).toBe([...az([a, b]), 'ALL AVAIL'].join(', '))
    expect(cardOf([r]).names).toBe([...az([a, b]), 'ALL AVAIL'].join(', '))
    expect(cardOf([r]).by, 'an input of several always says who filed it (D724)').toBe(cs(admin))
    expect(rowEl(r.iid)?.textContent).toContain(`By ${cs(admin)}`)
  })

  it('THE LIST: the search finds it by a person\'s callsign and by "all avail"; an ALL input is not found by "avail"', async () => {
    const a = others()[0]
    const r = await putMixed([a, 'allavail']), other = await putMixed([others()[1], 'all'])
    expect(inputMatchesSearch(r, cs(a).toLowerCase())).toBe(true)
    expect(inputMatchesSearch(r, 'all avail')).toBe(true)
    expect(inputMatchesSearch(other, 'avail')).toBe(false)
    expect(inputMatchesSearch(other, cs(others()[1]))).toBe(true)
  })

  it('THE MONTH: ONE bar — "Callsign + ALL AVAIL · Meeting" for one person, "2 + ALL AVAIL · Meeting" for two — and its tip names everyone', async () => {
    const [a, b] = [others()[0], others()[1]]
    const one = await putMixed([a, 'allavail'], { date: LBL }), two = await putMixed([b, 'all', a], { date: LBL, s: 700, e: 760 })
    const bar = (iid: string) => $$(`#inpCal [data-testid="ib-bar-${iid}"]`)
    expect(bar(one.iid), 'one bar').toHaveLength(1)
    expect(bar(one.iid)[0].textContent).toBe(`${cs(a)} + ALL AVAIL · Meeting`)
    expect(bar(two.iid)).toHaveLength(1)
    expect(bar(two.iid)[0].textContent, 'the count is of the PEOPLE').toBe('2 + ALL · Meeting')
    expect((bar(two.iid)[0].getAttribute('title') || '').split('\n')[0].startsWith(`${[...az([a, b]), 'ALL'].join(', ')} · Meeting · `), bar(two.iid)[0].getAttribute('title') || '').toBe(true)
  })

  it('THE OPENED DAY: its card names the people A to Z, then ALL AVAIL, and says who filed it', async () => {
    const [a, b] = [others()[0], others()[1]]
    const r = await putMixed([b, 'allavail', a], { date: LBL })
    await openDay()
    const c = card(r.iid)!
    expect(c, 'its card in the opened day').toBeTruthy()
    const names = [...az([a, b]), 'ALL AVAIL'].join(', ')
    expect(c.querySelector('[data-testid="idy-who"]')?.textContent).toBe(names)
    expect(c.querySelector('[data-testid="idy-by"]')?.textContent).toBe(`By ${cs(admin)}`)
    expect(c.querySelector('[data-testid="idy-open"]')?.getAttribute('aria-label')?.startsWith(names + ',')).toBe(true)
  })

  it('THE OPENED DAY, an admin presses Delete on it: asked about the people AND ALL AVAIL; Delete takes the one input, and the note says the same', async () => {
    const a = others()[0]
    const r = await putMixed([a, 'allavail'], { date: LBL })
    await openDay()
    await pressDelete(r.iid)
    expect($('[data-testid="idy-ask"]')?.textContent).toContain(`Delete this input for ${cs(a)} and ALL AVAIL?`)
    const n = INPUTS.length; said.length = 0
    await click($('[data-testid="idy-del-yes"]'))
    expect(INPUTS.length).toBe(n - 1)
    expect(live(r.iid)).toBeUndefined()
    expect(said.join(' | ')).toContain(`Input deleted for ${cs(a)} and ALL AVAIL`)
  })

  /* D755 (3): "he may always withdraw himself"; D757: "ALL AVAIL stays when anyone leaves" */
  it('THE OPENED DAY, a member who is in it but did not file it presses Delete: "Take yourself out of this input?" — and ALL AVAIL and the other man stay', async () => {
    const a = others()[0]
    const r = await putMixed([member, a, 'allavail'], { date: LBL })
    await as('member')
    await openDay()
    await pressDelete(r.iid)
    expect($('[data-testid="idy-ask"]')?.textContent).toContain('Take yourself out of this input?')
    expect($('[data-testid="idy-del-yes"]')?.textContent).toBe('Take me out')
    await click($('[data-testid="idy-del-yes"]'))
    expect(said.join(' | ')).toContain('You are out of this input')
    expect(idsOf(live(r.iid))).toEqual([a, 'allavail'])
    expect(card(r.iid)?.querySelector('[data-testid="idy-who"]')?.textContent, 'the card follows').toBe(`${cs(a)}, ALL AVAIL`)
  })

  it('THE OPENED DAY, a member who is NOT in it presses Delete: refused, naming who filed it — nothing changes', async () => {
    const r = await putMixed([others()[0], 'allavail'], { date: LBL })
    await as('member')
    await openDay()
    const was = world(); said.length = 0
    await pressDelete(r.iid)
    expect($('[data-testid="idy-ask"]'), 'no question is asked').toBeNull()
    expect(said.join(' | ')).toContain(`Only ${cs(admin)} — who filed it — or an admin can delete this for everyone`)
    expect(world()).toBe(was)
  })

  /* (RETIRED BY NAME — owner, D773, 12 Oct 26 — "I don't need an export to excel function for inputs. U can remove it.": "THE EXPORT: one line for each named person, in the order they joined, then one
     for the placeholder" pinned ui/export.ts inputRows, which is gone.) */
})

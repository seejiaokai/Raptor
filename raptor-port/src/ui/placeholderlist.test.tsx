// @vitest-environment jsdom
/* AN INPUT FILED FOR "ALL AVAIL" / "ALL" — THE INPUTS LIST, ITS OWN TWO EDITORS, THE THREE PERSON FILTERS, AND THE SAVE
   BOUNDARY WITH NO DOOR IN FRONT OF IT (`[INPUT-ALL-AVAIL]`; owner D700, D702, D711, D712 — the plan §3.2, §3.3, §3.5,
   §3.7 and the second read's three changes, its §11: docs/superpowers/plans/2026-10-09-input-all-avail-plan.md).

   · THE LIST'S ADD FORM builds its record by hand and never passes the editor's checks — the door both first-round
     readers found open (an admin could save a several-day ALL AVAIL there).
   · THE LIST'S PENCIL EDITOR has a Person list of its own (Astra, second read): it left both placeholders out, so a filed
     ALL AVAIL input opened showing a real man's name over it, and its document question came before any refusal.
   · "EVERYONE" in the person filter is the string 'all' — the ALL placeholder's own id — in three places.
   · THE SAVE BOUNDARY (Sol, second read): a good filing's Undo and Redo do not prove a RESTORE is refused; here the
     restore's own command shape is handed each refused record, with no picker or editor in front of it.
   · THE ANSWER RULES are the existing ones, for a placeholder input exactly as for a named man's (both readers). */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor, commitInputEdit, draftOf } from './inputedit'
import { dayEntries } from './InputsCal'
import { EVERYONE, monthItems, personFilterId, personFilterPasses, personFilterValue } from './inputscal-model'
import { initStore, notify, setSession, writeInputs, placeholderShapeViolation } from '../state/store'
import { schedStore } from '../state/sched-commit'
import { installGlobalUndo } from '../state/undo-wire'
import { commitAs } from '../command/commit'
import { deriveActor } from '../command/actor'
import { invariants } from '../command/harness'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { setMe } from '../state/auth'
import { INPUTS } from '../engine/inputs'
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
const world = () => JSON.stringify({ i: INPUTS, log: ELOG.rows.length, undo: [HIST.stack.length, HIST.ix] })
const rowEl = (iid: string) => $(`#inBody tr[data-iid="${iid}"]`)
const shown = () => $$('#inBody tr[data-iid]').map(tr => tr.getAttribute('data-iid')!)

beforeEach(async () => {
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
})

describe('the List row, and its pencil editor (Astra\'s read of the plan)', () => {
  for (const ph of ['allavail', 'all']) {
    it(`a filed ${PEOPLE[ph].cs} input reads "${PEOPLE[ph].cs}" on its row, and its pencil editor opens ON the placeholder — never a real man's name`, async () => {
      const r = await put({ person: ph })
      await listUp()
      expect(rowEl(r.iid)?.textContent).toContain(PEOPLE[ph].cs)
      await click(rowEl(r.iid)!.querySelector('[data-edit]'))
      const sel = rowEl(r.iid)!.querySelector('[data-ed="person"]') as HTMLSelectElement
      expect(sel, 'the pencil editor\'s own Person list').toBeTruthy()
      expect(sel.value, 'the box shows the placeholder it is filed for').toBe(ph)
      expect(sel.selectedOptions[0].textContent).toBe(PEOPLE[ph].cs)
      /* saved unchanged: it is still the placeholder's */
      await click(rowEl(r.iid)!.querySelector('[data-save]'))
      expect(live(r.iid).person).toBe(ph)
    })

    it(`its kind changed to a medical one is refused BEFORE the document question (${PEOPLE[ph].cs})`, async () => {
      const r = await put({ person: ph })
      await listUp()
      await click(rowEl(r.iid)!.querySelector('[data-edit]'))
      await pick(rowEl(r.iid)!.querySelector('[data-ed="type"]'), 'OML')
      const was = world(); said.length = 0
      await click(rowEl(r.iid)!.querySelector('[data-save]'))
      expect(said.join(' | ')).toContain(`${PEOPLE[ph].cs} can be filed only for`)
      expect(document.body.textContent || '', 'no document prompt').not.toContain('No document')
      expect(world()).toBe(was)
      expect(live(r.iid).type).toBe('Meeting')
    })
  }

  it('an admin turns a named man\'s Meeting into an ALL AVAIL one in the pencil editor, and back', async () => {
    const r = await put({ person: others()[0] })
    await listUp()
    await click(rowEl(r.iid)!.querySelector('[data-edit]'))
    const sel = () => rowEl(r.iid)!.querySelector('[data-ed="person"]') as HTMLSelectElement
    expect([...sel().options].map(o => o.value), 'both are offered for a kind that may carry one').toEqual(expect.arrayContaining(['allavail', 'all']))
    await pick(sel(), 'allavail')
    await click(rowEl(r.iid)!.querySelector('[data-save]'))
    expect(live(r.iid).person, said.join(' | ')).toBe('allavail')
    await click(rowEl(r.iid)!.querySelector('[data-edit]'))
    await pick(sel(), others()[1])
    await click(rowEl(r.iid)!.querySelector('[data-save]'))
    expect(live(r.iid).person).toBe(others()[1])
  })

  it('a leave\'s pencil editor offers no placeholder', async () => {
    const r = await put({ person: others()[0], type: 'LL', allday: true })
    await listUp()
    await click(rowEl(r.iid)!.querySelector('[data-edit]'))
    const sel = rowEl(r.iid)!.querySelector('[data-ed="person"]') as HTMLSelectElement
    expect([...sel.options].some(o => PEOPLE[o.value] && PEOPLE[o.value].special)).toBe(false)
  })
})

describe('the List\'s own Add form — it builds its record by hand, so it asks the one body itself', () => {
  const formUp = async () => { await listUp(); if (!$('#inAdd')) await click($('#inAddToggle') || $('#inNew')) }
  it('ALL AVAIL over a several-day range is refused in words, and nothing is saved', async () => {
    await formUp()
    expect($('#inAdd'), 'the form').toBeTruthy()
    await pick($('#inType'), 'Duty')
    await pick($('#inPerson'), 'allavail')
    const days = $$('#inCal [data-cal]')
    await click(days[10]); await click(days[12])
    const was = world(); said.length = 0
    await click($('#inAdd'))
    expect(said.join(' | ')).toContain('ALL AVAIL is filed one day at a time')
    expect(world()).toBe(was)
  })

  it('ALL AVAIL on one day is saved: one record, no group', async () => {
    await formUp()
    await pick($('#inType'), 'Meeting')
    await pick($('#inPerson'), 'allavail')
    const days = $$('#inCal [data-cal]')
    const working = days.find(d => { const iso = d.getAttribute('data-cal') || ''; const wd = new Date(iso + 'T00:00:00Z').getUTCDay(); return wd >= 1 && wd <= 5 })!
    await click(working); await click(working)
    const before = INPUTS.length
    await click($('#inAdd'))
    expect(INPUTS.length, said.join(' | ')).toBe(before + 1)
    expect(INPUTS[0].person).toBe('allavail')
    expect(INPUTS[0].grp).toBeUndefined()
    expect(INPUTS[0].endDate).toBeUndefined()
    expect(String(INPUTS[0].by)).toBe(admin)
  })

  it('a kind that may not carry one: the form\'s list stops offering it, and a save with it still chosen is refused', async () => {
    await formUp()
    await pick($('#inType'), 'Meeting')
    await pick($('#inPerson'), 'all')
    await pick($('#inType'), 'OD')
    expect(($('#inPerson') as HTMLSelectElement).value, 'what he picked stays shown').toBe('all')
    const days = $$('#inCal [data-cal]')
    await click(days[10]); await click(days[10])
    const was = world(); said.length = 0
    await click($('#inAdd'))
    expect(said.join(' | ')).toContain('ALL can be filed only for')
    expect(world()).toBe(was)
  })
})

describe('THE SAVE BOUNDARY, with no door in front of it (Sol\'s read of the plan)', () => {
  it('the hard check is registered, and reads neither the role nor where the command came from', () => {
    expect(invariants('hard').map(i => i.id)).toContain('placeholder-input-shape')
    const env = (actor: any, origin: string, after: any) => ({ type: 'undo.restore', origin, actor, changes: [{ collection: 'inputs', id: 'x', op: 'put', before: null, after }] }) as any
    const bad = { iid: 'x', person: 'allavail', type: 'OD', date: 'Oct 13', yr: 2026 }
    for (const role of ['admin', 'member', 'system'])
      for (const origin of ['user', 'restore', 'projection'])
        expect(placeholderShapeViolation(env({ role, personId: admin }, origin, bad)), `${role} · ${origin}`).toContain('ALL AVAIL can be filed only for')
    expect(placeholderShapeViolation(env({ role: 'admin' }, 'restore', { ...bad, type: 'Duty' }))).toBeNull()
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
  const refused: Array<[string, any]> = [['a wrong kind', { type: 'CSE' }], ['two dates', { endDate: 'Oct 15' }], ['a group mark', { grp: 'gZ', grpBy: admin }]]
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
})

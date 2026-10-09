// @vitest-environment jsdom
/* ONE INPUT FILED FOR SEVERAL PEOPLE — the editor (owner D654, D655, D656, D660 — 7 Oct 26; the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.13, "The picker", "The writer", "Where a shared
   input shows as ONE thing").

   D655: "a group filing is one shared input, shown and edited as one thing for everyone in it; the man himself,
   whoever filed it and an admin may change or delete it." The plan: the editor opened on ANY record of an entry opens
   the ENTRY — the people (the picker, lit), then the shared fields; the filer and an admin change both, and Save is one
   command. A man in it who is neither sees it read only with two live controls: "Take me out", and his own OIL answer.
   Anyone else sees it read only: "Only its people, Saber — who filed it — or an admin can change this."
   D660: "that person filing should answer for all" — the OIL question is asked ONCE, at the save. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor, askOilIfPending, commitGroup, draftOf, oilAnswered, removeInput } from './inputedit'
import { initStore, notify, setSession, undo, writeInputs } from '../state/store'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { setMe } from '../state/auth'
import { me } from '../state/perms'
import { INPUTS } from '../engine/inputs'
import { entriesOf } from '../state/inputgroup'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
import { ELOG } from '../engine/editlog'
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
/* the List's own Add form carries a people picker too (hidden under the calendar): the window's own is asked for first */
const tid = (id: string) => $(`#inpEditPop [data-testid="${id}"]`) || $(`[data-testid="${id}"]`)
const win = () => tid('win-inputedit')
const cs = (id: any) => PEOPLE[id].cs as string
const crew = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers)
/* who is signed in: the admin Saber (`stiff`) or the member Ranger (`bane`); the others are neither */
const admin = 'stiff', member = 'bane'
const others = () => crew().filter(id => id !== admin && id !== member)
const live = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
const of = (grp: string) => INPUTS.filter((r: any) => r.grp === grp) as any[]
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
const type = async (sel: string, v: string) => {
  const el = $(sel) as HTMLInputElement
  expect(el, sel).toBeTruthy()
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })) })
}
const choose = async (sel: string, v: string) => {
  const el = $(sel) as HTMLSelectElement
  expect(el, sel).toBeTruthy()
  await act(async () => { el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })) })
}
const puckBtn = (id: string) => $(`#inpEditPop [data-pp="${id}"]`)
const lit = () => $$('#inpEditPop [data-pp][aria-pressed="true"]').map(b => b.getAttribute('data-pp')!)
let n = 0
/* a shared input as it is kept: one record per man, tied by a group id — put in through the app's own door */
const shared = async (people: string[], over: any = {}) => {
  const grp = 'gT' + (++n)
  const rows = people.map((p, i) => ({ iid: `${grp}-${i}`, person: p, type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660,
    remarks: 'brief', mod: '2026-09-01', grp, grpBy: admin, by: admin, at: '2026-09-01T08:00:00.000Z', ...over }))
  await act(async () => { writeInputs(() => { INPUTS.push(...rows) }); notify() })
  return { grp, rows: rows.map(r => live(r.iid)) }
}
const single = async (over: any = {}) => {
  const row = { iid: 'gs' + (++n), person: others()[0], type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'solo', mod: '2026-09-01', ...over }
  await act(async () => { writeInputs(() => { INPUTS.push(row) }); notify() })
  return live(row.iid)
}
const openOn = async (r: any) => act(async () => { setInpEdit(live(r.iid)); notify() })
const openNew = async (over: any = {}) => act(async () => {
  setInpEdit({ _new: true, _calendar: true, _ctx: 'i', person: me(), type: 'Meeting', date: 'Oct 13', allday: false, s: 600, e: 660, ...over }); notify()
})
const as = async (who: 'admin' | 'member') => act(async () => {
  if (who === 'admin') { setSession({ user: admin, role: 'admin' }); setMe(admin) } else { setSession({ user: member, role: 'main' }); setMe(member) }
  notify()
})

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

describe('filing one input for several people', () => {
  it('an admin: Several people, two more picked, Add — one shared input, and ONE Undo takes it all back', async () => {
    const before = INPUTS.length
    const [b, c] = others()
    await openNew()
    expect(tid('pp'), 'the picker stands where the Person list stood').toBeTruthy()
    await click(tid('pp-several'))
    await click(puckBtn(b)); await click(puckBtn(c))
    await type('#inpEditRmk', 'range brief')
    await click($('#inpEditSave'))
    expect(win(), 'saved: the window has closed').toBeNull()
    const made = INPUTS.filter((r: any) => r.remarks === 'range brief') as any[]
    expect(made.map(r => String(r.person)).sort()).toEqual([admin, b, c].sort())
    expect(new Set(made.map(r => r.grp)).size).toBe(1)
    expect(made[0].grp, 'tied by a group id').toBeTruthy()
    expect(made.every(r => String(r.grpBy) === admin && String(r.by) === admin)).toBe(true)
    /* the change history: a line for each man, each carrying the filing's group — what the changes window makes ONE
       item of (D663) */
    const lines = ELOG.rows.filter(x => made.some(r => r.iid === x.iid))
    expect(lines).toHaveLength(3)
    expect(lines.every(x => x.grp === made[0].grp), 'each line carries the group id').toBe(true)
    await act(async () => { undo(); notify() })
    expect(INPUTS.length, 'one step').toBe(before)
  })
  it('one person picked from the list: an ordinary input for that man — no group', async () => {
    const b = others()[0]
    await openNew()
    await choose('#inpEditPerson', b)
    await type('#inpEditRmk', 'for one')
    await click($('#inpEditSave'))
    const made = INPUTS.filter((r: any) => r.remarks === 'for one') as any[]
    expect(made).toHaveLength(1)
    expect(String(made[0].person)).toBe(b)
    expect(made[0].grp).toBeUndefined()
  })
  it('a member files a meeting for himself and another man; it is his to change afterwards (D655)', async () => {
    await as('member')
    const b = others()[0]
    await openNew()
    await click(tid('pp-several'))
    await click(puckBtn(b))
    await type('#inpEditRmk', 'flight meeting')
    await click($('#inpEditSave'))
    const made = INPUTS.filter((r: any) => r.remarks === 'flight meeting') as any[]
    expect(made.map(r => String(r.person)).sort()).toEqual([member, b].sort())
    expect(made.every(r => String(r.grpBy) === member)).toBe(true)
    await openOn(made.find(r => String(r.person) === b))
    expect($('#inpEditSave'), 'the filer may change the whole of it').toBeTruthy()
    expect(tid('inped-ro')).toBeNull()
  })
  it('a member turns it into leave with two people picked: refused with the sentence, nothing saved, the window stays', async () => {
    await as('member')
    const before = INPUTS.length
    await openNew()
    await click(tid('pp-several'))
    await click(puckBtn(others()[0]))
    await choose('#inpEditType', 'LL')
    expect(lit(), 'nothing is substituted for what he picked').toEqual(expect.arrayContaining([member, others()[0]]))
    await click($('#inpEditSave'))
    expect(said.join(' | ')).toContain('You can file leave only for yourself')
    expect(INPUTS.length).toBe(before)
    expect(win()).toBeTruthy()
  })
})

describe('the editor opened on any record of a shared input opens the ENTRY', () => {
  it('the people are the picker, lit; the title says the first and how many more', async () => {
    const [a, b, c] = others()
    const g = await shared([a, b, c])
    await openOn(g.rows[2])
    const first = [a, b, c].sort((x, y) => cs(x).localeCompare(cs(y)))[0]
    expect(win()!.textContent).toContain(`${cs(first)} +2`)
    expect(lit().sort()).toEqual([a, b, c].sort())
    expect(tid('pp-count')!.textContent).toBe('3 picked')
    expect(tid('pp-several')!.getAttribute('aria-checked')).toBe('true')
  })
  it('an admin changes the remarks: every record changes, and one Undo puts them all back', async () => {
    const g = await shared(others().slice(0, 3))
    await openOn(g.rows[0])
    await type('#inpEditRmk', 'moved to room 2')
    await click($('#inpEditSave'))
    expect(of(g.grp).map(r => r.remarks)).toEqual(['moved to room 2', 'moved to room 2', 'moved to room 2'])
    await act(async () => { undo(); notify() })
    expect(of(g.grp).map(r => r.remarks)).toEqual(['brief', 'brief', 'brief'])
  })
  it('a man taken off the list: his record goes and nobody else’s is touched (their late date stands)', async () => {
    const [a, b, c] = others()
    const g = await shared([a, b, c])
    await openOn(g.rows[0])
    await click(puckBtn(b))
    await click($('#inpEditSave'))
    expect(of(g.grp).map(r => String(r.person)).sort()).toEqual([a, c].sort())
    expect(of(g.grp).every(r => r.mod === '2026-09-01' && r.modAt == null), 'not saved again').toBe(true)
  })
  it('a man added: he joins the entry, with its filer and his own "placed by"', async () => {
    const [a, b, c] = others()
    const g = await shared([a, b])
    await openOn(g.rows[0])
    await click(puckBtn(c))
    await click($('#inpEditSave'))
    const mine = of(g.grp).find(r => String(r.person) === c)
    expect(mine, 'one more record, same group').toBeTruthy()
    expect(String(mine.grpBy)).toBe(admin)
    expect(String(mine.by)).toBe(admin)
    expect(of(g.grp)).toHaveLength(3)
  })
  it('Delete asks "for all 3 people?" first; Keep removes nothing, Delete removes them all in one step', async () => {
    const g = await shared(others().slice(0, 3))
    await openOn(g.rows[1])
    await click($('#inpEditDel'))
    expect(tid('inped-delall')!.textContent).toContain('Delete this input for all 3 people?')
    expect(of(g.grp)).toHaveLength(3)
    await click(tid('inped-delall-no'))
    expect(tid('inped-delall')).toBeNull(); expect(of(g.grp)).toHaveLength(3)
    await click($('#inpEditDel')); await click(tid('inped-delall-yes'))
    expect(of(g.grp)).toHaveLength(0)
    expect(win()).toBeNull()
    await act(async () => { undo(); notify() })
    expect(of(g.grp), 'one Undo').toHaveLength(3)
  })
  it('an ordinary input made a group: the second man shares a group id, filed by whoever placed the first', async () => {
    const r = await single({ by: member, at: '2026-09-01T08:00:00.000Z' })
    await openOn(r)
    await click(tid('pp-several'))
    await click(puckBtn(others()[1]))
    await click($('#inpEditSave'))
    const now = live(r.iid)
    expect(now.grp).toBeTruthy()
    expect(of(now.grp)).toHaveLength(2)
    expect(of(now.grp).every(x => String(x.grpBy) === member), 'an admin’s hand never takes an entry from the member who filed it').toBe(true)
  })
})

describe('an input already filed, read by a member', () => {
  it('its one person is a value — moving it to another man stays a scheduler’s — but he may still add people to it', async () => {
    const r = await single({ person: member, by: member })
    await as('member')
    await openOn(r)
    expect($('#inpEditPerson'), 'no list to move it by').toBeNull()
    expect($('#inpEditPersonFixed')!.textContent).toBe(cs(member))
    expect($('#inpEditPop [data-testid="pp-several"]'), 'a meeting is a kind he may file for others').toBeTruthy()
  })
})

describe('who may change it', () => {
  it('a man in it who did not file it: read only, with "Take me out" — which removes HIS record alone', async () => {
    const [a, b] = others()
    const g = await shared([a, member, b])
    await as('member')
    await openOn(g.rows.find(r => String(r.person) === a))
    expect($('#inpEditSave'), 'not his to change for everyone').toBeNull()
    expect($('#inpEditDel')).toBeNull()
    expect(tid('inped-ro')!.textContent).toContain(`Only ${cs(admin)} — who filed it — or an admin can change this for everyone`)
    await click(tid('inped-takeout'))
    expect(tid('inped-takeout-ask')!.textContent).toContain('Take yourself out of this input?')
    await click(tid('inped-takeout-yes'))
    expect(of(g.grp).map(r => String(r.person)).sort()).toEqual([a, b].sort())
    expect(win()).toBeNull()
  })
  it('anyone else: read only, and told who can change it', async () => {
    const g = await shared(others().slice(0, 3))
    await as('member')
    await openOn(g.rows[0])
    expect($('#inpEditSave')).toBeNull()
    expect(tid('inped-takeout')).toBeNull()
    expect(tid('inped-ro')!.textContent).toBe(`Only its people, ${cs(admin)} — who filed it — or an admin can change this.`)
    expect(lit(), 'he still reads who is in it').toHaveLength(3)
  })
})

describe('the OIL question is asked once, of whoever files (D660)', () => {
  it('a duty on a Saturday for three: ONE sheet, and its answer is written on every man’s record', async () => {
    const [b, c] = others()
    await openNew({ type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439 })
    await click(tid('pp-several'))
    await click(puckBtn(b)); await click(puckBtn(c))
    await type('#inpEditRmk', 'saturday duty')
    await click($('#inpEditSave'))
    expect($$('[data-testid="oilconf"]'), 'asked once').toHaveLength(1)
    expect(INPUTS.some((r: any) => r.remarks === 'saturday duty'), 'nothing is written before the answer').toBe(false)
    await click(tid('oil-yes')); await click(tid('oilconf-save'))
    const made = INPUTS.filter((r: any) => r.remarks === 'saturday duty') as any[]
    expect(made).toHaveLength(3)
    for (const r of made) expect(r.oil, cs(r.person)).toEqual({ '2026-10-17': 1 })
  })
})

/* ASTRA'S READ of the calendar job's bug check (8 Oct 26), R2. D660: "whoever files an input for other people answers the
   OIL question for all of them, once, at the save - nobody is left to be asked by his own bell". The save asked the
   OIL gate about the FIRST man of the entry only. Once he had said No for himself, a change of hours by the filer
   opened no question (his No still stood) while every other man's answer was voided by the new hours and left
   unanswered. */
describe('hours changed on a shared duty: the question comes back while ANY man in it needs an answer (D660)', () => {
  const twoHours = async () => {
    const [b, c] = others()
    await openNew({ type: 'Duty', date: 'Oct 17', allday: false, s: 600, e: 720 })
    await click(tid('pp-several'))
    await click(puckBtn(b)); await click(puckBtn(c))
    await type('#inpEditRmk', 'two hours')
    await click($('#inpEditSave'))
    await click(tid('oil-yes')); await click(tid('oilconf-save'))
  }
  const made = () => INPUTS.filter((r: any) => r.remarks === 'two hours') as any[]
  for (const who of [0, 2]) {
    it(`the ${who === 0 ? 'FIRST' : 'LAST'} man has said No for himself; the filer makes it all day: asked once, and no record is left without an answer`, async () => {
      await twoHours()
      expect(made().map(r => r.oil && r.oil['2026-10-17'])).toEqual([0.5, 0.5, 0.5])
      await act(async () => { writeInputs(() => { made()[who].oil = { '2026-10-17': 0 } }); notify() })
      await openOn(made()[0])
      await click($('#inpEditAllday'))
      await click($('#inpEditSave'))
      expect($$('[data-testid="oilconf"]'), 'the new hours price a full day: the filer is asked again').toHaveLength(1)
      await click(tid('oil-yes')); await click(tid('oilconf-save'))
      expect(made()).toHaveLength(3)
      for (const r of made()) expect(r.oil && r.oil['2026-10-17'], cs(r.person) + ' has an answer').toBeDefined()
    })
  }
})

/* ASTRA'S READ, R1. A shared meeting, its kind changed to a medical one in the window and the people cut to ONE ("Keep ...
   only"): the save still took the GROUP's branch - the saved entry has two records - which returns before the document,
   the upchit summary and the medical-clash questions. A medical entry was written with none of them asked. It is
   refused now, in words, with nothing written: the others are taken out and saved first, and the kind is changed
   after - through the one-person save that asks every question. */
describe('a shared input is never turned into a medical entry by the group\u2019s save', () => {
  it('kind changed to a medical one, people cut to one: refused in words, both records as they were', async () => {
    const [a, b] = others()
    const g = await shared([a, b])
    await openOn(g.rows[0])
    await choose('#inpEditType', 'OML')
    const fix = tid('pp-fix')
    if (fix) await click(fix)
    said.length = 0
    await click($('#inpEditSave'))
    expect(said.join(' | ')).toMatch(/medical entry is one person/i)
    expect(of(g.grp).map(r => r.type), 'nothing was written').toEqual(['Meeting', 'Meeting'])
    expect($$('[data-testid="docconf"], [data-testid="oilconf"]')).toHaveLength(0)
  })
})

/* SOL'S READ of the calendar job's bug check (8 Oct 26), S2 - the same fault as R2 on another door. After a bar is
   dragged onto a weekend the question "follows the move" (ui/caldrag.ts -> askOilIfPending), and it was asked of the
   ONE record the drag held: a first man's standing No for that day left the second man, who has no answer, to his own
   bell. It is asked while ANY man of the entry needs an answer. */
describe('the OIL question that follows a move is asked while ANY man of a shared entry needs an answer (D660)', () => {
  for (const who of [0, 1]) {
    it(`a shared duty on a Saturday; the ${who === 0 ? 'FIRST' : 'SECOND'} man has a standing No, the other no answer: it asks`, async () => {
      const [a, b] = others()
      const g = await shared([a, b], { type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439 })
      await act(async () => { writeInputs(() => { of(g.grp)[who].oil = { '2026-10-17': 0 } }); notify() })
      let asked = false
      await act(async () => { asked = askOilIfPending(live(g.rows[0].iid)); notify() })
      expect(asked, 'the question opens').toBe(true)
      expect($$('[data-testid="oilconf"]')).toHaveLength(1)
    })
  }
  it('every man answered: nothing is asked', async () => {
    const [a, b] = others()
    const g = await shared([a, b], { type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439, oil: { '2026-10-17': 1 } })
    let asked = true
    await act(async () => { asked = askOilIfPending(live(g.rows[0].iid)); notify() })
    expect(asked).toBe(false)
  })
})

describe('the entry changed behind its window', () => {
  it('a man added on the page behind: the window shows him, and a Save of the remarks keeps him', async () => {
    const [a, b, c] = others()
    const g = await shared([a, b])
    await openOn(g.rows[0])
    await type('#inpEditRmk', 'mine')
    await act(async () => { commitGroup({ rows: of(g.grp) }, draftOf(live(g.rows[0].iid)), [a, b, c]); notify() })
    expect(lit().sort(), 'theirs, silently').toEqual([a, b, c].sort())
    expect(said.join(' | ')).toContain(`${cs(c)} added`)
    await click($('#inpEditSave'))
    expect(of(g.grp)).toHaveLength(3)
    expect(of(g.grp).every(r => r.remarks === 'mine')).toBe(true)
  })
  it('the very record the window was opened on is taken out behind it: the window stays, on the rest of the entry', async () => {
    const [a, b, c] = others()
    const g = await shared([a, b, c])
    await openOn(g.rows[0])
    await act(async () => { removeInput(live(g.rows[0].iid)); notify() })
    expect(win(), 'the entry is still there').toBeTruthy()
    expect(lit().sort()).toEqual([b, c].sort())
  })
})

/* THE DATES OF A SAVED SHARED INPUT (owner D681, 9 Oct 26 — "2 agree"; found by Astra's read of the calendar job's bug
   check, R3: `[CAL-SHARED-DATES]`). "A group filing is one shared input, shown and edited as one thing" (D655) — and its
   dates are part of it, but no door changed them: the List's row opens this window (no edit in place on a shared row),
   the window drew its date picker for a NEW input only, and a bar's drag keeps the length. The window now carries the
   same two-tap picker for a saved shared input its reader may change for everyone, and the save is the entry's ONE
   command — the write path (`commitGroup`) always took the dates from the draft; only the control was missing. */
describe('the dates of a saved shared input are changed in its window (D681)', () => {
  const day = (iso: string) => $(`#inpEditPop #inpEdCal [data-cal="${iso}"]`)
  it('the picker stands in the window, on the saved day; a tap for the start and a tap for the end stretch it for everyone — one Undo', async () => {
    const g = await shared(others().slice(0, 3))
    await openOn(g.rows[1])
    expect($('#inpEditPop #inpEdCal'), 'the two-tap calendar a new input has').toBeTruthy()
    expect(day('2026-10-13')!.className).toContain(' s')
    await click(day('2026-10-13')); await click(day('2026-10-15'))
    expect($('#inpEditPop .rc-read')!.textContent, 'the line under the calendar says what Save will write').toMatch(/13.*15/)
    await click($('#inpEditSave'))
    expect(win(), 'saved: the window has closed').toBeNull()
    expect(of(g.grp).map(r => [r.date, r.endDate])).toEqual([['Oct 13', 'Oct 15'], ['Oct 13', 'Oct 15'], ['Oct 13', 'Oct 15']])
    expect(new Set(of(g.grp).map(r => r.grp)).size, 'still one shared input').toBe(1)
    await act(async () => { undo(); notify() })
    expect(of(g.grp).map(r => [r.date, r.endDate || '']), 'ONE step puts every man back').toEqual([['Oct 13', ''], ['Oct 13', ''], ['Oct 13', '']])
  })
  it('moved whole to other days: a tap for the new start, a tap for the new end', async () => {
    const g = await shared(others().slice(0, 2), { endDate: 'Oct 14' })
    await openOn(g.rows[0])
    await click(day('2026-10-20')); await click(day('2026-10-21'))
    await click($('#inpEditSave'))
    expect(of(g.grp).map(r => [r.date, r.endDate])).toEqual([['Oct 20', 'Oct 21'], ['Oct 20', 'Oct 21']])
  })
  it('a one-day input moved to another day: ONE tap is the new start, and Save keeps it one day', async () => {
    const g = await shared(others().slice(0, 2))
    await openOn(g.rows[0])
    await click(day('2026-10-20'))
    await click($('#inpEditSave'))
    expect(of(g.grp).map(r => [r.date, r.endDate || ''])).toEqual([['Oct 20', ''], ['Oct 20', '']])
  })
  it('a member who filed it changes its dates too (D655: whoever filed it)', async () => {
    const [a] = others()
    const g = await shared([member, a], { grpBy: member, by: member })
    await as('member')
    await openOn(g.rows[0])
    expect($('#inpEditPop #inpEdCal')).toBeTruthy()
    await click(day('2026-10-13')); await click(day('2026-10-14'))
    await click($('#inpEditSave'))
    expect(of(g.grp).map(r => r.endDate)).toEqual(['Oct 14', 'Oct 14'])
  })
  it('a man in it who did not file it, and anyone else: no picker — the dates are not theirs to change', async () => {
    const [a, b] = others()
    const g = await shared([a, member, b])
    const h = await shared([a, b])
    await as('member')
    await openOn(g.rows[0])
    expect($('#inpEditPop #inpEdCal'), 'a man in it').toBeNull()
    expect(win()!.textContent, 'and nothing sends him elsewhere for the dates').not.toMatch(/dates are changed/i)
    await act(async () => { setInpEdit(null); notify() })
    await openOn(h.rows[0])
    expect($('#inpEditPop #inpEdCal'), 'anyone else').toBeNull()
    expect(win()!.textContent, 'and nothing sends him elsewhere for the dates').not.toMatch(/dates are changed/i)
  })
  it('new dates that reach a Saturday: the OIL question is asked ONCE, and its answer is on every man’s record (D660, D682)', async () => {
    const [a, b] = others()
    const g = await shared([a, b], { type: 'Duty', date: 'Oct 16', allday: true, s: 0, e: 1439 })
    await openOn(g.rows[0])
    await click(day('2026-10-16')); await click(day('2026-10-17'))
    await click($('#inpEditSave'))
    expect($$('[data-testid="oilconf"]'), 'asked once').toHaveLength(1)
    expect(of(g.grp).every(r => !r.endDate), 'nothing is written before the answer').toBe(true)
    await click(tid('oil-yes')); await click(tid('oilconf-save'))
    expect(of(g.grp).map(r => [r.date, r.endDate])).toEqual([['Oct 16', 'Oct 17'], ['Oct 16', 'Oct 17']])
    for (const r of of(g.grp)) expect(r.oil, cs(r.person)).toEqual({ '2026-10-17': 1 })
  })
  /* ONE SHORT LINE (owner D729 — the design vet's V3, 10 Oct 26; D726): the paragraph of instructions under the form
     ("To change its dates for everyone in it, tap the new start on the calendar above, then the new end …") went. What
     stays is the one thing nothing else in the window says — that the dates change for every man in it. */
  it('the words under the form are ONE short line: the dates change for all of them — never "changed on the Inputs page", never "delete it and add it again"', async () => {
    const g = await shared(others().slice(0, 2))
    await openOn(g.rows[0])
    const hint = $('#inpEditPop .inped-hint')!.textContent || ''
    expect(hint).toBe('Date changes apply to all 2.')
    expect(hint).not.toMatch(/Inputs page|delete it|tap the new start/i)
    const g3 = await shared(others().slice(2, 5))
    await openOn(g3.rows[0])
    expect($('#inpEditPop .inped-hint')!.textContent, 'the count is the entry’s own').toBe('Date changes apply to all 3.')
  })
  it('the dates changed on the page behind the open window are followed, and a Save of the remarks keeps them', async () => {
    const [a, b] = others()
    const g = await shared([a, b])
    await openOn(g.rows[0])
    await type('#inpEditRmk', 'mine')
    await act(async () => { commitGroup({ rows: of(g.grp) }, { ...draftOf(live(g.rows[0].iid)), start: '2026-10-22', end: '' }, [a, b]); notify() })
    expect(day('2026-10-22') ? day('2026-10-22')!.className : $('#inpEditPop .rc-read')!.textContent, 'theirs, silently').toMatch(/ s|22 Oct|Oct 22/)
    await click($('#inpEditSave'))
    expect(of(g.grp).map(r => [r.date, r.remarks])).toEqual([['Oct 22', 'mine'], ['Oct 22', 'mine']])
  })
  /* RESTATED 10 Oct 26 (owner D718, D723 — the Inputs list's pencil is gone; the plan
     docs/superpowers/plans/2026-10-10-input-card-plan.md §3.1). This test used to say "an ordinary one-man input keeps
     its window as it was: no picker there" — true while its row in the List changed its dates (D681's reading 7). With
     the edit in place removed, the window is the one form that can: the cases follow in their own describe, below. */
  it('an ordinary one-man input’s window carries the picker too, on its saved day', async () => {
    const r = await single()
    await openOn(r)
    expect($('#inpEditPop #inpEdCal')).toBeTruthy()
    expect(day('2026-10-13')!.className).toContain(' s')
  })
  it('a shared SANS commitment an admin filed for two: the picker is there, and the new dates are both men’s', async () => {
    const sans = Object.keys(PEOPLE).filter(id => PEOPLE[id].san && !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special)
    const g = await shared(sans.slice(0, 2), { type: 'SANS Availability', date: 'Oct 14', allday: true, s: 0, e: 1439, sans: { f: true }, remarks: '' })
    await act(async () => { setInpMode('sans'); notify() })
    await openOn(g.rows[0])
    expect($('#inpEditPop #inpEdCal')).toBeTruthy()
    expect($('#inpEditPop .inped-hint')!.textContent).not.toMatch(/delete it and add it again/i)
    await click(day('2026-10-14')); await click(day('2026-10-15'))
    await click($('#inpEditSave'))
    expect(of(g.grp).map(r => [r.date, r.endDate])).toEqual([['Oct 14', 'Oct 15'], ['Oct 14', 'Oct 15']])
  })
})

/* THE TWO BLIND READS OF THE DATE DOOR (Astra and Sol 6.1, 9 Oct 26 — docs/superpowers/briefs/2026-10-09-shared-dates-read-*.md;
   the evidence sheet §12). Each case below was SEEN failing here before its fix. */
describe('the date door, after the two reads (9 Oct 26)', () => {
  const day = (iso: string) => $(`#inpEditPop #inpEdCal [data-cal="${iso}"]`)
  const entries = (grp: string) => entriesOf(INPUTS).filter(e => e.rows.some((r: any) => r.grp === grp))
  /* Astra A1: the same day and month in ANOTHER YEAR read as "no change" — the comparison was of the printed labels,
     which carry no year inside the loaded one — and Save said "Input updated" with nothing moved */
  it('moved by exactly a year: the records move to the year picked — never "updated" with nothing changed', async () => {
    const g = await shared(others().slice(0, 2), { yr: 2027 })
    await openOn(g.rows[0])
    for (let i = 0; i < 12; i++) await click($('#inpEditPop #inpEdCal [aria-label="Previous month"]'))
    await click(day('2026-10-13'))
    await click($('#inpEditSave'))
    expect(of(g.grp).map(r => [r.date, r.yr])).toEqual([['Oct 13', 2026], ['Oct 13', 2026]])
    await act(async () => { undo(); notify() })
    expect(of(g.grp).map(r => [r.date, r.yr]), 'one Undo').toEqual([['Oct 13', 2027], ['Oct 13', 2027]])
  })
  /* Astra A2 = Sol 2: the men kept had their "till <last day>" word rewritten by the save, the man ADDED in the same
     save took the remark as typed — so one shared input came out as two entries, one of them with a stale last day */
  for (const order of ['a man added, then new days', 'new days, then a man added'] as const) {
    it(`a remark that says "till 14 Oct"; ${order}: ONE input for all three, its remark saying the new last day`, async () => {
      const [a, b, c] = others()
      const g = await shared([a, b], { endDate: 'Oct 14', remarks: 'brief till 14 Oct' })
      await openOn(g.rows[0])
      if (order.startsWith('a man')) await click(puckBtn(c))
      await click(day('2026-10-20')); await click(day('2026-10-21'))
      expect(($('#inpEditRmk') as HTMLInputElement).value, 'the picker never rewrites the remark').toBe('brief till 14 Oct')
      if (!order.startsWith('a man')) await click(puckBtn(c))
      await click($('#inpEditSave'))
      expect(of(g.grp).map(r => r.remarks)).toEqual(['brief till 21 Oct', 'brief till 21 Oct', 'brief till 21 Oct'])
      expect(of(g.grp).map(r => [r.date, r.endDate])).toEqual([['Oct 20', 'Oct 21'], ['Oct 20', 'Oct 21'], ['Oct 20', 'Oct 21']])
      expect(entries(g.grp), 'one entry, not two').toHaveLength(1)
      expect(entries(g.grp)[0].rows).toHaveLength(3)
      await act(async () => { undo(); notify() })
      expect(of(g.grp).map(r => [r.date, r.endDate, r.remarks]), 'one Undo').toEqual([['Oct 13', 'Oct 14', 'brief till 14 Oct'], ['Oct 13', 'Oct 14', 'brief till 14 Oct']])
    })
  }
  /* Astra A3: the calendar's month is seeded once, and it was seeded from the input the window held BEFORE */
  it('another shared input opened without closing the first: the calendar shows ITS month, and its first tap is a new start', async () => {
    const [a, b] = others()
    const g = await shared([a, b])
    const h = await shared([a, b], { date: 'Dec 10', remarks: 'december' })
    await openOn(g.rows[0])
    await openOn(h.rows[0])
    expect(day('2026-12-10'), 'December is on the calendar').toBeTruthy()
    expect(day('2026-12-10')!.className).toContain(' s')
    /* ...and after a half-made pick is thrown away for it */
    await act(async () => { setInpEdit(null); notify() })
    await openOn(g.rows[0])
    await click(day('2026-10-20'))
    await openOn(h.rows[0])
    await click(tid('inped-swap-go'))
    expect(day('2026-12-10'), 'December again').toBeTruthy()
    await click(day('2026-12-15'))
    await click($('#inpEditSave'))
    expect(of(h.grp).map(r => [r.date, r.endDate || '']), 'the first tap on the newly opened input began a NEW range').toEqual([['Dec 15', ''], ['Dec 15', '']])
    expect(of(g.grp).map(r => r.date), 'and the first input is as it was').toEqual(['Oct 13', 'Oct 13'])
  })
  /* Astra A4: "Take theirs" put the saved start back but left the window waiting for an END */
  it('a new start tapped, the input moved behind the window, "Take theirs": the next tap is a NEW start again', async () => {
    const [a, b] = others()
    const g = await shared([a, b])
    await openOn(g.rows[0])
    await click(day('2026-10-20'))
    await act(async () => { commitGroup({ rows: of(g.grp) }, { ...draftOf(live(g.rows[0].iid)), start: '2026-10-14', end: '' }, [a, b]); notify() })
    expect(tid('inped-clash'), 'changed both ways: it asks').toBeTruthy()
    await click(tid('inped-clash-theirs-start'))
    await click(day('2026-10-15'))
    await click($('#inpEditSave'))
    expect(of(g.grp).map(r => [r.date, r.endDate || ''])).toEqual([['Oct 15', ''], ['Oct 15', '']])
  })
  it('...and "Keep mine" keeps the start he tapped: the next tap is its end', async () => {
    const [a, b] = others()
    const g = await shared([a, b])
    await openOn(g.rows[0])
    await click(day('2026-10-20'))
    await act(async () => { commitGroup({ rows: of(g.grp) }, { ...draftOf(live(g.rows[0].iid)), start: '2026-10-14', end: '' }, [a, b]); notify() })
    await click(tid('inped-clash-mine-start'))
    await click(day('2026-10-21'))
    await click($('#inpEditSave'))
    expect(of(g.grp).map(r => [r.date, r.endDate])).toEqual([['Oct 20', 'Oct 21'], ['Oct 20', 'Oct 21']])
  })
  /* Sol 3: a first tap ON the saved day leaves the dates as they were, so a move made behind the window read as "he
     has not touched the dates" and replaced his start without a word — and the next tap finished THEIR range */
  it('the first tap is on the day it is already saved for, then the input is moved behind the window: it ASKS — his start is not replaced silently', async () => {
    const [a, b] = others()
    const g = await shared([a, b])
    await openOn(g.rows[0])
    await click(day('2026-10-13'))
    await act(async () => { commitGroup({ rows: of(g.grp) }, { ...draftOf(live(g.rows[0].iid)), start: '2026-10-22', end: '' }, [a, b]); notify() })
    expect(tid('inped-clash'), 'a start he picked against a start changed behind him').toBeTruthy()
    await click(tid('inped-clash-mine-start'))
    await click(day('2026-10-16'))
    await click($('#inpEditSave'))
    expect(of(g.grp).map(r => [r.date, r.endDate])).toEqual([['Oct 13', 'Oct 16'], ['Oct 13', 'Oct 16']])
  })
  /* Sol 1 (his ruling D682, 9 Oct 26: "the answer is written for everyone in it — a man's own earlier answer, a No
     included, is replaced"). A man is added, the sheet comes back for "X +2" and the filer answers — and the answer
     went on the ADDED man's record alone, while the sheet had asked about all of them. */
  for (const fresh of ['Yes', 'No'] as const) {
    it(`a man added to a Saturday duty already answered; the filer answers ${fresh}: the answer is on EVERY record, a man's own earlier answer replaced (D682)`, async () => {
      const [b, c] = others()
      await openNew({ type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439 })
      await click(tid('pp-several')); await click(puckBtn(b))
      await type('#inpEditRmk', 'sat duty')
      await click($('#inpEditSave'))
      await click(tid('oil-yes')); await click(tid('oilconf-save'))
      const made = () => INPUTS.filter((r: any) => r.remarks === 'sat duty') as any[]
      expect(made().map(r => r.oil['2026-10-17'])).toEqual([1, 1])
      /* one man has since said the opposite for himself */
      const own = fresh === 'Yes' ? 0 : 1
      if (fresh === 'Yes') await act(async () => { writeInputs(() => { made()[0].oil = { '2026-10-17': 0 } }); notify() })
      await openOn(made()[0])
      await click(puckBtn(c))
      await click($('#inpEditSave'))
      expect($$('[data-testid="oilconf"]'), 'a man added: asked again, once').toHaveLength(1)
      await click(tid(fresh === 'Yes' ? 'oil-yes' : 'oil-no')); await click(tid('oilconf-save'))
      expect(made()).toHaveLength(3)
      for (const r of made()) expect(r.oil['2026-10-17'], cs(r.person)).toBe(fresh === 'Yes' ? 1 : 0)
      await act(async () => { undo(); notify() })
      expect(made().map(r => r.oil['2026-10-17']).sort(), 'one Undo: the man gone, each earlier answer back').toEqual([own, 1].sort())
    })
  }
  /* two cases both readers asked the host to RUN and expected to hold — they do */
  it('a range across the year’s end: both men on the days picked, the new year kept', async () => {
    const g = await shared(others().slice(0, 2), { date: 'Dec 29' })
    await openOn(g.rows[0])
    await click(day('2026-12-30'))
    await click($('#inpEditPop #inpEdCal [aria-label="Next month"]'))
    await click(day('2027-01-01'))
    await click($('#inpEditSave'))
    expect(of(g.grp).map(r => [r.date, r.endDate])).toEqual([['Dec 30', 'Jan 1 2027'], ['Dec 30', 'Jan 1 2027']])
    await openOn(of(g.grp)[0])
    expect($('#inpEditPop .rc-read')!.textContent, 'reopened: the same days').toMatch(/Dec 30.*Jan 1/)
  })
  it('a Saturday duty answered Yes, moved to a Tuesday: nothing is asked and no answer for the Saturday is left to earn', async () => {
    const g = await shared(others().slice(0, 2), { type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439, oil: { '2026-10-17': 1 } })
    await openOn(g.rows[0])
    await click(day('2026-10-20'))
    await click($('#inpEditSave'))
    expect($$('[data-testid="oilconf"]')).toHaveLength(0)
    expect(of(g.grp).map(r => r.date)).toEqual(['Oct 20', 'Oct 20'])
    /* the old answer stays written against its own date, and a Tuesday has no day to earn on: nothing is credited */
    for (const r of of(g.grp)) expect(oilAnswered(r), cs(r.person) + ' has nothing that earns').toBe(false)
  })
  /* RESTATED (D729 — V3): the paragraph that said the one-day way ("for one day, tap that day and Save") is gone; the
     LINE UNDER THE CALENDAR says what a Save will write, and says one day as one day */
  it('one tap for one day: the line under the calendar says that day alone, and the paragraph is not there to say it', async () => {
    const g = await shared(others().slice(0, 2))
    await openOn(g.rows[0])
    await click(day('2026-10-20'))
    expect($('#inpEditPop .rc-read')!.textContent).toBe('Oct 20')
    expect($('#inpEditPop')!.textContent).not.toMatch(/for one day, tap that day/i)
  })
})

describe('outside the Inputs page nothing changes', () => {
  it('the board’s dialog keeps its one Person list — no "Several people"', async () => {
    const r = await single()
    await act(async () => { setPage('editsched'); notify() })
    await openOn(r)
    expect(win()).toBeNull()
    expect($('#inpEditPerson')).toBeTruthy()
    expect($('#inpEditPop [data-testid="pp-several"]')).toBeNull()
  })
  /* D681's calendar is the Inputs page's window only: the board's dialog holds ONE man's record on ONE day, and a
     moved span would take the row off the day it was opened from (the dialog's own standing rule) */
  it('the board’s dialog on a record of a shared input: no date calendar — the dates are changed on the Inputs page', async () => {
    const g = await shared(others().slice(0, 3))
    await act(async () => { setPage('editsched'); notify() })
    await openOn(g.rows[0])
    expect(win()).toBeNull()
    expect($('#inpEditPop #inpEdCal')).toBeNull()
    expect($('#inpEditPop .inped-hint')!.textContent).toMatch(/dates are changed on the Inputs page/i)
  })
})

/* THE DATES OF A SAVED ONE-PERSON INPUT ARE CHANGED IN ITS WINDOW (owner D718, D723 — 10 Oct 26: "the edit and cross is
   not needed because … u can click on it to edit it or delete it"; the plan §3.1). The List's pencil was the only form
   that changed an ordinary input's dates; it is gone, so the window carries the calendar a shared input's already had
   (D681). Nothing new is written: the one-person save always took the dates from what the window holds, and asks every
   question it asked before. */
describe('the dates of a saved one-person input are changed in its window (D718 — the List’s pencil is gone)', () => {
  const day = (iso: string) => $(`#inpEditPop #inpEdCal [data-cal="${iso}"]`)
  it('a tap for the start and a tap for the end stretch it; the line under the calendar says what Save will write — one Undo', async () => {
    const r = await single()
    await openOn(r)
    await click(day('2026-10-13')); await click(day('2026-10-15'))
    expect($('#inpEditPop .rc-read')!.textContent).toMatch(/13.*15/)
    await click($('#inpEditSave'))
    expect(win(), 'saved: the window has closed').toBeNull()
    expect([live(r.iid).date, live(r.iid).endDate]).toEqual(['Oct 13', 'Oct 15'])
    expect(live(r.iid).grp, 'still an ordinary input').toBeFalsy()
    await act(async () => { undo(); notify() })
    expect([live(r.iid).date, live(r.iid).endDate || '']).toEqual(['Oct 13', ''])
  })
  it('a one-day input moved to another day: ONE tap is the new start, and Save keeps it one day', async () => {
    const r = await single()
    await openOn(r)
    await click(day('2026-10-20'))
    await click($('#inpEditSave'))
    expect([live(r.iid).date, live(r.iid).endDate || '']).toEqual(['Oct 20', ''])
  })
  it('a range moved whole: a tap for the new start, a tap for the new end', async () => {
    const r = await single({ type: 'LL', allday: true, s: 0, e: 1439, endDate: 'Oct 14', remarks: 'Home till 14 Oct' })
    await openOn(r)
    await click(day('2026-10-20')); await click(day('2026-10-22'))
    await click($('#inpEditSave'))
    expect([live(r.iid).date, live(r.iid).endDate]).toEqual(['Oct 20', 'Oct 22'])
    expect(live(r.iid).remarks, 'the remark’s "till" word follows the new end').toBe('Home till 22 Oct')
  })
  it('the remarks alone changed: the dates are left exactly as they were', async () => {
    const r = await single({ endDate: 'Oct 14' })
    await openOn(r)
    await type('#inpEditRmk', 'only the words')
    await click($('#inpEditSave'))
    expect([live(r.iid).date, live(r.iid).endDate]).toEqual(['Oct 13', 'Oct 14'])
  })
  it('a member changes the dates of his OWN input', async () => {
    const r = await single({ person: member, by: member })
    await as('member')
    await openOn(r)
    expect($('#inpEditPop #inpEdCal')).toBeTruthy()
    await click(day('2026-10-21'))
    await click($('#inpEditSave'))
    expect(live(r.iid).date).toBe('Oct 21')
  })
  it('another man’s input, read only: no picker, and nothing sends him elsewhere for the dates', async () => {
    const r = await single()
    await as('member')
    await openOn(r)
    expect($('#inpEditPop #inpEdCal')).toBeNull()
    expect(win()!.textContent).not.toMatch(/dates are changed/i)
  })
  it('new dates that reach a Saturday bring the OIL question before anything is written; its answer is saved with the dates', async () => {
    const r = await single({ type: 'Duty', date: 'Oct 16', allday: true, s: 0, e: 1439 })
    await openOn(r)
    await click(day('2026-10-16')); await click(day('2026-10-17'))
    await click($('#inpEditSave'))
    expect($$('[data-testid="oilconf"]'), 'asked').toHaveLength(1)
    expect(live(r.iid).endDate, 'nothing is written before the answer').toBeFalsy()
    await click(tid('oil-yes')); await click(tid('oilconf-save'))
    expect([live(r.iid).date, live(r.iid).endDate]).toEqual(['Oct 16', 'Oct 17'])
    expect(live(r.iid).oil).toEqual({ '2026-10-17': 1 })
  })
  /* NO WORDS UNDER THE FORM (D729 — V3; D726): "To change its dates, tap the new start on the calendar above, then the
     new end — for one day, tap that day and Save. The line under the calendar shows what Save will write." went */
  it('a one-person input has no line of instructions under its form — and nothing that sends him elsewhere', async () => {
    const r = await single()
    await openOn(r)
    expect($('#inpEditPop .inped-hint'), 'no instructions').toBeNull()
    expect($('#inpEditPop')!.textContent).not.toMatch(/Inputs page|delete it and add|tap the new start|apply to all/i)
    expect($('#inpEdCal'), 'the calendar itself is there').toBeTruthy()
  })
  it('a date changed on the page behind the open window is followed, and a Save of the remarks keeps it', async () => {
    const r = await single()
    await openOn(r)
    await type('#inpEditRmk', 'mine')
    await act(async () => { writeInputs(() => { live(r.iid).date = 'Oct 22' }); notify() })
    await click($('#inpEditSave'))
    expect([live(r.iid).date, live(r.iid).remarks]).toEqual(['Oct 22', 'mine'])
  })
  it('one SANS commitment keeps its own way: no picker — it is deleted and added again on the SANS calendar', async () => {
    const sans = Object.keys(PEOPLE).filter(id => PEOPLE[id].san && !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special)
    const r = await single({ person: sans[0], type: 'SANS Availability', date: 'Oct 14', allday: true, s: 0, e: 1439, sans: { f: true }, remarks: '' })
    await act(async () => { setInpMode('sans'); notify() })
    await openOn(r)
    expect($('#inpEditPop #inpEdCal')).toBeNull()
    expect($('#inpEditPop .inped-hint')!.textContent).toMatch(/delete it and add it again on the SANS calendar/i)
  })
  it('the board’s dialog on an ordinary input: no date calendar — the dates are changed on the Inputs page', async () => {
    const r = await single()
    await act(async () => { setPage('editsched'); notify() })
    await openOn(r)
    expect($('#inpEditPop #inpEdCal')).toBeNull()
    expect($('#inpEditPop .inped-hint')!.textContent).toMatch(/dates are changed on the Inputs page/i)
  })
})

/* THE OIL QUESTION NOBODY ANSWERED, IN THE WINDOW (the plan §3.2). The List's "OIL?" chip (22 Sep 26) is what tells a
   scheduler that a weekend request's question was asked and never answered — the bell is the member's alone. The
   phone's card has no chips (D723), so the window's OIL line is drawn for that case too, with the same forced
   question the chip opened. */
describe('an OIL question nobody has answered is said in the input’s window, and answered from it', () => {
  it('"Not answered yet" and "Answer…": the question opens, and its answer is saved on the record', async () => {
    const r = await single({ type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439 })
    expect(oilAnswered(r)).toBe(false)
    await openOn(r)
    const line = tid('oil-unanswered')!
    expect(line.textContent).toMatch(/Not answered yet/)
    await click(tid('oil-answer'))
    expect($$('[data-testid="oilconf"]')).toHaveLength(1)
    await click(tid('oil-yes')); await click(tid('oilconf-save'))
    expect(live(r.iid).oil).toEqual({ '2026-10-17': 1 })
  })
  it('an answered one keeps "Change…", and has no "Not answered yet"', async () => {
    const r = await single({ type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439, oil: { '2026-10-17': 1 } })
    await openOn(r)
    expect(tid('oil-revise')).toBeTruthy()
    expect(tid('oil-unanswered')).toBeNull()
  })
  it('THE CONTROL — a kind that never asks, and a weekday, carry no OIL line at all', async () => {
    const leave = await single({ type: 'LL', date: 'Oct 17', allday: true, s: 0, e: 1439 })
    await openOn(leave)
    expect(tid('oil-unanswered')).toBeNull(); expect(tid('oil-revise')).toBeNull()
    await act(async () => { setInpEdit(null); notify() })
    const weekday = await single({ type: 'Duty', date: 'Oct 14', allday: true, s: 0, e: 1439 })
    await openOn(weekday)
    expect(tid('oil-unanswered')).toBeNull()
  })
  /* WALKER C's FIND (Astra's scenario 69, 10 Oct 26). A shared duty's day became a holiday after it was filed; its FIRST
     man answered from his own bell, another did not. The window judged the whole entry by the record it was opened on:
     "no OIL … Change…" and no word that anyone was still unanswered. The line is drawn while ANY man of the entry is
     unanswered, and names who. */
  it('a shared input where ONE man has answered and another has not: the window still says who is unanswered — whichever record it is opened on', async () => {
    const [a, b] = others()
    const first = [a, b].sort((x, y) => cs(x).localeCompare(cs(y), undefined, { sensitivity: 'base' }))[0], second = first === a ? b : a
    const g = await shared([a, b], { type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439 })
    await act(async () => { writeInputs(() => { of(g.grp).find(r => r.person === first)!.oil = { '2026-10-17': 0 } }); notify() })
    for (const opened of of(g.grp)) {
      await openOn(opened)
      const line = tid('oil-unanswered')
      expect(line, `opened on ${cs(opened.person)}`).toBeTruthy()
      expect(line!.textContent).toMatch(/Not answered yet — 17 Oct/)
      expect(line!.textContent, 'it names the man nobody has answered for').toContain(cs(second))
      expect(line!.textContent, 'and not the one who has').not.toContain(cs(first))
      await act(async () => { setInpEdit(null); notify() })
    }
  })
  it('one record with one day answered and another not: the answered line AND the unanswered one', async () => {
    const r = await single({ type: 'Duty', date: 'Oct 17', endDate: 'Oct 18', allday: true, s: 0, e: 1439, oil: { '2026-10-17': 1 } })
    await openOn(r)
    expect(tid('oil-revise'), 'the answered day: Change…').toBeTruthy()
    expect(tid('oil-unanswered')!.textContent).toMatch(/Not answered yet — 18 Oct/)
    expect($$('#inpEditPop [data-testid="oil-answer"], #inpEditPop [data-testid="oil-revise"]'), 'ONE button opens the question — not two that do the same').toHaveLength(1)
  })
  it('a reader who may not change the input is offered no "Answer…"', async () => {
    const r = await single({ type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439 })
    await as('member')
    await openOn(r)
    expect(tid('oil-answer')).toBeNull()
  })
})

/* THE SANS CALENDAR'S "+ COMMITMENT" (owner D658: "a member never files SANS availability for another man — a SANS
   member files his own only; an admin may file it for one SANS man or for several at once"). The same window, the same
   picker — showing the SANS people only. */
describe('the SANS calendar’s "+ Commitment" for several (D658)', () => {
  const sansPeople = () => Object.keys(PEOPLE).filter(id => PEOPLE[id].san && !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special)
  const openSans = async (person: string) => act(async () => {
    setInpEdit({ _new: true, _calendar: true, _ctx: 's', person, type: 'SANS Availability', date: 'Oct 14', allday: true, s: 360, e: 1080, sans: { f: true } }); notify()
  })
  it('an admin: the pucks are the SANS people and nobody else; two picked, one Add — one commitment for both', async () => {
    const [x, y] = sansPeople()
    expect(y, 'the demo roster holds two SANS people').toBeTruthy()
    await act(async () => { setInpMode('sans'); notify() })
    await openSans(x)
    await click(tid('pp-several'))
    expect($$('#inpEditPop [data-pp]').map(b => b.getAttribute('data-pp')!).sort()).toEqual(sansPeople().sort())
    await click(puckBtn(y))
    await click($('#inpEditSave'))
    const made = INPUTS.filter((r: any) => r.type === 'SANS Availability' && r.date === 'Oct 14' && r.grp) as any[]
    expect(made.map(r => String(r.person)).sort()).toEqual([x, y].sort())
    expect(new Set(made.map(r => r.grp)).size).toBe(1)
    expect(made.every(r => r.sans && r.sans.f), 'the ticks are every man’s alike').toBe(true)
  })
  it('a SANS member files his own only: his callsign, no list, no switch', async () => {
    const x = sansPeople()[0]
    await act(async () => { setSession({ user: x, role: 'main' }); setMe(x); setInpMode('sans'); notify() })
    await openSans(x)
    expect($('#inpEditPerson')).toBeNull()
    expect($('#inpEditPersonFixed')!.textContent).toBe(cs(x))
    expect($('#inpEditPop [data-testid="pp-several"]')).toBeNull()
  })
})

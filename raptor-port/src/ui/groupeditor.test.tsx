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
import { InputEditor, commitGroup, draftOf, removeInput } from './inputedit'
import { initStore, notify, setSession, undo, writeInputs } from '../state/store'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { setMe } from '../state/auth'
import { me } from '../state/perms'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
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
const tid = (id: string) => $(`[data-testid="${id}"]`)
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
const puckBtn = (id: string) => $(`[data-pp="${id}"]`)
const lit = () => $$('[data-pp][aria-pressed="true"]').map(b => b.getAttribute('data-pp')!)
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

describe('outside the Inputs page nothing changes', () => {
  it('the board’s dialog keeps its one Person list — no "Several people"', async () => {
    const r = await single()
    await act(async () => { setPage('editsched'); notify() })
    await openOn(r)
    expect(win()).toBeNull()
    expect($('#inpEditPerson')).toBeTruthy()
    expect(tid('pp-several')).toBeNull()
  })
})

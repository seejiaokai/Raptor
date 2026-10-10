// @vitest-environment jsdom
/* A SHARED INPUT IS ONE LINE — on an opened day and on the List (owner D655, 7 Oct 26: "one shared group input, shown
   and edited as one thing"; the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.13, "Where
   a shared input shows as ONE thing").

     A day opened: "one line — its people as compact pucks, the kind, the times, the remarks, and 'Placed by Saber for 4
     people · 7 Oct 26, 14:32'; the LATE tag beside a man whose own record is late (a man added later can be late
     alone). Delete on the focused line asks 'Delete this input for all 4 people?' of the filer or an admin, and 'Take
     yourself out of this input?' of a man in it."
     The List: "one line, its Person cell reading 'Saber +3' (the title lists everyone); its ✎ opens the editor window,
     not the row's in-place edit; sorted by its first callsign." */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor } from './inputedit'
import { initStore, notify, setSession, undo, writeInputs } from '../state/store'
import { setMe } from '../state/auth'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
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
const cs = (id: any) => PEOPLE[id].cs as string
/* the admin Saber (`stiff`), the member Ranger (`bane`); the others are neither */
const admin = 'stiff', member = 'bane'
const others = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers && id !== admin && id !== member)
const az = (ids: string[]) => [...ids].sort((a, b) => cs(a).localeCompare(cs(b), undefined, { sensitivity: 'base' }))
const of = (grp: string) => INPUTS.filter((r: any) => r.grp === grp) as any[]
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
const key = async (el: Element, k: string) => act(async () => { el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })) })
const day = (iso: string) => $(`[data-icday="${iso}"]`)!
const open = async (iso: string) => key(day(iso), 'Enter')
let n = 0
const shared = async (people: string[], over: any = {}, each: Record<string, any> = {}) => {
  const grp = 'gL' + (++n)
  const rows = people.map((p, i) => ({ iid: `${grp}-${i}`, person: p, type: 'Meeting', date: 'Oct 7', yr: 2026, allday: false, s: 600, e: 660,
    remarks: 'range brief', mod: '2026-09-01', grp, grpBy: admin, by: admin, at: new Date(2026, 8, 1, 14, 32).getTime(), ...over, ...(each[p] || {}) }))
  await act(async () => { writeInputs(() => { INPUTS.push(...rows) }); notify() })
  return { grp, first: az(people)[0], line: () => $$('[data-testid^="idy-row-"]').find(el => of(grp).some(r => el.getAttribute('data-popiid') === r.iid))! }
}
const as = async (who: 'admin' | 'member') => act(async () => {
  if (who === 'admin') { setSession({ user: admin, role: 'admin' }); setMe(admin) } else { setSession({ user: member, role: 'main' }); setMe(member) }
  notify()
})

beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); setSession({ user: admin, role: 'admin' }); setMe(admin); lwInitStore(memoryBackend()); lwSetRole('admin')
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

describe('a day opened: a shared input is one line', () => {
  it('one card, not one a man — EVERY name, A to Z, as words (D721: never "+N", no row of pucks); the kind, the hours, and who filed it', async () => {
    const [a, b, c] = others()
    const g = await shared([a, b, c])
    await open('2026-10-07')
    const lines = $$('[data-testid^="idy-row-"]').filter(el => of(g.grp).some(r => el.getAttribute('data-popiid') === r.iid))
    expect(lines, 'one card').toHaveLength(1)
    expect(lines[0].querySelector('[data-testid="idy-who"]')!.textContent).toBe(az([a, b, c]).map(cs).join(', '))
    expect(lines[0].textContent).not.toMatch(/\+\d/)
    expect(lines[0].querySelector('.puck'), 'the pucks stay in the input’s window').toBeNull()
    expect(lines[0].querySelector('[data-testid="idy-kind"]')!.textContent).toBe('Meeting')
    expect(lines[0].querySelector('[data-testid="idy-when"]')!.textContent).toContain('10:00')
    /* "By Saber" and no more (D720, D723): how many it is for is the names themselves; the day and time are in its window */
    expect(lines[0].querySelector('[data-testid="idy-by"]')!.textContent).toBe(`By ${cs(admin)}`)
    expect(tid('idy-count')!.textContent).toBe('1 input')
  })
  it('several people: who filed it is ALWAYS said — even where the filer is one of them (D724)', async () => {
    const [a, b] = others()
    const g = await shared([admin, a, b])
    await open('2026-10-07')
    expect(g.line().querySelector('[data-testid="idy-who"]')!.textContent).toContain(cs(admin))
    expect(g.line().querySelector('[data-testid="idy-by"]')!.textContent).toBe(`By ${cs(admin)}`)
  })
  it('one man late and the others not: the card says LATE once and, pressed, names who — the late date is each man’s own', async () => {
    const [a, b, c] = others()
    const g = await shared([a, b, c], {}, { [c]: { mod: '2026-10-06' } })
    await open('2026-10-07')
    const line = g.line()
    expect(line, 'still one card').toBeTruthy()
    expect(line.querySelectorAll('[data-testid="idy-late"]')).toHaveLength(1)
    await click(line.querySelector('[data-testid="idy-late"]'))
    const note = g.line().querySelector('[data-testid="idy-latenote"]')!.textContent!
    expect(note.startsWith(`${cs(c)}: after the cut-off`), note).toBe(true)
    expect(note).not.toContain(cs(a)); expect(note).not.toContain(cs(b))
  })
  it('every man late alike: the line says LATE once, as an ordinary input does — not once a man', async () => {
    const g = await shared(others().slice(0, 3), { mod: '2026-10-06' })
    await open('2026-10-07')
    const line = g.line()
    expect(line.querySelectorAll('[data-testid="idy-late"]')).toHaveLength(1)
    expect(line.querySelectorAll('[data-testid^="idy-late-"]')).toHaveLength(0)
  })
  it('a press on the line opens the ENTRY in the editor window', async () => {
    const g = await shared(others().slice(0, 3))
    await open('2026-10-07')
    await click(g.line().querySelector('[data-testid="idy-open"]'))
    expect(tid('win-inputedit')!.textContent).toContain(`${cs(g.first)} +2`)
  })
  it('Delete, for an admin: "Delete this input for all 3 people?" — and Delete takes them all, in one step', async () => {
    const g = await shared(others().slice(0, 3))
    await open('2026-10-07')
    await key(g.line().querySelector('[data-testid="idy-open"]')!, 'Delete')
    expect(tid('idy-ask')!.textContent).toContain('Delete this input for all 3 people?')
    expect(of(g.grp)).toHaveLength(3)
    await click(tid('idy-del-yes'))
    expect(of(g.grp)).toHaveLength(0)
    await act(async () => { undo(); notify() })
    expect(of(g.grp), 'one Undo').toHaveLength(3)
  })
  it('Delete, for a man in it who did not file it: "Take yourself out of this input?" — his record alone', async () => {
    const [a, b] = others()
    const g = await shared([a, member, b])
    await as('member')
    await open('2026-10-07')
    await key(g.line().querySelector('[data-testid="idy-open"]')!, 'Delete')
    expect(tid('idy-ask')!.textContent).toContain('Take yourself out of this input?')
    expect(tid('idy-del-yes')!.textContent).toBe('Take me out')
    await click(tid('idy-del-yes'))
    expect(of(g.grp).map(r => String(r.person)).sort()).toEqual([a, b].sort())
  })
  it('Delete, for anyone else: nothing is asked — it says who can', async () => {
    const g = await shared(others().slice(0, 3))
    await as('member')
    await open('2026-10-07')
    await key(g.line().querySelector('[data-testid="idy-open"]')!, 'Delete')
    expect(tid('idy-ask')).toBeNull()
    expect(said.join(' | ')).toContain(`Only ${cs(admin)} — who filed it — or an admin can delete this for everyone`)
    expect(of(g.grp)).toHaveLength(3)
  })
})

describe('the List: a shared input is one line', () => {
  /* the List opens on today onward — a date the demo's today has not passed */
  const LATER = { date: 'Oct 14' }
  const listUp = async () => act(async () => { setInpView('table'); notify() })
  const rowsOf = (grp: string) => $$('#inBody tr[data-iid]').filter(tr => of(grp).some(r => r.iid === tr.getAttribute('data-iid')))
  /* EVERY NAME, A TO Z — NEVER "ACE +2" (owner D727, 10 Oct 26 — drawing A of the desktop list: "On the desktop Inputs
     list a shared input names everyone in it"). Until then the Name read the first callsign and "+2", the rest behind
     a hover. And its small print is "By Saber" — the card's own words (the design vet's V2, D729) — where it read
     "Placed by Saber for 3 people · 1 Sep 26, 14:32". */
  it('one row, its Name naming EVERYONE, A to Z — never "+N" (D727); its small print "By <the filer>" (D729)', async () => {
    const [a, b, c] = others()
    const g = await shared([a, b, c], LATER)
    await listUp()
    const rows = rowsOf(g.grp)
    expect(rows).toHaveLength(1)
    const name = rows[0].querySelector('[data-label="Name"]')!
    expect(name.textContent).toBe(az([a, b, c]).map(cs).join(', '))
    expect(name.textContent, 'no count standing in for a name').not.toMatch(/\+\d/)
    expect(rows[0].querySelector('[data-testid="in-placed"]')!.textContent).toBe(`By ${cs(admin)}`)
  })
  it('a big group is still named whole — nine people, nine names, in order', async () => {
    const nine = others().slice(0, 9)
    const g = await shared(nine, LATER)
    await listUp()
    const name = rowsOf(g.grp)[0].querySelector('[data-label="Name"]')!
    expect(name.textContent!.split(', ')).toEqual(az(nine).map(cs))
  })
  /* the row's own button since D718 (10 Oct 26) — the ✎ a shared row carried is gone with every row's pencil */
  it('its row opens the editor window on the entry — nothing is edited in place', async () => {
    const g = await shared(others().slice(0, 3), LATER)
    await listUp()
    await click(rowsOf(g.grp)[0].querySelector('[data-testid="in-open"]'))
    expect($('#inBody tr.ined')).toBeNull()
    expect(tid('win-inputedit')!.textContent).toContain(`${cs(g.first)} +2`)
  })
  /* SOL'S READ of the calendar job's bug check (8 Oct 26), S3 - and what walker C had seen ("Anvil +2" and "Ace +2" for one
     filing). A man whose callsign sorts BEFORE the others is added from the List: the entry's first record is now his,
     but the save pins the record it was opened on - and pins went on top AFTER the entries were folded, as a record
     of their own. The one filing was drawn twice. */
  it('a man sorting FIRST is added from the List: still ONE row, now leading with him', async () => {
    const [z, x, y] = az(others())
    const g = await shared([x, y], LATER)
    await listUp()
    expect(rowsOf(g.grp)).toHaveLength(1)
    await click(rowsOf(g.grp)[0].querySelector('[data-testid="in-open"]'))
    await click($(`#inpEditPop .pp-pucks button[aria-label="${cs(z)}"]`))
    await click($('#inpEditSave'))
    expect(of(g.grp), 'three records saved').toHaveLength(3)
    const rows = rowsOf(g.grp)
    expect(rows, 'one row for the one filing').toHaveLength(1)
    expect(rows[0].querySelector('[data-label="Name"]')!.textContent, 'every name, A to Z — his first').toBe(az([z, x, y]).map(cs).join(', '))
  })
  it('its row has no ✕ and no OIL chip of one man’s: deleting it, and its OIL answer, are in its window — for everyone', async () => {
    const g = await shared(others().slice(0, 3), { type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439, oil: { '2026-10-17': 1 } })
    await listUp()
    const row = rowsOf(g.grp)[0]
    expect(row.querySelector('.rmx')).toBeNull()
    expect(row.querySelector('.roil')).toBeNull()
    expect(row.querySelector('[data-edit]'), 'nor a pencil: the row itself opens it').toBeNull()
    await click(row.querySelector('[data-testid="in-open"]'))
    expect(tid('win-inputedit'), 'its window').toBeTruthy()
    expect($('#inpEditDel'), 'Delete is in the window').toBeTruthy()
    expect($('#inpEditPop [data-testid="oil-revise"]'), 'and its OIL answer').toBeTruthy()
  })
  it('a man who may change nothing of it still opens it, to read', async () => {
    const g = await shared(others().slice(0, 3), LATER)
    await as('member')
    await listUp()
    await click(rowsOf(g.grp)[0].querySelector('[data-testid="in-open"]'))
    expect(tid('inped-ro')).toBeTruthy()
  })
  it('filtered to ONE of its people the line still shows — as the whole entry', async () => {
    const [a, b, c] = others()
    const g = await shared([a, b, c], LATER)
    await listUp()
    const last = az([a, b, c])[2]
    const sel = $('#inFPerson') as HTMLSelectElement
    expect(sel, 'the List’s person filter').toBeTruthy()
    await act(async () => { sel.value = last; sel.dispatchEvent(new Event('change', { bubbles: true })) })
    const rows = rowsOf(g.grp)
    expect(rows).toHaveLength(1)
    expect(rows[0].querySelector('[data-label="Name"]')!.textContent, 'all three named, not only the one filtered to').toBe(az([a, b, c]).map(cs).join(', '))
  })
  /* RESTATED 10 Oct 26 (owner D718, D723): this used to say "an ordinary input keeps its row as it was — ✎ in place, ✕,
     its own name". The pencil and the cross are gone from EVERY row; an ordinary input's row opens its window as a
     shared one's does, and keeps its own name. */
  it('an ordinary input’s row opens its window too — no pencil, no cross, its own name', async () => {
    const a = others()[0]
    /* a date the List still shows: it opens on today onward, and 8 Oct 26 - the date written here first - went
       red the night the calendar turned to the 9th (the calendar job's bug check) */
    await act(async () => { writeInputs(() => { INPUTS.push({ iid: 'solo1', person: a, type: 'Meeting', date: 'Oct 20', yr: 2026, allday: false, s: 600, e: 660, remarks: 'solo', mod: '2026-09-01' }) }); notify() })
    await listUp()
    const row = $('#inBody tr[data-iid="solo1"]')!
    expect(row.querySelector('[data-label="Name"]')!.textContent).toBe(cs(a))
    expect(row.querySelector('.rmx, [data-edit], [data-inx]')).toBeNull()
    await click(row.querySelector('[data-testid="in-open"]'))
    expect($('#inBody tr.ined')).toBeNull()
    expect(tid('win-inputedit')!.textContent).toContain(cs(a))
    expect(tid('win-inputedit')!.textContent, 'one man’s: no "+N"').not.toMatch(/\+\d/)
  })
})

/* THE LIST'S "+ INPUT" OPENS THE WINDOW, WHICH CARRIES THE PICKER (the plan §3.13: the picker is "used by the editor … and
   by the List's Add form; both save through commitGroup"). The List's own form went on 10 Oct 26 (owner D729 — the
   design vet's V1); its three tests are RESTATED for the window its "+ Input" opens — the same picker, the same save. */
describe('the List’s "+ Input" files for several people too', () => {
  const listUp = async () => act(async () => { setInpView('table'); notify() })
  const choose = async (sel: string, v: string) => {
    const el = $(sel) as HTMLSelectElement
    expect(el, sel).toBeTruthy()
    await act(async () => { el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })) })
  }
  const W = '[data-testid="win-inputedit"]'
  const plus = async () => { await listUp(); await click($('#inNew')); expect($(W), 'the new input’s window').toBeTruthy() }
  const form = () => $(`${W} [data-testid="pp"]`) as HTMLElement
  const pickDate = async () => { await click($('#inpEdCal [data-cal]')) }
  it('an admin: the Person list, with "Several people" beside it — three picked, one Add, one shared input', async () => {
    await plus()
    expect($('#inpEditPerson'), 'the one-person list').toBeTruthy()
    await choose('#inpEditType', 'Meeting')
    const sw = form().querySelector('[data-testid="pp-several"]')
    await click(sw)
    const [b, c] = others()
    await click(form().querySelector(`[data-pp="${b}"]`)); await click(form().querySelector(`[data-pp="${c}"]`))
    await pickDate()
    const before = INPUTS.length, had = new Set(INPUTS.map((r: any) => r.iid))
    await click($('#inpEditSave'))
    const made = INPUTS.filter((r: any) => !had.has(r.iid)) as any[]
    expect(INPUTS.length).toBe(before + 3)
    expect(new Set(made.map(r => r.grp)).size).toBe(1)
    expect(made.map(r => String(r.person)).sort()).toEqual([admin, b, c].sort())
    expect(made.every(r => String(r.grpBy) === admin && r.type === 'Meeting')).toBe(true)
    expect(said.join(' | ')).toContain('Input added for 3 people')
    await act(async () => { undo(); notify() })
    expect(INPUTS.length, 'one Undo').toBe(before)
  })
  it('a member: on a duty or commitment he may pick another man; on leave his own callsign, and no switch', async () => {
    await as('member')
    await plus()
    await choose('#inpEditType', 'Meeting')
    expect($('#inpEditPerson'), 'a list, starting on himself').toBeTruthy()
    expect(($('#inpEditPerson') as HTMLSelectElement).value).toBe(member)
    expect(document.querySelector(`${W} [data-testid="pp-several"]`)).toBeTruthy()
    await choose('#inpEditType', 'LL')
    expect($('#inpEditPerson')).toBeNull()
    expect($('#inpEditPersonFixed')!.textContent).toBe(cs(member))
    expect(document.querySelector(`${W} [data-testid="pp-several"]`)).toBeNull()
  })
  it('a member picks two, then turns it into leave: Add is refused with the sentence and files nothing', async () => {
    await as('member')
    await plus()
    await choose('#inpEditType', 'Meeting')
    await click(form().querySelector('[data-testid="pp-several"]'))
    await click(document.querySelector(`${W} [data-pp="${others()[0]}"]`))
    await choose('#inpEditType', 'LL')
    await pickDate()
    const before = INPUTS.length
    await click($('#inpEditSave'))
    expect(said.join(' | ')).toContain('You can file leave only for yourself')
    expect(INPUTS.length).toBe(before)
  })
})

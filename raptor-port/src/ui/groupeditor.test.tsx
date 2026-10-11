// @vitest-environment jsdom
/* ONE INPUT FILED FOR SEVERAL PEOPLE — the editor (owner D654, D655, D656, D660 — 7 Oct 26; the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.13, "The picker", "The writer", "Where a shared
   input shows as ONE thing").

   D655: "a group filing is one shared input, shown and edited as one thing for everyone in it; the man himself,
   whoever filed it and an admin may change or delete it." The plan: the editor opened on ANY record of an entry opens
   the ENTRY — the people (the picker, lit), then the shared fields; the filer and an admin change both, and Save is one
   command. A man in it who is neither sees it read only with two live controls: "Take me out", and his own OIL answer.
   Anyone else sees it read only: "Only its people, Saber — who filed it — or an admin can change this."
   D660: "that person filing should answer for all" — the OIL question is asked ONCE, at the save.
   Behaviour register ([GROUP-INPUT-ONE-ROW]): GI7, GI14.

   RE-EXPRESSED ON THE ONE RECORD (the one-rule build, step 2 — owner D756, D759, 11 Oct 26: "an input is stored as ONE
   record with the list of its people"; docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.1, §4.4, §4.5, §4.9).
   Until that build a shared input was kept as one record a man tied by a group id, and these fixtures pushed N records
   with `grp` / `grpBy`. They push the ONE record now — `people` in the order they joined, each entry with who put him
   in (`by`, `at`) — and where a case counted "every record" it reads the one record and who is in it. Three rulings
   changed what some of these cases said, and each such case names its ruling:
     D762 — the OIL question has ONE answer, for everyone in the input; no man in it gives an answer of his own ("Your
            OIL" is gone from the window), so "one man has said No for himself" cannot be set up any more;
     D755 (1) — someone added to an input follows the answer it carries; nothing is asked for him where it is answered;
     D763 / D755 (3) — a person in an input he did not file may take himself out and nothing else. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor, askOilIfPending, commitInput, draftOf, oilAnswered } from './inputedit'
import { initStore, notify, setSession, undo, writeInputs } from '../state/store'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { setMe } from '../state/auth'
import { me } from '../state/perms'
import { INPUTS, entryOf, idsOf } from '../engine/inputs'
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
/* who is in an input, in the order they joined — nobody, once it is deleted */
const inIt = (iid: string) => (live(iid) ? idsOf(live(iid)).map(String) : []) as string[]
/* the first of them A to Z — the name a window's title and the OIL question lead with */
const firstAZ = (ids: string[]) => [...ids].sort((x, y) => cs(x).localeCompare(cs(y), undefined, { sensitivity: 'base' }))[0]
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
const T0 = new Date('2026-09-01T08:00:00.000Z').getTime()
/* a shared input as it is kept: ONE record with its people, in the order they joined, each put in by whoever filed it
   (owner D756) — put in through the app's own door */
const shared = async (people: string[], over: any = {}) => {
  const iid = 'gT' + (++n)
  const rec: any = { iid, type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660,
    remarks: 'brief', mod: '2026-09-01', by: admin, at: T0, ...over }
  rec.people = people.map(p => ({ p, by: rec.by, at: rec.at }))
  await act(async () => { writeInputs(() => { INPUTS.push(rec) }); notify() })
  return { iid, people }
}
/* an input of ONE person, as the app files it since the build: a record with its list of one and no `person` field.
   (`person` here only says who that one is.) A record in the OLD shape has two cases of its own — "OLD SHAPE: …", with
   the one-person inputs' dates, below. */
const single = async (over: any = {}) => {
  const { person = others()[0], ...rest } = over
  const row: any = { iid: 'gs' + (++n), type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'solo', mod: '2026-09-01', ...rest }
  row.people = [{ p: person, ...(row.by != null ? { by: row.by } : {}), ...(row.at != null ? { at: row.at } : {}) }]
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
    /* ONE RECORD FOR THE THREE (D756): it was three records tied by one group id, each naming whoever filed the entry */
    const made = INPUTS.filter((r: any) => r.remarks === 'range brief') as any[]
    expect(made, 'one record, not one a man').toHaveLength(1)
    expect(idsOf(made[0]).map(String).sort()).toEqual([admin, b, c].sort())
    expect(made[0].person, 'a new input is written with its list — no `person` field').toBeUndefined()
    expect(String(made[0].by), 'filed by him').toBe(admin)
    expect(made[0].people.every((e: any) => String(e.by) === admin), 'and each man put in by him').toBe(true)
    /* the change history: ONE line for the one filing, naming everyone in it A to Z — it was a line for each man, each
       carrying the filing's group, which the changes window made ONE item of (D663; one item still — D736) */
    const lines = ELOG.rows.filter(x => x.iid === made[0].iid)
    expect(lines).toHaveLength(1)
    expect(lines[0].lbl.startsWith([admin, b, c].map(cs).sort((x, y) => x.localeCompare(y, undefined, { sensitivity: 'base' })).join(', ') + ' · '), lines[0].lbl).toBe(true)
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
    expect(idsOf(made[0]).map(String), 'his alone').toEqual([b])
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
    expect(made, 'one record').toHaveLength(1)
    expect(idsOf(made[0]).map(String).sort()).toEqual([member, b].sort())
    expect(String(made[0].by), 'he is who filed it').toBe(member)
    await openOn(made[0])
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

/* "Opened on ANY record of a shared input" was said while it was kept as a record a man: there is ONE record now (D756),
   so there is one thing to open — and the window on it holds everyone in it, as before. */
describe('the editor opened on a shared input holds everyone in it (it was: "opened on any record … opens the ENTRY")', () => {
  it('the people are the picker, lit — every one of them', async () => {
    const [a, b, c] = others()
    const g = await shared([a, b, c])
    await openOn(g)
    expect(lit().sort()).toEqual([a, b, c].sort())
    expect(tid('pp-count')!.textContent).toBe('3 picked')
    expect(tid('pp-several')!.getAttribute('aria-checked')).toBe('true')
  })
  /* the title's first name is the first A TO Z, whatever order its people joined in — the name its card and its row
     lead with, and the one the OIL question is headed by (the walk's find of 10 Oct 26: "Ranger +2" where the saved
     input read "Ace +2"). Each test here is given people who did NOT join in A-to-Z order. */
  it('the title says the first of them A to Z and how many more', async () => {
    const ids = others().slice(0, 3)
    const joined = [...ids].sort((x, y) => cs(y).localeCompare(cs(x), undefined, { sensitivity: 'base' }))
    const g = await shared(joined)
    await openOn(g)
    expect(win()!.textContent).toContain(`${cs(firstAZ(ids))} +2`)
  })
  it('an admin changes the remarks: the input’s remark changes — for everyone in it — and one Undo puts it back', async () => {
    const g = await shared(others().slice(0, 3))
    await openOn(g)
    await type('#inpEditRmk', 'moved to room 2')
    await click($('#inpEditSave'))
    expect(live(g.iid).remarks).toBe('moved to room 2')
    expect(inIt(g.iid), 'still all three, in the one record').toEqual(g.people)
    await act(async () => { undo(); notify() })
    expect(live(g.iid).remarks).toBe('brief')
  })
  /* "His record goes and nobody else's is touched" was said of a record a man. On the ONE record (D756) he leaves its
     list; "nobody else is touched" is that the input's late date stands — a change to who is in it makes nobody read
     late — and the entries of the men who stay are exactly as they were. The old check that their records were "not
     saved again" (`modAt == null`) has no subject left: the one record is, rightly, stamped as changed by whoever took
     him off. */
  it('a man taken off the list: he leaves and nobody else is touched (the late date stands, the others’ entries as they were)', async () => {
    const [a, b, c] = others()
    const g = await shared([a, b, c])
    const stay = JSON.stringify(live(g.iid).people.filter((e: any) => e.p !== b))
    await openOn(g)
    await click(puckBtn(b))
    await click($('#inpEditSave'))
    expect(inIt(g.iid)).toEqual([a, c])
    expect(live(g.iid).mod, 'nobody reads late for it').toBe('2026-09-01')
    expect(JSON.stringify(live(g.iid).people), 'the men who stay: their entries untouched').toBe(stay)
  })
  it('a man added: he joins the input, which keeps its filer, with his own "placed by"', async () => {
    const [a, b, c] = others()
    const g = await shared([a, b])
    await openOn(g)
    await click(puckBtn(c))
    await click($('#inpEditSave'))
    const mine = entryOf(live(g.iid), c)
    expect(mine, 'one more person, the same record').toBeTruthy()
    expect(String(live(g.iid).by), 'the input’s filer is as it was').toBe(admin)
    expect(String(mine.by), 'who put HIM in').toBe(admin)
    expect(inIt(g.iid), 'joined at the end').toEqual([a, b, c])
    expect(INPUTS.filter((r: any) => r.remarks === 'brief'), 'no second record').toHaveLength(1)
  })
  it('Delete asks "for all 3 people?" first; Keep removes nothing, Delete removes the input for them all in one step', async () => {
    const g = await shared(others().slice(0, 3))
    await openOn(g)
    await click($('#inpEditDel'))
    expect(tid('inped-delall')!.textContent).toContain('Delete this input for all 3 people?')
    expect(inIt(g.iid)).toHaveLength(3)
    await click(tid('inped-delall-no'))
    expect(tid('inped-delall')).toBeNull(); expect(inIt(g.iid)).toHaveLength(3)
    await click($('#inpEditDel')); await click(tid('inped-delall-yes'))
    expect(live(g.iid), 'the input is gone').toBeUndefined()
    expect(win()).toBeNull()
    await act(async () => { undo(); notify() })
    expect(inIt(g.iid), 'one Undo').toHaveLength(3)
  })
  /* "the second man shares a group id" until the build; the SAME record takes him now (D756), and who filed it stays
     the member who did — the man the admin adds is stamped as put in by the admin */
  it('an ordinary input made an input of two: the same record holds both, still filed by whoever placed the first', async () => {
    const r = await single({ by: member, at: T0 })
    const added = others()[1]
    await openOn(r)
    await click(tid('pp-several'))
    await click(puckBtn(added))
    await click($('#inpEditSave'))
    const now = live(r.iid)
    expect(inIt(r.iid)).toEqual([others()[0], added])
    expect(INPUTS.filter((x: any) => x.remarks === 'solo'), 'one record, not two').toHaveLength(1)
    expect(String(now.by), 'an admin’s hand never takes an input from the member who filed it').toBe(member)
    expect(String(entryOf(now, added).by), 'the man added: put in by the admin').toBe(admin)
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
  /* …AND THE ADD ITSELF, where SOMEONE ELSE filed his input for him (the one-rule plan §4.9: the ONLY named person of an
     input changes it in full — "its fields, its people, its OIL answer" — whoever filed it; D763 reading 2: "the one
     person of a one-person input may always change it … that is his own request"). The input of several he makes of
     it is HIS filing — who filed it passes to him in the same save — so he can go on changing who is in it. */
  it('the only person of an input an admin filed for him adds a man: saved, the same record holds both, and it is his to go on changing (D763)', async () => {
    const r = await single({ person: member, by: admin, at: T0 })
    const b = others()[0]
    await as('member')
    await openOn(r)
    await click(tid('pp-several'))
    await click(puckBtn(b))
    await click($('#inpEditSave'))
    expect(said.join(' | ')).not.toMatch(/not saved|not yours/i)
    expect(win(), 'saved: the window has closed').toBeNull()
    expect(inIt(r.iid)).toEqual([member, b])
    expect(String(live(r.iid).by), 'the input of several is his filing').toBe(member)
    expect(String(entryOf(live(r.iid), b).by), 'he put the other man in').toBe(member)
    await openOn(r)
    expect($('#inpEditSave'), 'still his to change').toBeTruthy()
    expect(tid('inped-ro')).toBeNull()
  })
})

describe('who may change it', () => {
  it('a man in it who did not file it: read only, with "Take me out" — which takes HIM out alone, the input staying (D755 (3))', async () => {
    const [a, b] = others()
    const g = await shared([a, member, b])
    await as('member')
    await openOn(g)
    expect($('#inpEditSave'), 'not his to change for everyone').toBeNull()
    expect($('#inpEditDel')).toBeNull()
    expect(tid('inped-ro')!.textContent).toContain(`Only ${cs(admin)} — who filed it — or an admin can change this for everyone`)
    await click(tid('inped-takeout'))
    expect(tid('inped-takeout-ask')!.textContent).toContain('Take yourself out of this input?')
    await click(tid('inped-takeout-yes'))
    expect(inIt(g.iid)).toEqual([a, b])
    expect(win()).toBeNull()
  })
  /* D762, D763: nobody IN an input he did not file changes anything of it but his own being in it — no OIL answer of
     his own, nobody added. So "its people" left the sentence ("Only its people, Saber — who filed it — or an admin can
     change this."): it is the one sentence every door says now (ui/inputedit.tsx sharedRefusal; the plan §4.9). */
  it('anyone else: read only, and told who can change it — its filer or an admin, no longer "its people" (D762, D763)', async () => {
    const g = await shared(others().slice(0, 3))
    await as('member')
    await openOn(g)
    expect($('#inpEditSave')).toBeNull()
    expect(tid('inped-takeout')).toBeNull()
    expect(tid('inped-ro')!.textContent).toBe(`Only ${cs(admin)} — who filed it — or an admin can change this for everyone.`)
    expect(lit(), 'he still reads who is in it').toHaveLength(3)
  })
  /* D763: "a person who is in a shared input he did not file does not add anyone to it". His form is inert and has no
     Save; the write path refuses a hand-made call too, and says who can. */
  it('a man in it who did not file it adds nobody — the save itself refuses, in words, and nothing changes (D763)', async () => {
    const [a, b, c] = others()
    const g = await shared([a, member, b])
    await as('member')
    let ok = true
    await act(async () => { ok = commitInput(live(g.iid), draftOf(live(g.iid)), [a, member, b, c]); notify() })
    expect(ok).toBe(false)
    expect(said.join(' | ')).toContain(`Only ${cs(admin)} — who filed it — or an admin can change this for everyone`)
    expect(inIt(g.iid)).toEqual([a, member, b])
  })
})

describe('the OIL question is asked once, of whoever files (D660)', () => {
  it('a duty on a Saturday for three: ONE sheet, and its answer is the input’s ONE answer, for everyone in it (D762)', async () => {
    const [b, c] = others()
    await openNew({ type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439 })
    await click(tid('pp-several'))
    await click(puckBtn(b)); await click(puckBtn(c))
    await type('#inpEditRmk', 'saturday duty')
    await click($('#inpEditSave'))
    expect($$('[data-testid="oilconf"]'), 'asked once').toHaveLength(1)
    expect(INPUTS.some((r: any) => r.remarks === 'saturday duty'), 'nothing is written before the answer').toBe(false)
    await click(tid('oil-yes')); await click(tid('oilconf-save'))
    /* it was written on each of three records; the one record carries it once (D756, D762) */
    const made = INPUTS.filter((r: any) => r.remarks === 'saturday duty') as any[]
    expect(made).toHaveLength(1)
    expect(idsOf(made[0]).map(String).sort()).toEqual([admin, b, c].sort())
    expect(made[0].oil).toEqual({ '2026-10-17': 1 })
    expect(made[0].people.every((e: any) => e.oil === undefined), 'no man carries an answer of his own').toBe(true)
  })
})

/* ASTRA'S READ of the calendar job's bug check (8 Oct 26), R2. D660: "whoever files an input for other people answers the
   OIL question for all of them, once, at the save - nobody is left to be asked by his own bell". The save asked the
   OIL gate about the FIRST man of the entry only. Once he had said No for himself, a change of hours by the filer
   opened no question (his No still stood) while every other man's answer was voided by the new hours and left
   unanswered. */
/* RETIRED BY D762 (11 Oct 26), AND WHAT IS PINNED IN ITS PLACE. These two cases set up "the FIRST / the LAST man has said
   No for himself" by writing a No onto one man's own record, and checked that the filer was still asked for the
   others. No man in an input gives an answer of his own any more — there is ONE answer, on the one record — so that
   state cannot exist and R2's fault (one man's No hiding the others' voided answers) has nowhere to live. What is
   true now, for the same change of hours: an answer the new hours no longer price brings the question back ONCE, for
   the input; and the input's own No stands for everyone whatever the hours, with nothing asked — either way the
   input is never left without an answer. */
describe('hours changed on a shared duty: the question comes back for the INPUT, once (D660 as D762 has it — one answer for everyone)', () => {
  const twoHours = async (answer: 'oil-yes' | 'oil-no') => {
    const [b, c] = others()
    await openNew({ type: 'Duty', date: 'Oct 17', allday: false, s: 600, e: 720 })
    await click(tid('pp-several'))
    await click(puckBtn(b)); await click(puckBtn(c))
    await type('#inpEditRmk', 'two hours')
    await click($('#inpEditSave'))
    await click(tid(answer)); await click(tid('oilconf-save'))
  }
  const made = () => INPUTS.filter((r: any) => r.remarks === 'two hours') as any[]
  it('answered Yes for two hours; the filer makes it all day: asked once, and the input is not left without an answer', async () => {
    await twoHours('oil-yes')
    expect(made().map(r => r.oil && r.oil['2026-10-17'])).toEqual([0.5])
    await openOn(made()[0])
    await click($('#inpEditAllday'))
    await click($('#inpEditSave'))
    expect($$('[data-testid="oilconf"]'), 'the new hours price a full day: the filer is asked again').toHaveLength(1)
    await click(tid('oil-yes')); await click(tid('oilconf-save'))
    expect(made()).toHaveLength(1)
    expect(inIt(made()[0].iid)).toHaveLength(3)
    expect(made()[0].oil && made()[0].oil['2026-10-17'], 'the input has an answer — a full day now').toBe(1)
  })
  it('answered No; the filer makes it all day: nothing is asked — the input’s No stands for everyone, and it is saved', async () => {
    await twoHours('oil-no')
    expect(made().map(r => r.oil && r.oil['2026-10-17'])).toEqual([0])
    await openOn(made()[0])
    await click($('#inpEditAllday'))
    await click($('#inpEditSave'))
    expect($$('[data-testid="oilconf"]'), 'a No is a No whatever the hours').toHaveLength(0)
    expect(win(), 'saved').toBeNull()
    expect(made()).toHaveLength(1)
    expect(made()[0].allday).toBe(true)
    expect(made()[0].oil && made()[0].oil['2026-10-17'], 'still answered: No').toBe(0)
  })
})

/* ASTRA'S READ, R1. A shared meeting, its kind changed to a medical one in the window and the people cut to ONE ("Keep ...
   only"): the save still took the GROUP's branch - the saved entry has two records - which returns before the document,
   the upchit summary and the medical-clash questions. A medical entry was written with none of them asked. It is
   refused now, in words, with nothing written: the others are taken out and saved first, and the kind is changed
   after - through the one-person save that asks every question. */
describe('a shared input is never turned into a medical entry by the group\u2019s save', () => {
  it('kind changed to a medical one, people cut to one: refused in words, the input as it was — its kind, and both people', async () => {
    const [a, b] = others()
    const g = await shared([a, b])
    await openOn(g)
    await choose('#inpEditType', 'OML')
    const fix = tid('pp-fix')
    if (fix) await click(fix)
    said.length = 0
    await click($('#inpEditSave'))
    expect(said.join(' | ')).toMatch(/medical entry is one person/i)
    expect(live(g.iid).type, 'nothing was written').toBe('Meeting')
    expect(inIt(g.iid), 'nobody was taken out').toEqual([a, b])
    expect($$('[data-testid="docconf"], [data-testid="oilconf"]')).toHaveLength(0)
  })
})

/* SOL'S READ of the calendar job's bug check (8 Oct 26), S2 - the same fault as R2 on another door. After a bar is
   dragged onto a weekend the question "follows the move" (ui/caldrag.ts -> askOilIfPending), and it was asked of the
   ONE record the drag held: a first man's standing No for that day left the second man, who has no answer, to his own
   bell. It is asked while ANY man of the entry needs an answer. */
/* RETIRED BY D762, AND WHAT IS PINNED IN ITS PLACE. The two cases here gave ONE man of the entry a standing No and left
   the other with no answer ("the FIRST / the SECOND man has a standing No, the other no answer: it asks"). An input has
   one answer now, so "one man's No beside another man's silence" cannot be stored. What is true of the same door: it
   asks while the INPUT has no answer, and asks nothing once it has one — a No as much as a Yes, for everyone in it. */
describe('the OIL question that follows a move is asked while the INPUT has no answer (D660 as D762 has it)', () => {
  it('a shared duty on a Saturday that nobody has answered: it asks, once', async () => {
    const [a, b] = others()
    const g = await shared([a, b], { type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439 })
    let asked = false
    await act(async () => { asked = askOilIfPending(live(g.iid)); notify() })
    expect(asked, 'the question opens').toBe(true)
    expect($$('[data-testid="oilconf"]')).toHaveLength(1)
  })
  it('the input’s one answer is No: nothing is asked — the No is everyone’s (D762)', async () => {
    const [a, b] = others()
    const g = await shared([a, b], { type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439, oil: { '2026-10-17': 0 } })
    let asked = true
    await act(async () => { asked = askOilIfPending(live(g.iid)); notify() })
    expect(asked).toBe(false)
    expect($$('[data-testid="oilconf"]')).toHaveLength(0)
  })
  it('answered Yes: nothing is asked', async () => {
    const [a, b] = others()
    const g = await shared([a, b], { type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439, oil: { '2026-10-17': 1 } })
    let asked = true
    await act(async () => { asked = askOilIfPending(live(g.iid)); notify() })
    expect(asked).toBe(false)
  })
})

describe('the input changed behind its window', () => {
  it('a man added on the page behind: the window shows him, and a Save of the remarks keeps him', async () => {
    const [a, b, c] = others()
    const g = await shared([a, b])
    await openOn(g)
    await type('#inpEditRmk', 'mine')
    await act(async () => { commitInput(live(g.iid), draftOf(live(g.iid)), [a, b, c]); notify() })
    expect(lit().sort(), 'theirs, silently').toEqual([a, b, c].sort())
    expect(said.join(' | ')).toContain(`${cs(c)} added`)
    await click($('#inpEditSave'))
    expect(inIt(g.iid)).toEqual([a, b, c])
    expect(live(g.iid).remarks).toBe('mine')
  })
  /* "The very RECORD the window was opened on is taken out behind it" — one man's record of three, deleted behind the
     window. There is one record now (D756): what can still be taken away behind the window is the MAN its title leads
     with. The window stays, on the rest of the input, as it did. */
  it('the man the window’s title leads with is taken out behind it: the window stays, on the rest of the input', async () => {
    const [a, b, c] = others()
    const g = await shared([a, b, c])
    await openOn(g)
    await act(async () => { commitInput(live(g.iid), draftOf(live(g.iid)), [b, c]); notify() })
    expect(win(), 'the input is still there').toBeTruthy()
    expect(lit().sort()).toEqual([b, c].sort())
    expect(said.join(' | ')).toContain(`${cs(a)} taken off`)
  })
})

/* THE DATES OF A SAVED SHARED INPUT (owner D681, 9 Oct 26 — "2 agree"; found by Astra's read of the calendar job's bug
   check, R3: `[CAL-SHARED-DATES]`). "A group filing is one shared input, shown and edited as one thing" (D655) — and its
   dates are part of it, but no door changed them: the List's row opens this window (no edit in place on a shared row),
   the window drew its date picker for a NEW input only, and a bar's drag keeps the length. The window now carries the
   same two-tap picker for a saved shared input its reader may change for everyone, and the save is the entry's ONE
   command — the write path (`commitGroup`) always took the dates from the draft; only the control was missing.
   ON THE ONE RECORD (D756): "every man's record" moved alike; the one record moves, and everyone is still in it. */
describe('the dates of a saved shared input are changed in its window (D681)', () => {
  const day = (iso: string) => $(`#inpEditPop #inpEdCal [data-cal="${iso}"]`)
  it('the picker stands in the window, on the saved day; a tap for the start and a tap for the end stretch it for everyone — one Undo', async () => {
    const g = await shared(others().slice(0, 3))
    await openOn(g)
    expect($('#inpEditPop #inpEdCal'), 'the two-tap calendar a new input has').toBeTruthy()
    expect(day('2026-10-13')!.className).toContain(' s')
    await click(day('2026-10-13')); await click(day('2026-10-15'))
    expect($('#inpEditPop .rc-read')!.textContent, 'the line under the calendar says what Save will write').toMatch(/13.*15/)
    await click($('#inpEditSave'))
    expect(win(), 'saved: the window has closed').toBeNull()
    expect([live(g.iid).date, live(g.iid).endDate]).toEqual(['Oct 13', 'Oct 15'])
    expect(inIt(g.iid), 'still one shared input, everyone in it').toEqual(g.people)
    expect(INPUTS.filter((r: any) => r.remarks === 'brief'), 'and no second record').toHaveLength(1)
    await act(async () => { undo(); notify() })
    expect([live(g.iid).date, live(g.iid).endDate || ''], 'ONE step puts it back for every man').toEqual(['Oct 13', ''])
  })
  it('moved whole to other days: a tap for the new start, a tap for the new end', async () => {
    const g = await shared(others().slice(0, 2), { endDate: 'Oct 14' })
    await openOn(g)
    await click(day('2026-10-20')); await click(day('2026-10-21'))
    await click($('#inpEditSave'))
    expect([live(g.iid).date, live(g.iid).endDate]).toEqual(['Oct 20', 'Oct 21'])
    expect(inIt(g.iid)).toEqual(g.people)
  })
  it('a one-day input moved to another day: ONE tap is the new start, and Save keeps it one day', async () => {
    const g = await shared(others().slice(0, 2))
    await openOn(g)
    await click(day('2026-10-20'))
    await click($('#inpEditSave'))
    expect([live(g.iid).date, live(g.iid).endDate || '']).toEqual(['Oct 20', ''])
    expect(inIt(g.iid)).toEqual(g.people)
  })
  it('a member who filed it changes its dates too (D655: whoever filed it)', async () => {
    const [a] = others()
    const g = await shared([member, a], { by: member })
    await as('member')
    await openOn(g)
    expect($('#inpEditPop #inpEdCal')).toBeTruthy()
    await click(day('2026-10-13')); await click(day('2026-10-14'))
    await click($('#inpEditSave'))
    expect(live(g.iid).endDate).toBe('Oct 14')
    expect(inIt(g.iid)).toEqual([member, a])
  })
  it('a man in it who did not file it, and anyone else: no picker — the dates are not theirs to change', async () => {
    const [a, b] = others()
    const g = await shared([a, member, b])
    const h = await shared([a, b])
    await as('member')
    await openOn(g)
    expect($('#inpEditPop #inpEdCal'), 'a man in it').toBeNull()
    expect(win()!.textContent, 'and nothing sends him elsewhere for the dates').not.toMatch(/dates are changed/i)
    await act(async () => { setInpEdit(null); notify() })
    await openOn(h)
    expect($('#inpEditPop #inpEdCal'), 'anyone else').toBeNull()
    expect(win()!.textContent, 'and nothing sends him elsewhere for the dates').not.toMatch(/dates are changed/i)
  })
  it('new dates that reach a Saturday: the OIL question is asked ONCE, and its answer is the input’s one answer, for both (D660, D762)', async () => {
    const [a, b] = others()
    const g = await shared([a, b], { type: 'Duty', date: 'Oct 16', allday: true, s: 0, e: 1439 })
    await openOn(g)
    await click(day('2026-10-16')); await click(day('2026-10-17'))
    await click($('#inpEditSave'))
    expect($$('[data-testid="oilconf"]'), 'asked once').toHaveLength(1)
    expect(live(g.iid).endDate, 'nothing is written before the answer').toBeFalsy()
    await click(tid('oil-yes')); await click(tid('oilconf-save'))
    expect([live(g.iid).date, live(g.iid).endDate]).toEqual(['Oct 16', 'Oct 17'])
    expect(inIt(g.iid)).toEqual([a, b])
    expect(live(g.iid).oil, 'the one answer, for everyone in it').toEqual({ '2026-10-17': 1 })
  })
  /* ONE SHORT LINE (owner D729 — the design vet's V3, 10 Oct 26; D726): the paragraph of instructions under the form
     ("To change its dates for everyone in it, tap the new start on the calendar above, then the new end …") went. What
     stays is the one thing nothing else in the window says — that the dates change for every man in it. */
  it('the words under the form are ONE short line: the dates change for all of them — never "changed on the Inputs page", never "delete it and add it again"', async () => {
    const g = await shared(others().slice(0, 2))
    await openOn(g)
    const hint = $('#inpEditPop .inped-hint')!.textContent || ''
    expect(hint).toBe('Date changes apply to all 2.')
    expect(hint).not.toMatch(/Inputs page|delete it|tap the new start/i)
    const g3 = await shared(others().slice(2, 5))
    await openOn(g3)
    expect($('#inpEditPop .inped-hint')!.textContent, 'the count is the entry’s own').toBe('Date changes apply to all 3.')
  })
  it('the dates changed on the page behind the open window are followed, and a Save of the remarks keeps them', async () => {
    const [a, b] = others()
    const g = await shared([a, b])
    await openOn(g)
    await type('#inpEditRmk', 'mine')
    await act(async () => { commitInput(live(g.iid), { ...draftOf(live(g.iid)), start: '2026-10-22', end: '' }, [a, b]); notify() })
    expect(day('2026-10-22') ? day('2026-10-22')!.className : $('#inpEditPop .rc-read')!.textContent, 'theirs, silently').toMatch(/ s|22 Oct|Oct 22/)
    await click($('#inpEditSave'))
    expect([live(g.iid).date, live(g.iid).remarks]).toEqual(['Oct 22', 'mine'])
    expect(inIt(g.iid)).toEqual([a, b])
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
    await openOn(g)
    expect($('#inpEditPop #inpEdCal')).toBeTruthy()
    expect($('#inpEditPop .inped-hint')!.textContent).not.toMatch(/delete it and add it again/i)
    await click(day('2026-10-14')); await click(day('2026-10-15'))
    await click($('#inpEditSave'))
    expect([live(g.iid).date, live(g.iid).endDate]).toEqual(['Oct 14', 'Oct 15'])
    expect(inIt(g.iid), 'both men, in the one commitment').toEqual(sans.slice(0, 2))
  })
})

/* THE TWO BLIND READS OF THE DATE DOOR (Astra and Sol 6.1, 9 Oct 26 — docs/superpowers/briefs/2026-10-09-shared-dates-read-*.md;
   the evidence sheet §12). Each case below was SEEN failing here before its fix. */
describe('the date door, after the two reads (9 Oct 26)', () => {
  const day = (iso: string) => $(`#inpEditPop #inpEdCal [data-cal="${iso}"]`)
  /* Astra A1: the same day and month in ANOTHER YEAR read as "no change" — the comparison was of the printed labels,
     which carry no year inside the loaded one — and Save said "Input updated" with nothing moved */
  it('moved by exactly a year: the input moves to the year picked — never "updated" with nothing changed', async () => {
    const g = await shared(others().slice(0, 2), { yr: 2027 })
    await openOn(g)
    for (let i = 0; i < 12; i++) await click($('#inpEditPop #inpEdCal [aria-label="Previous month"]'))
    await click(day('2026-10-13'))
    await click($('#inpEditSave'))
    expect([live(g.iid).date, live(g.iid).yr]).toEqual(['Oct 13', 2026])
    await act(async () => { undo(); notify() })
    expect([live(g.iid).date, live(g.iid).yr], 'one Undo').toEqual(['Oct 13', 2027])
  })
  /* Astra A2 = Sol 2: the men kept had their "till <last day>" word rewritten by the save, the man ADDED in the same
     save took the remark as typed — so one shared input came out as two entries, one of them with a stale last day.
     (One record cannot come out as two; what stays pinned is one input, three people, and the remark's new last day.) */
  for (const order of ['a man added, then new days', 'new days, then a man added'] as const) {
    it(`a remark that says "till 14 Oct"; ${order}: ONE input for all three, its remark saying the new last day`, async () => {
      const [a, b, c] = others()
      const g = await shared([a, b], { endDate: 'Oct 14', remarks: 'brief till 14 Oct' })
      await openOn(g)
      if (order.startsWith('a man')) await click(puckBtn(c))
      await click(day('2026-10-20')); await click(day('2026-10-21'))
      expect(($('#inpEditRmk') as HTMLInputElement).value, 'the picker never rewrites the remark').toBe('brief till 14 Oct')
      if (!order.startsWith('a man')) await click(puckBtn(c))
      await click($('#inpEditSave'))
      expect(live(g.iid).remarks).toBe('brief till 21 Oct')
      expect([live(g.iid).date, live(g.iid).endDate]).toEqual(['Oct 20', 'Oct 21'])
      expect(INPUTS.filter((r: any) => /^brief till/.test(String(r.remarks || ''))), 'one input, not two').toHaveLength(1)
      expect(inIt(g.iid), 'all three in it').toEqual([a, b, c])
      await act(async () => { undo(); notify() })
      expect([live(g.iid).date, live(g.iid).endDate, live(g.iid).remarks], 'one Undo').toEqual(['Oct 13', 'Oct 14', 'brief till 14 Oct'])
      expect(inIt(g.iid), 'and the man added is out again').toEqual([a, b])
    })
  }
  /* Astra A3: the calendar's month is seeded once, and it was seeded from the input the window held BEFORE */
  it('another shared input opened without closing the first: the calendar shows ITS month, and its first tap is a new start', async () => {
    const [a, b] = others()
    const g = await shared([a, b])
    const h = await shared([a, b], { date: 'Dec 10', remarks: 'december' })
    await openOn(g)
    await openOn(h)
    expect(day('2026-12-10'), 'December is on the calendar').toBeTruthy()
    expect(day('2026-12-10')!.className).toContain(' s')
    /* ...and after a half-made pick is thrown away for it */
    await act(async () => { setInpEdit(null); notify() })
    await openOn(g)
    await click(day('2026-10-20'))
    await openOn(h)
    await click(tid('inped-swap-go'))
    expect(day('2026-12-10'), 'December again').toBeTruthy()
    await click(day('2026-12-15'))
    await click($('#inpEditSave'))
    expect([live(h.iid).date, live(h.iid).endDate || ''], 'the first tap on the newly opened input began a NEW range').toEqual(['Dec 15', ''])
    expect(live(g.iid).date, 'and the first input is as it was').toBe('Oct 13')
  })
  /* THE QUESTION THAT STANDS BETWEEN THE TWO NAMES WHOSE INPUT WAS ASKED FOR — "Open Ace’s input and lose them?" — as it
     did for every saved input before the one-rule build, when the record carried `person`. An input filed since
     carries its people instead (D756), and the question must go on naming its man: never "the other’s input".
     (LEFT RED, 12 Oct 26, as the honest expectation: the app says "Open the other’s input" for every input in the new
     shape — ui/inputedit.tsx InputEditor, the `inped-swap` question, reads `swap.person`.) */
  it('another input asked for over unsaved changes: the question names whose it is — never "the other’s input"', async () => {
    const [a, b] = others()
    const g = await shared([a, b])
    const r = await single({ person: b, remarks: 'his own' })
    await openOn(g)
    await type('#inpEditRmk', 'typed, not saved')
    await openOn(r)
    expect(tid('inped-swap')!.textContent).toContain(`Open ${cs(b)}’s input and lose them?`)
    expect(tid('inped-swap')!.textContent).not.toMatch(/the other’s input/)
  })
  /* Astra A4: "Take theirs" put the saved start back but left the window waiting for an END */
  it('a new start tapped, the input moved behind the window, "Take theirs": the next tap is a NEW start again', async () => {
    const [a, b] = others()
    const g = await shared([a, b])
    await openOn(g)
    await click(day('2026-10-20'))
    await act(async () => { commitInput(live(g.iid), { ...draftOf(live(g.iid)), start: '2026-10-14', end: '' }, [a, b]); notify() })
    expect(tid('inped-clash'), 'changed both ways: it asks').toBeTruthy()
    await click(tid('inped-clash-theirs-start'))
    await click(day('2026-10-15'))
    await click($('#inpEditSave'))
    expect([live(g.iid).date, live(g.iid).endDate || '']).toEqual(['Oct 15', ''])
  })
  it('...and "Keep mine" keeps the start he tapped: the next tap is its end', async () => {
    const [a, b] = others()
    const g = await shared([a, b])
    await openOn(g)
    await click(day('2026-10-20'))
    await act(async () => { commitInput(live(g.iid), { ...draftOf(live(g.iid)), start: '2026-10-14', end: '' }, [a, b]); notify() })
    await click(tid('inped-clash-mine-start'))
    await click(day('2026-10-21'))
    await click($('#inpEditSave'))
    expect([live(g.iid).date, live(g.iid).endDate]).toEqual(['Oct 20', 'Oct 21'])
  })
  /* Sol 3: a first tap ON the saved day leaves the dates as they were, so a move made behind the window read as "he
     has not touched the dates" and replaced his start without a word — and the next tap finished THEIR range */
  it('the first tap is on the day it is already saved for, then the input is moved behind the window: it ASKS — his start is not replaced silently', async () => {
    const [a, b] = others()
    const g = await shared([a, b])
    await openOn(g)
    await click(day('2026-10-13'))
    await act(async () => { commitInput(live(g.iid), { ...draftOf(live(g.iid)), start: '2026-10-22', end: '' }, [a, b]); notify() })
    expect(tid('inped-clash'), 'a start he picked against a start changed behind him').toBeTruthy()
    await click(tid('inped-clash-mine-start'))
    await click(day('2026-10-16'))
    await click($('#inpEditSave'))
    expect([live(g.iid).date, live(g.iid).endDate]).toEqual(['Oct 13', 'Oct 16'])
  })
  /* Sol 1 (his ruling D682, 9 Oct 26: "the answer is written for everyone in it — a man's own earlier answer, a No
     included, is replaced"). A man is added, the sheet comes back for "X +2" and the filer answers — and the answer
     went on the ADDED man's record alone, while the sheet had asked about all of them.
     RE-EXPRESSED UNDER D762 AND D755 (1) (11 Oct 26). The two cases here added a man to a Saturday duty already answered
     and expected the question to come back ("a man added: asked again, once"), its answer then written on every record
     over "a man's own earlier answer". Both halves changed: someone added FOLLOWS the answer the input carries — nothing
     is asked for him where it is answered (D755 (1)) — and no man has an answer of his own to be replaced (D762). What
     D682 still says is the second case: whoever may change the input answers AGAIN, and the new answer is the input's
     one answer, for everyone in it. */
  const satDuty = async () => {
    const [b] = others()
    await openNew({ type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439 })
    await click(tid('pp-several')); await click(puckBtn(b))
    await type('#inpEditRmk', 'sat duty')
    await click($('#inpEditSave'))
    await click(tid('oil-yes')); await click(tid('oilconf-save'))
    return INPUTS.find((r: any) => r.remarks === 'sat duty') as any
  }
  it('a man added to a Saturday duty already answered: NOTHING is asked — he follows the input’s one answer (D755 (1), D762); one Undo takes him out', async () => {
    const [b, c] = others()
    const r = await satDuty()
    expect(r.oil).toEqual({ '2026-10-17': 1 })
    await openOn(r)
    await click(puckBtn(c))
    await click($('#inpEditSave'))
    expect($$('[data-testid="oilconf"]'), 'answered already: no question for the man added').toHaveLength(0)
    expect(win(), 'saved').toBeNull()
    expect(inIt(r.iid)).toEqual([admin, b, c])
    expect(live(r.iid).oil, 'the one answer, his too').toEqual({ '2026-10-17': 1 })
    expect(live(r.iid).people.every((e: any) => e.oil === undefined), 'nothing is written for him').toBe(true)
    await act(async () => { undo(); notify() })
    expect(inIt(r.iid), 'one Undo: the man gone').toEqual([admin, b])
    expect(live(r.iid).oil, 'and the answer as it was').toEqual({ '2026-10-17': 1 })
  })
  for (const fresh of ['No', 'Yes'] as const) {
    it(`a Saturday duty for two answered ${fresh === 'No' ? 'Yes' : 'No'}; the filer answers again, ${fresh}: the new answer is the input’s one answer, for everyone in it (D682, D762) — one Undo`, async () => {
      const r = await satDuty()
      const was = fresh === 'No' ? 1 : 0
      if (was === 0) await act(async () => { writeInputs(() => { live(r.iid).oil = { '2026-10-17': 0 } }); notify() })
      await openOn(r)
      await click(tid('oil-revise'))
      expect($$('[data-testid="oilconf"]'), 'the question, once').toHaveLength(1)
      expect(tid('oilconf')!.textContent, 'asked for all of them').toContain(`${cs(firstAZ(inIt(r.iid)))} +1`)
      await click(tid(fresh === 'Yes' ? 'oil-yes' : 'oil-no')); await click(tid('oilconf-save'))
      expect(INPUTS.filter((x: any) => x.remarks === 'sat duty')).toHaveLength(1)
      expect(live(r.iid).oil['2026-10-17']).toBe(fresh === 'Yes' ? 1 : 0)
      await act(async () => { undo(); notify() })
      expect(live(r.iid).oil['2026-10-17'], 'one Undo: the earlier answer back').toBe(was)
    })
  }
  /* two cases both readers asked the host to RUN and expected to hold — they do */
  it('a range across the year’s end: the input — both men — on the days picked, the new year kept', async () => {
    const g = await shared(others().slice(0, 2), { date: 'Dec 29' })
    await openOn(g)
    await click(day('2026-12-30'))
    await click($('#inpEditPop #inpEdCal [aria-label="Next month"]'))
    await click(day('2027-01-01'))
    await click($('#inpEditSave'))
    expect([live(g.iid).date, live(g.iid).endDate]).toEqual(['Dec 30', 'Jan 1 2027'])
    expect(inIt(g.iid)).toEqual(g.people)
    await openOn(g)
    expect($('#inpEditPop .rc-read')!.textContent, 'reopened: the same days').toMatch(/Dec 30.*Jan 1/)
  })
  it('a Saturday duty answered Yes, moved to a Tuesday: nothing is asked and no answer for the Saturday is left to earn', async () => {
    const g = await shared(others().slice(0, 2), { type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439, oil: { '2026-10-17': 1 } })
    await openOn(g)
    await click(day('2026-10-20'))
    await click($('#inpEditSave'))
    expect($$('[data-testid="oilconf"]')).toHaveLength(0)
    expect(live(g.iid).date).toBe('Oct 20')
    expect(inIt(g.iid)).toEqual(g.people)
    /* the old answer stays written against its own date, and a Tuesday has no day to earn on: nothing is credited */
    expect(oilAnswered(live(g.iid)), 'the input has nothing that earns — for either man').toBe(false)
  })
  /* RESTATED (D729 — V3): the paragraph that said the one-day way ("for one day, tap that day and Save") is gone; the
     LINE UNDER THE CALENDAR says what a Save will write, and says one day as one day */
  it('one tap for one day: the line under the calendar says that day alone, and the paragraph is not there to say it', async () => {
    const g = await shared(others().slice(0, 2))
    await openOn(g)
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
  it('the board’s dialog on a shared input: no date calendar — the dates are changed on the Inputs page', async () => {
    const g = await shared(others().slice(0, 3))
    await act(async () => { setPage('editsched'); notify() })
    await openOn(g)
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
    expect(inIt(r.iid), 'still an ordinary input, of one').toHaveLength(1)
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
  /* A RECORD STORED BEFORE THE ONE-RULE BUILD — one `person`, no list — is read, for ever, as the one-person input it
     always was (D756; D759 reading 10 — nothing stored is converted), and is written with its list the first time a
     save changes it. Every other one-person case of this file files the shape the app writes now. */
  it('OLD SHAPE: a record with `person` and no list opens as that man’s input, and a save of its dates keeps it his', async () => {
    const who = others()[0]
    await act(async () => { writeInputs(() => { INPUTS.push({ iid: 'old1', person: who, type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'old', mod: '2026-09-01' }) }); notify() })
    await openOn({ iid: 'old1' })
    expect(win()!.textContent).toContain(cs(who))
    expect(($('#inpEditPerson') as HTMLSelectElement).value).toBe(who)
    await click(day('2026-10-20'))
    await click($('#inpEditSave'))
    expect(win(), 'saved').toBeNull()
    expect([live('old1').date, live('old1').endDate || '']).toEqual(['Oct 20', ''])
    expect(inIt('old1'), 'still his, and his alone').toEqual([who])
  })
  /* …and two old records that still carry one group id are NOT joined any more: each is its own one-person input, its
     own window (D759 reading 10 — stored data only, D56) */
  it('OLD SHAPE: two records of an old group filing are each a one-person input — the window on one holds that man alone', async () => {
    const [a, b] = others()
    await act(async () => { writeInputs(() => { INPUTS.push(
      { iid: 'oldg-0', person: a, type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'old group', mod: '2026-09-01', grp: 'oldg', grpBy: admin, by: admin, at: T0 },
      { iid: 'oldg-1', person: b, type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'old group', mod: '2026-09-01', grp: 'oldg', grpBy: admin, by: admin, at: T0 }) }); notify() })
    await openOn({ iid: 'oldg-1' })
    expect(win()!.textContent).toContain(cs(b))
    expect(win()!.textContent, 'no "+1": it is one man’s').not.toMatch(/\+\d/)
    expect(($('#inpEditPerson') as HTMLSelectElement).value, 'the one-person list, on him').toBe(b)
    await type('#inpEditRmk', 'his alone')
    await click($('#inpEditSave'))
    expect([live('oldg-0').remarks, live('oldg-1').remarks], 'the other man’s is not touched').toEqual(['old group', 'his alone'])
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
     unanswered, and names who.
     RETIRED BY D762 (11 Oct 26), AND WHAT IS PINNED IN ITS PLACE: "one man has answered and another has not" cannot be
     stored — the question has ONE answer, the input's, and no man answers from his own bell. The window's line is the
     input's: while nobody has answered it says so and names NO man (there is nobody's own answer to be missing), and
     the one "Answer…" writes the one answer, for everyone in it. */
  it('a shared input nobody has answered: the window says "Not answered yet" for the INPUT, naming no man, and its answer is everyone’s (D762)', async () => {
    const [a, b] = others()
    const g = await shared([a, b], { type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439 })
    await openOn(g)
    const line = tid('oil-unanswered')
    expect(line).toBeTruthy()
    expect(line!.textContent).toMatch(/Not answered yet — 17 Oct/)
    expect(line!.textContent, 'no man is named: the answer is the input’s').not.toContain(cs(a))
    expect(line!.textContent).not.toContain(cs(b))
    expect($('#inpEditPop')!.textContent, 'and "Your OIL" is gone from the window').not.toMatch(/Your OIL/i)
    await click(tid('oil-answer'))
    expect($$('[data-testid="oilconf"]')).toHaveLength(1)
    expect(tid('oilconf')!.textContent, 'asked for both').toContain(`${cs(firstAZ([a, b]))} +1`)
    await click(tid('oil-yes')); await click(tid('oilconf-save'))
    expect(live(g.iid).oil).toEqual({ '2026-10-17': 1 })
    expect(inIt(g.iid)).toEqual([a, b])
    await openOn(g)
    expect(tid('oil-revise'), 'answered: Change…').toBeTruthy()
    expect(tid('oil-unanswered')).toBeNull()
  })
  /* …and a man IN it who did not file it reads that line and has no button on it: no answer of his own (D762), only
     "Take me out" (D755 (3)) */
  it('a man in a shared input he did not file: he reads its OIL line, and has no "Answer…" / "Change…" — only "Take me out" (D762)', async () => {
    const [a] = others()
    const g = await shared([a, member], { type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439 })
    const h = await shared([a, member], { type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439, oil: { '2026-10-17': 1 }, remarks: 'answered' })
    await as('member')
    await openOn(g)
    expect(tid('oil-unanswered')!.textContent).toMatch(/Not answered yet — 17 Oct/)
    expect(tid('oil-answer')).toBeNull()
    expect(tid('inped-takeout')).toBeTruthy()
    await act(async () => { setInpEdit(null); notify() })
    await openOn(h)
    expect($('#inpEditPop .inped-oilsum')!.textContent).toBe('credited on its non-working day')
    expect(tid('oil-revise')).toBeNull()
    expect($('#inpEditPop')!.textContent).not.toMatch(/Your OIL/i)
    expect(tid('inped-takeout')).toBeTruthy()
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
    const had = new Set(INPUTS.map((r: any) => r.iid))
    await click($('#inpEditSave'))
    /* ONE record for both (D756) — it was two tied by a group id, found by that id */
    const made = INPUTS.filter((r: any) => !had.has(r.iid)) as any[]
    expect(made, 'one commitment').toHaveLength(1)
    expect([made[0].type, made[0].date]).toEqual(['SANS Availability', 'Oct 14'])
    expect(idsOf(made[0]).map(String).sort()).toEqual([x, y].sort())
    expect(made[0].sans && made[0].sans.f, 'the ticks are the commitment’s — every man’s alike').toBeTruthy()
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

/* THE DIALOG OPENED FROM A SHARED INPUT'S ROW ON THE SCHEDULE IS THE ENTRY'S (`[GROUP-INPUT-ONE-ROW]` step 5; owner D661 —
   "on the schedule a group input is ONE row holding everyone", D734 — "the same as doing it in the input's own window",
   D739 — a change made on its row "changes the input itself, for everyone in it"; the plan
   docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md §4.5: "the dialog opened from the row or the line is
   the entry's throughout"). The schedule draws ONE row; the dialog a tap on it opened held ONE man's record and saved
   one — a remark changed there left that man standing as his own row (the re-walk's picture G5b). Its dates stay not
   editable there, as for every dialog the schedule opens: a moved span would take the row off the day it was opened
   from. */
describe('the schedule’s dialog on a shared input holds the ENTRY — as its window on the Inputs page does', () => {
  const sched = async () => act(async () => { setPage('editsched'); notify() })
  it('every man of it is lit; a remark changed there and Saved is the input’s, for EVERY man — one Undo; nobody stands apart', async () => {
    const g = await shared(others().slice(0, 3))
    await sched()
    await openOn(g)
    expect(win(), 'the blocking dialog, not the Inputs page’s window').toBeNull()
    expect(lit().sort(), 'the people of the input').toEqual([...g.people].sort())
    await type('#inpEditRmk', 'bring ID')
    await click($('#inpEditSave'))
    expect(live(g.iid).remarks).toBe('bring ID')
    expect(inIt(g.iid), 'still one shared input, all three in it').toEqual(g.people)
    expect(INPUTS.filter((r: any) => r.remarks === 'bring ID' || r.remarks === 'brief'), 'nobody stands apart as a record of his own').toHaveLength(1)
    await act(async () => { undo() })
    expect(live(g.iid).remarks, 'ONE Undo').toBe('brief')
  })
  it('a man un-picked there leaves the input; Delete asks "for all" and takes the whole input', async () => {
    const g = await shared(others().slice(0, 3))
    await sched()
    await openOn(g)
    await click(puckBtn(g.people[2]))
    await click($('#inpEditSave'))
    expect(inIt(g.iid)).toEqual([g.people[0], g.people[1]])
    await openOn(g)
    await click($('#inpEditDel'))
    expect(tid('inped-delall')!.textContent).toMatch(/for all 2 people/)
    await click(tid('inped-delall-yes'))
    expect(live(g.iid), 'the whole input is gone').toBeUndefined()
  })
  it('no date calendar there, still — the line says where the dates are changed', async () => {
    const g = await shared(others().slice(0, 2))
    await sched()
    await openOn(g)
    expect($('#inpEditPop #inpEdCal')).toBeNull()
    expect($('#inpEditPop .inped-hint')!.textContent).toMatch(/dates are changed on the Inputs page/i)
  })
  it('THE CONTROL — a one-man input’s dialog there is the one Person list it was', async () => {
    const r = await single()
    await sched()
    await openOn(r)
    expect($('#inpEditPerson')).toBeTruthy()
    expect($('#inpEditPop [data-testid="pp"]')).toBeNull()
  })
})

/* THE OIL QUESTION FOR A MAN ADDED FROM THE SCHEDULE, WHERE THE INPUT'S ANSWERS DIFFER (owner D744, 11 Oct 26 — "If an
   input has multiple people and different answers for OIL. Any subsequent addition the OIL earned question will be
   asked"; the plan §4.5). The door (ui/grouprow.ts groupPut) hands the editor HIS record with the question marked as
   his own: the sheet opens on him, the answer is written on HIS record alone — nobody else's is touched (it is not
   D682's answer-for-everyone, though an admin gives it) — and the dialog closes with the sheet, answered or not:
   whoever added him was on the schedule, not in the input's window.

   RE-EXPRESSED UNDER D762 AND D755 (1) (11 Oct 26; the one-rule plan §4.4 "OIL at the add"). D744 has nothing left to
   ask: the people of one input cannot carry different answers, so there is no question "for one man alone" and no
   record of his to write it on. What the schedule's door does now (ui/reqdoor.ts afterPut): the person added follows
   the input's one answer — nothing is asked where there is one — and where the input has NO answer the question opens
   at once, for the INPUT, for whoever added him. `ask` below is that door's own call (askOilIfPending). What has not
   changed is where the scheduler was standing: on the schedule, not in the input's window — the dialog closes with
   the sheet, answered or not. */
describe('the OIL question opened from the schedule is the INPUT’s, asked where it has no answer (D755 (1), D762 — it was "for one man alone", D744)', () => {
  const SAT = { type: 'Duty', date: 'Oct 17', yr: 2026, allday: false, s: 600, e: 660 }
  const ask = async (g: any) => { let asked = false; await act(async () => { setPage('editsched'); notify() }); await act(async () => { asked = askOilIfPending(live(g.iid), true); notify() }); return asked }
  it('nobody has answered: the question is up at once, headed for everyone in it; Yes is the input’s one answer; the dialog has closed', async () => {
    const g = await shared(others().slice(0, 3), SAT)
    expect(await ask(g)).toBe(true)
    expect(tid('oilconf'), 'the question is up at once').toBeTruthy()
    expect(tid('oilconf')!.textContent, 'headed for the input — "X +2", no one man’s question').toContain(`${cs(firstAZ(g.people))} +2`)
    await click(tid('oil-yes'))
    await click(tid('oilconf-save'))
    expect(live(g.iid).oil, 'one answer, on the input').toEqual({ '2026-10-17': 0.5 })
    expect(live(g.iid).people.every((e: any) => e.oil === undefined), 'nothing is written on any one man').toBe(true)
    expect(inIt(g.iid)).toEqual(g.people)
    expect($('#inpEditPop')!.hidden, 'the dialog closed with the answer').toBe(true)
  })
  it('the question closed without an answer: the input is left unanswered, for its filer’s bell — and the dialog closes too', async () => {
    const g = await shared(others().slice(0, 3), SAT)
    expect(await ask(g)).toBe(true)
    await click($('[data-testid="oilconf"] .airpop-head .x'))
    expect(live(g.iid).oil).toBeUndefined()
    expect($('#inpEditPop')!.hidden).toBe(true)
  })
  it('the input is answered already — Yes or No: nothing is asked of whoever added a man, and no dialog opens (D755 (1))', async () => {
    for (const v of [0.5, 0]) {
      const g = await shared(others().slice(0, 3), { ...SAT, oil: { '2026-10-17': v } })
      expect(await ask(g), `answered ${v}`).toBe(false)
      expect($$('[data-testid="oilconf"]')).toHaveLength(0)
      expect($('#inpEditPop')!.hidden).toBe(true)
    }
  })
})

// @vitest-environment jsdom
/* AN INPUT FILED FOR "ALL AVAIL" / "ALL" — EVERY DOOR THAT CAN WRITE ONE, AND EVERY DOOR THAT MUST REFUSE
   (`[INPUT-ALL-AVAIL]`; owner D700, D702, D711, D712, D713 — 9 Oct 26; the plan §3.2–§3.4:
   docs/superpowers/plans/2026-10-09-input-all-avail-plan.md).

   Both first-round readers of the plan found the same hole: the three rules — one of six kinds, one day, never in a
   group — were checked in the editor and nowhere else, so the List's own Add form (which builds its record by hand),
   the group save, an admin, the test bridge and a restore could each write what the picker would not offer. So the
   rules are held twice: by ONE sentence at every door (said where he pressed, the window kept open), and by ONE hard
   check at the save boundary on what the command really changed, whoever ran it. Each door is pressed here, and after
   every refusal the inputs, the change history and the Undo list are exactly as they were.

   RE-EXPRESSED FOR STEP 3 OF THE ONE-RULE BUILD (12 Oct 26 — the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md
   §4.1, §4.4, §4.5). Of "the three rules" above, TWO STAND and ONE IS GONE:
     · one of six kinds, one day — the rules survive (D753: "offered only where the input is a single day"; its reading
       3: "the same six kinds"); only their words changed, to the plan's shorter ones (D726);
     · "never in a group" — ended by owner D750 ("'Several people' takes ALL AVAIL / ALL, so the puck is one of the
       input's own people and is tied to no man"), D753 ("an input takes ALL or ALL AVAIL, never both") and D755 ("whoever
       stands on it — a named person or ALL AVAIL / ALL … — is in the input"). Every case that pinned the refusal "ALL
       AVAIL is filed on its own — it already stands for whoever is free" now pins what those rulings say instead, and
       says so above itself.
   Each re-expressed case names which it is. The builder's own cases for the new rule are ui/phmember.test.tsx (the row's
   door, the writer) and ui/phpick.test.tsx (the picker by itself); the cases ADDED here are the ones those do not ask —
   the input's own WINDOW, opened, pressed and saved, by an admin, by its member filer, by a member who is only in it
   and by one who is not. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor, commitInput, commitInputEdit, commitNewInput, draftOf, inputWho, normalizeInputDraft, reassignInput } from './inputedit'
import { accCtl } from './html'
import { pickProblem } from './PeoplePick'
import { EVERYONE, everyoneIn, monthItems } from './inputscal-model'
import { initStore, notify, setSession, undo, redo, writeInputs } from '../state/store'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { setMe } from '../state/auth'
import { me, mayEditInput, mayDeleteInput, mayFileInputFor } from '../state/perms'
import { setMembersFile } from '../state/memberfile'
import { INPUTS, PLACEHOLDER_KINDS, INPUT_TYPES, idsOf, namedOf, holds } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { acceptInput } from '../engine/slots'
import { dayAway } from '../engine/avail'
import { HOOKS, storeBackend } from '../engine/hooks'
import { ELOG } from '../engine/editlog'
import { HIST } from '../state/history'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { oilPendingFor } from '../leavewar/sync'
import { _resetFloatWins } from './FloatWindow'
import { setInpEdit } from './pops'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const said: string[] = []
const realToast = HOOKS.toast
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const tid = (id: string) => $(`#inpEditPop [data-testid="${id}"]`) || $(`[data-testid="${id}"]`)
const win = () => tid('win-inputedit')
const crew = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers)
/* who is signed in: the admin Saber (`stiff`) or the member Ranger (`bane`) */
const admin = 'stiff', member = 'bane'
const others = () => crew().filter(id => id !== admin && id !== member)
const live = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
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
const optionsOf = (sel: string) => [...(($(sel) as HTMLSelectElement | null)?.options || [])].map(o => o.value)
const openOn = async (r: any) => act(async () => { setInpEdit(live(r.iid)); notify() })
/* Tue 13 Oct 2026 — a working day, so no OIL question; Sat 17 Oct 2026 for the ones that ask */
const openNew = async (over: any = {}) => act(async () => {
  setInpEdit({ _new: true, _calendar: true, _ctx: 'i', person: me(), type: 'Meeting', date: 'Oct 13', allday: false, s: 600, e: 660, ...over }); notify()
})
const as = async (who: 'admin' | 'member') => act(async () => {
  if (who === 'admin') { setSession({ user: admin, role: 'admin' }); setMe(admin) } else { setSession({ user: member, role: 'main' }); setMe(member) }
  notify()
})
let n = 0
/* a placeholder input as the app keeps it, put in through the app's own write */
const filed = async (over: any = {}) => {
  const row = { iid: 'ph' + (++n), person: 'allavail', by: admin, at: '2026-09-01T08:00:00.000Z', type: 'Meeting', date: 'Oct 13', yr: 2026,
    allday: false, s: 600, e: 660, remarks: 'all hands', mod: '2026-09-01', ...over }
  let ok = false
  await act(async () => { ok = writeInputs(() => { INPUTS.push(row) }); notify() })
  expect(ok, 'the fixture itself is a legal record').toBe(true)
  return live(row.iid)
}
/* the world a refused save must leave exactly as it was */
const world = () => JSON.stringify({ i: INPUTS, log: ELOG.rows.length, undo: [HIST.stack.length, HIST.ix] })

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

describe('D700 — choosing it: the two entries in the one-person list', () => {
  it('an admin, for an allowed kind: ALL AVAIL and ALL under "Whoever is free that day"', async () => {
    await openNew()
    const grp = $('#inpEditPerson optgroup[data-ph]') as HTMLOptGroupElement
    expect(grp, 'the heading').toBeTruthy()
    expect(grp.label).toBe('Whoever is free that day')
    expect([...grp.querySelectorAll('option')].map(o => [o.getAttribute('value'), o.textContent])).toEqual([['allavail', 'ALL AVAIL'], ['all', 'ALL']])
  })

  it('offered for each of the six kinds and for no other', async () => {
    await openNew()
    for (const t of INPUT_TYPES.filter((x: string) => x !== 'SANS Availability')) {
      await choose('#inpEditType', t)
      expect(optionsOf('#inpEditPerson').includes('allavail'), t).toBe(PLACEHOLDER_KINDS.includes(t))
      expect(optionsOf('#inpEditPerson').includes('all'), t).toBe(PLACEHOLDER_KINDS.includes(t))
    }
  })

  /* A RULING CHANGED THIS RULE (owner D750, D753 — step 3; the plan §4.5 "The picker"). The case was '"Several people"
     never offers a placeholder puck', and it went on passing after the build only because it looked for a puck marked
     as a PERSON's (`data-pp`). D750: "'Several people' takes ALL AVAIL / ALL". The two ARE offered now, in the window
     itself — as pucks of their own (`data-ph`) under the same heading as the one-person list's, above the groups;
     never among the people's pucks, so "All" on a heading and a drag across the people (D685) cannot sweep one up. */
  it('"Several people" offers both as pucks of their own, above the groups — never among the people\'s pucks (D750, D753)', async () => {
    await openNew()
    await click(tid('pp-several'))
    const grp = $('#inpEditPop [data-ppgroup="ph"]')!
    expect(grp, 'a group of their own').toBeTruthy()
    expect(grp.querySelector('b')!.textContent).toBe('Whoever is free that day')
    expect([...grp.querySelectorAll('[data-ph]')].map(b => [b.getAttribute('data-ph'), b.getAttribute('aria-label'), (b as HTMLButtonElement).disabled]))
      .toEqual([['allavail', 'ALL AVAIL', false], ['all', 'ALL', false]])
    expect(grp.compareDocumentPosition($('#inpEditPop [data-ppgroup="pilots"]')!) & Node.DOCUMENT_POSITION_FOLLOWING, 'before Pilots').toBeTruthy()
    expect($('#inpEditPop [data-pp="allavail"]'), 'not a person\'s puck').toBeNull()
    expect($('#inpEditPop [data-pp="all"]')).toBeNull()
    expect(tid('pp-phwhy'), 'a one-day Meeting may hold one: nothing to say').toBeNull()
  })

  /* ADDED FOR STEP 3 (D753 reading 3 — the same six kinds; the plan §4.5: "where it is not, the two are shown greyed with
     the reason under them"): asked of every kind the window offers, in "Several people" as the one-person list is above */
  it('…live for each of the six kinds, greyed with the reason for every other kind that may be filed for several', async () => {
    await openNew()
    await click(tid('pp-several'))
    const ph = (id: string) => $(`#inpEditPop [data-ph="${id}"]`) as HTMLButtonElement | null
    for (const t of INPUT_TYPES.filter((x: string) => x !== 'SANS Availability')) {
      await choose('#inpEditType', t)
      if (!ph('allavail')) continue        // a kind with no "Several people" at all (a medical entry, an upchit): nothing to grey
      const ok = PLACEHOLDER_KINDS.includes(t)
      expect(ph('allavail')!.disabled, t).toBe(!ok)
      expect(ph('all')!.disabled, t).toBe(!ok)
      expect(tid('pp-phwhy')?.textContent ?? '', t).toBe(ok ? '' : 'ALL AVAIL is for Training, Meeting, Appointment, Duty, Event and Other')
    }
  })

  it('a member, the members\' switch ON: offered (D702 — "members can choose too"); switch OFF: not offered', async () => {
    await as('member')
    await openNew()
    expect(optionsOf('#inpEditPerson')).toEqual(expect.arrayContaining(['allavail', 'all']))
    await act(async () => { setInpEdit(null); notify() })
    await as('admin'); await act(async () => { setMembersFile(false); notify() }); await as('member')
    await openNew()
    expect($('#inpEditPerson'), 'with the switch off a member picks nobody but himself').toBeNull()
    expect(mayFileInputFor('allavail', 'Meeting')).toBe(false)
  })
})

describe('filing it — one ordinary input, nobody\'s name copied in', () => {
  for (const ph of ['allavail', 'all']) {
    it(`an admin files a Meeting for ${PEOPLE[ph].cs}: ONE record, no group, he its filer; Undo takes it back, Redo returns it`, async () => {
      const before = INPUTS.length
      await openNew()
      await choose('#inpEditPerson', ph)
      await type('#inpEditRmk', 'whole sqn')
      await click($('#inpEditSave'))
      expect(win(), 'saved: the window has closed').toBeNull()
      const made = INPUTS.filter((r: any) => r.remarks === 'whole sqn') as any[]
      expect(made).toHaveLength(1)
      /* THE ONE RECORD (owner D756 — the one-rule build, step 2): a new input is written with its list of people, and
         an input for a placeholder is ONE record whose list is the placeholder alone */
      expect(idsOf(made[0])).toEqual([ph])
      expect(made[0].grp).toBeUndefined()
      expect(made[0].grpBy).toBeUndefined()
      expect(String(made[0].by), 'who placed it').toBe(admin)
      expect(made[0].endDate).toBeUndefined()
      /* nobody's name is copied in (D702): the record's own list (`people`, D756) names no real person, and it keeps
         no other list of who stands behind it */
      expect(namedOf(made[0]), 'no name is stored in its list').toEqual([])
      expect(Object.keys(made[0]).some(k => /names|crowd/i.test(k)), 'no list of names is stored').toBe(false)
      expect(ELOG.rows.some(x => x.iid === made[0].iid), 'its line in the change history').toBe(true)
      await act(async () => { undo(); notify() })
      expect(INPUTS.length, 'one Undo step').toBe(before)
      await act(async () => { redo(); notify() })
      expect(INPUTS.filter((r: any) => r.remarks === 'whole sqn' && holds(r, ph))).toHaveLength(1)
    })
  }

  it('a member files one (the switch on); it is his to change and delete, and nobody else\'s but an admin\'s', async () => {
    await as('member')
    await openNew()
    await choose('#inpEditPerson', 'allavail')
    await type('#inpEditRmk', 'flight social')
    await click($('#inpEditSave'))
    const made = INPUTS.find((r: any) => r.remarks === 'flight social') as any
    expect(made, said.join(' | ')).toBeTruthy()
    expect(String(made.by)).toBe(member)
    expect(mayEditInput(made)).toBe(true)
    expect(mayDeleteInput(made)).toBe(true)
    await act(async () => { setSession({ user: others()[0], role: 'main' }); setMe(others()[0]); notify() })
    expect(mayEditInput(made), 'another member: read only').toBe(false)
    expect(mayDeleteInput(made)).toBe(false)
    await as('admin')
    expect(mayEditInput(made)).toBe(true)
  })

  it('the switch turned off AFTER he filed it: his right over it goes with the switch (the plan §3.4)', async () => {
    const r = await filed({ by: member })
    await as('member')
    expect(mayEditInput(live(r.iid))).toBe(true)
    await as('admin'); await act(async () => { setMembersFile(false); notify() }); await as('member')
    expect(mayEditInput(live(r.iid))).toBe(false)
    expect(mayDeleteInput(live(r.iid))).toBe(false)
  })
})

describe('read only — walker A\u2019s finds (9 Oct 26)', () => {
  it('another member opens it: the line names WHO FILED it — never "Only ALL AVAIL …", a puck that is nobody', async () => {
    const r = await filed({ by: admin })
    await as('member')
    await openOn(r)
    expect($('#inpEditSave'), 'read only').toBeNull()
    const ro = tid('inped-ro')?.textContent || ''
    expect(ro).toContain(`Only ${PEOPLE[admin].cs} — who filed it — or an admin can change this`)
    expect(ro).not.toContain('Only ALL AVAIL')
  })

  /* SOL'S READ OF THE CODE (9 Oct 26): W5 fixed the editor's line and missed the keyboard's — Delete on the opened
     day's card told another member "Only ALL AVAIL or an admin can delete this input" */
  for (const ph of ['allavail', 'all']) for (const keyName of ['Delete', 'Backspace']) {
    it(`another member presses ${keyName} on ${ph}'s card in the opened day: refused, naming WHO FILED it — nothing is deleted`, async () => {
      const r = await filed({ person: ph, by: admin })
      await as('member')
      await act(async () => { $('#inpCal [data-icday="2026-10-13"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })) })
      const btn = $$('[data-testid="idy-open"]').find(b => (b.getAttribute('aria-label') || '').startsWith(PEOPLE[ph].cs + ',')) as HTMLElement | undefined
      expect(btn, 'the card’s own button in the opened day').toBeTruthy()
      const was = world(); said.length = 0
      await act(async () => { btn!.focus(); btn!.dispatchEvent(new KeyboardEvent('keydown', { key: keyName, bubbles: true })) })
      expect(world()).toBe(was)
      expect(said.join(' | ')).toContain(`Only ${PEOPLE[admin].cs} — who filed it — or an admin can delete this input`)
      expect(said.join(' | ')).not.toMatch(/Only ALL( AVAIL)? or an admin/)
    })
  }

  it('its member filer, the members\u2019 switch since turned off: read only, and NO dead "File it for me only" press', async () => {
    const r = await filed({ by: member })
    await act(async () => { setMembersFile(false); notify() })
    await as('member')
    await openOn(r)
    expect($('#inpEditSave')).toBeNull()
    expect(tid('pp-fix'), 'a press that could do nothing is not drawn').toBeNull()
    expect(tid('inped-ro')?.textContent || '').not.toContain('Only ALL AVAIL')
  })
})

/* THE RULE SURVIVES in every case of this describe (D711 (2), D712, D713; kept by D753 reading 3); step 3 changed only its
   WORDS — "ALL AVAIL can be filed only for Training, Meeting, Appointment, Duty, Event or Other" is the plan's "ALL AVAIL
   is for Training, Meeting, Appointment, Duty, Event and Other" (§4.4; D726). The sentence is pinned whole and said
   ONCE, so a door that began to say two things would go red. */
const KIND_WHY = (cs: string) => `${cs} is for Training, Meeting, Appointment, Duty, Event and Other`
describe('D711 (2), D712 — a kind that is not allowed is refused, with its sentence, and nothing is saved', () => {
  it('the picker says why the moment the kind changes; Save refuses; what he picked is never substituted', async () => {
    await openNew()
    await choose('#inpEditPerson', 'allavail')
    await choose('#inpEditType', 'OD')
    expect(($('#inpEditPerson') as HTMLSelectElement).value, 'ALL AVAIL stays shown').toBe('allavail')
    expect(tid('pp-why')?.querySelector('span')?.textContent).toBe(KIND_WHY('ALL AVAIL'))
    expect(tid('pp-fix'), 'an ADMIN is offered no "file it for me" — he picks the name it is for').toBeNull()
    const was = world()
    await click($('#inpEditSave'))
    expect(said).toEqual([KIND_WHY('ALL AVAIL')])
    expect(world()).toBe(was)
    expect(win(), 'the window stays, nothing typed is lost').toBeTruthy()
  })

  it('a MEMBER is offered the one press — "File it for me only" — and it files nothing by itself', async () => {
    await as('member')
    await openNew()
    await choose('#inpEditPerson', 'allavail')
    await choose('#inpEditType', 'OD')
    expect(tid('pp-why')?.querySelector('span')?.textContent).toBe(KIND_WHY('ALL AVAIL'))
    expect(tid('pp-fix')?.textContent).toBe('File it for me only')
    const was = world()
    await click(tid('pp-fix'))
    expect(world(), 'the press changes the pick, never the records').toBe(was)
    expect(tid('pp-why')).toBeNull()
  })

  it('a medical kind is refused BEFORE the document question is ever asked', async () => {
    await openNew()
    await choose('#inpEditPerson', 'all')
    await choose('#inpEditType', 'OML')
    const was = world()
    await click($('#inpEditSave'))
    expect(said).toEqual([KIND_WHY('ALL')])
    expect(document.body.textContent || '', 'no document prompt came up').not.toContain('No document')
    expect(world()).toBe(was)
  })

  /* ADDED FOR STEP 3 — the same rule where the placeholder is ONE OF SEVERAL (D755 (4): "ALL AVAIL on an input … of
     another kind" is refused with the reason; the plan §4.5). The kind changed UNDER a pick of two people and ALL AVAIL:
     nothing is substituted — it stays lit — the one line says why, Save refuses with the same sentence, and the one
     press takes the PLACEHOLDER out and leaves the people, who may be filed an overseas duty together. */
  it('the kind changed under two people and ALL AVAIL: it stays lit, the line says why, Save refuses — and "Take ALL AVAIL out" leaves a save that goes through', async () => {
    const [a, b] = [others()[0], others()[1]]
    await openNew({ person: a })
    await click(tid('pp-several'))
    await click($(`#inpEditPop [data-pp="${b}"]`))
    await click($('#inpEditPop [data-ph="allavail"]'))
    expect(tid('pp-count')?.textContent).toBe('2 picked + ALL AVAIL')
    await choose('#inpEditType', 'OD')
    expect($('#inpEditPop [data-ph="allavail"]')!.getAttribute('aria-pressed'), 'nothing is substituted for what he picked').toBe('true')
    expect(($('#inpEditPop [data-ph="allavail"]') as HTMLButtonElement).disabled, 'and it can still be let go by its own press').toBe(false)
    expect(tid('pp-why')?.querySelector('span')?.textContent).toBe(KIND_WHY('ALL AVAIL'))
    expect(tid('pp-phwhy'), 'said once, not twice').toBeNull()
    expect(tid('pp-fix')?.textContent).toBe('Take ALL AVAIL out')
    const was = world()
    await click($('#inpEditSave'))
    expect(said).toEqual([KIND_WHY('ALL AVAIL')])
    expect(world(), 'nothing was filed — not even for the two people').toBe(was)
    expect(win()).toBeTruthy()
    await click(tid('pp-fix'))
    expect(tid('pp-why')).toBeNull()
    expect(tid('pp-count')?.textContent).toBe('2 picked')
    expect(tid('pp-phwhy')?.textContent, 'the two pucks are greyed now, with the reason under them').toBe(KIND_WHY('ALL AVAIL'))
    const before = INPUTS.length; said.length = 0
    await click($('#inpEditSave'))
    expect(INPUTS.length, said.join(' | ')).toBe(before + 1)
    const made = INPUTS.find((r: any) => r.type === 'OD' && holds(r, a)) as any
    expect(idsOf(made)).toEqual([a, b])
  })

  it('every refused kind, by a hand-made save: commitNewInput and commitInputEdit each refuse with the sentence', async () => {
    const r = await filed()
    for (const t of INPUT_TYPES.filter((x: string) => !PLACEHOLDER_KINDS.includes(x))) {
      const was = world(); said.length = 0
      let ok = true
      await act(async () => { ok = commitNewInput({ ...draftOf(r), type: t, person: 'allavail', sans: { f: true } }) })
      expect(ok, `new · ${t}`).toBe(false)
      await act(async () => { ok = !!commitInputEdit(live(r.iid), { ...draftOf(live(r.iid)), type: t, sans: { f: true } }) })
      expect(ok, `edit · ${t}`).toBe(false)
      expect(world(), t).toBe(was)
      expect(said.length, `${t}: a reason was given`).toBeGreaterThan(0)
    }
  })
})

describe('the editor\u2019s one body asks the rules itself — before any write is tried (the break test B8)', () => {
  /* every editor's commit passes through normalizeInputDraft; with its own check gone the save boundary still refused,
     so no door test went red. Asked directly: it answers null and says the sentence, with nothing written or rolled back */
  const draft = (over: any) => ({ person: 'allavail', type: 'Meeting', start: '2026-10-13', end: '2026-10-13', allday: false, sTime: '10:00', eTime: '11:00', remarks: '', ...over })
  /* THE RULE SURVIVES; its two sentences are the plan's shorter ones since step 3 (§4.4 — see KIND_WHY above; "is filed
     one day at a time" is "is for one day"). */
  it('a kind it may not carry, two days — each refused by the body itself; a good one passes', () => {
    said.length = 0
    expect(normalizeInputDraft(draft({ type: 'OD' }), null)).toBeNull()
    expect(said).toEqual([KIND_WHY('ALL AVAIL')])
    said.length = 0
    expect(normalizeInputDraft(draft({ end: '2026-10-14' }), null)).toBeNull()
    expect(said).toEqual(['ALL AVAIL is for one day'])
    said.length = 0
    expect(normalizeInputDraft(draft({ person: 'all', type: 'CSE' }), null)).toBeNull()
    expect(said).toEqual([KIND_WHY('ALL')])
    said.length = 0
    expect(normalizeInputDraft(draft({}), null)).toBeTruthy()
    expect(normalizeInputDraft(draft({ person: others()[0], type: 'OD', end: '2026-10-20', allday: true }), null), 'a named man\u2019s is none of its business').toBeTruthy()
    expect(said).toEqual([])
  })
})

/* THE RULE SURVIVES (D711 (3); D753: "it is offered only where the input is a single day"); step 3 changed its words —
   "ALL AVAIL is filed one day at a time" is the plan's "ALL AVAIL is for one day" (§4.4). */
describe('D711 (3), D753 — one day', () => {
  it('the editor: a two-day range with ALL AVAIL is refused in words', async () => {
    await openNew({ person: 'allavail', date: 'Oct 13', endDate: 'Oct 14' })
    const was = world()
    await click($('#inpEditSave'))
    expect(said).toEqual(['ALL AVAIL is for one day'])
    expect(world()).toBe(was)
    expect(win()).toBeTruthy()
  })

  it('a saved one-day input cannot be stretched to a second day (the calendar\'s drag, the window, any door)', async () => {
    const r = await filed()
    const was = world()
    let ok = true
    await act(async () => { ok = !!commitInputEdit(live(r.iid), { ...draftOf(live(r.iid)), end: '2026-10-15' }) })
    expect(ok).toBe(false)
    expect(said).toEqual(['ALL AVAIL is for one day'])
    expect(world()).toBe(was)
  })

  /* ADDED FOR STEP 3 — the same rule where the placeholder is one of several (D753 reading 2: "on a longer input the
     picker does not offer the puck and says why"; D755 (4)). A shared input may run several days; with ALL AVAIL in it
     it may not — at the picker (greyed, the reason under the two), and at the input's one writer whichever way the two
     facts meet: the placeholder added to a longer input, or an input that holds one stretched. */
  it('"Several people" on a NEW input of several days: both pucks greyed, "ALL AVAIL is for one day" under them, and a press does nothing', async () => {
    await openNew({ date: 'Oct 13', endDate: 'Oct 15' })
    await click(tid('pp-several'))
    const ph = $('#inpEditPop [data-ph="allavail"]') as HTMLButtonElement
    expect(ph.disabled).toBe(true)
    expect(($('#inpEditPop [data-ph="all"]') as HTMLButtonElement).disabled).toBe(true)
    expect(tid('pp-phwhy')?.textContent).toBe('ALL AVAIL is for one day')
    await click(ph)
    expect(ph.getAttribute('aria-pressed')).toBe('false')
    expect(tid('pp-count')?.textContent).toBe('1 picked')
  })

  it('a saved input of two people and ALL AVAIL cannot be stretched to a second day; the same two people without it can', async () => {
    const [a, b] = [others()[0], others()[1]]
    let ok = false
    await act(async () => { ok = commitInput(null, draftOf({ person: a, type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'with' }), [a, b, 'allavail']) })
    expect(ok, said.join(' | ')).toBe(true)
    const rec = INPUTS.find((r: any) => r.remarks === 'with') as any
    const was = world(); said.length = 0
    await act(async () => { ok = commitInput(rec, { ...draftOf(rec), end: '2026-10-15' }, idsOf(rec).map(String)) })
    expect(ok).toBe(false)
    expect(said).toEqual(['ALL AVAIL is for one day'])
    expect(world()).toBe(was)
    /* …taken out in the SAME save as the stretch, it goes through: the two people's input runs three days */
    said.length = 0
    await act(async () => { ok = commitInput(live(rec.iid), { ...draftOf(live(rec.iid)), end: '2026-10-15' }, [a, b]) })
    expect(ok, said.join(' | ')).toBe(true)
    expect(idsOf(live(rec.iid))).toEqual([a, b])
    expect(live(rec.iid).endDate).toBe('Oct 15')
  })

  it('ALL AVAIL cannot be added to a saved input of two people that already runs several days', async () => {
    const [a, b] = [others()[0], others()[1]]
    let ok = false
    await act(async () => { ok = commitInput(null, { ...draftOf({ person: a, type: 'Training', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'long' }), end: '2026-10-15' }, [a, b]) })
    expect(ok, said.join(' | ')).toBe(true)
    const rec = INPUTS.find((r: any) => r.remarks === 'long' || /^long/.test(String(r.remarks))) as any
    expect(rec, 'the fixture').toBeTruthy()
    const was = world(); said.length = 0
    await act(async () => { ok = commitInput(rec, draftOf(rec), [a, b, 'all']) })
    expect(ok).toBe(false)
    expect(said).toEqual(['ALL is for one day'])
    expect(world()).toBe(was)
  })

  it('moved to another single day: fine', async () => {
    const r = await filed()
    let ok = false
    await act(async () => { ok = !!commitInputEdit(live(r.iid), { ...draftOf(live(r.iid)), start: '2026-10-15', end: '2026-10-15' }) })
    expect(ok, said.join(' | ')).toBe(true)
    expect(live(r.iid).date).toBe('Oct 15')
  })
})

/* A RULING CHANGED EVERY RULE OF THIS DESCRIBE (owner D750, D753, D755 — step 3 of the one-rule build; the plan §4.1,
   §4.4, §4.5). It was "never in a group — it already stands for whoever is free", and its four cases pinned the one
   refusal "ALL AVAIL is filed on its own — it already stands for whoever is free": at the picker, in pickProblem, at the
   input's writer, and for a shared input taken over. D750: "'Several people' takes ALL AVAIL / ALL, so the puck is one
   of the input's own people and is tied to no man." D755: "whoever stands on it — a named person or ALL AVAIL / ALL …
   whether the input began with one person or several — is in the input." What is left of "alone" is D753's "an input
   takes ALL or ALL AVAIL, never both". Each case below is the old one, door for door, saying what holds NOW. */
describe('one of an input\'s own people (D750, D753, D755) — was "never in a group"', () => {
  /* was: '"Several people" switched on AFTER ALL AVAIL was picked: the picker says so, with the one press back' — the
     line "…filed on its own…", a refused Save, and the press "File it for ALL AVAIL only". Now nothing is said, people
     are picked beside it, and the Save files ONE input holding them all — through the real window. */
  it('"Several people" switched on AFTER ALL AVAIL was picked: it stays picked, a person is added beside it, and Save files ONE input for both', async () => {
    const a = others()[0]
    await openNew()
    await choose('#inpEditPerson', 'allavail')
    await click(tid('pp-several'))
    expect(tid('pp-why'), 'no longer refused').toBeNull()
    expect(tid('pp-fix'), 'and no press back to "ALL AVAIL only"').toBeNull()
    expect($('#inpEditPop [data-ph="allavail"]')!.getAttribute('aria-pressed')).toBe('true')
    expect(tid('pp-count')?.textContent, 'a placeholder is nobody to count').toBe('ALL AVAIL')
    await click($(`#inpEditPop [data-pp="${a}"]`))
    expect(tid('pp-count')?.textContent).toBe('1 picked + ALL AVAIL')
    await type('#inpEditRmk', 'both of them')
    const before = INPUTS.length, log = ELOG.rows.length
    await click($('#inpEditSave'))
    expect(win(), 'saved: the window has closed — ' + said.join(' | ')).toBeNull()
    expect(said.join(' | ')).not.toMatch(/on its own|already stands for/)
    const made = INPUTS.filter((r: any) => r.remarks === 'both of them') as any[]
    expect(INPUTS.length, 'ONE record').toBe(before + 1)
    expect(made).toHaveLength(1)
    expect(idsOf(made[0]), 'in the order picked').toEqual(['allavail', a])
    expect(namedOf(made[0]).map((e: any) => e.p), 'the one name stored is the one picked — nobody behind the placeholder is copied in (D702)').toEqual([a])
    expect(String(made[0].by)).toBe(admin)
    expect(ELOG.rows.length, 'its line in the change history').toBeGreaterThan(log)
    await act(async () => { undo(); notify() })
    expect(INPUTS.length, 'one Undo step takes the whole input back').toBe(before)
    await act(async () => { redo(); notify() })
    expect(idsOf(INPUTS.find((r: any) => r.remarks === 'both of them'))).toEqual(['allavail', a])
  })

  /* was: 'pickProblem is the one sentence — a placeholder with named people, or the two placeholders together', both
     answered "…filed on its own". A placeholder with named people is no problem now; the two together are refused in
     D753's own sentence, and the one press takes the SECOND one out. */
  it('pickProblem: a placeholder with named people is no problem; the two placeholders together are — "This input already has ALL AVAIL"', () => {
    const [a, b] = [others()[0], others()[1]]
    expect(pickProblem(['allavail', a], true, 'Meeting')).toBeNull()
    expect(pickProblem([a, b, 'all'], true, 'Meeting')).toBeNull()
    expect(pickProblem(['allavail'], false, 'Meeting')).toBeNull()
    const both = pickProblem(['allavail', 'all'], true, 'Meeting')!
    expect(both.why).toBe('This input already has ALL AVAIL')
    expect([both.fixLabel, both.fix]).toEqual(['Take ALL out', ['allavail']])
    const three = pickProblem([a, 'all', 'allavail'], true, 'Meeting')!
    expect(three.why).toBe('This input already has ALL')
    expect([three.fixLabel, three.fix]).toEqual(['Take ALL AVAIL out', [a, 'all']])
    /* a kind that bars it: beside people the press takes the PLACEHOLDER out; alone, an admin is offered none */
    const kind = pickProblem([a, 'allavail'], true, 'OD')!
    expect([kind.why, kind.fixLabel, kind.fix]).toEqual([KIND_WHY('ALL AVAIL'), 'Take ALL AVAIL out', [a]])
    expect(pickProblem(['allavail'], false, 'OD')!.fix, 'an admin: no "file it for me"').toEqual([])
  })

  /* was: 'the save itself refuses a placeholder among several — before ANY man is written; the two placeholders together
     by D753'. Its first two rows — ALL AVAIL with one person, ALL between two — were refused "…filed on its own"; the
     input's one writer (commitInput) FILES them now, each as ONE record in the order picked, one Undo step. Its third
     row STANDS, word for word: the two placeholders together are refused by D753 — the plain sentence, said once,
     before anybody is written. */
  it('the save itself files a placeholder among several as ONE record — and still refuses the two placeholders together, before ANYONE is written (D753)', async () => {
    const [a, b] = [others()[0], others()[1]]
    let k = 0
    for (const want of [['allavail', a], [a, 'all', b]]) {
      const before = INPUTS.length, steps = HIST.ix, mark = 'mix' + (++k); said.length = 0
      let ok = false
      await act(async () => { ok = commitInput(null, draftOf({ person: want[0], type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: mark }), want) })
      expect(ok, `${want.join('+')}: ${said.join(' | ')}`).toBe(true)
      expect(INPUTS.length, `${want.join('+')}: ONE record`).toBe(before + 1)
      const rec = INPUTS.find((r: any) => r.remarks === mark) as any
      expect(idsOf(rec), 'in the order wanted').toEqual(want)
      expect(HIST.ix, `${want.join('+')}: one Undo step`).toBe(steps + 1)
      expect(said.join(' | '), want.join('+')).not.toMatch(/on its own|already stands for/)
    }
    for (const [want, sentence] of [[['allavail', 'all'], 'This input already has ALL AVAIL'], [[a, 'all', b, 'allavail'], 'This input already has ALL']] as Array<[string[], string]>) {
      const was = world(); said.length = 0
      let ok = true
      await act(async () => { ok = commitInput(null, draftOf({ person: want[0], type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'x' }), want) })
      expect(ok, want.join('+')).toBe(false)
      /* refused BEFORE anyone is written: the plain sentence, said once — not the save boundary's rollback with its
         "nothing was saved for anyone" tail (the break test B9, 9 Oct 26: with the up-front check gone the boundary
         still refused, so nothing here went red) */
      expect(said, want.join('+')).toEqual([sentence])
      expect(world(), `${want.join('+')}: nobody was written`).toBe(was)
    }
  })

  /* was: 'a shared input cannot be turned into ALL AVAIL by taking its people off and picking the placeholder' — refused
     "…filed on its own". D755: whoever stands on the input is in it, "whether the input began with one person or
     several"; the plan §4.4's writer "lets it take an input over in one save" — and his own two routes (D755 reading
     (a), the plan's T1) must end the same, so the route "un-pick its people, pick ALL AVAIL" cannot be the one that is
     barred. It is the SAME input afterwards — its id, its filer, its hours — and one Undo gives its people back. */
  it('a shared input IS turned into ALL AVAIL\'s by taking its people off and picking the placeholder — the same input, one Undo step back', async () => {
    const people = [others()[0], others()[1]]
    await act(async () => { writeInputs(() => { INPUTS.push({ iid: 'gP1', people: people.map(p => ({ p, by: admin, at: '2026-09-01T08:00:00.000Z' })), type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'brief', mod: '2026-09-01', by: admin, at: '2026-09-01T08:00:00.000Z' }) }); notify() })
    const rec = live('gP1')
    expect(idsOf(rec), 'the fixture: one record, two people').toEqual(people)
    const n = INPUTS.length; said.length = 0
    let ok = false
    await act(async () => { ok = commitInput(rec, draftOf(rec), ['allavail']) })
    expect(ok, said.join(' | ')).toBe(true)
    expect(INPUTS.length, 'no second record').toBe(n)
    expect(idsOf(live('gP1'))).toEqual(['allavail'])
    expect([live('gP1').type, live('gP1').date, live('gP1').s, live('gP1').e, live('gP1').remarks, String(live('gP1').by)]).toEqual(['Meeting', 'Oct 13', 600, 660, 'brief', admin])
    expect(said.join(' | ')).not.toMatch(/on its own/)
    await act(async () => { undo(); notify() })
    expect(idsOf(live('gP1')), 'Undo gives its people back').toEqual(people)
  })

  /* ADDED FOR STEP 3 — the same take-over through the WINDOW an admin opens on the saved input: its people un-picked, the
     placeholder pressed, Save. (The picker never lets the LAST one picked go, so the placeholder is pressed first.) */
  it('…and in its own window: ALL AVAIL pressed, both people un-picked, Save — the window closes on an input for ALL AVAIL alone', async () => {
    const people = [others()[0], others()[1]]
    await act(async () => { writeInputs(() => { INPUTS.push({ iid: 'gP2', people: people.map(p => ({ p, by: admin, at: Date.UTC(2026, 8, 1, 8) })), type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'brief', mod: '2026-09-01', by: admin, at: Date.UTC(2026, 8, 1, 8) }) }); notify() })
    await openOn(live('gP2'))
    expect(tid('pp-count')?.textContent).toBe('2 picked')
    await click($('#inpEditPop [data-ph="allavail"]'))
    expect(tid('pp-count')?.textContent).toBe('2 picked + ALL AVAIL')
    await click($(`#inpEditPop [data-pp="${people[0]}"]`)); await click($(`#inpEditPop [data-pp="${people[1]}"]`))
    expect(tid('pp-count')?.textContent).toBe('ALL AVAIL')
    await click($('#inpEditSave'))
    expect(win(), 'saved — ' + said.join(' | ')).toBeNull()
    expect(idsOf(live('gP2'))).toEqual(['allavail'])
  })
})

/* ADDED FOR STEP 3 — THE INPUT'S OWN WINDOW ON AN INPUT THAT HOLDS PEOPLE AND A PLACEHOLDER (the second scenario pass of
   this area: the builder's cases drive the row's door, the writer and the picker by itself, never the window standing
   over a saved input of this shape). His rulings: D748 — the window "shows everyone in the input and changes it for
   everyone"; D755 (3) — a person in it "may always withdraw himself"; D757 — "ALL AVAIL stays when anyone leaves";
   D762 — one OIL answer for everyone in it, given by whoever filed it or an admin; D763 — "a person who is in a shared
   input he did not file does not add anyone to it"; D702 — members may choose it too; the plan §4.5 "Names and counts"
   — a count is of the NAMED people and the placeholder is said beside it. */
describe('the window on a saved input of people AND a placeholder (D748, D755, D757, D762, D763)', () => {
  const AT = Date.UTC(2026, 8, 1, 8)
  /* an input as the app writes it since the one record: a list of its people, each stamped with who put him in */
  const mixed = async (ids: string[], over: any = {}) => {
    const by = over.by ?? admin
    const row = { iid: 'mx' + (++n), people: ids.map(p => ({ p, by, at: AT })), by, at: AT, type: 'Meeting', date: 'Oct 13', yr: 2026,
      allday: false, s: 600, e: 660, remarks: 'mixed', mod: '2026-09-01', ...over }
    let ok = false
    await act(async () => { ok = writeInputs(() => { INPUTS.push(row) }); notify() })
    expect(ok, 'the fixture itself is a legal record').toBe(true)
    return live(row.iid)
  }
  const cs = (p: string) => String(PEOPLE[p].cs)
  const ph = (id: string) => $(`#inpEditPop [data-ph="${id}"]`) as HTMLButtonElement
  const pp = (id: string) => $(`#inpEditPop [data-pp="${id}"]`) as HTMLButtonElement

  it('an admin opens it: the people as pucks, the placeholder lit above them, the count of the PEOPLE with it said beside', async () => {
    const [a, b] = [others()[0], others()[1]]
    const r = await mixed([a, 'allavail', b])
    await openOn(r)
    expect($('#inpEditPerson'), '"Several people" — never the one-person list').toBeNull()
    expect(ph('allavail').getAttribute('aria-pressed')).toBe('true')
    expect(ph('all').getAttribute('aria-pressed')).toBe('false')
    expect(ph('all').disabled, 'the other one may be picked instead').toBe(false)
    expect(pp(a).getAttribute('aria-pressed')).toBe('true'); expect(pp(b).getAttribute('aria-pressed')).toBe('true')
    expect(tid('pp-count')?.textContent).toBe('2 picked + ALL AVAIL')
    expect(tid('pp-why')).toBeNull()
    expect($('#inpEditSave'), 'an admin may change it').toBeTruthy()
  })

  it('never both: ALL pressed in the window takes ALL AVAIL\'s place, and the save keeps the people (D753)', async () => {
    const [a, b] = [others()[0], others()[1]]
    const r = await mixed([a, b, 'allavail'])
    await openOn(r)
    await click(ph('all'))
    expect(ph('allavail').getAttribute('aria-pressed')).toBe('false')
    expect(tid('pp-count')?.textContent).toBe('2 picked + ALL')
    await click($('#inpEditSave'))
    expect(win(), said.join(' | ')).toBeNull()
    expect(idsOf(live(r.iid))).toEqual([a, b, 'all'])
  })

  it('the placeholder let go in the window leaves the people\'s input; pressed again on a later visit, it is back', async () => {
    const [a, b] = [others()[0], others()[1]]
    const r = await mixed([a, b, 'allavail'])
    await openOn(r)
    await click(ph('allavail'))
    await click($('#inpEditSave'))
    expect(idsOf(live(r.iid)), said.join(' | ')).toEqual([a, b])
    await openOn(live(r.iid))
    expect(tid('pp-count')?.textContent).toBe('2 picked')
    await click(ph('allavail'))
    await click($('#inpEditSave'))
    expect(idsOf(live(r.iid)), said.join(' | ')).toEqual([a, b, 'allavail'])
  })

  /* the dates of a saved shared input are changed in this window (D681): stretched to a second day with a placeholder
     in it, the two pucks say why, the picked one stays lit, and Save refuses in the one sentence */
  it('its dates stretched in the window: the line says "ALL AVAIL is for one day", Save refuses, and "Take ALL AVAIL out" lets the longer input be saved', async () => {
    const [a, b] = [others()[0], others()[1]]
    const r = await mixed([a, b, 'allavail'])
    await openOn(r)
    const day = (iso: string) => $(`#inpEdCal [data-cal="${iso}"]`)
    expect(day('2026-10-13'), 'the window carries the calendar for a saved input its reader may change').toBeTruthy()
    await click(day('2026-10-13')); await click(day('2026-10-15'))
    expect(ph('allavail').getAttribute('aria-pressed'), 'nothing is substituted for what was picked').toBe('true')
    expect(tid('pp-why')?.querySelector('span')?.textContent).toBe('ALL AVAIL is for one day')
    expect(tid('pp-fix')?.textContent).toBe('Take ALL AVAIL out')
    const was = world(); said.length = 0
    await click($('#inpEditSave'))
    expect(said).toEqual(['ALL AVAIL is for one day'])
    expect(world()).toBe(was)
    expect(win(), 'the window stays').toBeTruthy()
    await click(tid('pp-fix'))
    expect(ph('allavail').disabled, 'greyed now: this input is longer than a day').toBe(true)
    expect(tid('pp-phwhy')?.textContent).toBe('ALL AVAIL is for one day')
    said.length = 0
    await click($('#inpEditSave'))
    expect(win(), said.join(' | ')).toBeNull()
    expect(idsOf(live(r.iid))).toEqual([a, b])
    expect(live(r.iid).endDate).toBe('Oct 15')
  })

  it('another member — not in it, not its filer — reads it: no Save, no Delete, no "Take me out", and the line names who filed it', async () => {
    const r = await mixed([others()[0], 'allavail'])
    await as('member')
    await openOn(r)
    expect($('#inpEditSave')).toBeNull()
    expect($('#inpEditDel')).toBeNull()
    expect(tid('inped-takeout'), 'he is not in it').toBeNull()
    expect(tid('inped-ro')?.textContent).toBe(`Only ${cs(admin)} — who filed it — or an admin can change this for everyone.`)
    expect(tid('pp-why'), 'a reader picks nobody, so nothing is said about what may be picked').toBeNull()
    expect(ph('allavail').getAttribute('aria-pressed'), 'he still sees that ALL AVAIL is in it').toBe('true')
    expect(tid('pp-count')?.textContent).toBe('1 picked + ALL AVAIL')
  })

  /* D755 (3): "he may always withdraw himself"; D757: "ALL AVAIL stays when anyone leaves". Ranger is in a Meeting the
     admin filed for him, another man and ALL AVAIL. */
  it('a member who is IN it but did not file it: he reads it, takes himself out — and ALL AVAIL and the other man stay', async () => {
    const a = others()[0]
    const r = await mixed([member, a, 'allavail'])
    await as('member')
    await openOn(r)
    expect($('#inpEditSave'), 'not his to change for everyone').toBeNull()
    await click(tid('inped-takeout'))
    expect(tid('inped-takeout-ask')).toBeTruthy()
    await click(tid('inped-takeout-yes'))
    expect(said.join(' | ')).toContain('You are out of this input')
    expect(idsOf(live(r.iid))).toEqual([a, 'allavail'])
    expect(String(live(r.iid).by), 'still the admin\'s filing').toBe(admin)
  })

  /* …and where he is its only NAMED person beside the placeholder (an admin filed "Ranger and ALL AVAIL"): taking
     himself out leaves the input standing for ALL AVAIL ALONE (D757: "ALL AVAIL stays when anyone leaves") — it is never
     deleted under the men behind it, and who filed it does not change. BY WHICHEVER DOOR THE WINDOW GIVES HIM: today it
     treats him as the input's only named person and gives him the form, so he un-picks his own puck and saves; if the
     fault reported at the foot of this file (FAULT C) is settled the other way, it will be "Take me out". Either way
     the end is the same, and that end is what this case pins. */
  it('"Ranger and ALL AVAIL", opened by Ranger: he takes himself out — the input stays, for ALL AVAIL alone', async () => {
    const r = await mixed([member, 'allavail'])
    await as('member')
    await openOn(r)
    expect(tid('pp-count')?.textContent).toBe('1 picked + ALL AVAIL')
    if (tid('inped-takeout')) { await click(tid('inped-takeout')); await click(tid('inped-takeout-yes')) }
    else {
      await click(pp(member))
      expect(tid('pp-count')?.textContent).toBe('ALL AVAIL')
      await click($('#inpEditSave'))
    }
    expect(win(), said.join(' | ')).toBeNull()
    expect(live(r.iid), 'the input is still there').toBeTruthy()
    expect(idsOf(live(r.iid))).toEqual(['allavail'])
    expect(String(live(r.iid).by), 'still the admin\'s filing').toBe(admin)
  })

  /* D763: "a person who is in a shared input he did not file does not add anyone to it" — ALL AVAIL neither. Driven at
     the writer by ui/phmember.test.tsx; here it is the WINDOW he really has: its form is one he may not use at all. */
  it('a member in it who did not file it cannot add ALL AVAIL in the window: he has no Save, and the writer refuses him (D763)', async () => {
    const a = others()[0]
    const r = await mixed([member, a])
    await as('member')
    await openOn(r)
    expect($('#inpEditSave')).toBeNull()
    expect(($('#inpEditPop .inped-body') as HTMLElement).hasAttribute('inert'), 'the form is not his to press').toBe(true)
    const was = world(); said.length = 0
    let ok = true
    await act(async () => { ok = commitInput(live(r.iid), draftOf(live(r.iid)), [member, a, 'allavail']) })
    expect(ok).toBe(false)
    expect(said.length, 'and says why').toBe(1)
    expect(world()).toBe(was)
  })

  /* D702: "members can choose it too" — and D763's reading 1: whoever filed it changes who is in it, for the kinds a
     member may file for others, while the members' switch is on. */
  it('its MEMBER filer adds ALL AVAIL in the window (D702) — and with the members\' switch off he may not (D655, D763 reading 1)', async () => {
    const a = others()[0]
    const r = await mixed([member, a], { by: member })
    const r2 = await mixed([member, a], { by: member, remarks: 'second' })
    await as('member')
    expect(mayEditInput(live(r.iid)), 'the fixture: his own filing, his to change').toBe(true)
    await openOn(r)
    await click(ph('allavail'))
    await click($('#inpEditSave'))
    expect(win(), said.join(' | ')).toBeNull()
    expect(idsOf(live(r.iid))).toEqual([member, a, 'allavail'])
    expect(String(live(r.iid).by)).toBe(member)
    /* the switch off: the same member, the second input he filed */
    await as('admin'); await act(async () => { setMembersFile(false); notify() }); await as('member')
    const was = world(); said.length = 0
    let ok = true
    await act(async () => { ok = commitInput(live(r2.iid), draftOf(live(r2.iid)), [member, a, 'allavail']) })
    expect(ok).toBe(false)
    expect(world()).toBe(was)
    expect(mayFileInputFor('allavail', 'Meeting')).toBe(false)
  })

  /* D655 reading 6 ("one switch puts it back to admins only") where the input is "himself and ALL AVAIL", filed by him
     while the switch was on: an input for ALL AVAIL counts as filed for another person, so with the switch off he may
     not change it as it stands — a Save with ALL AVAIL still in it is refused, in a sentence that says why, and nothing
     is written. (What the window offers him around that refusal is FAULT C, at the foot of this file.) */
  it('himself and ALL AVAIL, filed by him, the members\' switch since turned off: a Save with ALL AVAIL still in it is refused, saying the switch is off — nothing is written', async () => {
    const r = await mixed([member, 'allavail'], { by: member })
    await act(async () => { setMembersFile(false); notify() })
    await as('member')
    const was = world(); said.length = 0
    let ok = true
    await act(async () => { ok = commitInput(live(r.iid), { ...draftOf(live(r.iid)), remarks: 'changed by him' }, [member, 'allavail']) })
    expect(ok).toBe(false)
    expect(world()).toBe(was)
    await openOn(live(r.iid))
    if ($('#inpEditSave')) {
      /* the window as built: the form is his, and its picker says why before he presses anything */
      expect(tid('pp-why')?.querySelector('span')?.textContent).toBe('Filing for other people is switched off — you can file this only for yourself')
      expect(ph('allavail').getAttribute('aria-pressed'), 'nothing is substituted for what was picked').toBe('true')
      await type('#inpEditRmk', 'changed by him'); said.length = 0
      await click($('#inpEditSave'))
      expect(said).toEqual(['Filing for other people is switched off — you can file this only for yourself'])
    } else expect(tid('inped-ro')?.textContent || '').toMatch(/switched off/)
    expect(world()).toBe(was)
  })

  /* D655: "shown and edited as one thing" — a delete from the window asks first where the input is more than one man's,
     takes the ONE record, and is one Undo step. With a placeholder in it as with people alone. */
  it('Delete in the window asks first, takes the ONE record — ALL AVAIL with it — and one Undo brings it all back', async () => {
    const a = others()[0]
    const r = await mixed([a, 'allavail'])
    await openOn(r)
    await click($('#inpEditDel'))
    expect(tid('inped-delall'), 'it asks first: the input is more than one man\'s').toBeTruthy()
    expect(live(r.iid), 'nothing has gone yet').toBeTruthy()
    const n = INPUTS.length
    await click(tid('inped-delall-yes'))
    expect(INPUTS.length, 'ONE record goes').toBe(n - 1)
    expect(live(r.iid)).toBeUndefined()
    expect(win()).toBeNull()
    await act(async () => { undo(); notify() })
    expect(idsOf(live(r.iid)), 'one Undo step brings the whole input back').toEqual([a, 'allavail'])
  })

  /* THE OIL QUESTION (D762: "the OIL question has one answer, for everyone in it: whoever filed it, or an admin, gives
     it"; D753: "the men behind it follow the OIL answer given for the input"; D660: asked once, at the save). A
     Saturday Duty for one man and ALL AVAIL, filed in the window: ONE question before anything is written, and ONE
     answer on the ONE record — nothing kept for the placeholder apart, nobody behind it copied in. */
  it('a weekend Duty for a person and ALL AVAIL: the OIL question is asked once, before anything is written, and its one answer is on the one record', async () => {
    const a = others()[0]
    await openNew({ person: a, type: 'Duty', date: 'Oct 17' })
    await click(tid('pp-several'))
    await click(ph('allavail'))
    await type('#inpEditRmk', 'weekend')
    const before = INPUTS.length
    await click($('#inpEditSave'))
    expect($$('[data-testid="oilconf"]'), 'ONE question').toHaveLength(1)
    const sheet = $('[data-testid="oilconf"]')!
    expect(INPUTS.length, 'nothing is written before it is answered').toBe(before)
    await click(sheet.querySelector('[data-testid="oil-yes"]'))
    await click(sheet.querySelector('[data-testid="oilconf-save"]'))
    expect($('[data-testid="oilconf"]'), 'and it is not asked a second time for the placeholder').toBeNull()
    expect(INPUTS.length, 'ONE record — ' + said.join(' | ')).toBe(before + 1)
    const made = INPUTS.find((r: any) => r.remarks === 'weekend') as any
    expect(idsOf(made)).toEqual([a, 'allavail'])
    expect(Object.values(made.oil || {}).some((v: any) => v > 0), 'the one answer, Yes').toBe(true)
    expect(Object.keys(made).some(k => /names|crowd/i.test(k)), 'no list of who stands behind it is stored').toBe(false)
    /* answered, so nobody's bell asks — not the filer's, not the named person's (D711 (4), D762) */
    for (const p of [admin, a, 'allavail']) expect(oilPendingFor(p).map(x => x.iid), p).not.toContain(made.iid)
  })

  /* …and the saved input's window says that one answer, with "Change…" for whoever may change the input and without it
     for a man who is only in it (D762: "no man in it gives an answer of his own") */
  it('the saved input\'s window carries the ONE OIL line: "Change…" for an admin, the line alone for a man who is only in it', async () => {
    const a = others()[0]
    const r = await mixed([member, a, 'allavail'], { type: 'Duty', date: 'Oct 17', oil: { '2026-10-17': 0 } })
    await openOn(r)
    expect($$('#inpEditPop .inped-oilsum'), 'one line, for the input').toHaveLength(1)
    expect(tid('oil-revise'), 'an admin may change it').toBeTruthy()
    await act(async () => { setInpEdit(null); notify() })
    await as('member')
    await openOn(live(r.iid))
    expect($$('#inpEditPop .inped-oilsum')).toHaveLength(1)
    expect(tid('oil-revise'), 'not his to answer').toBeNull()
    expect(tid('oil-answer')).toBeNull()
    expect(tid('inped-takeout'), 'the one thing that is his').toBeTruthy()
  })
})

/* THE WINDOW'S OWN SENTENCES COUNT THE PEOPLE AND SAY THE PLACEHOLDER BESIDE THEM (the plan §4.5 "Names and counts": a
   count "counts named people and says '+ ALL AVAIL'" — "ALL AVAIL stands for whoever is free on the day", D702, so it is
   nobody to count). The look at step 3 found "Input added for 3 people" for two people and ALL AVAIL, and the host
   fixed the window's sentences while this file was being re-expressed (ui/inputedit.tsx howMany — its words pinned
   equal to the calendar's by ui/phmember.test.tsx). These are those sentences READ OFF THE WINDOW ITSELF, each pressed
   as a person would press it: the question a delete asks and the note that answers it, what "Take me out" says stays,
   and the note of a filing — the same words the opened day's card uses for the same input (ui/inputscal-model.ts
   everyoneIn). */
describe('the window counts the PEOPLE and says ALL AVAIL beside them — never "2 people" for one person and a placeholder (the plan §4.5)', () => {
  const AT = Date.UTC(2026, 8, 1, 8)
  const mixed = async (ids: string[], over: any = {}) => {
    const row = { iid: 'pf' + (++n), people: ids.map(p => ({ p, by: admin, at: AT })), by: admin, at: AT, type: 'Meeting', date: 'Oct 13', yr: 2026,
      allday: false, s: 600, e: 660, remarks: 'mixed', mod: '2026-09-01', ...over }
    let ok = false
    await act(async () => { ok = writeInputs(() => { INPUTS.push(row) }); notify() })
    expect(ok, 'the fixture itself is a legal record').toBe(true)
    return live(row.iid)
  }
  const cs = (p: string) => String(PEOPLE[p].cs)
  /* what the opened day's card says of the same record — the one body the window must agree with */
  const dayWords = (r: any) => everyoneIn(monthItems([r], { fPerson: EVERYONE, fType: 'all', fSearch: '' })[0]!)

  it('Delete: the question and its note name the person and ALL AVAIL, as the opened day\'s do', async () => {
    const a = others()[0]
    const r = await mixed([a, 'allavail'])
    expect(dayWords(r)).toBe(`${cs(a)} and ALL AVAIL`)
    await openOn(r)
    await click($('#inpEditDel'))
    const ask = tid('inped-delall')?.textContent || ''
    expect(ask).not.toMatch(/2 people/)
    expect(ask).toContain(`Delete this input for ${dayWords(r)}?`)
    said.length = 0
    await click(tid('inped-delall-yes'))
    expect(said.join(' | ')).toContain(`Input deleted for ${cs(a)} and ALL AVAIL`)
  })

  it('Delete, three people and ALL: "3 people and ALL" — and with no placeholder it is "all 3 people", as it always was', async () => {
    const [a, b, c] = others()
    const r = await mixed([a, b, c, 'all'])
    await openOn(r)
    await click($('#inpEditDel'))
    expect(tid('inped-delall')?.textContent).toContain(`Delete this input for ${dayWords(r)}?`)
    expect(dayWords(r)).toBe('3 people and ALL')
    await click(tid('inped-delall-no'))
    await act(async () => { setInpEdit(null); notify() })
    const plain = await mixed([a, b, c])
    await openOn(plain)
    await click($('#inpEditDel'))
    expect(tid('inped-delall')?.textContent).toContain('Delete this input for all 3 people?')
  })

  it('"Take me out": what stays is the other person and ALL AVAIL, not "the other 2 people"', async () => {
    const a = others()[0]
    const r = await mixed([member, a, 'allavail'])
    await as('member')
    await openOn(r)
    await click(tid('inped-takeout'))
    const ask = tid('inped-takeout-ask')?.textContent || ''
    expect(ask).toContain('Take yourself out of this input?')
    expect(ask).not.toMatch(/2 people/)
    expect(ask).toContain(`It stays for ${cs(a)} and ALL AVAIL.`)
  })

  it('filed for one person and ALL AVAIL, the note says so — not "for 2 people"', async () => {
    const a = others()[0]
    await openNew({ person: a })
    await click(tid('pp-several'))
    await click($('#inpEditPop [data-ph="allavail"]'))
    said.length = 0
    await click($('#inpEditSave'))
    expect(win(), 'saved').toBeNull()
    expect(said.join(' | ')).not.toMatch(/2 people/)
    expect(said.join(' | ')).toContain(`Input added for ${cs(a)} and ALL AVAIL`)
  })
})

/* ---- PRODUCT FAULTS FOUND RE-EXPRESSING THIS FILE FOR STEP 3 (12 Oct 26) — REPORTED, NOT PINNED -------------------------
   Each case below says what SHOULD happen, by the ruling or the plan named above it, and is RED on the build as it
   stands. None of them is to be made green by changing the test: the fix is in the app, and is the builder's. */
/* FAULT C — THE SCREEN SAYS A MEMBER MAY CHANGE IT, AND THE SAVE REFUSES HIM WITH THE CATCH-ALL.
   An input whose only NAMED person is a member, with ALL AVAIL beside him, is a shape step 3 made possible (until then a
   placeholder stood alone). The screens ask state/perms.ts mayEditInput / mayDeleteInput, which answers "he is its only
   named person — his, in full" (the plan §4.9, written of an input with nobody else in it). The check on what a
   member's command really changed answers the other way — the same module's own note says "an input filed for ALL
   AVAIL / ALL counts as filed for another person", and D755 (3): "changing it for everyone, once the scheduler has
   added others, is the scheduler's". So where a SCHEDULER put the ALL AVAIL in (D757's own walk-through: his request,
   "ALL AVAIL dropped on"; the same where an admin filed "Ranger and ALL AVAIL"), the window offers him Save and Delete,
   the opened day asks him "Delete this input for Ranger and ALL AVAIL?" — and every one of those presses ends in "Not
   saved — that change is not yours to make" / "…was refused, and nothing was kept", the sentences kept for a change no
   door should have let through. A door never offers a press that can only be refused; and a refusal names who can.
   (Where the members' switch is off the window DOES say why before he presses — pinned in the describe above.)
   WHICH SIDE IS RIGHT is the builder's to settle against D755 (3) and D763 reading 1 — these cases pass either way:
   where the window offers the press, the press must work; where it does not, the window must say who can change it
   and still give him "Take me out" (D755 (3): "he may always withdraw himself"). */
describe('STEP 3 — product fault C, reported and left red: a member is offered Save and Delete on "himself and ALL AVAIL" that the save then refuses', () => {
  const at = Date.UTC(2026, 8, 1, 8)
  /* `phBy` — who put the ALL AVAIL in */
  const hisOwn = async (iid: string, phBy: string) => {
    await as('admin')
    await act(async () => { writeInputs(() => { INPUTS.push({ iid, people: [{ p: member, by: member, at }, { p: 'allavail', by: phBy, at }], by: member, at, type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'his own', mod: '2026-09-01' }) }); notify() })
    expect(live(iid), 'the fixture').toBeTruthy()
  }
  const readsItRight = () => {
    expect(tid('inped-ro')?.textContent || '', 'a reader is told who can change it').toMatch(/admin/)
    expect(tid('inped-takeout'), 'and may still take himself out (D755 (3))').toBeTruthy()
  }

  it('his own request, a scheduler put ALL AVAIL on it — Save: if the window offers it, it saves; never "not yours to make"', async () => {
    await hisOwn('fc1', admin)
    await as('member')
    await openOn(live('fc1'))
    if (!$('#inpEditSave')) { readsItRight(); return }
    await type('#inpEditRmk', 'changed by him')
    said.length = 0
    await click($('#inpEditSave'))
    expect(said.join(' | ')).not.toMatch(/not yours to make/)
    expect(live('fc1').remarks, 'the press he was offered did what it said').toBe('changed by him')
  })

  it('…the same input — Delete: if the window offers it, it deletes; never the catch-all', async () => {
    await hisOwn('fc2', admin)
    await as('member')
    await openOn(live('fc2'))
    if (!$('#inpEditDel')) { readsItRight(); return }
    await click($('#inpEditDel'))
    said.length = 0
    await click(tid('inped-delall-yes'))
    expect(said.join(' | ')).not.toMatch(/was refused, and nothing was kept|not yours to make/)
    expect(live('fc2'), 'the press he was offered did what it said').toBeUndefined()
  })

  /* …and the same mismatch with the members' switch OFF, on what he filed HIMSELF for himself and ALL AVAIL while it was
     on. The window's own line says "Filing for other people is switched off — you can file this only for yourself";
     he does exactly that — lets ALL AVAIL go, keeping his own input — and THAT save is refused "Not saved — that change
     is not yours to make". (For an input filed for ALL AVAIL ALONE the rule is pinned above: "his right over it goes
     with the switch", the window read only, no dead press.) */
  it('himself and ALL AVAIL, filed by him, the members\' switch since turned off: if the window offers Save, doing what its own line says — filing it for himself only — saves', async () => {
    await hisOwn('fc3', member)
    await act(async () => { setMembersFile(false); notify() })
    await as('member')
    await openOn(live('fc3'))
    if (!$('#inpEditSave')) { expect(tid('inped-ro')?.textContent || '').toMatch(/switched off|admin/); return }
    await click($('#inpEditPop [data-ph="allavail"]'))
    expect(tid('pp-why'), 'himself alone: nothing is wrong with the pick any more').toBeNull()
    said.length = 0
    await click($('#inpEditSave'))
    expect(said.join(' | ')).not.toMatch(/not yours to make/)
    expect(idsOf(live('fc3')), 'his own input, as the line told him to make it').toEqual([member])
  })
})

describe('STEP 3 — product faults, reported and left red: the placeholder leads the OIL question, and is counted as a person in the small print', () => {
  const cs = (p: string) => String(PEOPLE[p].cs)

  /* ui/inputedit.tsx inputWho — the saved input's title — says "a placeholder never leads while a named person is in
     it": "Ranger +1". The OIL question asked AT THE FILING of that same input sorts the picked callsigns A to Z with the
     placeholder among them, so for any person whose callsign comes after "ALL AVAIL" it is headed "OIL — ALL AVAIL +1":
     the same fault the walk of 10 Oct 26 found for people ("a NEW group asked as 'Ranger +2' … and was 'Ace +2' from the
     moment it was saved"), back through the placeholder. */
  it('FAULT A — the OIL question at the filing is headed by the PERSON, as the saved input\'s title is — never "ALL AVAIL +1"', async () => {
    const a = others().find(p => cs(p).localeCompare('ALL AVAIL', undefined, { sensitivity: 'base' }) > 0)!
    expect(a, 'a callsign that sorts after "ALL AVAIL"').toBeTruthy()
    await openNew({ person: a, type: 'Duty', date: 'Oct 17' })
    await click(tid('pp-several'))
    await click($('#inpEditPop [data-ph="allavail"]'))
    await click($('#inpEditSave'))
    const sheet = $('[data-testid="oilconf"]')!
    expect(sheet, 'the question').toBeTruthy()
    const head = sheet.querySelector('.airpop-head b')!.textContent || ''
    expect(head).not.toMatch(/^OIL — ALL AVAIL/)
    expect(head).toBe(`OIL — ${inputWho({ people: [{ p: a }, { p: 'allavail' }] })}, Duty`)
  })

  /* The same count the host fixed in the window's sentences (above), left in the window's SMALL PRINT (ui/placedline.ts
     placedLine — D629, D655: "Placed by Saber for 4 people · 7 Oct 26, 14:32"): for one person and ALL AVAIL it reads
     "Placed by Saber for 2 people". The plan §4.5: a count is of the named people and the placeholder is said beside
     it. (An input for ALL AVAIL ALONE already reads "for ALL AVAIL" — only the mixed input miscounts.) */
  it('FAULT B — the window\'s "Placed by … for …" line does not count ALL AVAIL as a person', async () => {
    const a = others()[0], at = Date.UTC(2026, 8, 1, 8)
    await act(async () => { writeInputs(() => { INPUTS.push({ iid: 'pfb', people: [a, 'allavail'].map(p => ({ p, by: admin, at })), by: admin, at, type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: '', mod: '2026-09-01' }) }); notify() })
    await openOn(live('pfb'))
    const line = tid('inped-placed')?.textContent || ''
    expect(line, 'the line is drawn').toContain(`Placed by ${cs(admin)}`)
    expect(line).not.toMatch(/for 2 people/)
    expect(line).toContain('ALL AVAIL')
  })
})

describe('THE SAVE BOUNDARY — one hard check on what a command really changed, whoever ran it', () => {
  /* THE RULE SURVIVES for the first six (the kinds, the one day — D711, D712, D753); what the boundary SAYS is the one
     body's new sentence, pinned whole where the old pattern matched either wording loosely. THE SEVENTH — "a group
     member", a record carrying `grp` / `grpBy` — is re-expressed below: a ruling changed it and its subject is gone. */
  const bad: Array<[string, any, string]> = [
    ['an overseas duty', { type: 'OD' }, KIND_WHY('ALL AVAIL')], ['a course', { type: 'CSE' }, KIND_WHY('ALL AVAIL')],
    ['Fly with', { type: 'Fly with' }, KIND_WHY('ALL AVAIL')], ['Personal', { type: 'Personal' }, KIND_WHY('ALL AVAIL')],
    ['a leave', { type: 'LL', allday: true }, KIND_WHY('ALL AVAIL')], ['two days', { endDate: 'Oct 14' }, 'ALL AVAIL is for one day'],
  ]
  for (const [name, over, why] of bad) {
    it(`an ADMIN's hand-made write of a placeholder input that is ${name} is rolled back whole — and says why`, async () => {
      const was = world(); said.length = 0
      let ok = true
      await act(async () => { ok = writeInputs(() => { INPUTS.unshift({ iid: 'bad1', person: 'allavail', by: admin, type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: '', mod: '2026-09-01', ...over }) }); notify() })
      expect(ok).toBe(false)
      expect(world(), 'no record, no history line, no Undo step').toBe(was)
      expect(said.join(' | ')).toContain(why)
    })
  }

  /* was: '…a placeholder input that is a group member is rolled back whole' — a hand-made record carrying a group mark
     (`grp: 'gX', grpBy`) was refused "ALL AVAIL is filed on its own". TWO THINGS ENDED THAT: D750 / D753 / D755 — a
     placeholder is one of an input's own people; and D756 — several people share an input through its LIST, so `grp` /
     `grpBy` are fields nothing reads (the plan §4.1: "`person`, `grp`, `grpBy`, `leftAt` leave the record").
     WHAT IS TRUE NOW, at the same boundary, for a hand-made write whoever makes it: a placeholder beside people is KEPT;
     what the list may not hold is still rolled back whole, in the one body's sentence. */
  it('an ADMIN\'s hand-made write of ONE record holding two people and ALL AVAIL is kept (D750, D755) — was "a group member … rolled back"', async () => {
    const [a, b] = [others()[0], others()[1]]
    let ok = false
    await act(async () => { ok = writeInputs(() => { INPUTS.unshift({ iid: 'mixok', people: [{ p: a }, { p: 'allavail' }, { p: b }], by: admin, type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: '', mod: '2026-09-01' }) }); notify() })
    expect(ok, said.join(' | ')).toBe(true)
    expect(idsOf(live('mixok'))).toEqual([a, 'allavail', b])
  })
  /* OLD DATA (D56, D759 reading 10 — nothing stored is converted): a record in the old shape that still carries the
     retired group fields is read as the one-person ALL AVAIL input it is, and a command that touches it is not refused
     for a mark nothing reads */
  it('an old-shaped ALL AVAIL record still carrying a retired group mark is kept: the mark is read by nothing', async () => {
    let ok = false
    await act(async () => { ok = writeInputs(() => { INPUTS.unshift({ iid: 'oldgrp', person: 'allavail', by: admin, type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: '', mod: '2026-09-01', grp: 'gX', grpBy: admin }) }); notify() })
    expect(ok, said.join(' | ')).toBe(true)
    expect(idsOf(live('oldgrp'))).toEqual(['allavail'])
    expect(said.join(' | ')).not.toMatch(/on its own/)
  })
  const badList: Array<[string, any, string]> = [
    ['both placeholders (D753)', { people: [{ p: 'PERSON' }, { p: 'allavail' }, { p: 'all' }] }, 'This input already has ALL AVAIL'],
    ['the same placeholder twice', { people: [{ p: 'all' }, { p: 'PERSON' }, { p: 'all' }] }, 'This input already has ALL'],
    ['a placeholder beside a person over two days (D753)', { people: [{ p: 'PERSON' }, { p: 'allavail' }], endDate: 'Oct 14' }, 'ALL AVAIL is for one day'],
    ['a placeholder beside a person on an overseas duty (D755 (4))', { people: [{ p: 'PERSON' }, { p: 'all' }], type: 'OD' }, KIND_WHY('ALL')],
    ['a placeholder beside a person under Unavailable', { people: [{ p: 'PERSON' }, { p: 'allavail' }], type: 'Other', acc: 'u' }, 'ALL AVAIL cannot be filed under Unavailable'],
  ]
  for (const [name, over, why] of badList) {
    it(`an ADMIN's hand-made write of ONE record holding ${name} is rolled back whole — and says why`, async () => {
      const row = JSON.parse(JSON.stringify({ iid: 'bad2', by: admin, type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: '', mod: '2026-09-01', ...over }).replace(/PERSON/g, others()[0]))
      const was = world(); said.length = 0
      let ok = true
      await act(async () => { ok = writeInputs(() => { INPUTS.unshift(row) }); notify() })
      expect(ok).toBe(false)
      expect(world(), 'no record, no history line, no Undo step').toBe(was)
      expect(said.join(' | ')).toContain(why)
    })
  }

  it('a good one passes; so does a later change to its place on the programme, its order or its OIL answer', async () => {
    const r = await filed({ date: 'Oct 17' })
    let ok = false
    await act(async () => { ok = writeInputs(() => { live(r.iid).acc = 'r' }) }); expect(ok).toBe(true)
    await act(async () => { ok = writeInputs(() => { live(r.iid).oil = { '2026-10-17': 0 } }) }); expect(ok).toBe(true)
    await act(async () => { ok = writeInputs(() => { live(r.iid).remarks = 'changed' }) }); expect(ok).toBe(true)
  })

  /* was: '…its kind, a second day, a group…'. The first two STAND (the rule survives). The third — the retired group mark
     put on it — is refused by nothing any more (D750, D755; `grp` is read by nothing since D756): in its place, the
     change D753 still bars — the OTHER placeholder put into its list. */
  it('a good one changed into a bad one — its kind, a second day, the other placeholder beside it — is refused, and stays as it was', async () => {
    const r = await filed()
    for (const [over, why] of [[{ type: 'CSE' }, KIND_WHY('ALL AVAIL')], [{ endDate: 'Oct 20' }, 'ALL AVAIL is for one day'],
      [{ person: undefined, people: [{ p: 'allavail' }, { p: 'all' }] }, 'This input already has ALL AVAIL']] as Array<[any, string]>) {
      const was = world(); said.length = 0
      let ok = true
      await act(async () => { ok = writeInputs(() => { Object.assign(live(r.iid), over) }) })
      expect(ok, JSON.stringify(over)).toBe(false)
      expect(said.join(' | '), JSON.stringify(over)).toContain(why)
      expect(world()).toBe(was)
    }
  })

  /* ADDED FOR STEP 3 (D750, D755): a named person put into its list by a hand-made write is a sound record now */
  it('a good one given a named person beside the placeholder is kept — and the same change over two days is not', async () => {
    const r = await filed()
    let ok = false
    await act(async () => { ok = writeInputs(() => { const x = live(r.iid); x.people = [{ p: 'allavail', by: admin }, { p: others()[0], by: admin }]; delete x.person }) })
    expect(ok, said.join(' | ')).toBe(true)
    expect(idsOf(live(r.iid))).toEqual(['allavail', others()[0]])
    const was = world(); said.length = 0
    await act(async () => { ok = writeInputs(() => { live(r.iid).endDate = 'Oct 14' }) })
    expect(ok).toBe(false)
    expect(said.join(' | ')).toContain('ALL AVAIL is for one day')
    expect(world()).toBe(was)
  })

  it('a placeholder input UNDER UNAVAILABLE is refused at the boundary too (Astra\'s read of the code)', async () => {
    const was = world(); said.length = 0
    let ok = true
    await act(async () => { ok = writeInputs(() => { INPUTS.unshift({ iid: 'badu', person: 'allavail', by: admin, type: 'Other', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: '', mod: '2026-09-01', acc: 'u' }) }); notify() })
    expect(ok).toBe(false)
    expect(world()).toBe(was)
    expect(said.join(' | ')).toContain('cannot be filed under Unavailable')
  })

  it('a NAMED man\'s input of any shape is none of this check\'s business', async () => {
    let ok = false
    await act(async () => { ok = writeInputs(() => { INPUTS.unshift({ iid: 'ok1', person: others()[0], type: 'OD', date: 'Oct 13', endDate: 'Oct 20', yr: 2026, allday: true, remarks: '', mod: '2026-09-01' }) }) })
    expect(ok).toBe(true)
  })
})

describe('the schedule\'s own doors', () => {
  it('reassign refuses BOTH directions — a placeholder input is changed in its own window, never by a drag', async () => {
    /* (a placeholder input can never BE under Unavailable — the save boundary refuses that record, below — so the
       source here is an ordinary one; the door must refuse it wherever the gesture came from) */
    const r = await filed({ type: 'Other' })
    const was = world(); said.length = 0
    let ok = true
    await act(async () => { ok = reassignInput(r.iid, others()[0]) })
    expect(ok, 'a placeholder as the SOURCE').toBe(false)
    expect(world()).toBe(was)
    expect(said.join(' | ')).toContain('ALL AVAIL')
    const named = await filed({ person: others()[0], type: 'Other', acc: 'u' })
    const was2 = world()
    await act(async () => { ok = reassignInput(named.iid, 'allavail') })
    expect(ok, 'a placeholder as the DESTINATION').toBe(false)
    expect(world()).toBe(was2)
    /* …and it says why (walker B, 9 Oct 26: the drop was refused with no words at all) */
    expect(said.join(' | ')).toContain('Unavailable is a real person')
  })

  it('"→ Unavail" refuses a placeholder input: Unavailable describes a real person\'s day', async () => {
    /* taken off the programme ('r') — the state from which the buttons are offered again */
    const r = await filed({ type: 'Other', date: 'Jul 14', acc: 'r' })
    expect(acceptInput(1, live(r.iid), 'u')).toBe(false)
    expect(live(r.iid).acc).toBe('r')
    const named = await filed({ person: others()[0], type: 'Other', date: 'Jul 14', acc: 'r' })
    expect(acceptInput(1, live(named.iid), 'u'), 'a named man\'s Other still files under Unavailable').toBe(true)
  })

  it('the "→ Unavail" BUTTON is not drawn for a placeholder\u2019s Other; a named man\u2019s Other keeps both (the break test B26)', () => {
    const ph = accCtl(1, { iid: 'b1', person: 'all', type: 'Other', date: 'Jul 14', yr: 2026, acc: 'r' })
    expect(ph).toContain('data-acc="g"')
    expect(ph, 'no door to Unavailable').not.toContain('data-acc="u"')
    expect(ph).not.toContain('Unavail')
    const named = accCtl(1, { iid: 'b2', person: others()[0], type: 'Other', date: 'Jul 14', yr: 2026, acc: 'r' })
    expect(named).toContain('data-acc="g"')
    expect(named).toContain('data-acc="u"')
  })

  it('a placeholder is never counted as one absent man, whatever record reaches the day', () => {
    /* straight into the list, past every door — the day's own counting must still leave it out */
    INPUTS.unshift({ iid: 'aw1', person: 'allavail', type: 'Fly with', date: 'Jul 14', yr: 2026, allday: true, acc: 'g', remarks: '', mod: '' })
    INPUTS.unshift({ iid: 'aw2', person: 'all', type: 'OL', date: 'Jul 14', yr: 2026, allday: true, remarks: '', mod: '' })
    INPUTS.unshift({ iid: 'aw3', person: 'allavail', type: 'OD', date: 'Jul 14', yr: 2026, allday: false, s: 600, e: 700, remarks: '', mod: '' })
    INPUTS.unshift({ iid: 'aw4', person: others()[0], type: 'OL', date: 'Jul 14', yr: 2026, allday: true, remarks: '', mod: '' })
    const aw = dayAway(DAYS[1])
    expect(aw.all.has('allavail')).toBe(false)
    expect(aw.all.has('all')).toBe(false)
    expect(aw.tw.allavail).toBeUndefined()
    expect(aw.all.has(others()[0]), 'a real man beside them is still counted').toBe(true)
  })
})

describe('D711 (4) — an OIL question nobody answered goes to the FILER\'s bell, and only his', () => {
  it('a weekend Duty for ALL AVAIL with no answer: the filer is asked; nobody else is', async () => {
    const r = await filed({ type: 'Duty', date: 'Oct 17', by: admin })
    expect(oilPendingFor(admin).map(x => x.iid)).toContain(r.iid)
    for (const p of [member, others()[0], 'allavail']) expect(oilPendingFor(p).map(x => x.iid), p).not.toContain(r.iid)
  })

  it('answered — Yes or No — and the bell is off', async () => {
    const r = await filed({ type: 'Duty', date: 'Oct 17', by: admin })
    await act(async () => { writeInputs(() => { live(r.iid).oil = { '2026-10-17': 0 } }) })
    expect(oilPendingFor(admin).map(x => x.iid)).not.toContain(r.iid)
  })

  it('a MEMBER filer is asked while he may answer — and not once the members\' switch is off (never a task he cannot do)', async () => {
    const r = await filed({ type: 'Duty', date: 'Oct 17', by: member })
    await as('member')
    expect(oilPendingFor(member).map(x => x.iid)).toContain(r.iid)
    await as('admin'); await act(async () => { setMembersFile(false); notify() }); await as('member')
    expect(oilPendingFor(member).map(x => x.iid)).not.toContain(r.iid)
  })

  it('a working day asks nothing of anyone', async () => {
    const r = await filed({ type: 'Duty', date: 'Oct 13', by: admin })
    expect(oilPendingFor(admin).map(x => x.iid)).not.toContain(r.iid)
  })

  /* ADDED FOR STEP 3 — the same rule where the placeholder is one of several (D762: the question "has one answer, for
     everyone in it: whoever filed it, or an admin, gives it; no man in it gives an answer of his own"; D753 reading 1:
     "where nobody has answered … the question goes to the filer's bell"). A weekend Duty a MEMBER filed for himself,
     another man and ALL AVAIL, unanswered: it is on HIS bell — and not on the other man's, who is in it, nor on
     anybody's who merely stands behind ALL AVAIL. */
  it('a weekend Duty for two people and ALL AVAIL, unanswered: the FILER\'s bell alone — not the other man in it, not the placeholder', async () => {
    const a = others()[0], at = Date.UTC(2026, 8, 1, 8)
    await act(async () => { writeInputs(() => { INPUTS.push({ iid: 'bellmix', people: [member, a, 'allavail'].map(p => ({ p, by: member, at })), by: member, at, type: 'Duty', date: 'Oct 17', yr: 2026, allday: false, s: 600, e: 660, remarks: '', mod: '2026-09-01' }) }); notify() })
    expect(live('bellmix'), 'the fixture').toBeTruthy()
    await as('member')
    expect(oilPendingFor(member).map(x => x.iid)).toContain('bellmix')
    for (const p of [a, others()[1], 'allavail', admin]) expect(oilPendingFor(p).map(x => x.iid), p).not.toContain('bellmix')
    await as('admin')
    await act(async () => { writeInputs(() => { live('bellmix').oil = { '2026-10-17': 0 } }) })
    await as('member')
    expect(oilPendingFor(member).map(x => x.iid), 'answered — No — and the bell is off').not.toContain('bellmix')
  })
})

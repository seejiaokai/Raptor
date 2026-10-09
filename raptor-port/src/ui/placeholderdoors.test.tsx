// @vitest-environment jsdom
/* AN INPUT FILED FOR "ALL AVAIL" / "ALL" — EVERY DOOR THAT CAN WRITE ONE, AND EVERY DOOR THAT MUST REFUSE
   (`[INPUT-ALL-AVAIL]`; owner D700, D702, D711, D712, D713 — 9 Oct 26; the plan §3.2–§3.4:
   docs/superpowers/plans/2026-10-09-input-all-avail-plan.md).

   Both first-round readers of the plan found the same hole: the three rules — one of six kinds, one day, never in a
   group — were checked in the editor and nowhere else, so the List's own Add form (which builds its record by hand),
   the group save, an admin, the test bridge and a restore could each write what the picker would not offer. So the
   rules are held twice: by ONE sentence at every door (said where he pressed, the window kept open), and by ONE hard
   check at the save boundary on what the command really changed, whoever ran it. Each door is pressed here, and after
   every refusal the inputs, the change history and the Undo list are exactly as they were. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor, commitGroup, commitInputEdit, commitNewInput, draftOf, normalizeInputDraft, reassignInput } from './inputedit'
import { accCtl } from './html'
import { pickProblem } from './PeoplePick'
import { initStore, notify, setSession, undo, redo, writeInputs } from '../state/store'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { setMe } from '../state/auth'
import { me, mayEditInput, mayDeleteInput, mayFileInputFor } from '../state/perms'
import { setMembersFile } from '../state/memberfile'
import { INPUTS, PLACEHOLDER_KINDS, INPUT_TYPES } from '../engine/inputs'
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

  it('"Several people" never offers a placeholder puck', async () => {
    await openNew()
    await click(tid('pp-several'))
    expect($('#inpEditPop [data-pp="allavail"]')).toBeNull()
    expect($('#inpEditPop [data-pp="all"]')).toBeNull()
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
      expect(String(made[0].person)).toBe(ph)
      expect(made[0].grp).toBeUndefined()
      expect(made[0].grpBy).toBeUndefined()
      expect(String(made[0].by), 'who placed it').toBe(admin)
      expect(made[0].endDate).toBeUndefined()
      expect(Object.keys(made[0]).some(k => /people|names|crowd/i.test(k)), 'no list of names is stored').toBe(false)
      expect(ELOG.rows.some(x => x.iid === made[0].iid), 'its line in the change history').toBe(true)
      await act(async () => { undo(); notify() })
      expect(INPUTS.length, 'one Undo step').toBe(before)
      await act(async () => { redo(); notify() })
      expect(INPUTS.filter((r: any) => r.remarks === 'whole sqn' && r.person === ph)).toHaveLength(1)
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

describe('D711 (2), D712 — a kind that is not allowed is refused, with its sentence, and nothing is saved', () => {
  it('the picker says why the moment the kind changes; Save refuses; what he picked is never substituted', async () => {
    await openNew()
    await choose('#inpEditPerson', 'allavail')
    await choose('#inpEditType', 'OD')
    expect(($('#inpEditPerson') as HTMLSelectElement).value, 'ALL AVAIL stays shown').toBe('allavail')
    expect(tid('pp-why')?.textContent).toContain('ALL AVAIL can be filed only for Training, Meeting, Appointment, Duty, Event or Other')
    expect(tid('pp-fix'), 'an ADMIN is offered no "file it for me" — he picks the name it is for').toBeNull()
    const was = world()
    await click($('#inpEditSave'))
    expect(said.join(' | ')).toContain('ALL AVAIL can be filed only for')
    expect(world()).toBe(was)
    expect(win(), 'the window stays, nothing typed is lost').toBeTruthy()
  })

  it('a MEMBER is offered the one press — "File it for me only" — and it files nothing by itself', async () => {
    await as('member')
    await openNew()
    await choose('#inpEditPerson', 'allavail')
    await choose('#inpEditType', 'OD')
    expect(tid('pp-why')?.textContent).toContain('ALL AVAIL can be filed only for')
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
    expect(said.join(' | ')).toContain('ALL can be filed only for')
    expect(document.body.textContent || '', 'no document prompt came up').not.toContain('No document')
    expect(world()).toBe(was)
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
  it('a kind it may not carry, two days — each refused by the body itself; a good one passes', () => {
    said.length = 0
    expect(normalizeInputDraft(draft({ type: 'OD' }), null)).toBeNull()
    expect(said.join(' | ')).toContain('ALL AVAIL can be filed only for')
    said.length = 0
    expect(normalizeInputDraft(draft({ end: '2026-10-14' }), null)).toBeNull()
    expect(said.join(' | ')).toContain('ALL AVAIL is filed one day at a time')
    said.length = 0
    expect(normalizeInputDraft(draft({ person: 'all', type: 'CSE' }), null)).toBeNull()
    expect(said.join(' | ')).toContain('ALL can be filed only for')
    said.length = 0
    expect(normalizeInputDraft(draft({}), null)).toBeTruthy()
    expect(normalizeInputDraft(draft({ person: others()[0], type: 'OD', end: '2026-10-20', allday: true }), null), 'a named man\u2019s is none of its business').toBeTruthy()
    expect(said).toEqual([])
  })
})

describe('D711 (3) — one day at a time', () => {
  it('the editor: a two-day range with ALL AVAIL is refused in words', async () => {
    await openNew({ person: 'allavail', date: 'Oct 13', endDate: 'Oct 14' })
    const was = world()
    await click($('#inpEditSave'))
    expect(said.join(' | ')).toContain('ALL AVAIL is filed one day at a time')
    expect(world()).toBe(was)
    expect(win()).toBeTruthy()
  })

  it('a saved one-day input cannot be stretched to a second day (the calendar\'s drag, the window, any door)', async () => {
    const r = await filed()
    const was = world()
    let ok = true
    await act(async () => { ok = !!commitInputEdit(live(r.iid), { ...draftOf(live(r.iid)), end: '2026-10-15' }) })
    expect(ok).toBe(false)
    expect(said.join(' | ')).toContain('ALL AVAIL is filed one day at a time')
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

describe('never in a group — it already stands for whoever is free', () => {
  it('"Several people" switched on AFTER ALL AVAIL was picked: the picker says so, with the one press back', async () => {
    await openNew()
    await choose('#inpEditPerson', 'allavail')
    await click(tid('pp-several'))
    expect(tid('pp-why')?.textContent).toContain('ALL AVAIL is filed on its own — it already stands for whoever is free')
    const was = world()
    await click($('#inpEditSave'))
    expect(said.join(' | ')).toContain('filed on its own')
    expect(world()).toBe(was)
    expect(tid('pp-fix')?.textContent).toBe('File it for ALL AVAIL only')
    await click(tid('pp-fix'))
    expect(($('#inpEditPerson') as HTMLSelectElement).value, 'back to one person: ALL AVAIL').toBe('allavail')
    expect(tid('pp-why')).toBeNull()
  })

  it('pickProblem is the one sentence — a placeholder with named people, or the two placeholders together', () => {
    expect(pickProblem(['allavail', others()[0]], true, 'Meeting')?.why).toContain('ALL AVAIL is filed on its own')
    expect(pickProblem(['allavail', 'all'], true, 'Meeting')?.why).toContain('filed on its own')
    expect(pickProblem(['allavail'], false, 'Meeting')).toBeNull()
  })

  it('the group save itself refuses a placeholder among several — before ANY man is written', async () => {
    for (const want of [['allavail', others()[0]], [others()[0], 'all', others()[1]], ['allavail', 'all']]) {
      const was = world(); said.length = 0
      let ok = true
      await act(async () => { ok = commitGroup(null, draftOf({ person: want[0], type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'x' }), want) })
      expect(ok, want.join('+')).toBe(false)
      expect(said.join(' | '), want.join('+')).toContain('filed on its own')
      /* refused BEFORE any man is written: the plain sentence, said once — not the save boundary's rollback with its
         "nothing was saved for anyone" tail (the break test B9, 9 Oct 26: with the up-front check gone the boundary
         still refused, so nothing here went red) */
      expect(said, want.join('+')).toHaveLength(1)
      expect(said[0], want.join('+')).not.toContain('nothing was saved')
      expect(world(), `${want.join('+')}: nobody was written`).toBe(was)
    }
  })

  it('a shared input cannot be turned into ALL AVAIL by taking its people off and picking the placeholder', async () => {
    const grp = 'gP1', people = [others()[0], others()[1]]
    await act(async () => { writeInputs(() => { INPUTS.push(...people.map((p, i) => ({ iid: `${grp}-${i}`, person: p, type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'brief', mod: '2026-09-01', grp, grpBy: admin, by: admin }))) }); notify() })
    const rows = INPUTS.filter((r: any) => r.grp === grp)
    const was = world(); said.length = 0
    let ok = true
    await act(async () => { ok = commitGroup({ rows }, draftOf(rows[0]), ['allavail']) })
    expect(ok).toBe(false)
    expect(said.join(' | ')).toContain('filed on its own')
    expect(world()).toBe(was)
  })
})

describe('THE SAVE BOUNDARY — one hard check on what a command really changed, whoever ran it', () => {
  const bad: Array<[string, any]> = [
    ['an overseas duty', { type: 'OD' }], ['a course', { type: 'CSE' }], ['Fly with', { type: 'Fly with' }], ['Personal', { type: 'Personal' }],
    ['a leave', { type: 'LL', allday: true }], ['two days', { endDate: 'Oct 14' }], ['a group member', { grp: 'gX', grpBy: admin }],
  ]
  for (const [name, over] of bad) {
    it(`an ADMIN's hand-made write of a placeholder input that is ${name} is rolled back whole — and says why`, async () => {
      const was = world(); said.length = 0
      let ok = true
      await act(async () => { ok = writeInputs(() => { INPUTS.unshift({ iid: 'bad1', person: 'allavail', by: admin, type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: '', mod: '2026-09-01', ...over }) }); notify() })
      expect(ok).toBe(false)
      expect(world(), 'no record, no history line, no Undo step').toBe(was)
      expect(said.join(' | ')).toMatch(/ALL AVAIL (can be filed only|is filed)/)
    })
  }

  it('a good one passes; so does a later change to its place on the programme, its order or its OIL answer', async () => {
    const r = await filed({ date: 'Oct 17' })
    let ok = false
    await act(async () => { ok = writeInputs(() => { live(r.iid).acc = 'r' }) }); expect(ok).toBe(true)
    await act(async () => { ok = writeInputs(() => { live(r.iid).oil = { '2026-10-17': 0 } }) }); expect(ok).toBe(true)
    await act(async () => { ok = writeInputs(() => { live(r.iid).remarks = 'changed' }) }); expect(ok).toBe(true)
  })

  it('a good one changed into a bad one — its kind, a second day, a group — is refused, and stays as it was', async () => {
    const r = await filed()
    for (const over of [{ type: 'CSE' }, { endDate: 'Oct 20' }, { grp: 'gY', grpBy: admin }]) {
      const was = world()
      let ok = true
      await act(async () => { ok = writeInputs(() => { Object.assign(live(r.iid), over) }) })
      expect(ok, JSON.stringify(over)).toBe(false)
      expect(world()).toBe(was)
    }
  })

  it('a NAMED man\'s input of any shape is none of this check\'s business', async () => {
    let ok = false
    await act(async () => { ok = writeInputs(() => { INPUTS.unshift({ iid: 'ok1', person: others()[0], type: 'OD', date: 'Oct 13', endDate: 'Oct 20', yr: 2026, allday: true, remarks: '', mod: '2026-09-01' }) }) })
    expect(ok).toBe(true)
  })
})

describe('the schedule\'s own doors', () => {
  it('reassign refuses BOTH directions — a placeholder input is changed in its own window, never by a drag', async () => {
    const r = await filed({ type: 'Other', acc: 'u' })
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
})

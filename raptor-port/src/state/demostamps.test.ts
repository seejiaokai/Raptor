/* THE DEMO SEED CARRIES WHO PLACED EACH INPUT (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md
   §3.8: "A record with no `by` shows no line (D56); the demo seed is rewritten to carry them" — so the small-print line
   of D629 is seen on every list from the first look, not only on what is filed after it).

   The stamps are made up, as the demo inputs themselves are — and made so that the seed hands NOBODY a right he should
   not have: who placed an input is what lets a member change one he filed for another man (D655), so no seeded input
   names a member as the filer of someone else's. */
import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS, idsOf, inputLines, isLateInput, isPlaceholderInput, leadOf, onlyNamed, peopleOf, placeholderProblem, oilAsks, titleOf, inpLabel } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { initStore } from './store'
import { seedDemoGroup, seedDemoPlaceholders, seedDemoStamps } from './demoseed'
import { memberFilesForOthers } from './perms'
import { placedLine } from '../ui/placedline'

const SNAP = JSON.stringify(INPUTS)
beforeEach(() => { INPUTS.splice(0, INPUTS.length, ...JSON.parse(SNAP)); initStore() })
const admin = () => Object.keys(PEOPLE).find(id => PEOPLE[id].cs === 'Saber')!
/* who an input is for, for a failure's message — read through the one reader, so a record in either shape answers */
const who = (r: any) => idsOf(r).join('+')

describe('the demo inputs say who placed them', () => {
  it('every seeded input has a filer and a moment, and so a line to show', () => {
    expect(INPUTS.length).toBeGreaterThan(10)
    for (const r of INPUTS as any[]) {
      expect(r.by, `${who(r)} ${r.type} ${r.date}`).toBeTruthy()
      expect(typeof r.at).toBe('number')
      expect(placedLine(r), `${who(r)} ${r.type} ${r.date}`).toMatch(/^Placed by /)
    }
  })
  it('each is placed by a person it is for, or by the admin for him — never by another member', () => {
    const a = admin()
    let forHim = 0
    for (const r of INPUTS as any[]) {
      expect([...idsOf(r).map(String), a], `${who(r)} ${r.type} ${r.date} is placed by ${r.by}`).toContain(String(r.by))
      if (onlyNamed(r) != null && String(r.by) !== String(onlyNamed(r))) forHim++
    }
    expect(forHim, 'some are shown as filed for a man by the admin, so that wording is seen too').toBeGreaterThan(0)
  })
  it('the moment is on the day the record says it was last changed, where that day can be read', () => {
    const two = (n: number) => String(n).padStart(2, '0')
    let read = 0
    for (const r of INPUTS as any[]) {
      if (!/^\d{4}-\d{2}-\d{2}/.test(String(r.mod))) continue
      const d = new Date(r.at)
      expect(`${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`, `${who(r)} ${r.type}`).toBe(String(r.mod).slice(0, 10))
      read++
    }
    expect(read).toBeGreaterThan(0)
  })
  it('it stamps once: run again, nothing moves — and a record that already says who placed it is left alone', () => {
    const before = JSON.stringify(INPUTS)
    seedDemoStamps(); initStore()
    expect(JSON.stringify(INPUTS)).toBe(before)
    const mine: any = INPUTS[0]
    mine.by = 'someone'; mine.at = 5
    seedDemoStamps()
    expect([mine.by, mine.at]).toEqual(['someone', 5])
  })
})

/* ONE SHARED INPUT IN THE DEMO (the plan §3.13: "The demo seed carries one group input, so every list is seen with one
   from the first walk"). Filed by the admin for himself and three others — never by a member for another man.

   ON THE ONE RECORD (owner D756, 11 Oct 26: "an input is stored as ONE record with the list of its people"; the one-rule
   plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.11: "`state/demoseed.ts`'s shared demo input … rewritten in
   the new shape (one record of four people)" — step 2 (i) of that build). The demo's shared input is found by what it
   SAYS — the Flight safety brief of 23 Jul — and its people read through the one reader (engine/inputs.ts peopleOf), so
   no case reads a record's old `person` / `grp`; the FIRST one is the rule itself: a seed that still wrote one record a
   man tied by a group id would read as four one-person inputs (D759 reading 10) — a fresh demo with no shared input at
   all — and fails it. */
describe('the demo carries one shared input', () => {
  const team = () => (INPUTS as any[]).filter(r => r.type === 'Meeting' && r.date === 'Jul 23' && r.remarks === 'Flight safety brief')
  const everyone = () => team().flatMap(r => peopleOf(r))
  it('ONE record holding four people, each man once — the same day, hours, kind and remark (D756)', () => {
    const t = team()
    expect(t, 'one input is one record — not one a man').toHaveLength(1)
    expect(idsOf(t[0])).toHaveLength(4)
    expect(new Set(idsOf(t[0]).map(String)).size, 'each man once').toBe(4)
    for (const k of ['person', 'grp', 'grpBy']) expect(k in t[0], `the old shape's \`${k}\` is not written`).toBe(false)
    expect(memberFilesForOthers(t[0].type), 'a duty or a commitment').toBe(true)
  })
  it('filed by the admin, with each man\'s entry saying who put him in and when', () => {
    expect(team().length).toBeGreaterThan(0)
    for (const r of team()) {
      expect(String(r.by), 'who filed it').toBe(admin())
      expect(typeof r.at).toBe('number')
      expect(r.iid, 'its own id').toBeTruthy()
    }
    expect(everyone()).toHaveLength(4)
    for (const e of everyone()) { expect(String(e.by), String(e.p)).toBe(admin()); expect(typeof e.at, String(e.p)).toBe('number') }
    expect(everyone().some(e => String(e.p) === admin()), 'the admin is in it').toBe(true)
  })
  it('it is not late: the demo’s one shared input is not also its LATE example', () => {
    const lines = inputLines(team())
    expect(lines).toHaveLength(4)
    for (const l of lines) expect(isLateInput(l), PEOPLE[l.person].cs).toBe(false)
  })
  it('seeded once: a second boot adds no second one', () => {
    const before = JSON.stringify(team())
    seedDemoGroup()
    expect(JSON.stringify(team())).toBe(before)
    expect(everyone(), 'still four people, each once').toHaveLength(4)
  })
  /* …AND AN OLD STORE IS NOT SEEDED A SECOND TIME (the one-rule plan §4.11: the seed's "already seeded?" test "learns the
     new shape so an old store is not seeded twice"). A browser that booted before the build holds the brief as four
     records tied by the old group id; they read as four one-person inputs (D759 reading 10, D56) and nothing converts
     them — but a fifth, shared one beside them would be the brief twice over. */
  it('a store that still holds the brief in the old shape — four records of one group — is given no second one', () => {
    const [now] = team()
    const olds = idsOf(now).map((person: any, i: number) => ({
      iid: `old-brief-${i}`, person, type: now.type, date: now.date, allday: now.allday, s: now.s, e: now.e, remarks: now.remarks, mod: now.mod,
      grp: 'g-demo-brief', grpBy: now.by, by: now.by, at: now.at, modBy: now.by, modAt: now.at,
    }))
    INPUTS.splice(INPUTS.indexOf(now), 1, ...olds)
    seedDemoGroup()
    expect(team(), 'the four old records, and no new one').toHaveLength(4)
    expect(team().every(r => !Array.isArray(r.people)), 'nothing converted (D56)').toBe(true)
    expect(inputLines(team()).map((l: any) => String(l.person)).sort(), 'each still reads as that man\'s own input').toEqual(idsOf(now).map(String).sort())
  })
})

/* [INPUT-ALL-AVAIL], [INPUT-EVENT-KIND] (owner D700, D702, D711, D713 — 9 Oct 26): the demo carries an input filed for
   each placeholder, one of them of the new kind Event, so a fresh boot shows both on every list and the walk starts on
   them (the checking order's §7.1). Each is the record the app itself would write. */
describe('the demo carries an input filed for ALL AVAIL, and an Event filed for ALL', () => {
  const phs = () => (INPUTS as any[]).filter(r => isPlaceholderInput(r))
  it('two of them: a weekend Duty for ALL AVAIL, and an Event for ALL', () => {
    expect(phs().map(r => `${leadOf(r)} · ${r.type} · ${r.date}`).sort()).toEqual(['all · Event · Jul 22', 'allavail · Duty · Jul 25'])
  })
  it('the Event carries a title of its own, as the app would store one — the one demo input not named by its kind (D715)', () => {
    const ev = phs().find(r => r.type === 'Event')
    expect(ev.title).toBe('Sports afternoon')
    expect(titleOf(ev.type, ev.title), 'stored as the normaliser would store it').toBe(ev.title)
    expect(inpLabel(ev)).toBe('Sports afternoon')
    expect(ev.remarks, 'its remark is a remark, not its name over again').not.toBe(ev.title)
    expect(phs().find(r => r.type === 'Duty').title, 'the other is named by its kind').toBeUndefined()
  })
  it('each is a record the app itself would write: an allowed kind, one day, no group, no names', () => {
    for (const r of phs()) {
      expect(placeholderProblem(r), `${who(r)} ${r.type}`).toBe('')
      expect(idsOf(r), 'the placeholder alone — nobody named beside it').toHaveLength(1)
      expect(r.grp).toBeUndefined()
      expect(r.endDate).toBeUndefined()
      expect(r.iid, 'its own id').toBeTruthy()
    }
  })
  it('filed by the admin — a made-up member filer would hand out a made-up right, and here it is also whose OIL answer counts', () => {
    for (const r of phs()) { expect(String(r.by)).toBe(admin()); expect(typeof r.at).toBe('number') }
    const duty = phs().find(r => r.type === 'Duty')
    expect(oilAsks(duty.type)).toBe(true)
    expect(duty.oil, 'the Saturday\'s question is answered, so the demo opens on a crowd that earns').toEqual({ '2026-07-25': 0.5 })
  })
  it('neither is the demo\'s LATE example, and neither sits in the seed week', () => {
    for (const r of phs()) {
      expect(isLateInput(r), `${r.type}`).toBe(false)
      expect(['Jul 13', 'Jul 14', 'Jul 15', 'Jul 16', 'Jul 17', 'Jul 18', 'Jul 19']).not.toContain(r.date)
    }
  })
  it('seeded once: a second boot adds no second pair', () => {
    seedDemoPlaceholders()
    expect(phs()).toHaveLength(2)
  })
})


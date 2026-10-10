/* THE DEMO SEED CARRIES WHO PLACED EACH INPUT (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md
   §3.8: "A record with no `by` shows no line (D56); the demo seed is rewritten to carry them" — so the small-print line
   of D629 is seen on every list from the first look, not only on what is filed after it).

   The stamps are made up, as the demo inputs themselves are — and made so that the seed hands NOBODY a right he should
   not have: who placed an input is what lets a member change one he filed for another man (D655), so no seeded input
   names a member as the filer of someone else's. */
import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS, isLateInput, isPlaceholderInput, placeholderProblem, oilAsks, titleOf, inpLabel } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { initStore } from './store'
import { seedDemoGroup, seedDemoPlaceholders, seedDemoStamps } from './demoseed'
import { entriesOf } from './inputgroup'
import { memberFilesForOthers } from './perms'
import { placedLine } from '../ui/placedline'

const SNAP = JSON.stringify(INPUTS)
beforeEach(() => { INPUTS.splice(0, INPUTS.length, ...JSON.parse(SNAP)); initStore() })
const admin = () => Object.keys(PEOPLE).find(id => PEOPLE[id].cs === 'Saber')!

describe('the demo inputs say who placed them', () => {
  it('every seeded input has a filer and a moment, and so a line to show', () => {
    expect(INPUTS.length).toBeGreaterThan(10)
    for (const r of INPUTS as any[]) {
      expect(r.by, `${r.person} ${r.type} ${r.date}`).toBeTruthy()
      expect(typeof r.at).toBe('number')
      expect(placedLine(r), `${r.person} ${r.type} ${r.date}`).toMatch(/^Placed by /)
    }
  })
  it('each is placed by the person himself, or by the admin for him — never by another member', () => {
    const a = admin()
    let forHim = 0
    for (const r of INPUTS as any[]) {
      expect([String(r.person), a], `${r.person} ${r.type} ${r.date} is placed by ${r.by}`).toContain(String(r.by))
      if (String(r.by) !== String(r.person)) forHim++
    }
    expect(forHim, 'some are shown as filed for a man by the admin, so that wording is seen too').toBeGreaterThan(0)
  })
  it('the moment is on the day the record says it was last changed, where that day can be read', () => {
    const two = (n: number) => String(n).padStart(2, '0')
    let read = 0
    for (const r of INPUTS as any[]) {
      if (!/^\d{4}-\d{2}-\d{2}/.test(String(r.mod))) continue
      const d = new Date(r.at)
      expect(`${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`, `${r.person} ${r.type}`).toBe(String(r.mod).slice(0, 10))
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
   from the first walk"). Filed by the admin for himself and three others — never by a member for another man. */
describe('the demo carries one shared input', () => {
  const team = () => INPUTS.filter((r: any) => r.grp) as any[]
  it('four records, one group, the same day, hours, kind and remark — each man once', () => {
    const t = team()
    expect(t).toHaveLength(4)
    expect(new Set(t.map(r => r.grp)).size).toBe(1)
    expect(new Set(t.map(r => String(r.person))).size).toBe(4)
    expect(entriesOf(t)).toHaveLength(1)
    expect(memberFilesForOthers(t[0].type), 'a duty or a commitment').toBe(true)
  })
  it('filed by the admin, with each record saying who placed it and when', () => {
    for (const r of team()) {
      expect(String(r.grpBy)).toBe(admin())
      expect(String(r.by)).toBe(admin())
      expect(typeof r.at).toBe('number')
      expect(r.iid, 'its own id').toBeTruthy()
    }
    expect(team().some(r => String(r.person) === admin()), 'the admin is in it').toBe(true)
  })
  it('it is not late: the demo’s one shared input is not also its LATE example', () => {
    for (const r of team()) expect(isLateInput(r), PEOPLE[r.person].cs).toBe(false)
  })
  it('seeded once: a second boot adds no second one', () => {
    seedDemoGroup()
    expect(team()).toHaveLength(4)
  })
})

/* [INPUT-ALL-AVAIL], [INPUT-EVENT-KIND] (owner D700, D702, D711, D713 — 9 Oct 26): the demo carries an input filed for
   each placeholder, one of them of the new kind Event, so a fresh boot shows both on every list and the walk starts on
   them (the checking order's §7.1). Each is the record the app itself would write. */
describe('the demo carries an input filed for ALL AVAIL, and an Event filed for ALL', () => {
  const phs = () => (INPUTS as any[]).filter(r => isPlaceholderInput(r))
  it('two of them: a weekend Duty for ALL AVAIL, and an Event for ALL', () => {
    expect(phs().map(r => `${r.person} · ${r.type} · ${r.date}`).sort()).toEqual(['all · Event · Jul 22', 'allavail · Duty · Jul 25'])
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
      expect(placeholderProblem(r), `${r.person} ${r.type}`).toBe('')
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


/* THE DEMO SEED CARRIES WHO PLACED EACH INPUT (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md
   §3.8: "A record with no `by` shows no line (D56); the demo seed is rewritten to carry them" — so the small-print line
   of D629 is seen on every list from the first look, not only on what is filed after it).

   The stamps are made up, as the demo inputs themselves are — and made so that the seed hands NOBODY a right he should
   not have: who placed an input is what lets a member change one he filed for another man (D655), so no seeded input
   names a member as the filer of someone else's. */
import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { initStore } from './store'
import { seedDemoStamps } from './demoseed'
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

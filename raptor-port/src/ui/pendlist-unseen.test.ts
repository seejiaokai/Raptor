/* F4 of the 3 Nov 26 re-check (the Inputs batch [INPUTS-FIXES-1103]; docs/handpass/2026-11-03-inputs-seen-recheck.md):
   an input taken off before its day was published, retitled while off, then put back on the programme read in "To go
   out" as "Sports day → Games afternoon" — a change to something no reader of the published day ever saw. It reads as
   what it is to them: put on the programme. A request the published day DID show keeps its details words. */
import { describe, it, expect, beforeEach } from 'vitest'
import { INPUTS, inpId } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, signOf, setDayApproved, dayPendingItems } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore } from '../state/store'
import { pendItemWords } from './pendlist'

const ISNAP = JSON.stringify(INPUTS), DSNAP = JSON.stringify(DAYS)
const WED = 2
beforeEach(() => {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  stashClear()
  initStore()
})
const publish = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; setDayApproved(di, true) }
const plant = (r: any) => { const row: any = { person: 'ranger', type: 'Event', title: 'Sports day', date: 'Jul 15', allday: false, s: 540, e: 600, remarks: '', mod: '2026-07-01', yr: 2026, ...r }; inpId(row); INPUTS.unshift(row); return row }
const wordsFor = (iid: string) => dayPendingItems(WED).map((it: any) => pendItemWords(WED, it)).filter((w: any) => /Sports day|Games afternoon/.test(w.where + ' ' + w.from + ' ' + w.to))

describe('To go out: a request the published day never showed', () => {
  it('taken off, published, retitled, put back: it reads as put on the programme, not as a change of words', () => {
    const r = plant({ acc: 'r' })
    publish(WED)
    r.title = 'Games afternoon'
    r.acc = 'g'
    const w = wordsFor(r.iid)
    expect(w.length, 'one line for it').toBe(1)
    const line = `${w[0].where} · ${w[0].from} → ${w[0].to}`
    expect(line, 'not a change of words').not.toMatch(/Sports day\s*·?\s*→|Sports day →/)
    expect(line).toMatch(/Games afternoon/)
    expect(line, 'said as where it stands now').toMatch(/on the programme/)
  })

  it('THE CONTROL — one the published day showed keeps its details words', () => {
    const r = plant({ acc: 'g' })
    publish(WED)
    r.title = 'Games afternoon'
    const w = wordsFor(r.iid)
    expect(w.length).toBe(1)
    expect(`${w[0].from} → ${w[0].to}`).toMatch(/Sports day.*→.*Games afternoon/)
  })
})

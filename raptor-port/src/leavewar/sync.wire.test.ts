/* WHO STANDS BEHIND ALL AVAIL — A WIRE NO TEST HELD ([ALL-AVAIL-AS-MEMBER], the break tests of 12 Oct 26 —
   docs/superpowers/briefs/2026-10-12-one-rule-break-tests-brief.md, group 2). Written with the wire broken on purpose
   (sync.ts availableFor made to skip every input that holds a placeholder when it works out who is kept out), red
   then, green on the code as built.

   The rule (sync.ts availableFor; engine/inputs.ts inputLines — the one-rule plan §4.1, step 1): "a man's own line is
   his commitment over the window, WHOEVER ELSE IS IN THE INPUT, and an input for ALL AVAIL / ALL has no line and so
   keeps nobody out". The tests that existed ask it of an input of named people, and of a placeholder alone — never of
   the two TOGETHER, which is the input the one-rule build made possible (D750, D753, D755). There the named man must
   still be kept out of every ALL AVAIL crowd over those hours — his own input's (engine/oilev.ts strikes him from that
   one a second time, which is why nothing else noticed) and any other row's.

   Same harness as oilsync.test.ts: both real stores, headless; the input is planted as that file plants one. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore } from '../state/store'
import { projectPeople } from './state/raptorRoster'
import { initStore as lwInitStore, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { availableFor } from './sync'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
const SAT = '2026-07-18'
const WIN: [number, number] = [8 * 60, 15 * 60]

const reset = () => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0
  JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  stashClear()
}
beforeEach(() => {
  reset()
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
})
afterEach(reset)

const plant = (people: string[], over: any = {}) => INPUTS.unshift({ people: people.map(p => ({ p, h: 0 })), type: 'Meeting', date: 'Jul 18', allday: true, s: 0, e: 1439, remarks: '', mod: 'now', yr: 2026, by: 'stiff', ...over } as any)

/* THE SECOND WIRE (the same break tests): availableFor's own "cancelled or information only" line (engine/inputs.ts
   inputSilent — owner D760: "a CX the scheduler puts on a row that came from an input cancels the input itself"; the
   code's words: "its people are free for whoever else needs them"). With that one line taken out, 23 test files stayed
   green: the marks' tests ask the rules, the seven-day run and OIL, never who stands behind ALL AVAIL. */
describe('a CANCELLED or information-only input keeps nobody out of the ALL AVAIL crowd (D760 reading 1)', () => {
  it('his own all-day Meeting keeps him out; cancelled — he is free for whoever else needs him; brought back — kept out again', () => {
    plant(['bane'])
    expect(availableFor(SAT, WIN, DAYS[5]), 'the control').not.toContain('bane')
    ;(INPUTS[0] as any).cx = true; (INPUTS[0] as any).cxr = 'WX'
    expect(availableFor(SAT, WIN, DAYS[5]), 'cancelled').toContain('bane')
    ;(INPUTS[0] as any).cx = false; delete (INPUTS[0] as any).cxr
    expect(availableFor(SAT, WIN, DAYS[5]), 'brought back').not.toContain('bane')
  })
  it('information only: he is free; the red box alone frees nobody', () => {
    plant(['bane'], { info: true })
    expect(availableFor(SAT, WIN, DAYS[5]), 'information only').toContain('bane')
    reset()
    plant(['bane'], { flag: true })
    expect(availableFor(SAT, WIN, DAYS[5]), 'the red box is a mark to look at, not a cancel').not.toContain('bane')
  })
})

describe('a named person\'s own input keeps him out of the ALL AVAIL crowd — with ALL AVAIL beside him in it too (D750, D753, D755; the plan §4.1)', () => {
  it('THE CONTROLS — he is free that Saturday; an input for ALL AVAIL alone keeps nobody out; an input naming him alone keeps him out', () => {
    expect(availableFor(SAT, WIN, DAYS[5]), 'free before anything is filed').toContain('bane')
    plant(['allavail'])
    expect(availableFor(SAT, WIN, DAYS[5]), 'a placeholder has no line').toContain('bane')
    reset()
    plant(['bane'])
    expect(availableFor(SAT, WIN, DAYS[5]), 'his own commitment over those hours').not.toContain('bane')
  })
  it('named in an input that ALSO holds ALL AVAIL he is still kept out — and the man beside him, not in it, is not', () => {
    plant(['bane', 'allavail'])
    const crowd = availableFor(SAT, WIN, DAYS[5])
    expect(crowd, 'he is in the input as himself — never one of the crowd').not.toContain('bane')
    expect(crowd, 'nobody else is kept out by it').toContain('stiff')
  })
  it('…whichever of the two joined first', () => {
    plant(['allavail', 'bane'])
    expect(availableFor(SAT, WIN, DAYS[5])).not.toContain('bane')
  })
})

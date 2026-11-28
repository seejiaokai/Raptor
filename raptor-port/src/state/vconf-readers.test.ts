/* THE GUARD: EVERY READ OF THE SETTINGS HELD IN MEMORY IS THE SCHEDULE IN VIEW'S, OR SAYS WHY (batch 1's second half,
   §15 D4 and §16 D4′; the inventory in docs/data-schema.md §Settings held in memory).

   VCONF (and ruleNow, which reads it — engine/rules.ts) holds ONE squadron's Logic values: the schedule in view's. Once a
   pick can show another squadron's schedule while a page shows his own (D2252, D2253), a reader on his own page that
   reads VCONF reads the pick's values — an input's OIL question asked by 149's threshold for a 142 man. So each reader is
   marked: "schedule in view" (it reads the schedule shown, rightly), or "own squadron" (it asks the squadron of the
   thing it judges — an input's, a calendar's — through the reader installed by state/cutoff.ts, VCONF only where that
   squadron is the one loaded). The guard counts reads per file; a new read, or one more in a listed file, turns it red
   until it is listed with its kind and reason. */
import { describe, it, expect } from 'vitest'
import { join } from 'node:path'
import { countAll } from '../testing/enumguard'

const SRC = join(__dirname, '..')
type Kind = 'schedule in view' | 'own squadron' | 'the store itself'
const SV = 'the schedule engine, judging the schedule in view'
const READS: Record<string, { n: { VCONF?: number; ruleNow?: number }; kind: Kind; why: string }> = {
  'engine/rules.ts': { n: { VCONF: 17 }, kind: 'the store itself', why: 'VCONF itself: its load, its save, ruleNow' },
  'state/cutoff.ts': { n: { VCONF: 3 }, kind: 'own squadron', why: 'the cut-off of the squadron named: VCONF only where it is the loaded one, else its stored rules (getCut, saveCut, rulesOf) — and the readers it installs for an input\'s cut-off and OIL threshold' },
  'engine/oil.ts': { n: { ruleNow: 16 }, kind: 'own squadron', why: 'the schedule\'s OIL (the day\'s work, today\'s values beside a published day\'s kept ones) — the schedule in view; an input\'s OIL amount (inputOilAmt) its own squadron\'s threshold through ruleFor (§15 D4), voidedOil and repricedOil with it' },
  'engine/inputs.ts': { n: { VCONF: 8 }, kind: 'own squadron', why: 'the loaded squadron\'s cut-off (cutBackDays, cutRuleText — Logic\'s, the schedule in view); an input\'s own late mark asks cutBackFor, its own squadron\'s' },
  'engine/avail.ts': { n: { VCONF: 8 }, kind: 'schedule in view', why: `${SV}: who is available, the flight and sim lengths` },
  'engine/events.ts': { n: { VCONF: 9 }, kind: 'schedule in view', why: `${SV}: the day's events and their leads` },
  'engine/faceattrs.ts': { n: { VCONF: 4 }, kind: 'schedule in view', why: `${SV}: a published face's attributes` },
  'engine/people.ts': { n: { VCONF: 2 }, kind: 'schedule in view', why: `${SV}: a shift's day or night` },
  'engine/publish.ts': { n: { VCONF: 1 }, kind: 'schedule in view', why: `${SV}: publishing a day` },
  'engine/reporting.ts': { n: { VCONF: 4 }, kind: 'schedule in view', why: `${SV}: report times` },
  'engine/slots.ts': { n: { VCONF: 2 }, kind: 'schedule in view', why: `${SV}: a seat's rules` },
  'engine/time.ts': { n: { VCONF: 1 }, kind: 'schedule in view', why: `${SV}: a row with no end time` },
  'engine/validate.ts': { n: { VCONF: 42 }, kind: 'schedule in view', why: `${SV}: the warning list` },
  'engine/weekctx.ts': { n: { ruleNow: 1 }, kind: 'schedule in view', why: `${SV}: the week's context` },
  'ui/LogicPage.tsx': { n: { VCONF: 7, ruleNow: 1 }, kind: 'schedule in view', why: 'Logic shows and edits the schedule in view\'s rules' },
  'ui/logic-html.ts': { n: { VCONF: 8 }, kind: 'schedule in view', why: 'Logic\'s markup, the schedule in view\'s rules' },
  'ui/board.ts': { n: { VCONF: 1 }, kind: 'schedule in view', why: 'the Scheduler Board of the schedule in view' },
  'ui/html.ts': { n: { VCONF: 1 }, kind: 'schedule in view', why: 'the week\'s markup, the schedule in view' },
  'ui/interactions.ts': { n: { VCONF: 2 }, kind: 'schedule in view', why: 'the week\'s handlers' },
  'ui/oilmode.ts': { n: { VCONF: 4 }, kind: 'schedule in view', why: 'OIL Earn mode on the schedule' },
  'ui/peek.ts': { n: { VCONF: 3 }, kind: 'schedule in view', why: 'the next-week peek' },
  'probe-bridge.ts': { n: { VCONF: 2 }, kind: 'schedule in view', why: 'the developer\'s test bridge' },
}
const counts: Record<string, { VCONF?: number; ruleNow?: number }> = {}
for (const [k, re] of Object.entries({ VCONF: /\bVCONF\b/, ruleNow: /\bruleNow\s*\(/ })) for (const [f, n] of Object.entries(countAll(SRC, re))) (counts[f] ??= {})[k as 'VCONF'] = n

describe('every read of the settings held in memory is listed with its kind (§15 D4)', () => {
  it('each file reads VCONF / ruleNow exactly as often as listed', () => {
    expect(counts, 'a read of VCONF or ruleNow outside the inventory: list it with its kind and reason (docs/data-schema.md §Settings held in memory) — or, on a page of his own squadron, ask that squadron\'s value').toEqual(Object.fromEntries(Object.entries(READS).map(([f, e]) => [f, e.n])))
  })
  it('every entry says why', () => { for (const [f, e] of Object.entries(READS)) expect(e.why.length, f).toBeGreaterThan(15) })
})

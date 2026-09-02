import { describe, expect, it } from 'vitest'
import {
  addEventDef,
  classifyEvent,
  columnKindFor,
  defKey,
  EVENTDEF_STD,
  MAX_DEFNAME,
  MAX_EVENTDEFS,
  readEventDefs,
  removeEventDef,
  seedEventDefs,
  updateEventDef,
  type EventDef,
} from './eventdefs'
import type { DayInfo, EventBand } from './period'

const day = (date: string, e0 = '', e1 = ''): DayInfo => ({
  date, events: [e0, e1], blocked: false, blockedReason: '', ph: false,
})

describe('the seed', () => {
  it('is PH=off, Off day=free, No Leave=nolv, SC=work', () => {
    expect(seedEventDefs()).toEqual([
      { name: 'PH', kind: 'off' },
      { name: 'Off day', kind: 'free' },
      { name: 'No Leave', kind: 'nolv' },
      { name: 'SC', kind: 'work' },
    ])
  })

  it('is a copy, not the frozen original', () => {
    const a = seedEventDefs()
    a[0]!.name = 'X'
    expect(EVENTDEF_STD[0]!.name).toBe('PH')
  })
})

describe('classifyEvent — case- and spacing-folded', () => {
  const defs = seedEventDefs()
  it('matches exactly', () => {
    expect(classifyEvent(defs, 'PH')).toBe('off')
    expect(classifyEvent(defs, 'SC')).toBe('work')
  })
  it('folds case and inner whitespace', () => {
    expect(classifyEvent(defs, ' ph ')).toBe('off')
    expect(classifyEvent(defs, 'no  leave')).toBe('nolv')
  })
  it('is null for open text with no matching type', () => {
    expect(classifyEvent(defs, 'Range closure')).toBeNull()
    expect(classifyEvent(defs, '')).toBeNull()
  })
})

describe('defKey', () => {
  it('trims, collapses whitespace, lowercases', () => {
    expect(defKey('  No   Leave ')).toBe('no leave')
  })
})

describe('columnKindFor — the whole-column colour', () => {
  const defs = seedEventDefs()
  it('is off when any line is an off day', () => {
    expect(columnKindFor(defs, day('2026-01-01', 'PH'), [])).toBe('off')
    expect(columnKindFor(defs, day('2026-01-01', '', 'PH'), [])).toBe('off')
  })
  it('is nolv when a no-leave word is present and nothing is off', () => {
    expect(columnKindFor(defs, day('2026-01-01', 'No Leave'), [])).toBe('nolv')
  })
  it('lets off win over nolv on the same day', () => {
    expect(columnKindFor(defs, day('2026-01-01', 'No Leave', 'PH'), [])).toBe('off')
  })
  // The management Off day (owner, 2 Sep 26): grey, between PH and No Leave
  // in precedence. A PH on a declared Off day is still a PH — it earns.
  it('is free for an Off day, under off and over nolv', () => {
    expect(columnKindFor(defs, day('2026-01-01', 'Off day'), [])).toBe('free')
    expect(columnKindFor(defs, day('2026-01-01', 'No Leave', 'Off day'), [])).toBe('free')
    expect(columnKindFor(defs, day('2026-01-01', 'Off day', 'PH'), [])).toBe('off')
    const bands: EventBand[] = [{ line: 0, from: '2026-01-01', to: '2026-01-05', text: 'x', kind: 'free' }]
    expect(columnKindFor(defs, day('2026-01-03'), bands)).toBe('free')
  })
  it('never colours the column for a work word', () => {
    expect(columnKindFor(defs, day('2026-01-01', 'SC'), [])).toBeNull()
  })
  it('reads a covering band too', () => {
    const bands: EventBand[] = [{ line: 0, from: '2026-01-01', to: '2026-01-05', text: 'PH' }]
    expect(columnKindFor(defs, day('2026-01-03'), bands)).toBe('off')
    expect(columnKindFor(defs, day('2026-01-09'), bands)).toBeNull()
  })
})

describe('addEventDef', () => {
  it('appends a new type', () => {
    const out = addEventDef(seedEventDefs(), 'Standby', 'work')
    expect(out).toEqual([...seedEventDefs(), { name: 'Standby', kind: 'work' }])
  })
  it('refuses a blank name', () => {
    expect(addEventDef([], '  ', 'off')).toBe('An event type needs a name')
  })
  it('refuses a duplicate by fold', () => {
    expect(addEventDef(seedEventDefs(), ' ph ', 'work')).toContain('already an event type')
  })
  it('refuses an over-long name', () => {
    expect(addEventDef([], 'x'.repeat(MAX_DEFNAME + 1), 'off')).toContain(`${MAX_DEFNAME} characters`)
  })
  it('refuses past the cap', () => {
    const full: EventDef[] = Array.from({ length: MAX_EVENTDEFS }, (_, i) => ({ name: `E${i}`, kind: 'off' }))
    expect(addEventDef(full, 'One more', 'off')).toContain(`${MAX_EVENTDEFS} event types`)
  })
})

describe('updateEventDef', () => {
  it('renames and reclassifies', () => {
    const out = updateEventDef(seedEventDefs(), 3, { name: 'Standing Charge', kind: 'off' })
    expect(out).toEqual([
      { name: 'PH', kind: 'off' },
      { name: 'Off day', kind: 'free' },
      { name: 'No Leave', kind: 'nolv' },
      { name: 'Standing Charge', kind: 'off' },
    ])
  })
  it('changes only the kind when no name is given', () => {
    const out = updateEventDef(seedEventDefs(), 0, { kind: 'work' })
    expect((out as EventDef[])[0]).toEqual({ name: 'PH', kind: 'work' })
  })
  it('refuses a rename onto another type', () => {
    expect(updateEventDef(seedEventDefs(), 3, { name: 'PH' })).toContain('already an event type')
  })
})

describe('removeEventDef', () => {
  it('drops the entry', () => {
    expect(removeEventDef(seedEventDefs(), 1)).toEqual([
      { name: 'PH', kind: 'off' },
      { name: 'No Leave', kind: 'nolv' },
      { name: 'SC', kind: 'work' },
    ])
  })
  it('returns the same array unchanged for a bad index', () => {
    const defs = seedEventDefs()
    expect(removeEventDef(defs, 9)).toBe(defs)
  })
})

describe('readEventDefs — untrusted storage', () => {
  it('reads a clean list', () => {
    const raw = [{ name: 'PH', kind: 'off' }, { name: 'SC', kind: 'work' }]
    expect(readEventDefs(raw)).toEqual(raw)
  })
  it('returns null for a non-array (falls back to seed)', () => {
    expect(readEventDefs({})).toBeNull()
    expect(readEventDefs('nope')).toBeNull()
  })
  it('drops malformed rows, keeps good ones', () => {
    const raw = [
      { name: 'PH', kind: 'off' },
      { name: 'Bad', kind: 'purple' },
      { kind: 'off' },
      { name: 'SC', kind: 'work' },
    ]
    expect(readEventDefs(raw)).toEqual([{ name: 'PH', kind: 'off' }, { name: 'SC', kind: 'work' }])
  })
  it('collapses duplicates by fold', () => {
    const raw = [{ name: 'PH', kind: 'off' }, { name: ' ph ', kind: 'work' }]
    expect(readEventDefs(raw)).toEqual([{ name: 'PH', kind: 'off' }])
  })
})

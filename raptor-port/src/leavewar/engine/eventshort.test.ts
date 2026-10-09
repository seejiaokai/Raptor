/* AN EVENT'S SHORT FORM — what the grid prints for it (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.12; owner D643, D644, D645).

   An event has three things now: its full name ("National Day"), its kind (public holiday), and a short form of one to
   three letters or digits ("ND") that a day cell prints so no event widens its day. ONE function, `normShort`, says
   what a short form is, and every write and every read goes through it; ONE function, `shortOf`, answers "what does
   the grid print": the event's own short form, else the short form of the preset its name matches, else one derived
   from the name — so an event saved before this change prints short at once, with nothing converted (D56).

   Pure: no store. The writers that carry a short form are in ../eventshort-store.test.ts. */
import { describe, expect, it } from 'vitest'
import {
  addEventDef, derivedShort, EVENTDEF_STD, normShort, readEventDefs, removeEventDef, seedEventDefs, shortOf, SHORT_RULE,
  updateEventDef, type EventDef,
} from './eventdefs'
import { dayEventShort, writeDayEvent, type DayInfo } from './period'

const day = (date: string, e0 = '', e1 = ''): DayInfo => ({ date, events: [e0, e1], blocked: false, blockedReason: '', ph: false })

describe('normShort — the one rule of a short form', () => {
  it('takes one to three letters or digits and puts them in capitals', () => {
    expect(normShort('PH')).toBe('PH')
    expect(normShort('nl')).toBe('NL')
    expect(normShort('ex2')).toBe('EX2')
    expect(normShort('7')).toBe('7')
    expect(normShort('Off')).toBe('OFF')
  })
  it('forgives a space typed before or after, never one inside', () => {
    expect(normShort(' nd ')).toBe('ND')
    expect(normShort('A B')).toBeNull()
    expect(normShort(' ')).toBeNull()
  })
  it('refuses nothing, four characters, and any other mark', () => {
    expect(normShort('')).toBeNull()
    expect(normShort('ABCD')).toBeNull()
    expect(normShort('1/2')).toBeNull()
    expect(normShort('!!!')).toBeNull()
    expect(normShort('N.D')).toBeNull()
    expect(normShort('é')).toBeNull()
  })
  it('puts it in capitals FIRST, then counts — a letter that grows cannot slip past the length', () => {
    /* the German sharp s is ONE character and becomes "SS" in capitals: two of them with a third letter are five */
    expect('ß'.toUpperCase()).toBe('SS')
    expect(normShort('ßßa')).toBeNull()
    expect(normShort('ß')).toBe('SS')
  })
  it('refuses what is not text at all', () => {
    for (const v of [null, undefined, 12, {}, ['PH']]) expect(normShort(v)).toBeNull()
  })
  it('has one sentence for the refusal', () => {
    expect(SHORT_RULE).toMatch(/one to three letters or digits/i)
  })
})

describe('derivedShort — a short form made from the name', () => {
  it('two or more words give their initials, up to three', () => {
    expect(derivedShort('National Day')).toBe('ND')
    expect(derivedShort('No Leave')).toBe('NL')
    expect(derivedShort('A B')).toBe('AB')
    expect(derivedShort('Chinese New Year Eve')).toBe('CNY')
    expect(derivedShort('  off   day ')).toBe('OD')
  })
  it('one word gives its first three', () => {
    expect(derivedShort('Exercise')).toBe('EXE')
    expect(derivedShort('PH')).toBe('PH')
    expect(derivedShort('sc')).toBe('SC')
  })
  it('takes only letters and digits — a mark between two words parts them, an apostrophe does not', () => {
    expect(derivedShort('Stand-down')).toBe('SD')
    expect(derivedShort('1/2 day')).toBe('12D')
    expect(derivedShort('New Year’s Day')).toBe('NYD')
    expect(derivedShort("New Year's Day")).toBe('NYD')
    expect(derivedShort('Ex. 2')).toBe('E2')
  })
  it('reads an accented letter as its plain one', () => {
    expect(derivedShort('Évènement')).toBe('EVE')
  })
  it('a name with no letter or digit yields nothing', () => {
    expect(derivedShort('!!!')).toBeNull()
    expect(derivedShort('—')).toBeNull()
    expect(derivedShort('')).toBeNull()
  })
  it('whatever it yields is itself a good short form', () => {
    for (const t of ['National Day', 'Exercise', 'Stand-down', '1/2 day', 'ßßß', 'a', 'Ex. 2', 'ÉÉ ÀÀ ÖÖ ÜÜ'])
      expect(normShort(derivedShort(t))).toBe(derivedShort(t))
  })
})

describe('shortOf — what the grid prints', () => {
  const defs = seedEventDefs()
  it('the event’s own short form first', () => {
    expect(shortOf(defs, 'National Day', 'NAT')).toBe('NAT')
    expect(shortOf(defs, 'PH', 'hol')).toBe('HOL')
  })
  it('else the short form of the preset whose NAME matches, folded as the kind is matched', () => {
    expect(shortOf(defs, 'Off day', null)).toBe('OFF')
    expect(shortOf(defs, '  off   DAY ', undefined)).toBe('OFF')
    expect(shortOf(defs, 'No Leave', null)).toBe('NL')
  })
  it('else derived from the name', () => {
    expect(shortOf(defs, 'National Day', null)).toBe('ND')
    expect(shortOf(defs, 'Exercise', null)).toBe('EXE')
  })
  it('a stored short form that breaks the rule is ignored — the next answer shows', () => {
    expect(shortOf(defs, 'Off day', 'TOO LONG')).toBe('OFF')
    expect(shortOf(defs, 'National Day', '!!')).toBe('ND')
  })
  it('an event saved before this change prints short at once, nothing converted', () => {
    /* a library stored before short forms: its presets carry none */
    const old: EventDef[] = [{ name: 'PH', kind: 'off' }, { name: 'No Leave', kind: 'nolv' }]
    expect(shortOf(old, 'No Leave', undefined)).toBe('NL')
    expect(shortOf(old, 'PH', undefined)).toBe('PH')
    expect(shortOf([], 'Off day', undefined)).toBe('OD')
  })
  it('an old event whose name yields nothing prints a dot', () => {
    expect(shortOf(defs, '!!!', null)).toBe('•')
  })
  it('nothing for no event', () => {
    expect(shortOf(defs, '', null)).toBe('')
    expect(shortOf(defs, '   ', 'PH')).toBe('')
  })
})

describe('a preset carries a short form', () => {
  it('the four it starts with: PH, OFF, NL, SC', () => {
    expect(seedEventDefs().map(d => [d.name, d.short])).toEqual([['PH', 'PH'], ['Off day', 'OFF'], ['No Leave', 'NL'], ['SC', 'SC']])
    expect(EVENTDEF_STD.every(d => normShort(d.short) === d.short)).toBe(true)
  })
  it('a stored library with none reads as it stands', () => {
    expect(readEventDefs([{ name: 'PH', kind: 'off' }, { name: 'Ex', kind: 'work' }])).toEqual([{ name: 'PH', kind: 'off' }, { name: 'Ex', kind: 'work' }])
  })
  it('a stored short form is read through the one rule — a bad one is dropped, the preset kept', () => {
    expect(readEventDefs([
      { name: 'PH', kind: 'off', short: 'ph' },
      { name: 'Ex', kind: 'work', short: 'EXERCISE' },
      { name: 'Vis', kind: 'work', short: 7 },
    ])).toEqual([{ name: 'PH', kind: 'off', short: 'PH' }, { name: 'Ex', kind: 'work' }, { name: 'Vis', kind: 'work' }])
  })
  it('added with one, or without', () => {
    expect(addEventDef([], 'National Day', 'off', 'nat')).toEqual([{ name: 'National Day', kind: 'off', short: 'NAT' }])
    expect(addEventDef([], 'National Day', 'off')).toEqual([{ name: 'National Day', kind: 'off' }])
    expect(addEventDef([], 'National Day', 'off', '')).toEqual([{ name: 'National Day', kind: 'off' }])
  })
  it('an add with a bad one is refused with the sentence', () => {
    expect(addEventDef([], 'National Day', 'off', 'NATL')).toBe(SHORT_RULE)
    expect(addEventDef([], 'National Day', 'off', 'N D')).toBe(SHORT_RULE)
  })
  it('an edit keeps what it did not name — a rename or a change of kind leaves the short form', () => {
    const defs = seedEventDefs()
    expect(updateEventDef(defs, 1, { name: 'Stand down' })).toEqual(expect.arrayContaining([{ name: 'Stand down', kind: 'free', short: 'OFF' }]))
    expect(updateEventDef(defs, 1, { kind: 'nolv' })).toEqual(expect.arrayContaining([{ name: 'Off day', kind: 'nolv', short: 'OFF' }]))
  })
  it('its short form is changed, refused when bad, and cleared by an empty box', () => {
    const defs = seedEventDefs()
    expect((updateEventDef(defs, 0, { short: 'hol' }) as EventDef[])[0]).toEqual({ name: 'PH', kind: 'off', short: 'HOL' })
    expect(updateEventDef(defs, 0, { short: 'HOLS' })).toBe(SHORT_RULE)
    expect((updateEventDef(defs, 0, { short: '' }) as EventDef[])[0]).toEqual({ name: 'PH', kind: 'off' })
    /* the others untouched each time */
    expect((updateEventDef(defs, 0, { short: 'hol' }) as EventDef[]).slice(1)).toEqual(defs.slice(1))
  })
  it('a neighbour’s delete leaves it', () => {
    expect(removeEventDef(seedEventDefs(), 0)[0]).toEqual({ name: 'Off day', kind: 'free', short: 'OFF' })
  })
})

describe('a day’s event carries its short form beside its text and kind', () => {
  it('written together, read back by its line', () => {
    const d = writeDayEvent(day('2026-08-09'), 1, 'National Day', 'off', 'nat')
    expect(d.events[1]).toBe('National Day')
    expect(d.eventKinds?.[1]).toBe('off')
    expect(dayEventShort(d, 1)).toBe('NAT')
    expect(dayEventShort(d, 0)).toBeNull()
    expect(dayEventShort(d, 7)).toBeNull()
  })
  it('a write that names none clears the one that was there — yesterday’s short form never prints for today’s word', () => {
    const a = writeDayEvent(day('2026-08-09'), 0, 'National Day', 'off', 'NAT')
    expect(dayEventShort(writeDayEvent(a, 0, 'Exercise', 'work'), 0)).toBeNull()
  })
  it('a cleared event keeps none behind', () => {
    const a = writeDayEvent(day('2026-08-09'), 0, 'National Day', 'off', 'NAT')
    expect(dayEventShort(writeDayEvent(a, 0, '', null, 'NAT'), 0)).toBeNull()
  })
  it('a day that never had one is stored exactly as before', () => {
    expect(writeDayEvent(day('2026-08-09'), 0, 'PH', 'off')).toEqual({ ...day('2026-08-09', 'PH'), eventKinds: ['off'] })
  })
  it('a stored short form that breaks the rule reads as none', () => {
    const d: DayInfo = { ...day('2026-08-09', 'PH'), eventShorts: ['FOUR', 'x!'] as any }
    expect(dayEventShort(d, 0)).toBeNull()
    expect(dayEventShort(d, 1)).toBeNull()
  })
})

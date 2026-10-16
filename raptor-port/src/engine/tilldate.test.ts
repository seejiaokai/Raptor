/* THE TILL DATE IS PRINTED FROM AN INPUT'S OWN DATES, NEVER WRITTEN INTO ITS REMARK (owner D948, 16 Oct 26 — answering
   D946, building D728 step 2, [TILL-FROM-DATES]). The engine's three answers, pinned:
   · remarksTyped — the words a person typed: a date token read as the date and left out, NARROWLY (the night's scenario
     designer, A and B): only "till <day> <real month>", and "on <day> <month>" only where that day is the input's own;
     SANS availability and an upchit are their words as typed;
   · tillOf / remarksShown — what every screen prints: the typed words, then "till <its last day>", one-day inputs too
     (his answer B);
   · inpDetailKey — a published day compares the PRINTED remark, so a stretched or cut input reads pending where its date
     moved (D189, kept by D948 (3)), and a remark saved with the date in it reads the same as the words alone. */
import { describe, expect, it } from 'vitest'
import { remarksTyped, remarksShown, tillOf, tillOfISO, inpDetailKey } from './inputs'

const leave = (o: any = {}) => ({ person: 'bane', type: 'LL', date: 'Aug 10', endDate: 'Aug 14', yr: 2026, allday: true, remarks: '', ...o })

describe('remarksTyped — the words a person typed', () => {
  it('a "till <day> <month>" is the date, wherever it stands; its words are kept; what the cut leaves is tidied', () => {
    expect(remarksTyped('Bangkok till 14 Aug, back Mon', leave())).toBe('Bangkok, back Mon')
    expect(remarksTyped('Leave (till 14 Aug)', leave())).toBe('Leave')
    expect(remarksTyped('till 14 Aug,Bangkok', leave())).toBe('Bangkok')
    expect(remarksTyped('Home till 14 August', leave()), 'a month spelt out').toBe('Home')
    expect(remarksTyped('Bali till 14 Aug', leave())).toBe('Bali')
    expect(remarksTyped('till 14 Aug Bangkok', leave())).toBe('Bangkok')
    expect(remarksTyped('till 14 Aug — Bangkok', leave()), 'the join after a date that opens it goes').toBe('Bangkok')
    expect(remarksTyped('till 14 Aug -5°C kit', leave()), 'a sign of the next word stays').toBe('-5°C kit')
    expect(remarksTyped('— see the notice — till 14 Aug', leave()), 'a sign the words opened with stays').toBe('— see the notice')
    expect(remarksTyped('kit, boots, till 14 Aug', leave())).toBe('kit, boots')
  })
  it('words that only look like a date are his (A, and the code read): no real month, a time after it, any "on"', () => {
    expect(remarksTyped('Brief till 14 Aug 0800 start', leave()), 'the time stays').toBe('Brief 0800 start')
    expect(remarksTyped('till 3 Marines are back', leave())).toBe('till 3 Marines are back')
    expect(remarksTyped('Instructing on 2 BFM', leave())).toBe('Instructing on 2 BFM')
    expect(remarksTyped('Course on 1 day', leave())).toBe('Course on 1 day')
    expect(remarksTyped('till 6 ACs are back', leave())).toBe('till 6 ACs are back')
    expect(remarksTyped('Wedding on 12 Aug', leave()), 'the 12th is inside it, not its first or last day').toBe('Wedding on 12 Aug')
  })
  it('"on <day> <month>" is never read as a date, even one of its own days (the code read, finding 1)', () => {
    expect(remarksTyped('Flight on 10 Aug', leave())).toBe('Flight on 10 Aug')
    expect(remarksTyped('on 10 Aug', leave({ endDate: undefined }))).toBe('on 10 Aug')
  })
  it('SANS availability and an upchit keep their words whole (B)', () => {
    expect(remarksTyped('Avail till 20 Jul only', { type: 'SANS Availability' })).toBe('Avail till 20 Jul only')
    expect(remarksTyped('fit till 3 Jan', { type: 'Upchit' })).toBe('fit till 3 Jan')
  })
  it('a window\'s draft (ISO dates) is asked the same way', () => {
    expect(remarksTyped('Bali till 14 Aug', { type: 'LL', start: '2026-08-10', end: '2026-08-14' })).toBe('Bali')
  })
})

describe('a remark with no date in it is returned exactly as typed — the tidy runs only where a date was cut (the fix read)', () => {
  it('no date: nothing of it is touched', () => {
    for (const r of ['-ve ART, cleared', '[ ] pack kit', 'Leave () placeholder', '—see the notice—', '--> Bangkok', 'Extra .5 day', 'Leave ( see note )', 'ok :)'])
      expect(remarksTyped(r, leave()), r).toBe(r)
  })
  it('a date cut beside a bracket or a dash, or opening the remark before a stop: only its own place is tidied', () => {
    expect(remarksTyped('Bangkok (till 14 Aug, back Mon)', leave())).toBe('Bangkok (back Mon)')
    expect(remarksTyped('Bangkok—till 14 Aug—back Mon', leave())).toBe('Bangkok—back Mon')
    expect(remarksTyped('till 14 Aug: Bangkok', leave())).toBe('Bangkok')
    expect(remarksTyped('till 17 Jul.', leave())).toBe('')
    expect(remarksTyped('Bali till 14 Aug?', leave())).toBe('Bali?')
  })
})

describe('tillOf / remarksShown — what every screen prints', () => {
  it('the typed words, then "till <its last day>"; the date alone where nothing was typed', () => {
    expect(remarksShown(leave({ remarks: 'Las Vegas' }))).toBe('Las Vegas till 14 Aug')
    expect(remarksShown(leave())).toBe('till 14 Aug')
  })
  it('a one-day input says "till <that day>" (his answer B)', () => {
    expect(tillOf(leave({ endDate: undefined }))).toBe('till 10 Aug')
    expect(tillOfISO('Meeting', '2026-08-10', '')).toBe('till 10 Aug')
  })
  it('a remark saved with its date in it is printed once', () => {
    expect(remarksShown(leave({ remarks: 'Medically down till 14 Aug' }))).toBe('Medically down till 14 Aug')
    expect(remarksShown(leave({ remarks: 'Bali till 12 Aug' })), 'a stale date is read as the date; the real one printed').toBe('Bali till 14 Aug')
  })
  it('SANS availability and an upchit print as typed, with no date; a window with no date yet shows none', () => {
    expect(remarksShown({ type: 'SANS Availability', date: 'Aug 10', remarks: 'AM only' })).toBe('AM only')
    expect(tillOf({ type: 'Upchit', date: 'Aug 10' })).toBe('')
    expect(tillOfISO('LL', '', '')).toBe('')
  })
})

describe('inpDetailKey — a published day compares the printed remark (D189, D948 (3))', () => {
  it('a remark saved with its date and the words alone read the same — a day published before the build reads nothing', () => {
    expect(inpDetailKey(leave({ remarks: 'Bali till 14 Aug' }))).toBe(inpDetailKey(leave({ remarks: 'Bali' })))
  })
  it('its last day moved: the printed date moved — a change; its first day alone moved: no change', () => {
    expect(inpDetailKey(leave({ endDate: 'Aug 15' }))).not.toBe(inpDetailKey(leave()))
    expect(inpDetailKey(leave({ date: 'Aug 9' }))).toBe(inpDetailKey(leave()))
  })
})

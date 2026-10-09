/* THE INPUT CARD'S FACTS (owner D718–D724, 10 Oct 26 — `[INPUT-LIST-AS-DAY-CARD]`; the plan
   docs/superpowers/plans/2026-10-10-input-card-plan.md §2.1). One pure body says what a card prints — the opened day
   and the phone's list draw whatever it answers, so the two cannot differ.

   D721: every name of a shared input, never "+N". D723: the kind's own name on the top line, always; the title on a row
   of its own only where it is not the kind's name. D720 / D723 / D724: "By Saber" — for one person only where someone
   else placed it; for several people always; never a day or a time. */
import { describe, expect, it } from 'vitest'
import { cardOf, cardWhen, lateNoteOf } from './inputcard-model'

const P: Record<string, any> = {
  a: { cs: 'Ace' }, b: { cs: 'Blade' }, r: { cs: 'Ranger' }, s: { cs: 'Saber' }, z: { cs: 'zulu' },
  allavail: { cs: 'ALL AVAIL', special: true }, all: { cs: 'ALL', special: true },
}
const T = new Date(2026, 6, 10, 9, 30).getTime()
const rec = (over: any) => ({ iid: 'i' + Math.random(), person: 'r', type: 'Duty', date: 'Jul 18', yr: 2026, allday: false, s: 780, e: 900, by: 'r', at: T, ...over })

describe('who it is for', () => {
  it('one person: his callsign', () => {
    expect(cardOf([rec({})], P).names).toBe('Ranger')
  })
  it('a shared input names EVERYONE, A to Z, whatever order the records come in — never "+N" (D721)', () => {
    const rows = ['s', 'z', 'a', 'r', 'b'].map(person => rec({ person, grp: 'g1', grpBy: 's', by: 's' }))
    expect(cardOf(rows, P).names).toBe('Ace, Blade, Ranger, Saber, zulu')
    expect(cardOf(rows, P).names).not.toMatch(/\+\d/)
  })
  it('an input for ALL AVAIL or ALL reads the placeholder’s own name', () => {
    expect(cardOf([rec({ person: 'allavail', by: 's' })], P).names).toBe('ALL AVAIL')
    expect(cardOf([rec({ person: 'all', by: 's' })], P).names).toBe('ALL')
  })
  it('someone no list knows is said by his id, never left blank', () => {
    expect(cardOf([rec({ person: 'p99' })], P).names).toBe('p99')
  })
})

describe('the kind, the title and the remark', () => {
  it('the kind is the kind’s own name — with a title or without', () => {
    expect(cardOf([rec({ type: 'Event', title: 'Sports day' })], P).kind).toBe('Event')
    expect(cardOf([rec({ type: 'Duty' })], P).kind).toBe('Duty')
    expect(cardOf([rec({ type: 'OIL', allday: true })], P).kind).toBe('OIL')
  })
  it('the title is the input’s own, only where it is not the kind’s name (D722, D723)', () => {
    expect(cardOf([rec({ type: 'Event', title: 'Sports day' })], P).title).toBe('Sports day')
    expect(cardOf([rec({ type: 'Event' })], P).title).toBe('')
    expect(cardOf([rec({ type: 'Event', title: 'event' })], P).title, 'the kind’s own name typed back is no title').toBe('')
  })
  it('a title on a kind that takes none is not shown', () => {
    expect(cardOf([rec({ type: 'LL', title: 'Holiday', allday: true })], P).title).toBe('')
  })
  it('the remark is the remark as stored; a blank one is none', () => {
    expect(cardOf([rec({ remarks: 'bring boots' })], P).remark).toBe('bring boots')
    expect(cardOf([rec({ remarks: '   ' })], P).remark).toBe('')
    expect(cardOf([rec({})], P).remark).toBe('')
  })
})

describe('"By Saber" — who placed it (D720, D723, D724)', () => {
  it('one person, placed by himself: nothing', () => {
    expect(cardOf([rec({ person: 'r', by: 'r' })], P).by).toBe('')
  })
  it('one person, placed by someone else: the filer’s callsign — no "for", no day, no time', () => {
    expect(cardOf([rec({ person: 'r', by: 's' })], P).by).toBe('Saber')
  })
  it('several people: ALWAYS — even where the filer is one of them (D724)', () => {
    const rows = ['a', 's', 'r'].map(person => rec({ person, grp: 'g1', grpBy: 's', by: 's' }))
    expect(cardOf(rows, P).by).toBe('Saber')
  })
  it('several people, filed by someone outside it', () => {
    const rows = ['a', 'r'].map(person => rec({ person, grp: 'g1', grpBy: 's', by: 's' }))
    expect(cardOf(rows, P).by).toBe('Saber')
  })
  it('a shared input’s filer is the entry’s own (`grpBy`) — not whoever added a man later', () => {
    const rows = [rec({ person: 'a', grp: 'g1', grpBy: 's', by: 's' }), rec({ person: 'r', grp: 'g1', grpBy: 's', by: 'b' })]
    expect(cardOf(rows, P).by).toBe('Saber')
  })
  it('an input for ALL AVAIL always says it — its filer is never its person', () => {
    expect(cardOf([rec({ person: 'allavail', by: 's' })], P).by).toBe('Saber')
  })
  it('a record that never recorded who placed it says nothing (D56) — one person or several', () => {
    expect(cardOf([rec({ person: 'r', by: undefined, at: undefined })], P).by).toBe('')
    expect(cardOf(['a', 'r'].map(person => rec({ person, grp: 'g1', by: undefined, at: undefined })), P).by).toBe('')
  })
  it('a filer since taken off every list is still said, in words', () => {
    expect(cardOf([rec({ person: 'r', by: 'gone' })], P).by).toBe('someone no longer listed')
  })
  it('a later change by someone else does not put a name on a man’s own input (the change is in the window — D723)', () => {
    expect(cardOf([rec({ person: 'r', by: 'r', modBy: 's', modAt: T + 5000 })], P).by).toBe('')
  })
})

describe('the colour square', () => {
  it('red for an absence, amber for a duty or a commitment — and for an upchit', () => {
    expect(cardOf([rec({ type: 'LL', allday: true })], P).tone).toBe('red')
    expect(cardOf([rec({ type: 'OIL', allday: true })], P).tone).toBe('red')
    expect(cardOf([rec({ type: 'Duty' })], P).tone).toBe('amb')
    expect(cardOf([rec({ type: 'Upchit', allday: true })], P).tone).toBe('amb')
  })
})

describe('when it is', () => {
  it('its hours, "All day", or a half day', () => {
    expect(cardWhen(rec({ s: 600, e: 660 }), '2026-07-18', '2026-07-18')).toBe('10:00–11:00')
    expect(cardWhen(rec({ allday: true }), '2026-07-18', '2026-07-18')).toBe('All day')
    expect(cardWhen(rec({ allday: false, half: 'am' }), '2026-07-18', '2026-07-18')).toBe('AM')
  })
  it('one that runs on past the day it is shown under says the day it runs till', () => {
    expect(cardWhen(rec({ allday: true }), '2026-07-20', '2026-07-18')).toBe('till 20 Jul')
    expect(cardWhen(rec({ s: 600, e: 660 }), '2026-07-20', '2026-07-18')).toBe('10:00–11:00 · till 20 Jul')
  })
  it('shown under its last day it says its hours', () => {
    expect(cardWhen(rec({ allday: true }), '2026-07-20', '2026-07-20')).toBe('All day')
  })
})

describe('the LATE note (D646)', () => {
  const late = (r: any) => (r.late ? 'after the cut-off, Wed 1 Jul' : '')
  it('nobody late: no note, so no tag', () => {
    expect(lateNoteOf([rec({})], late, P)).toBe('')
  })
  it('one person late: the cut-off he missed', () => {
    expect(lateNoteOf([rec({ late: true })], late, P)).toBe('after the cut-off, Wed 1 Jul')
  })
  it('a shared input, everyone late alike: the one sentence', () => {
    const rows = ['a', 'r'].map(person => rec({ person, late: true }))
    expect(lateNoteOf(rows, late, P)).toBe('after the cut-off, Wed 1 Jul')
  })
  it('a shared input where only some are late names who — a man added later can be late alone', () => {
    const rows = [rec({ person: 'a' }), rec({ person: 'r', late: true }), rec({ person: 'b', late: true })]
    expect(lateNoteOf(rows, late, P)).toBe('Blade, Ranger: after the cut-off, Wed 1 Jul')
  })
  it('…and where their cut-offs differ, each with his own', () => {
    const l2 = (r: any) => (r.late ? `after the cut-off, ${r.late}` : '')
    const rows = [rec({ person: 'a', late: 'Wed 1 Jul' }), rec({ person: 'r', late: 'Wed 8 Jul' })]
    expect(lateNoteOf(rows, l2, P)).toBe('Ace: after the cut-off, Wed 1 Jul · Ranger: after the cut-off, Wed 8 Jul')
  })
})

/* "TILL" SAID ONCE (owner D728, 10 Oct 26 — "1 now, 2 later"): the app writes "till 17 Jul" into the remark of an input
   of several days, and the card's corner says the same day — so the card leaves those automatic words out of its
   remark. ONLY on the card, only the words that repeat the corner's own day; anything typed stays; the record is not
   touched. The corner is handed in as the card prints it (cardWhen). */
describe('"till <date>" is said once — by the corner (D728)', () => {
  const corner = 'till 17 Jul'
  it('a remark that is only the automatic words shows no remark', () => {
    expect(cardOf([rec({ remarks: 'till 17 Jul' })], P, corner).remark).toBe('')
  })
  it('the words typed before it stay', () => {
    expect(cardOf([rec({ remarks: 'Medically down till 17 Jul' })], P, corner).remark).toBe('Medically down')
    expect(cardOf([rec({ remarks: 'bring ID card till 17 Jul' })], P, '10:00–11:00 · till 17 Jul').remark).toBe('bring ID card')
  })
  it('…and the words typed after it, or round it', () => {
    expect(cardOf([rec({ remarks: 'till 17 Jul Bangkok' })], P, corner).remark).toBe('Bangkok')
    expect(cardOf([rec({ remarks: 'Detachment till 17 Jul — Bangkok' })], P, corner).remark).toBe('Detachment — Bangkok')
    expect(cardOf([rec({ remarks: 'Overseas leave — off island, till 17 Jul' })], P, corner).remark).toBe('Overseas leave — off island')
  })
  /* ONLY THE JOIN IS TIDIED (Astra's read of the code, 10 Oct 26 — finding 1). The first version, having taken the
     words out, stripped spaces, commas and dashes from BOTH ENDS OF THE WHOLE REMARK: "-5°C cold-weather kit till
     17 Jul" lost its minus sign on the card. What a person typed stays (D728) — to the character. */
  it('punctuation that belongs to the typed words is never touched — only the join where the words stood', () => {
    expect(cardOf([rec({ remarks: '-5°C cold-weather kit till 17 Jul' })], P, corner).remark).toBe('-5°C cold-weather kit')
    expect(cardOf([rec({ remarks: '— see the notice — till 17 Jul' })], P, corner).remark).toBe('— see the notice')
    expect(cardOf([rec({ remarks: 'till 17 Jul — Bangkok -' })], P, corner).remark).toBe('Bangkok -')
    expect(cardOf([rec({ remarks: 'Bring ID till 17 Jul report to desk' })], P, corner).remark).toBe('Bring ID report to desk')
    expect(cardOf([rec({ remarks: 'kit, boots, till 17 Jul' })], P, corner).remark).toBe('kit, boots')
    expect(cardOf([rec({ remarks: 'kit… till 17 Jul' })], P, corner).remark).toBe('kit…')
  })
  it('a "till" for ANOTHER day is not the corner’s and stays — somebody typed it', () => {
    expect(cardOf([rec({ remarks: 'Course till 30 Jul' })], P, corner).remark).toBe('Course till 30 Jul')
  })
  it('a card whose corner says no "till" keeps its remark whole — a one-day input, or an input on its last day', () => {
    expect(cardOf([rec({ remarks: 'till 17 Jul' })], P, 'All day').remark).toBe('till 17 Jul')
    expect(cardOf([rec({ remarks: 'till 17 Jul' })], P, '').remark).toBe('till 17 Jul')
    expect(cardOf([rec({ remarks: 'till 17 Jul' })], P).remark).toBe('till 17 Jul')
  })
  it('an input that runs into another year: the remark’s "till 1 Jan" is the corner’s "till 1 Jan 2027"', () => {
    expect(cardOf([rec({ remarks: 'Overseas leave till 1 Jan' })], P, 'till 1 Jan 2027').remark).toBe('Overseas leave')
    expect(cardOf([rec({ remarks: 'till 1 Jan 2027' })], P, 'till 1 Jan 2027').remark).toBe('')
  })
  it('a year somebody typed after it, which the corner does not say, is his words — left alone', () => {
    expect(cardOf([rec({ remarks: 'till 17 Jul 2025 (last year’s)' })], P, corner).remark).toBe('till 17 Jul 2025 (last year’s)')
  })
  it('never mid-word, whatever the capitals', () => {
    expect(cardOf([rec({ remarks: 'Until 17 Jul stay clear' })], P, corner).remark).toBe('Until 17 Jul stay clear')
    expect(cardOf([rec({ remarks: 'TILL 17 JUL' })], P, corner).remark).toBe('')
  })
  it('a shared input’s remark is treated the same', () => {
    expect(cardOf([rec({ person: 'a', remarks: 'Range week till 17 Jul' }), rec({ person: 'b', remarks: 'Range week till 17 Jul' })], P, corner).remark).toBe('Range week')
  })
  it('nothing else of the card changes', () => {
    const plain = cardOf([rec({ remarks: 'Medically down till 17 Jul', title: 'Sports day' })], P)
    expect(cardOf([rec({ remarks: 'Medically down till 17 Jul', title: 'Sports day' })], P, corner)).toEqual({ ...plain, remark: 'Medically down' })
  })
})

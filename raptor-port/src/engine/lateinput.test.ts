/* The late-input mark (owner, 9 Aug 26). A member's input is due
   VCONF.inputLead days before the week's Monday; one last changed after that
   is marked LATE wherever it is drawn. This file pins the arithmetic and the
   two edges that decide whether the mark is fair: the deadline day itself is
   ON TIME, and an input with no usable stamp is never accused. */
import { describe, expect, it, afterEach } from 'vitest'
import { VCONF, rulesReset } from './rules'
import { INPUTS, isDownchit, isLateInput, inputDueISO, weekStartISO, inputStampISO, lateNote, isoLabel } from './inputs'
import { otherWeekInputs } from './weeks-data'

afterEach(() => rulesReset())

describe('the deadline itself', () => {
  it('is the week Monday minus the rule — two weeks, so 17 Aug is due by 3 Aug', () => {
    /* the ask was first "a week prior, which is 10 August", then corrected to
       two weeks (owner, 9 Aug 26). Both are just this arithmetic. */
    expect(inputDueISO('17/08/2026')).toBe('2026-08-03')
    VCONF.inputLead = 7
    expect(inputDueISO('17/08/2026'), 'the original one-week ask still works').toBe('2026-08-10')
  })

  it('follows the rule value, so changing it in the Rules tab moves the line', () => {
    VCONF.inputLead = 28
    expect(inputDueISO('17/08/2026')).toBe('2026-07-20')
    VCONF.inputLead = 0
    expect(inputDueISO('17/08/2026'), 'zero days = due by the Monday itself').toBe('2026-08-17')
  })

  it('steps back over a month boundary rather than off the end of one', () => {
    /* 3 Aug minus 14 is 20 Jul, not "Aug -11" — the arithmetic runs through a
       real date, not by subtracting from the day number. */
    expect(inputDueISO('03/08/2026')).toBe('2026-07-20')
    expect(inputDueISO('12/01/2026')).toBe('2025-12-29')   // and over a year boundary
  })

  it('reads the loaded week when it is not given one', () => {
    expect(weekStartISO()).toBe('2026-07-13')              // the demo week's Monday
    expect(inputDueISO()).toBe('2026-06-29')
  })
})

describe('what counts as late', () => {
  const on = (mod: any) => ({ person: 'yeti', date: 'Jul 13', type: 'Meeting', mod })

  it('is strictly AFTER the deadline — the deadline day is still on time', () => {
    expect(isLateInput(on('2026-06-29')), 'the deadline day itself').toBe(false)
    expect(isLateInput(on('2026-06-30')), 'the day after').toBe(true)
    expect(isLateInput(on('2026-06-20')), 'comfortably early').toBe(false)
  })

  it('never marks a DOWNCHIT, however late it is stamped (owner, 9 Aug 26)', () => {
    /* going DNIF is not a decision made in advance. Marking the one type that
       is always last-minute would put a badge on every downchit and teach
       everyone to ignore the badge. */
    const dnif = { person: 'divot', date: 'Jul 13', type: 'OML', mod: '2026-07-12' }
    expect(isLateInput(dnif)).toBe(false)
    expect(lateNote(dnif), 'and it has nothing to say about one').toBe('')
    /* the exemption is by TYPE, and since 10 Aug 26 it is the whole MEDICAL
       GROUP — the plain "Downchit" type is gone and these four replaced it.
       None of them is a decision made in advance either. */
    for (const t of ['HL', 'OML', 'ATT C', 'ATT B'])
      expect(isLateInput({ ...dnif, type: t }), t).toBe(false)
    /* Upchit joined the exemption on 27 Aug 26 by the same ruling — the
       medical officer decides the date, never the deadline */
    expect(isLateInput({ ...dnif, type: 'Upchit' })).toBe(false)
    /* and leave is still NOT exempt: it is applied for, which is the whole
       point of a deadline */
    for (const t of ['LL', 'OL', 'OIL', 'CCL', 'EL', 'OD'])
      expect(isLateInput({ ...dnif, type: t, mod: '2026-07-12' }), t).toBe(true)
  })

  it('still marks late LEAVE and a late detachment — those are applied for', () => {
    for (const t of ['LL', 'OL', 'OIL', 'Detachment', 'Appointment', 'Meeting'])
      expect(isLateInput({ ...on('2026-07-12'), type: t }), t).toBe(true)
  })

  it('never accuses an input whose stamp is missing or unreadable', () => {
    /* every test in this suite that builds an input writes mod:'' — and a real
       record could be just as thin. An unknown date is not evidence. */
    for (const m of ['', null, undefined, 'yesterday', '2026-7-6', '06/07/2026'])
      expect(isLateInput(on(m)), String(m)).toBe(false)
    expect(inputStampISO(on('nonsense'))).toBe('')
  })

  it('treats an input touched THIS session as today, not as unstamped', () => {
    /* 'now' is what the Inputs page writes on every add and every edit. The
       demo week is in the past, so anything edited now is late — which is the
       behaviour the owner asked for: a late CHANGE counts, not just a late
       first submission. */
    const today = inputStampISO(on('now'))
    expect(today, 'resolves to a real date').toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(isLateInput(on('now'))).toBe(today > inputDueISO())
  })

  it('says which dates it is talking about, in the form the app prints them', () => {
    expect(isoLabel('2026-08-11')).toBe('11 Aug')
    const n = lateNote(on('2026-07-09'))
    expect(n).toContain('9 Jul')          // when it was last changed
    expect(n).toContain('29 Jun')         // the deadline it missed
    expect(n).toContain('13 Jul')         // the week it was for
    expect(lateNote(on('')), 'nothing to say about an unstamped input').toBe('')
  })
})

/* THE DEADLINE RUNS WITH THE INPUT'S OWN WEEK (owner, 24 Aug 26 — a leave for
   24 Dec filed in August wore a LATE tag: the check compared the stamp against
   the LOADED week's deadline, which was an invariant while the Inputs page was
   week-scoped and became wrong the day inputs went global. Each input is now
   judged against the Monday of the week its OWN first day falls in.) */
describe("the deadline runs with the input's own week", () => {
  it('a leave filed months ahead of its week is not late, whatever week is loaded', () => {
    /* the reported case: filed 24 Aug for 24 Dec → 8 Jan, while the loaded
       demo week (13 Jul) had a long-expired deadline of 29 Jun */
    const r: any = { person: 'yeti', date: 'Dec 24', endDate: 'Jan 8 2027', allday: true, type: 'LL', yr: 2026, mod: '2026-08-24' }
    expect(isLateInput(r)).toBe(false)
    /* its own week starts Mon 21 Dec, so its own deadline is 7 Dec — and the
       deadline day itself stays on time, same as ever */
    expect(isLateInput({ ...r, mod: '2026-12-07' }), 'ON its own deadline').toBe(false)
    expect(isLateInput({ ...r, mod: '2026-12-08' }), 'a day past it').toBe(true)
  })

  it("an input for NEXT week gets next week's deadline, not the loaded week's", () => {
    /* loaded 13 Jul week is due 29 Jun; the 20 Jul week is due 6 Jul — a stamp
       between the two used to read late and is on time for its own week */
    const r: any = { person: 'vegas', date: 'Jul 20', allday: true, type: 'Appointment', mod: '2026-07-01' }
    expect(isLateInput(r)).toBe(false)
    expect(isLateInput({ ...r, mod: '2026-07-06' }), 'ON its own deadline').toBe(false)
    expect(isLateInput({ ...r, mod: '2026-07-07' }), 'a day past it').toBe(true)
  })

  it("reads the input's anchor year — the same month/day a year on has a different deadline", () => {
    const r26: any = { person: 'yeti', date: 'Jul 13', type: 'Meeting', yr: 2026, mod: '2026-07-10' }
    expect(isLateInput(r26), 'after its 29 Jun 2026 deadline').toBe(true)
    expect(isLateInput({ ...r26, yr: 2027 }), 'a year early for 13 Jul 2027').toBe(false)
  })

  it('never accuses an input whose DATE it cannot read — symmetric with the stamp rule', () => {
    /* an unreadable date means an unknown week and an unknown deadline; an
       unknown is not evidence, exactly as with an unreadable stamp */
    expect(isLateInput({ person: 'yeti', date: 'whenever', type: 'LL', mod: '2026-07-12' })).toBe(false)
  })

  it("the second demo week's PHA is judged against ITS week and reads on time", () => {
    const vegas = otherWeekInputs().find((i: any) => i.person === 'vegas')
    expect(vegas.mod, 'stamped on its own 6 Jul deadline').toBe('2026-07-06')
    expect(isLateInput(vegas)).toBe(false)
  })

  it("the note names the input's own week, with its year when it is not the loaded one", () => {
    /* week of Mon 4 Jan 2027, due 21 Dec 2026, stamped 2 Jan 2027 — late */
    const n = lateNote({ person: 'yeti', date: 'Jan 4 2027', allday: true, type: 'LL', yr: 2026, mod: '2027-01-02' })
    expect(n).toContain('2 Jan 2027')     // when it was last changed
    expect(n).toContain('21 Dec')         // the deadline it missed (2026 = the loaded year, bare)
    expect(n).toContain('4 Jan 2027')     // the week it is for
  })
})

describe('the seed week shows all three cases, so the mark reads as a signal', () => {
  const byPerson = (p: string) => INPUTS.find((i: any) => i.person === p)

  it('has late inputs, on-time inputs, and one exactly on the deadline', () => {
    expect(isLateInput(byPerson('salsa')), 'booked after planning closed').toBe(true)
    expect(isLateInput(byPerson('nasty')), 'leave applied for one day late').toBe(true)
    expect(isLateInput(byPerson('pike')), 'a detachment planned weeks out').toBe(false)
    expect(isLateInput(byPerson('bane')), 'stamped ON the deadline — on time').toBe(false)
    expect(inputStampISO(byPerson('bane'))).toBe(inputDueISO())
  })

  it('leaves both downchits unmarked even though they are the LATEST stamps in it', () => {
    /* the strongest form of the exemption: these two are stamped later than
       anything else in the seed and are still clean. */
    const dn = INPUTS.filter((i: any) => isDownchit(i.type))
    expect(dn.length).toBe(2)
    const latest = INPUTS.map((i: any) => i.mod).sort().pop()
    expect(dn.every((i: any) => i.mod === latest), 'they really are the latest').toBe(true)
    expect(dn.some(isLateInput), 'and none of them is marked').toBe(false)
  })

  it('does not mark everything — a mark on every row would carry no information', () => {
    const late = INPUTS.filter(isLateInput).length
    expect(late).toBeGreaterThan(0)
    expect(late).toBeLessThan(INPUTS.length)
  })

  it('cannot be made to mark everything, because the downchits are exempt', () => {
    VCONF.inputLead = 60
    expect(INPUTS.every(isLateInput)).toBe(false)
    expect(INPUTS.filter((i: any) => !isLateInput(i)).every((i: any) => isDownchit(i.type))).toBe(true)
  })
})

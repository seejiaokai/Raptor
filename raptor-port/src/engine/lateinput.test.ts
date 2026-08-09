/* The late-input mark (owner, 9 Aug 26). A member's input is due
   VCONF.inputLead days before the week's Monday; one last changed after that
   is marked LATE wherever it is drawn. This file pins the arithmetic and the
   two edges that decide whether the mark is fair: the deadline day itself is
   ON TIME, and an input with no usable stamp is never accused. */
import { describe, expect, it, afterEach } from 'vitest'
import { VCONF, rulesReset } from './rules'
import { INPUTS, isLateInput, inputDueISO, weekStartISO, inputStampISO, lateNote, isoLabel } from './inputs'

afterEach(() => rulesReset())

describe('the deadline itself', () => {
  it('is the week Monday minus the rule, and the owner\'s own example lands on 10 Aug', () => {
    /* the ask, verbatim: "in order to have an input on the week of 17 Aug ...
       no later than a week prior, which is 10 August" */
    expect(inputDueISO('17/08/2026')).toBe('2026-08-10')
  })

  it('follows the rule value, so changing it in the Rules tab moves the line', () => {
    VCONF.inputLead = 14
    expect(inputDueISO('17/08/2026')).toBe('2026-08-03')
    VCONF.inputLead = 0
    expect(inputDueISO('17/08/2026'), 'zero days = due by the Monday itself').toBe('2026-08-17')
  })

  it('steps back over a month boundary rather than off the end of one', () => {
    /* 3 Aug minus 7 is 27 Jul, not "Aug -4" — the arithmetic runs through a
       real date, not by subtracting from the day number. */
    expect(inputDueISO('03/08/2026')).toBe('2026-07-27')
    expect(inputDueISO('05/01/2026')).toBe('2025-12-29')   // and over a year boundary
  })

  it('reads the loaded week when it is not given one', () => {
    expect(weekStartISO()).toBe('2026-07-13')              // the demo week's Monday
    expect(inputDueISO()).toBe('2026-07-06')
  })
})

describe('what counts as late', () => {
  const on = (mod: any) => ({ person: 'yeti', date: 'Jul 13', type: 'Meeting', mod })

  it('is strictly AFTER the deadline — the deadline day is still on time', () => {
    expect(isLateInput(on('2026-07-06')), 'the deadline day itself').toBe(false)
    expect(isLateInput(on('2026-07-07')), 'the day after').toBe(true)
    expect(isLateInput(on('2026-07-05')), 'comfortably early').toBe(false)
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
    expect(n).toContain('6 Jul')          // the deadline it missed
    expect(n).toContain('13 Jul')         // the week it was for
    expect(lateNote(on('')), 'nothing to say about an unstamped input').toBe('')
  })
})

describe('the seed week shows all three cases, so the mark reads as a signal', () => {
  const byPerson = (p: string) => INPUTS.find((i: any) => i.person === p)

  it('has late inputs, on-time inputs, and one exactly on the deadline', () => {
    expect(isLateInput(byPerson('salsa')), 'booked after planning closed').toBe(true)
    expect(isLateInput(byPerson('divot')), 'a downchit raised the day before').toBe(true)
    expect(isLateInput(byPerson('pike')), 'a detachment planned weeks out').toBe(false)
    expect(isLateInput(byPerson('yeti')), 'stamped ON the deadline — on time').toBe(false)
    expect(inputStampISO(byPerson('yeti'))).toBe(inputDueISO())
  })

  it('does not mark everything — a mark on every row would carry no information', () => {
    const late = INPUTS.filter(isLateInput).length
    expect(late).toBeGreaterThan(0)
    expect(late).toBeLessThan(INPUTS.length)
  })
})

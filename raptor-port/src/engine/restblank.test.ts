/* A LINE WITH NOTHING TO MEASURE NEITHER RAISES A CREW-REST BREACH NOR HIDES ONE ([REST-BLANK-LINE], D602, 6 Oct 26).

   "+ Line" and "+ Wave" mint a BLANK flying line — no take-off, no landing (owner, 10 and 25 Aug 26). Its times reach
   the engine as not-a-number, and every comparison with not-a-number is false: seat a man on one and the breach his
   OTHER line raised went quiet — the red warning, the ring, the CR chip, yesterday's dotted mark, the crew picker's
   "not clear until", the SC seat's closed door. On the day BEFORE, a blank crewed line drawn ahead of his late landing
   did the same to the next day. The same-day tight turn lost a turn when the blank line sat between the two legs.

   What this pins, on each side of the rule:
     - today: the blank line is not a report — the breach from his real line stands, word for word, with a landing
       typed alone and with a take-off typed too;
     - a line with no take-off that still carries an INSTRUCTION — a typed Brief, or its wave's In-time — is measured
       on that instruction (the typed-Brief case already was; it must not be lost by skipping the line);
     - a man whose only line today has nothing on it has nothing to measure: silent, and no "NaN" in any sentence —
       unless something else starts his day inside his rest (a meeting): he flies that day, so the meeting binds
       the breach, and the sentence says the line has no take-off yet instead of inventing a report;
     - yesterday: a blank crewed line is not an end — his real last landing still counts, whatever the order;
     - the half left as it was: a landing typed with no take-off IS yesterday's end; the double-turn chip still counts
       a timeless line (validate.ts `dturns`).

   The blank shape is board.ts `addLine`'s own, character for character; the browser test (e2e/restblank.spec.ts)
   drives the real "+ Line" button. Snapshot/restore of DAYS follows turnring.test.ts. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { validate, WARN, restClear, chipOf, traceOf, restIfPlaced } from './validate'
import { VCONF } from './rules'
import { makeStandalone } from './waves'
import { hm24 } from './time'

const CREW = 'waldo'      // idle across the seed week, so planting him moves nothing else
const MON = 0, TUE = 1
const DSNAP = JSON.stringify(DAYS), ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
})

/* board.ts addLine — the blank line, as the app mints it */
const blank = (who = CREW): any => ({ cs: '', msn: '', to: '', ld: '', aircraft: [{ p: '', w: who, area: '', rmks: '', opts: {} }] })
const line = (cs: string, to: string, ld: string, who = CREW, more: any = {}): any =>
  ({ cs, msn: 'BFM', to, ld, aircraft: [{ p: '', w: who, area: '', rmks: '', opts: {} }], ...more })
const wave = (label: string, formations: any[], intimes: string[] = []): any =>
  ({ label, night: false, intimes, traffic: [], formations })
const add = (di: number, w: any) => { (DAYS[di] as any).waves.push(w); return w }

/* Monday: lands 22:30, the debrief pad ends his day, twelve hours on from that is when he is clear on Tuesday */
const LAND = 22 * 60 + 30
const clear = () => LAND + VCONF.debrief + VCONF.crewRest - 1440
const lateMonday = () => add(MON, wave('ZM', [line('ZM', '21:00', '22:30')]))
/* Tuesday: a 07:00 take-off, no in-time on the wave — told to report at the suggested brief, hours inside his rest */
const earlyTuesday = () => add(TUE, wave('ZT', [line('ZT', '07:00', '08:30')]))
const TOLD = hm24(7 * 60 - VCONF.briefLead)

const mine = (di: number) => {
  const g: any = WARN.byDay.find((x: any) => x.di === di)
  return ((g && g.warns) || []).filter((w: any) => (w.who || []).includes(CREW))
}
const breach = () => mine(TUE).find((w: any) => w.code === 'CREW_REST')
/* the three sentences this rule writes. (Not every sentence in the list: an SC line whose shift times were cleared
   still prints "(NaN:NaN–NaN:NaN)" in its CURRENCY warning — another rule's fault, filed as [SC-BLANK-SHIFT-QUAL].) */
const OURS = ['CREW_REST', 'CREW_TIGHT', 'TURN']
const noNaN = () => (WARN.all || []).filter((w: any) => OURS.includes(w.code))
  .forEach((w: any) => expect(w.msg, w.code).not.toMatch(/NaN|Infinity/))

/* the whole of the breach as a person meets it: the red line, the ring, the chip, the SC seat's clock, and
   yesterday's dotted mark pointing at today */
const expectBreach = (why: string, chip = true) => {
  const cr = breach()
  expect(cr, why + ' — the red crew-rest line').toBeTruthy()
  expect(cr.sev).toBe('hard')
  expect(cr.msg).toContain(`told to report ${TOLD}`)
  expect(cr.msg).toContain(`crew rest clear at ${hm24(clear())}`)
  expect(WARN.sev[TUE] && WARN.sev[TUE][CREW], why + ' — the red ring').toBe('hard')
  if (chip) expect(chipOf(TUE, CREW), why + ' — the CR chip').toBe('CR')
  expect(restClear(TUE, CREW), why + ' — the SC seat stays closed until he is clear').toBe(clear())
  const t: any = traceOf(MON, CREW)
  expect(t && t.leaveBy, why + " — Monday's dotted mark").toBeTruthy()
  noNaN()
  return cr
}

describe('the fixture is a real breach before anything blank is added', () => {
  it('lands 22:30 Monday, told to report before 07:00 Tuesday', () => {
    lateMonday(); earlyTuesday(); validate()
    expectBreach('the base case')
  })
})

describe('TODAY — a blank crewed line does not hide the breach his other line raises', () => {
  it('"+ Line" on the same wave, after his real line', () => {
    lateMonday(); const w = earlyTuesday(); validate()
    const before = breach().msg
    w.formations.push(blank()); validate()
    expect(expectBreach('blank line after').msg, 'the sentence does not change').toBe(before)
  })

  it('a blank line in a wave drawn BEFORE his real line', () => {
    lateMonday(); add(TUE, wave('ZB', [blank()])); earlyTuesday(); validate()
    expectBreach('blank line before')
  })

  it('a landing typed alone on that line changes nothing', () => {
    lateMonday(); const w = earlyTuesday(); const b = blank(); b.ld = '15:00'; w.formations.push(b); validate()
    expectBreach('landing only')
  })

  it('a take-off typed there (a later one) changes nothing either — the earliest report is still his 07:00 line', () => {
    lateMonday(); const w = earlyTuesday(); const b = blank(); b.to = '16:00'; w.formations.push(b); validate()
    expectBreach('take-off typed')
  })

  it('an SC line whose shift times were cleared does not hide it', () => {
    lateMonday(); earlyTuesday()
    const sc: any = makeStandalone('sc'); const f = sc.formations[0]
    f.to = ''; f.ld = ''; f.aircraft[0].w = CREW          // aircraft[0] is a MAIN row — it reaches the engine
    add(TUE, sc); validate()
    /* he holds no SC currency, and that louder Q chip outranks CR on the puck — the ring and the line are the proof */
    expectBreach('blank SC shift', false)
  })

  it('the amber tight-turning note survives a blank crewed line too', () => {
    /* rest clears between the nominal report and the one he is told: the advisory, not the breach */
    lateMonday()
    const to = clear() + VCONF.reportLead - 20             // nominal report 20 min inside his rest
    expect(to - VCONF.briefLead, 'the fixture is the tight turn, not the breach').toBeGreaterThanOrEqual(clear())
    const w = add(TUE, wave('ZT', [line('ZT', hm24(to), hm24(to + 90))]))
    validate()
    const tightBefore = mine(TUE).find((x: any) => x.code === 'CREW_TIGHT')
    expect(tightBefore, 'the fixture raises the advisory').toBeTruthy()
    w.formations.unshift(blank()); validate()
    const tight = mine(TUE).find((x: any) => x.code === 'CREW_TIGHT')
    expect(tight, 'still raised with a blank line ahead of it').toBeTruthy()
    expect(tight.msg).toBe(tightBefore.msg)
    expect(chipOf(TUE, CREW)).toBe('TT')
    noNaN()
  })
})

describe('TODAY — a line with no take-off is measured on the instruction it does carry', () => {
  it('a typed Brief on a line with no take-off does not cost his OTHER line its tight-turning note', () => {
    /* the nominal report is read off the legs that have a take-off; a leg that only carries a (late, harmless)
       Brief must not turn that minimum into not-a-number (break test: `noms` cut back to `legs`) */
    lateMonday()
    const to = clear() + VCONF.reportLead - 20
    const b = blank(); b.br = '18:00'
    add(TUE, wave('ZT', [line('ZT', hm24(to), hm24(to + 90)), b])); validate()
    const tight = mine(TUE).find((x: any) => x.code === 'CREW_TIGHT')
    expect(tight, 'the advisory off his real line').toBeTruthy()
    expect(tight.msg).toContain(`T/O ${hm24(to)}`)
    expect(breach(), 'and it is the advisory, not the breach').toBeFalsy()
    noNaN()
  })

  it('a typed Brief on his only line raises the breach (it did before the fix — it must not be lost)', () => {
    lateMonday(); const b = blank(); b.br = '06:00'; add(TUE, wave('ZT', [b])); validate()
    const cr = breach()
    expect(cr, 'breach off the typed brief').toBeTruthy()
    expect(cr.msg).toContain('told to report 06:00')
    expect(WARN.sev[TUE][CREW]).toBe('hard')
    noNaN()
  })

  it('a typed Brief beside a "late show" remark says nothing about a step it cannot work out', () => {
    lateMonday(); const b = blank(); b.br = '06:00'; b.aircraft[0].rmks = 'LATE SHOW'; add(TUE, wave('ZT', [b])); validate()
    const cr = breach()
    expect(cr).toBeTruthy()
    expect(cr.msg).not.toContain('Late show')
    expect(WARN.dash[TUE] && WARN.dash[TUE][CREW], 'no sanctioned-late dashed ring without a take-off to step for').toBeFalsy()
    noNaN()
  })

  it("his wave's In-time is his report although his line has no take-off yet", () => {
    lateMonday(); add(TUE, wave('ZT', [blank()], ['0600H: IN TIME'])); validate()
    const cr = breach()
    expect(cr, 'breach off the wave in-time').toBeTruthy()
    expect(cr.msg).toContain('told to report 06:00')
    noNaN()
  })

  it('that same typed Brief still counts when his other line is later', () => {
    lateMonday(); const b = blank(); b.br = '06:00'
    add(TUE, wave('ZT', [line('ZL', '18:00', '19:30'), b])); validate()
    const cr = breach()
    expect(cr, 'the 06:00 brief is the earliest instruction of the day').toBeTruthy()
    expect(cr.msg).toContain('told to report 06:00')
    noNaN()
  })

  it("an SC line's typed in-time (its B box) is his report although the shift has no start yet", () => {
    lateMonday()
    const sc: any = makeStandalone('sc'); const f = sc.formations[0]
    f.to = ''; f.ld = ''; f.br = '05:00'; f.aircraft[0].w = CREW
    add(TUE, sc); validate()
    const cr = breach()
    expect(cr, 'breach off the SC in-time').toBeTruthy()
    expect(cr.msg).toContain('starts 05:00')
    noNaN()
  })

  it('a man whose ONLY line has nothing on it has nothing to measure — silent, and no sentence carries a "NaN"', () => {
    lateMonday(); add(TUE, wave('ZT', [blank()])); validate()
    expect(breach()).toBeFalsy()
    expect(mine(TUE).find((x: any) => x.code === 'CREW_TIGHT')).toBeFalsy()
    /* …but the SC seat still knows when he is clear */
    expect(restClear(TUE, CREW)).toBe(clear())
    noNaN()
  })

  it('…but he FLIES that day: an 08:00 meeting inside his rest binds the breach, and no report is invented', () => {
    lateMonday(); add(TUE, wave('ZT', [blank()]))
    ;(DAYS[TUE] as any).ground.push({ prog: 'SQN BRIEF', str: '0800', end: '0900', who: CREW }); validate()
    const cr = breach()
    expect(cr, 'the meeting starts his day inside the twelve hours').toBeTruthy()
    expect(cr.sev).toBe('hard')
    expect(cr.msg).toContain('his day starts 08:00 (SQN BRIEF), and he is on a line with no take-off yet')
    expect(cr.msg).not.toContain('report')
    expect(WARN.sev[TUE][CREW]).toBe('hard')
    expect(WARN.dash[TUE] && WARN.dash[TUE][CREW], 'a blank line sanctions nothing').toBeFalsy()
    /* the figures, not only their presence (Sol's read): to be clear for an 08:00 start he had to be gone by 20:00,
       and the warning jumps to the row the scheduler has to move — the meeting's own */
    expect(cr.leaveBy).toBe('20:00')
    expect(String(cr.key), 'anchored on the ground row').toMatch(new RegExp(`^g:${TUE}\\.`))
    const t: any = traceOf(MON, CREW)
    expect(t && t.leaveBy, "Monday's dotted mark carries the same leave-by").toBe('20:00')
    noNaN()
  })

  it('…and when what starts his day is a typed Meeting REQUEST (no row to jump to), the warning anchors on his blank line', () => {
    lateMonday(); const w = add(TUE, wave('ZT', [blank()]))
    INPUTS.push({ person: CREW, date: 'Jul 14', allday: false, s: 8 * 60, e: 9 * 60, type: 'Meeting', mod: '2026-06-26', remarks: '' } as any)
    validate()
    const cr = breach()
    expect(cr, 'the request binds the breach').toBeTruthy()
    expect(cr.msg).toContain('his day starts 08:00 (Meeting), and he is on a line with no take-off yet')
    const gi = (DAYS[TUE] as any).waves.indexOf(w)
    expect(cr.key, 'the fallback anchor is his own seat on the blank line').toBe(`${TUE}.${gi}.0.0.w`)
    expect(cr.leaveBy).toBe('20:00')
    noNaN()
  })

  it('LEFT AS IT WAS: the same meeting with NO flying line that day needs no rest', () => {
    lateMonday()
    ;(DAYS[TUE] as any).ground.push({ prog: 'SQN BRIEF', str: '0800', end: '0900', who: CREW }); validate()
    expect(breach()).toBeFalsy()
  })

  it('LEFT AS IT WAS: a meeting ahead of a real report still reads "before the … report"', () => {
    lateMonday(); add(TUE, wave('ZT', [line('ZL', '18:00', '19:30'), blank()]))
    ;(DAYS[TUE] as any).ground.push({ prog: 'SQN BRIEF', str: '0800', end: '0900', who: CREW }); validate()
    const cr = breach()
    expect(cr).toBeTruthy()
    expect(cr.msg).toMatch(/his day starts 08:00 \(SQN BRIEF\) before the \d\d:\d\d report/)
    noNaN()
  })
})

describe('YESTERDAY — a blank crewed line is not an end, and does not hide his real one', () => {
  it('a blank line in a wave drawn BEFORE his 22:30 landing', () => {
    add(MON, wave('ZB', [blank()])); lateMonday(); earlyTuesday(); validate()
    expectBreach('blank Monday line first')
  })

  it('a blank line drawn AFTER it (the order that already worked)', () => {
    lateMonday(); add(MON, wave('ZB', [blank()])); earlyTuesday(); validate()
    expectBreach('blank Monday line last')
  })

  it('a blank line ahead of it in the SAME wave', () => {
    add(MON, wave('ZM', [blank(), line('ZM', '21:00', '22:30')])); earlyTuesday(); validate()
    expectBreach('blank Monday line, same wave')
  })

  it('an SC line whose shift times were cleared, drawn before his landing', () => {
    const sc: any = makeStandalone('sc'); const f = sc.formations[0]
    f.to = ''; f.ld = ''; f.aircraft[0].w = CREW
    add(MON, sc); lateMonday(); earlyTuesday(); validate()
    expectBreach('blank SC shift on Monday')
  })

  it('a blank Monday line that is his ONLY Monday event ends nothing — Tuesday is silent and no clock is invented', () => {
    add(MON, wave('ZB', [blank()])); earlyTuesday(); validate()
    expect(breach()).toBeFalsy()
    expect(restClear(TUE, CREW)).toBeNull()
    noNaN()
  })

  it('LEFT AS IT WAS: a landing typed with no take-off is still the end of his Monday', () => {
    const b = blank(); b.ld = '22:30'
    add(MON, wave('ZM', [b])); earlyTuesday(); validate()
    expectBreach('landing-only Monday line')
  })
})

describe('THE CREW PICKER asks the same question before the drop', () => {
  it('already on a blank line today: the 07:00 seat still answers "crew rest — not clear until …"', () => {
    lateMonday()
    /* someone else holds the front seat of the 07:00 line, so the empty back seat has a leg to measure */
    const w = add(TUE, wave('ZT', [{ cs: 'ZT', msn: 'BFM', to: '07:00', ld: '08:30', aircraft: [{ p: 'stuff', w: '', area: '', rmks: '', opts: {} }] }, blank()]))
    validate()
    const gi = (DAYS[TUE] as any).waves.indexOf(w)
    const ans: any = restIfPlaced(CREW, `${TUE}.${gi}.0.0.w`)
    expect(ans, 'the pre-drop answer').toBeTruthy()
    expect(ans.dir).toBe('back')
    expect(ans.earliest).toBe(clear())
  })
})

describe('THE CREW PICKER, when the line he is asked about has no take-off itself', () => {
  /* restIfPlaced clones a sibling leg of the same formation; the sibling of a line with no take-off carries
     not-a-number times too. Whatever instruction that line does carry must reach the pre-drop answer, and the
     answer must be the same breach the list shows once he is placed. */
  const ask = (form: any, intimes: string[] = []) => {
    lateMonday()
    form.aircraft[0].p = 'stuff'; form.aircraft[0].w = ''     // someone else in front: the empty back seat has a sibling
    const w = add(TUE, wave('ZT', [form], intimes)); validate()
    const gi = (DAYS[TUE] as any).waves.indexOf(w)
    const key = `${TUE}.${gi}.0.0.w`
    const before: any = restIfPlaced(CREW, key)
    form.aircraft[0].w = CREW; validate()
    return { before, placed: breach() }
  }
  it('a typed Brief 05:00 and no take-off: "not clear until 12:30" before the drop, the breach after it', () => {
    const b = blank(); b.br = '05:00'
    const { before, placed } = ask(b)
    expect(before, 'the pre-drop answer').toBeTruthy()
    expect(before.dir).toBe('back')
    expect(before.earliest).toBe(clear())
    expect(placed.msg).toContain('told to report 05:00')
    expect(before.msg, 'the same sentence before and after').toBe(placed.msg)
    noNaN()
  })
  it("the wave's In-time alone: the same", () => {
    const { before, placed } = ask(blank(), ['0500H: IN TIME'])
    expect(before && before.dir).toBe('back')
    expect(before.earliest).toBe(clear())
    expect(before.msg).toBe(placed.msg)
    expect(placed.msg).toContain('told to report 05:00')
  })
  it('a wholly blank line and an earlier meeting of his: the meeting answers before the drop too', () => {
    ;(DAYS[TUE] as any).ground.push({ prog: 'SQN BRIEF', str: '0800', end: '0900', who: CREW })
    const { before, placed } = ask(blank())
    expect(before && before.dir).toBe('back')
    expect(before.earliest).toBe(clear())
    expect(placed.msg).toContain('his day starts 08:00 (SQN BRIEF), and he is on a line with no take-off yet')
    expect(before.msg).toBe(placed.msg)
    noNaN()
  })
  it('a wholly blank line and nothing else: no answer, and none is invented', () => {
    const { before, placed } = ask(blank())
    expect(before).toBeNull()
    expect(placed).toBeFalsy()
  })
})

describe('THE SAME-DAY TIGHT TURN', () => {
  const turnDay = (between: boolean) => {
    const a = line('ZA', '07:30', '09:00'), b = line('ZC', '09:30', '11:00')
    add(TUE, wave('ZT', between ? [a, blank(), b] : [a, b])); validate()
    return mine(TUE).find((x: any) => x.code === 'TURN')
  }
  it('two legs 30 minutes apart raise it', () => {
    expect(turnDay(false), 'the fixture').toBeTruthy()
  })
  it('a blank crewed line drawn between the two legs does not hide it', () => {
    const base = turnDay(false).msg
    DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
    const t = turnDay(true)
    expect(t, 'still raised').toBeTruthy()
    expect(t.msg).toBe(base)
    noNaN()
  })
  it('…nor when the LATER leg is drawn first — the legs are put in time order after the blank one is set aside', () => {
    /* a sort cannot place not-a-number: [09:30, blank, 07:30] "sorted" stays as drawn, and setting the blank line
       aside afterwards would pair 09:30 → 07:30, a negative turn that says nothing */
    add(TUE, wave('ZT', [line('ZC', '09:30', '11:00'), blank(), line('ZA', '07:30', '09:00')])); validate()
    const t = mine(TUE).find((x: any) => x.code === 'TURN')
    expect(t, 'still raised').toBeTruthy()
    expect(t.msg).toContain('ZA BFM→ZC BFM')
    expect(t.msg).toContain('30 min')
    noNaN()
  })
  it('LEFT AS IT WAS: one real leg and one timeless leg still wear the double-turn chip', () => {
    add(TUE, wave('ZT', [line('ZA', '12:00', '13:30'), blank()])); validate()
    expect(chipOf(TUE, CREW)).toBe('DT')
  })
})

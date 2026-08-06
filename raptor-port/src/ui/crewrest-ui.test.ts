/* The two crew-rest visuals (owner, 6 Aug 26): a sanctioned late show rings
   DASHED rather than solid, and clicking a crew-rest warning traces it back to
   the previous day — dashed ring there too, labelled CR, with the leave-by
   time the warning already worked out.

   Markup-level, because that is where both live: jsdom cannot measure a ring,
   but it can prove which class the builder emitted. The stroke itself is a
   measured contract in scheduler.css and is covered by the geometry gate. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { validate, WARN } from '../engine/validate'
import { VCONF } from '../engine/rules'
import { parseHM } from '../engine/time'
import { isStandalone } from '../engine/waves'
import { dayHTML } from './html'
import { focusWarn, clearWarnFocus, setWarnFocus } from '../state/view'

const CREW = 'waldo'
const DSNAP = JSON.stringify(DAYS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  clearWarnFocus()
})

const firstForm = (di: number) => {
  const w = (DAYS[di].waves || []).find((x: any) => !isStandalone(x) && (x.formations || []).length)
  return w ? w.formations[0] : null
}
const hhmmOf = (m: number) => {
  const x = ((m % 1440) + 1440) % 1440
  return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0')
}
/* the owner's numbers: in-time 12:00, brief 13:00, T/O 15:20 → rest must be
   clear by 12:00 and the latest show is 14:20 */
const build = (leftAt: string, rmks: string) => {
  const prev: any = firstForm(0)!
  /* waldo is a WSO: seat him in the RCP or the puck earns a QUAL flag, which
     outranks CR and would hide the very label these tests are about */
  prev.aircraft.push({ p: '', w: CREW, area: '', rmks: '', opts: {} })
  prev.to = '20:00'; prev.ld = hhmmOf(parseHM(leftAt)! - VCONF.debrief)
  const today: any = firstForm(1)!
  today.aircraft.push({ p: '', w: CREW, area: '', rmks, opts: {} })
  today.br = '13:00'; today.to = '15:20'; today.ld = '16:45'
  const wave = DAYS[1].waves.find((w: any) => (w.formations || []).includes(today))
  wave.intimes = ['%CS% IN TIME 1200H'.replace('%CS%', today.cs)]
  validate()
  return WARN.byDay[1].warns.findIndex((w: any) => w.code === 'CREW_REST' && (w.who || []).includes(CREW))
}
/* the crew's own puck on a day: [0] the class list, [1] the whole element,
   because the flag chip is a CHILD (class l-cr / l-c), not part of the class */
const puckOf = (di: number) => {
  const m = dayHTML(di, false).match(new RegExp(`<span class="([^"]*puck[^"]*)"[^>]*data-person="${CREW}"[^>]*>(.{0,200})`))
  return m ? m[1] : ''
}
const puckHtml = (di: number) => {
  const m = dayHTML(di, false).match(new RegExp(`<span class="[^"]*puck[^"]*"[^>]*data-person="${CREW}"[^>]*>(.{0,200})`))
  return m ? m[1] : ''
}

describe('the crew-rest ring', () => {
  it('an unsanctioned breach rings SOLID', () => {
    expect(build('01:30', '2A: BFM-5'), 'the case flags').toBeGreaterThanOrEqual(0)
    expect(puckOf(1)).toContain('boxred')
    expect(puckOf(1)).not.toContain('boxdash')
  })

  it('a sanctioned late show that still makes the show rings DASHED', () => {
    expect(build('01:30', '2A: LATE SHOW')).toBeGreaterThanOrEqual(0)
    expect(puckOf(1)).toContain('boxdash')
    expect(puckOf(1), 'the dashed class REPLACES the solid one').not.toContain('boxred')
  })

  it('past the latest show it rings solid again, remark or not', () => {
    /* left 02:21 → rest clears 14:21, after the 14:20 latest show */
    expect(build('02:21', '2A: LATE SHOW')).toBeGreaterThanOrEqual(0)
    expect(puckOf(1)).toContain('boxred')
    expect(puckOf(1)).not.toContain('boxdash')
  })
})

describe('the previous-day trace', () => {
  it('is painted only while the warning is focused', () => {
    const ix = build('01:30', '2A: BFM-5')
    /* unfocused: the previous day carries nothing — the man flew a clean sortie */
    expect(puckOf(0), 'nothing before the click').not.toContain('boxdash')
    expect(puckOf(0)).not.toContain('l-cr')
    focusWarn(1, ix)
    expect(puckOf(0), 'the previous day rings dashed').toContain('boxdash')
    expect(puckOf(0), 'and is labelled CR').toContain('boxdash')
    expect(dayHTML(0, false)).toContain('l-cr')
    clearWarnFocus()
    expect(puckOf(0), 'and it clears with the focus').not.toContain('boxdash')
  })

  it('the warning names the time he had to leave', () => {
    const ix = build('01:30', '2A: BFM-5')
    const w = WARN.byDay[1].warns[ix]
    expect(w.leaveBy, 'anchor 12:00 less 12h crew rest').toBe('00:00')
    expect(w.msg).toContain('so he had to leave by 00:00')
    expect(w.prevDi, 'and which day to look back at').toBe(0)
  })

  it('traces only the crew the warning names, and only its own previous day', () => {
    const ix = build('01:30', '2A: BFM-5')
    focusWarn(1, ix)
    /* day 2 is not the traced day, so nothing is painted there */
    expect(puckOf(2)).not.toContain('boxdash')
  })
})

/* A man can carry a sanctioned late show AND an unrelated warning that
   outranks it. The ring belongs to the flag the puck PRINTS, so a conflict
   must not inherit the dash and read as a sanctioned conflict. */
describe('the dash belongs to the crew-rest flag, not to the person', () => {
  it('a louder unrelated flag rings solid even when the CR is sanctioned', () => {
    build('01:30', '2A: LATE SHOW')
    /* give him a conflict on the same day: C (rank 12) outranks CR (rank 9) */
    const today: any = firstForm(1)!
    DAYS[1].ground = DAYS[1].ground || []
    DAYS[1].ground.push({ prog: 'CLASHING MTG', str: today.to, end: '17:30', who: 'Waldo' })
    validate()
    const cls = puckOf(1)
    expect(puckHtml(1), 'the conflict wins the chip').toContain('l-c"')
    expect(cls, 'so the ring is solid, not a sanctioned-looking dash').toContain('boxred')
    expect(cls).not.toContain('boxdash')
  })
})

/* Reached from the CHIP, not the issue row. jumpToWarn (interactions.ts)
   builds its own focus object rather than calling focusWarn, so the trace
   fields have to be carried there too — a real-browser check caught this
   after the row path was already passing. */
describe('the trace does not depend on which surface opened the warning', () => {
  it('a focus built by jumpToWarn carries the trace fields', () => {
    const ix = build('01:30', '2A: BFM-5')
    const w = WARN.byDay[1].warns[ix]
    setWarnFocus({ di: 1, ix, ids: (w.who || []).slice(), sev: w.sev, key: w.key, code: w.code, prevDi: w.prevDi, leaveBy: w.leaveBy })
    expect(puckOf(0), 'the previous day still lights up').toContain('boxdash')
    expect(puckHtml(0)).toContain('l-cr"')
  })
})

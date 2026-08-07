/* The two crew-rest visuals (owner, 6 Aug 26): a sanctioned late show rings
   DASHED rather than solid, and clicking a crew-rest warning traces it back to
   the previous day — dashed ring there too, labelled CR, with the leave-by
   time the warning already worked out.

   Markup-level, because that is where both live: jsdom cannot measure a ring,
   but it can prove which class the builder emitted. The stroke itself is a
   measured contract in scheduler.css and is covered by the geometry gate. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { validate, WARN, traceOf, traceLeads, traceIx } from '../engine/validate'
import { VCONF } from '../engine/rules'
import { parseHM } from '../engine/time'
import { isStandalone } from '../engine/waves'
import { dayHTML } from './html'
import { personWarns } from '../engine/avail'
import { focusWarn, clearWarnFocus, setWarnFocus, toggleDayWarn, selectPerson, selDrop } from '../state/view'

const CREW = 'waldo'
const DSNAP = JSON.stringify(DAYS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  /* selDrop, not clearWarnFocus alone: these tests now OPEN day boxes and
     click pucks, and an open box leaking into the next test would make the
     on-demand strip look standing again — i.e. hide the very regression the
     block below exists to catch. */
  selDrop()
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

/* THE TRACE IS A STANDING MARK (owner, 6 Aug 26). It used to appear only while
   the warning was focused, which meant the reader had to already know about
   the breach to be shown its cause. It is model state now — validate() files
   every breach against the day that caused it — so it is on the page before
   anything is clicked, and clicking is only ever navigation. */
describe('the previous-day trace', () => {
  it('is painted with nothing clicked, and does not clear with the focus', () => {
    const ix = build('01:30', '2A: BFM-5')
    expect(puckOf(0), 'the cause is marked before any click').toContain('boxdot')
    expect(puckHtml(0), 'and labelled CR').toContain('l-cr"')
    focusWarn(1, ix)
    expect(puckOf(0), 'focusing the warning does not change it').toContain('boxdot')
    clearWarnFocus()
    expect(puckOf(0), 'and clearing the focus does not take it away').toContain('boxdot')
  })

  it('rings DOTTED, never solid — he flew a legal day here', () => {
    build('01:30', '2A: BFM-5')
    expect(puckOf(0)).toContain('boxdot')
    expect(puckOf(0), 'the breach is tomorrow, so no red box today').not.toContain('boxred')
    expect(puckOf(0), 'and it is not the sanctioned-late-show dash either').not.toContain('boxdash')
  })

  it('the chip and the title name the day it breaks and the leave-by time', () => {
    build('01:30', '2A: BFM-5')
    const h = puckHtml(0)
    expect(h, 'the caption is the reader\'s question, not the threshold').toContain('is broken by this day')
    expect(h).toContain('had to leave by 00:00')
  })

  it('the warning names the time he had to leave', () => {
    const ix = build('01:30', '2A: BFM-5')
    const w = WARN.byDay[1].warns[ix]
    expect(w.leaveBy, 'anchor 12:00 less 12h crew rest').toBe('00:00')
    expect(w.msg).toContain('so he had to leave by 00:00')
    expect(w.prevDi, 'and which day to look back at').toBe(0)
  })

  it('publishes the same facts on WARN.trace, keyed by the day that caused it', () => {
    const ix = build('01:30', '2A: BFM-5')
    const t = traceOf(0, CREW)
    expect(t, 'filed against day 0, the day a scheduler can still fix').toBeTruthy()
    expect(t.di, 'and pointing at the day of the breach').toBe(1)
    expect(t.leaveBy).toBe('00:00')
    expect(traceIx(t, CREW), 'resolving to the warning\'s own index').toBe(ix)
    expect(traceOf(1, CREW), 'nothing is filed against the day of the breach').toBeNull()
  })

  it('traces only the crew the warning names, and only its own previous day', () => {
    build('01:30', '2A: BFM-5')
    expect(puckOf(2), 'day 2 caused nothing').not.toContain('boxdot')
    expect(traceOf(0, 'bane'), 'and nobody else flew him into it').toBeNull()
  })
})

/* The strip under the previous day's issue box — the same breach, read from
   the day that caused it, addressed by the NEXT day's (di, ix) so the ordinary
   .witem handler navigates it with no click path of its own.

   It is ON DEMAND (owner, 7 Aug 26): several lines of tomorrow's prose used to
   sit on a day whose own issue list was still collapsed, so the day read as
   though it had a problem of its own. Two asks reveal it — open this day's
   warning list, or click the man's puck — and the puck's own dotted ring and R
   tag stay standing either way, so the day still shows WHERE to click. */
describe('the cross-day row on the warning list', () => {
  it('stays hidden until asked for', () => {
    build('01:30', '2A: BFM-5')
    expect(dayHTML(0, false), 'nothing clicked, nothing opened').not.toContain('dwtrace')
  })

  it('opening this day\'s warning list reveals it', () => {
    const ix = build('01:30', '2A: BFM-5')
    toggleDayWarn(0)
    const h = dayHTML(0, false)
    expect(h, 'the strip is there').toContain('dwtrace')
    expect(h, 'addressed to the day of the breach, not this one')
      .toContain(`data-wdi="1" data-wix="${ix}"`)
    expect(h).toContain('had to leave by')
  })

  it('clicking the man\'s puck reveals it too', () => {
    /* the other half of the owner's sentence. Landing at 01:30 gives him a
       long-day note on day 0 as well, so his narrowed box opens there and the
       strip rides INSIDE it — the row sits with his own issues, in the same
       list, which is the whole point of the 7 Aug 26 restyle. */
    build('01:30', '2A: BFM-5')
    selectPerson(CREW, true)
    const h = dayHTML(0, false)
    expect(h, 'his own puck is the way in').toContain('dwtrace')
    expect(h, 'and the strip is part of his list, not a private box').toContain('dwlist')
  })

  it('a day where he has nothing of his own wears the solo list box', () => {
    /* Ending day 0 at 22:45 keeps his day short (no long-day note) while the
       06:00 report still breaches — the seed's own Casper numbers. With no
       row of his on the causing day there is no box to ride in, so the strip
       stands alone — wrapped as a `solo` list so its box and width are the
       SAME as an ordinary issue list's, not a private container (owner,
       7 Aug 26). */
    build('22:45', '2A: BFM-5')
    const today: any = firstForm(1)!
    const wave = DAYS[1].waves.find((w: any) => (w.formations || []).includes(today))
    wave.intimes = [`${today.cs} IN TIME 0600H`]
    validate()
    expect(personWarns(0, CREW).length, 'the case depends on him carrying nothing on day 0').toBe(0)
    selectPerson(CREW, true)
    const h = dayHTML(0, false)
    expect(h, 'the strip still reveals').toContain('dwtrace')
    expect(h, 'wrapped as a solo list').toContain('dwlist solo')
  })

  it('sits below the warnings and above the advisories (owner, 7 Aug 26)', () => {
    /* items are severity-sorted at validate(); the cross-day row is red
       business but tomorrow's, so it ranks after this day's own hard rows and
       before its ambers. Read the rendered order straight off the list. */
    build('01:30', '2A: BFM-5')
    toggleDayWarn(0)
    const h = dayHTML(0, false)
    const kinds = [...h.matchAll(/<div class="witem (hard wtr|hard|adv|note)[" ]/g)].map(m => m[1])
    expect(kinds, 'the seed day gives the row neighbours on both sides')
      .toEqual(expect.arrayContaining(['hard', 'hard wtr', 'adv']))
    const tr = kinds.indexOf('hard wtr')
    expect(kinds.slice(0, tr).every(k => k === 'hard'), 'nothing but warnings above it').toBe(true)
    expect(kinds.slice(tr + 1).every(k => k !== 'hard'), 'every warning sits above it').toBe(true)
    expect(kinds.slice(tr + 1).some(k => k === 'adv' || k === 'note'), 'and the advisories follow below').toBe(true)
  })

  it('the puck keeps its standing mark, so there is something to click', () => {
    build('01:30', '2A: BFM-5')
    expect(puckOf(0), 'the dotted ring stays with nothing clicked').toContain('boxdot')
    expect(dayHTML(0, false), 'even though the prose does not').not.toContain('dwtrace')
  })

  it('the day of the breach carries no such row — it is not that day\'s doing', () => {
    build('01:30', '2A: BFM-5')
    toggleDayWarn(1)
    expect(dayHTML(1, false)).not.toContain('dwtrace')
  })

  it('the ⚠ count stays the day\'s OWN issues', () => {
    build('01:30', '2A: BFM-5')
    const own = ((WARN.byDay[0] && WARN.byDay[0].warns) || []).length
    toggleDayWarn(0)
    const m = dayHTML(0, false).match(/⚠ (\d+) issue/)
    /* a day with no issues of its own shows no count at all, and the strip
       still renders once asked for — that is the case the mark exists for */
    if (own) expect(+m![1], 'tomorrow\'s breach is not counted here').toBe(own)
    else expect(m, 'no issue box, but the strip stands alone').toBeNull()
    expect(dayHTML(0, false)).toContain('dwtrace')
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

/* The trace used to be rebuilt from whatever the click had put on WFOCUS, so
   each surface that opened a warning had to remember to carry prevDi and
   leaveBy across — and the chip path once didn't. Reading it off the model
   instead makes that whole class of bug unreachable: no surface can forget a
   field it never passes. Pinned, because it is the reason for the rework. */
describe('the trace does not depend on which surface opened the warning', () => {
  it('a focus built by jumpToWarn carries no trace fields, and none are needed', () => {
    const ix = build('01:30', '2A: BFM-5')
    const w = WARN.byDay[1].warns[ix]
    setWarnFocus({ di: 1, ix, ids: (w.who || []).slice(), sev: w.sev, key: w.key, code: w.code })
    expect(puckOf(0), 'the previous day is marked regardless').toContain('boxdot')
    expect(puckHtml(0)).toContain('l-cr"')
  })
})

/* A louder flag of his own wins the CAPTION — a conflict is not a crew-rest
   problem and must not be labelled as one — but the dotted ring is additive
   and stays, because he still wrecks tomorrow either way. .boxdot is an
   outline and .boxred a box-shadow, which is what lets both be worn at once. */
describe('a louder flag on the causing day', () => {
  it('takes the chip but leaves the dotted ring', () => {
    build('01:30', '2A: BFM-5')
    const prev: any = firstForm(0)!
    DAYS[0].ground = DAYS[0].ground || []
    DAYS[0].ground.push({ prog: 'CLASHING MTG', str: prev.to, end: '23:30', who: 'Waldo' })
    validate()
    expect(traceOf(0, CREW), 'the trace itself is untouched').toBeTruthy()
    expect(traceLeads(0, CREW), 'but it no longer owns the flag').toBeNull()
    expect(puckHtml(0), 'the conflict wins the chip').toContain('l-c"')
    expect(puckOf(0), 'and both rings are worn at once').toContain('boxdot')
    expect(puckOf(0)).toContain('boxred')
  })
})

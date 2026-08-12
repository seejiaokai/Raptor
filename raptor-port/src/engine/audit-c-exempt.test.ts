/* AUDIT C — exempt-line pucks ring from their OWN red rules only (PRs
   341142e + 0532aa2). The two adversarial combinations the owner's contract
   implies but nothing pinned:
     - an SC spare who is ALSO genuinely double-booked elsewhere (a hard
       DOUBLE_BOOK, not just a meeting) — the spare copy must stay clean;
     - an AVALON seat man carrying a crew-rest breach EARNED on a normal wave
       — no bleed onto the exempt copy, per "never bleeds". */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { validate } from './validate'
import { makeStandalone, waveDutyBlock } from './waves'
import { dayHTML } from '../ui/html'
import { SCHED } from './publish'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

const hits = (code: string, id: string) =>
  validate().all.filter((x: any) => x.code === code && (x.who || []).includes(id))
/* same anchor overnight.test.ts uses: the puck's class on ONE data-slot key */
const slotPuckClass = (html: string, key: string) => {
  const m = html.match(new RegExp('data-slot="' + key.replace(/\./g, '\\.') + '"[^>]*><span class="(puck[^"]*)"'))
  return m ? m[1] : null
}

describe('an SC spare who is also hard double-booked elsewhere', () => {
  it('the two ordinary copies ring red; the spare copy stays clean', () => {
    const w0 = DAYS[0].waves[0]
    w0.formations[0].aircraft[0].w = 'plasma'
    w0.formations[1].to = w0.formations[0].to
    w0.formations[1].ld = w0.formations[0].ld
    w0.formations[1].aircraft[0].w = 'plasma'
    const sc = makeStandalone('sc')
    DAYS[0].waves.push(sc)
    const wi = DAYS[0].waves.length - 1
    const ai = sc.formations[0].aircraft.findIndex((a: any) => a.spare)
    sc.formations[0].aircraft[ai].w = 'plasma'
    const db = hits('DOUBLE_BOOK', 'plasma').filter((x: any) => x.di === 0)
    expect(db.length, JSON.stringify(db)).toBeGreaterThan(0)
    const html = dayHTML(0, false)
    expect(/warn hard/.test(slotPuckClass(html, '0.0.0.0.w') || ''), 'first sortie copy rings').toBe(true)
    expect(/warn hard/.test(slotPuckClass(html, '0.0.1.0.w') || ''), 'second sortie copy rings').toBe(true)
    const spare = slotPuckClass(html, `0.${wi}.0.${ai}.w`)
    expect(spare, 'spare seat renders a puck').toBeTruthy()
    expect(/warn/.test(spare!), 'spare copy stays clean: ' + spare).toBe(false)
  })
})

describe('an AVALON seat man with a crew-rest breach earned on a normal wave', () => {
  it('the breach rings the normal leg; the AVALON copy does not bleed', () => {
    // Monday: split lands late on an ordinary wave — ends 23:30 + 2h debrief
    const d0 = DAYS[0].waves[0].formations[0]
    d0.to = '17:00'; d0.ld = '23:30'; d0.br = ''
    d0.aircraft[0].p = 'split'
    // Tuesday: an ordinary morning sortie breaches his rest…
    DAYS[1].waves[0].formations[0].aircraft[0].p = 'split'
    // …and he ALSO holds an AVALON jet seat that same Tuesday
    const w = makeStandalone('avalon')
    DAYS[1].waves.push(w)
    const wi = DAYS[1].waves.length - 1
    DAYS[1].dutywaves.push(waveDutyBlock(w))
    w.formations[0].aircraft[0].p = 'split'
    const cr = hits('CREW_REST', 'split').filter((x: any) => x.di === 1)
    expect(cr.length, JSON.stringify(cr)).toBe(1)
    // the breach anchors on the leg told to report, never on the AVALON seat
    expect(cr[0].key).toBe('1.0.0.0.p')
    const html = dayHTML(1, false)
    expect(/warn hard/.test(slotPuckClass(html, '1.0.0.0.p') || ''), 'the normal leg rings').toBe(true)
    const av = slotPuckClass(html, `1.${wi}.0.0.p`)
    expect(av, 'AVALON seat renders a puck').toBeTruthy()
    expect(/warn/.test(av!), 'AVALON copy stays clean: ' + av).toBe(false)
  })

  it('and the AVALON copy still rings for ITS OWN rule when one applies too', () => {
    // same shape, but the man is also overseas on the Tuesday — the wave's one
    // check fires and the AVALON copy now rings for that, and that alone
    const w = makeStandalone('avalon')
    DAYS[1].waves.push(w)
    const wi = DAYS[1].waves.length - 1
    DAYS[1].dutywaves.push(waveDutyBlock(w))
    w.formations[0].aircraft[0].p = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'OL', remarks: '', mod: '' })
    expect(hits('LEAVE_FLY', 'split').filter((x: any) => x.di === 1).length).toBeGreaterThan(0)
    const av = slotPuckClass(dayHTML(1, false), `1.${wi}.0.0.p`)
    expect(av, 'AVALON seat renders a puck').toBeTruthy()
    expect(/warn hard/.test(av!) && /boxred/.test(av!), av!).toBe(true)
  })
})

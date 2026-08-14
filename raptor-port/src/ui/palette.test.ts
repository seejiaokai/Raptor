/* The aircrew palette's own rendering rules. slotrules.test.ts pins the ENGINE
   answer (slotBar/slotRules); this file pins what the palette does with it when
   nothing is armed, which is the one path that cannot ask slotBar anything —
   there is no slot to ask about — and so has to reason from the day alone.
   String assertions only: jsdom has no layout engine in this repo, so a test
   here can prove which class was emitted and nothing about what was painted. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { dayEngaged, dayOff, dayStandby, slotRules } from '../engine/avail'
import { validate } from '../engine/validate'
import { SCHED } from '../engine/publish'
import { rosterPuck, paletteHTML, sansAvailHTML } from './palette-html'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

/* the unarmed palette, built the way paletteHTML builds it */
const unarmed = (id: string, di = 0) => {
  const d = DAYS[di]
  return rosterPuck(id, di, '', dayEngaged(d), dayOff(d), dayStandby(d), null)
}

describe('the unarmed palette and the grounded man (ATT B)', () => {
  /* 'nasty' is the id slotrules.test.ts uses for the same rule, for the same
     reason: nothing in the seed week competes with the test's own input. */
  const groundHim = (type: string) =>
    INPUTS.push({ person: 'nasty', date: 'Jul 13', allday: true, type, remarks: '', mod: '' })

  it('ATT B is not struck through — he may still man a desk', () => {
    groundHim('ATT B')
    const html = unarmed('nasty')
    expect(html).not.toContain('rpuck no')
    expect(html).toContain('rpuck busy')
  })

  it('and the puck says what he cannot do', () => {
    groundHim('ATT B')
    expect(unarmed('nasty')).toContain('grounded today')
  })

  it('ATT C — genuinely away — is still struck through', () => {
    groundHim('ATT C')
    expect(unarmed('nasty')).toContain('rpuck no')
  })

  it('ordinary leave is still struck through', () => {
    groundHim('LL')
    expect(unarmed('nasty')).toContain('rpuck no')
  })

  it('ATT B PLUS leave is struck through — one carve-out does not excuse the other', () => {
    groundHim('ATT B')
    groundHim('OL')
    expect(unarmed('nasty')).toContain('rpuck no')
  })

  it('a man with nothing on is neither struck nor dimmed', () => {
    const html = unarmed('split')
    expect(html).not.toContain('rpuck no')
    expect(html).toContain(`data-person="split"`)
  })

  it('the roster still names every man it draws', () => {
    groundHim('ATT B')
    expect(unarmed('nasty')).toContain(PEOPLE['nasty'].cs)
  })
})

/* THE SANS AVAILABILITY SECTION (owner, 14 Aug 26) — the per-column SANS
   sub-bands are gone; every SANS member, pilot or WSO, lists in ONE
   full-width `.rall.rsans` band instead. Grey-out is automatic (rosterPuck
   already reads slotBar), so this file only has to pin that the band lists
   everyone, the badge tracks a filed record, and the columns above it never
   carry a SANS name a second time. */
describe('the SANS Availability palette section', () => {
  const SANS_IDS = Object.keys(PEOPLE).filter(id => PEOPLE[id].san)
    .sort((a, b) => PEOPLE[a].cs.localeCompare(PEOPLE[b].cs))
  /* one row's own markup, isolated by splitting on the row wrapper — rosterPuck
     never emits a nested <div>, so the first `</div>` after the split IS the
     row's own close */
  const rowsOf = (html: string) => html.split('<div class="rsans-row">').slice(1).map(s => s.split('</div>')[0])
  const rowFor = (html: string, id: string) => rowsOf(html).find(r => r.includes(`data-person="${id}"`))

  it('lists every SANS member, one row each, unarmed', () => {
    const html = paletteHTML(0)
    expect((html.match(/class="rsans-row"/g) || []).length).toBe(SANS_IDS.length)
    SANS_IDS.forEach(id => expect(rowFor(html, id), id).toBeTruthy())
  })

  it('the badge shows iff a record is filed for the day', () => {
    INPUTS.push({ person: 'krait', date: DAYS[0].dt, allday: true, type: 'SANS Availability', sans: { f: true }, mod: 'now' })
    const html = paletteHTML(0)
    expect(rowFor(html, 'krait')).toContain('rsans-b')
    expect(rowFor(html, 'yeti')).not.toContain('rsans-b')
  })

  it('the old per-column SANS sub-bands are gone — no SANS name inside a seat column', () => {
    const html = paletteHTML(0)
    /* one "SANS Availability" heading — the full-width band, never a
       per-column sub-band beside "Pilots"/"WSOs" */
    expect((html.match(/SANS Availability/g) || []).length).toBe(1)
    /* the three seat columns sit in .rcols, BEFORE the full-width band —
       isolate that slice and confirm no SANS id's puck (which itself
       carries data-person twice, on the .rpuck wrapper and the inner
       puck() span) ever lands inside it */
    const colsBlock = html.slice(html.indexOf('<div class="rcols">'), html.indexOf('<div class="rall rsans">'))
    SANS_IDS.forEach(id => expect(colsBlock, id).not.toContain(`data-person="${id}"`))
  })

  it('an armed flying seat greys a record-less SANS entry, reason printed', () => {
    const armKey = '0.0.0.0.p'
    const arules = slotRules(armKey)
    const html = sansAvailHTML(0, armKey, dayEngaged(DAYS[0]), dayOff(DAYS[0]), dayStandby(DAYS[0]), arules)
    const row = rowFor(html, 'ipman')!
    expect(row).toContain('rpuck no haswhy')
    expect(row).toMatch(/rwhy">SANS/)
  })

  it('an armed duty seat leaves a record-less SANS entry ungreyed — no SANS grey off a jet', () => {
    const armKey = 'd:0.0.0'
    const arules = slotRules(armKey)
    const html = sansAvailHTML(0, armKey, dayEngaged(DAYS[0]), dayOff(DAYS[0]), dayStandby(DAYS[0]), arules)
    const row = rowFor(html, 'ipman')!
    expect(row).not.toContain('haswhy')
    expect(row).not.toContain('rpuck no')
  })
})

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
import { dayEngaged, dayOff, dayStandby } from '../engine/avail'
import { validate } from '../engine/validate'
import { SCHED } from '../engine/publish'
import { rosterPuck } from './palette-html'

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

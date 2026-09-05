/* THE RUN TRACE ON SCREEN (owner, 5 Sep 26 — "dotted pucks, to warn that the
   7 day breach is on which day actually"). Markup-level, like crewrest-ui:
   jsdom cannot draw a ring, but it can prove which class and caption the
   builder emitted. The stroke is scheduler.css's measured contract. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { validate, traceOf } from '../engine/validate'
import { VCONF } from '../engine/rules'
import { dayHTML, dayWarnHTML } from './html'
import { DWOPEN, selDrop } from '../state/view'

const ID = 'bullet'
const DSNAP = JSON.stringify(DAYS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  VCONF.maxRun = 6
  selDrop(); DWOPEN.clear()
})
const workOn = (id: string, days: number[]) => days.forEach(di => {
  DAYS[di].ground = DAYS[di].ground || []
  DAYS[di].ground.push({ prog: 'DUTY SPELL', str: '0900', end: '1000', who: id })
})
/* the man's puck on one day, as the week builder emits it: the opening tag
   (classes, title) plus its label/name/role children — through to the next
   puck or 400 characters, whichever is first */
const puckOf = (html: string, id: string) => {
  const m = html.match(new RegExp(`<span class="puck[^"]*"[^>]*data-person="${id}"[^>]*>`))
  if (!m) return ''
  const from = m.index!, rest = html.slice(from + m[0].length)
  const next = rest.search(/<span class="puck/)
  return html.slice(from, from + m[0].length + (next < 0 ? 400 : Math.min(next, 400)))
}

describe('a day of a run that breaks later in the week', () => {
  it('wears the dotted ring and the 7, captioned with the day it breaks on', () => {
    workOn(ID, [0, 1, 2, 3, 4, 5, 6])
    validate()
    const wed = puckOf(dayHTML(2, true, true), ID)
    expect(wed).toContain('boxdot')
    expect(wed).not.toContain('boxred')
    expect(wed).toContain('lchip l-run')
    expect(wed).toContain('Consecutive days — Sunday is his 7th day in a row: a break day is due before then')
    /* the breach day itself: solid, its own label */
    const sun = puckOf(dayHTML(6, true, true), ID)
    expect(sun).toContain('boxred')
    expect(sun).not.toContain('boxdot')
    expect(sun).toContain('lchip l-run')
    expect(sun).not.toContain('Consecutive days —')
  })

  it('the day\'s issue box carries a "Breaks Sunday" row that addresses the breach on Sunday', () => {
    workOn(ID, [0, 1, 2, 3, 4, 5, 6])
    validate()
    DWOPEN.add(2)
    const box = dayWarnHTML(2)
    expect(box).toContain('Breaks Sunday')
    expect(box).toContain('his 7th day in a row falls on Sunday; a break day before then clears it.')
    expect(box).toMatch(/data-wdi="6" data-wix="\d+"/)
  })

  it('a run-only trace never prints crew-rest words', () => {
    workOn(ID, [0, 1, 2, 3, 4, 5, 6])
    validate()
    const t = traceOf(3, ID)
    expect(t.leaveBy).toBeUndefined()
    const thu = puckOf(dayHTML(3, true, true), ID)
    expect(thu).not.toContain('Crew rest')
    expect(thu).not.toContain('leave by')
    DWOPEN.add(3)
    expect(dayWarnHTML(3)).not.toContain('had to leave by')
  })

  it('a puck with both traces prints both captions and the run row and the crew-rest row', () => {
    const d1 = DAYS[1].waves[0].formations[0]
    d1.to = '20:00'; d1.ld = '23:00'; d1.br = ''
    d1.aircraft[0].p = 'split'
    DAYS[2].waves[0].formations[0].aircraft[0].p = 'split'
    workOn('split', [0, 1, 2, 3, 4, 5, 6])
    validate()
    const tue = puckOf(dayHTML(1, true, true), 'split')
    expect(tue).toContain('boxdot')
    expect(tue).toContain('Consecutive days — Sunday is his 7th day in a row')
    expect(tue).toContain('Crew rest — Wednesday is broken by this day: he had to leave by 20:15')
    expect(tue).toContain('lchip l-run')          // RUN outranks CR on the label
    DWOPEN.add(1)
    const box = dayWarnHTML(1)
    expect(box).toContain('Breaks Wednesday')
    expect(box).toContain('had to leave by <b>20:15</b>')
    expect(box).toContain('Breaks Sunday')
  })
})

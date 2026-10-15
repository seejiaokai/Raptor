/* THE WHOLE-APP WORDS PASS, ROUND 1 (owner D938, D940, 16 Oct 26 — "1-5 as recommended"). The Scheduler Board's panel
   names carry no grey subtitle; a folded Personal Inputs keeps its count and caret, no "show"; the open one keeps its
   caret; no "tap to review", "press a card to edit" or editing how-to anywhere on the board; the removed-input note's
   dash is a full stop; the empty Amendments box says only "No amendments published yet." The week's half of the round
   is driven in the real app by scripts/handpass/words-r1-walk.mjs (its edit mode needs the page). String assertions
   only — jsdom has no layout engine in this repo. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { PIOPEN } from '../state/view'
import { validate } from '../engine/validate'
import { dayHTML } from './html'
import { boardWarnHTML } from './board'
import { sbNotesPanel, sbProgPanel, sbDutyPanel, sbSimRowsPanel, sbGroundPanel, sbInputsGroupPanel, sbUnavailPanel, sbSansPanel } from './board-html'

const DSNAP = JSON.stringify(DAYS), ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  PIOPEN.clear()
})

const GONE = ['shown at the head of the day', 'squadron-wide — affects all', 'SDO / SXO / ops desk, by block', 'AMT and OFT rows',
  'briefs, reviews, admin', 'submitted by aircrew', 'leave, medical and overseas duty', 'what SANS aircrew are offering',
  'press a card to edit', 'type in place', 'clear a time for all day', 'tap header to hide', 'tap to review', 'show ⌄']
const panels = (ro: boolean) => [sbNotesPanel(DAYS[0], 0, undefined, ro), sbProgPanel(DAYS[0], 0, undefined, ro), sbDutyPanel(DAYS[0], 0, undefined, ro),
  sbSimRowsPanel(DAYS[0], 0, undefined, ro), sbGroundPanel(DAYS[0], 0, undefined, ro), sbInputsGroupPanel(DAYS[0], 0, undefined, undefined, ro),
  sbUnavailPanel(DAYS[0], 0, undefined, ro), sbSansPanel(DAYS[0], 0, undefined, ro)].join('\n')

describe("the board's panel words (D940)", () => {
  it('no panel name carries its old subtitle or a how-to, editable or read-only', () => {
    for (const ro of [false, true]) {
      const html = panels(ro)
      expect(html).toContain('Overall notes')        // the panels were drawn at all
      expect(html).toContain('Unavailable')
      for (const g of GONE) expect(html, `${ro ? 'read-only' : 'editable'}: "${g}"`).not.toContain(g)
    }
  })
  it('a folded Personal Inputs keeps its count and its caret, without "show"', () => {
    const html = sbInputsGroupPanel(DAYS[0], 0)
    expect(html).toMatch(/\d+ inputs?(?: · \d+ on programme)? ⌄<\/span>/)
  })
  it('an open Personal Inputs keeps the caret as its one sign that it folds, and the note has a full stop for its dash', () => {
    PIOPEN.add(0)
    const html = sbInputsGroupPanel(DAYS[0], 0)
    expect(html).toContain('Personal Inputs <span class="sub">⌃</span>')
    expect(html).toContain('A removed input flags nothing until accepted again. Delete it here if it should go entirely.')
    expect(html).not.toContain('accepted again — delete')
  })
  it('the issues bar says its count and its caret, no "tap to review" — the week and the board alike', () => {
    validate()                                                        // the bar lists the day's checks
    let bars = 0
    for (let di = 0; di < 7; di++) {
      const wk = dayHTML(di, false), bd = boardWarnHTML(di)
      if (wk.includes('data-daywarn')) bars++                             // a day with nothing to list draws no bar
      expect(wk, 'week ' + di).not.toMatch(/tap to (?:review|collapse)/)
      expect(bd, 'board ' + di).not.toMatch(/tap to (?:review|collapse)/)
    }
    expect(bars).toBeGreaterThan(3)                                       // the bars were drawn at all
  })
})

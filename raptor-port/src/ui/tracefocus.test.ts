// @vitest-environment jsdom
/* [TRACE-FOCUS-STAYS] through the real tap. A "Breaks <day>" line in a day's open issues list focuses the breach on
   ANOTHER day; closing the list it was tapped in must let that focus go (the crew stayed lit, the page dimmed). The
   crew-rest line was mended on 18 Oct 26 by its pan (`panDi`); the run-of-days line ("his 7th day in a row") carries
   no pan, and the scenario designer of the batch's check (19 Oct 26, S2-10) read that it was left out — so both are
   tapped here through routeClick, the way a finger does, and the list closed. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { validate } from '../engine/validate'
import { VCONF } from '../engine/rules'
import { dayWarnHTML } from './html'
import * as view from '../state/view'
import { initStore } from '../state/store'
import { routeClick } from './interactions'

const ID = 'bullet'
const DSNAP = JSON.stringify(DAYS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  initStore()
  VCONF.maxRun = 6
  view.selDrop(); view.DWOPEN.clear(); view.clearWarnFocus()
})
const workOn = (id: string, days: number[]) => days.forEach(di => {
  DAYS[di].ground = DAYS[di].ground || []
  DAYS[di].ground.push({ prog: 'DUTY SPELL', str: '0900', end: '1000', who: id })
})
const tap = (el: Element) => routeClick({ target: el, stopPropagation() {}, preventDefault() {} } as any)

describe('closing the list a "Breaks <day>" line was tapped in lets its focus go', () => {
  it('the run-of-days line: tapped in Wednesday\'s list, then Wednesday\'s list closed', () => {
    workOn(ID, [0, 1, 2, 3, 4, 5, 6])
    validate()
    view.toggleDayWarn(2)
    const box = document.createElement('div'); box.innerHTML = dayWarnHTML(2); document.body.append(box)
    try {
      const line = [...box.querySelectorAll<HTMLElement>('.witem.wtr[data-wdi="6"]')].find(el => /day in a row/.test(el.textContent || ''))
      expect(line, 'Wednesday’s list draws the "Breaks Sunday" run line (or this test proves nothing)').toBeTruthy()
      tap(line!)
      expect(view.WFOCUS && view.WFOCUS.di, 'the tap focuses Sunday’s breach').toBe(6)
      view.toggleDayWarn(2)
      expect(view.WFOCUS, 'the list closed: nothing stays lit').toBeNull()
    } finally { box.remove() }
  })
  it('…and closing another day\'s list leaves it be', () => {
    workOn(ID, [0, 1, 2, 3, 4, 5, 6])
    validate()
    view.toggleDayWarn(2); view.toggleDayWarn(3)
    const box = document.createElement('div'); box.innerHTML = dayWarnHTML(2); document.body.append(box)
    try {
      const line = [...box.querySelectorAll<HTMLElement>('.witem.wtr[data-wdi="6"]')].find(el => /day in a row/.test(el.textContent || ''))
      tap(line!)
      view.toggleDayWarn(3)
      expect(view.WFOCUS, 'a list it has nothing to do with').toBeTruthy()
    } finally { box.remove() }
  })
})

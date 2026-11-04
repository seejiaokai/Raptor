// @vitest-environment jsdom
/* THE RED NOTE UNDER A WAVE'S IN-TIME LINES (ui/html.ts reportNote, refreshWaveReports; ui/textedit.ts).
   · An unreadable clock is said ONCE (owner D1648, 5 Nov 26): a wave of three unnamed lines with no take-off times and an
     in-time line typed "25:90" said "WAVE 3: reporting line 1 has no recognised clock. Check the time." three times — once
     a line, each line named for the wave. Every writer of the note says each distinct sentence once now: the builder, the
     refresh, the line being typed and the line committed. The day's issues list keeps one issue a line, as it was. Red on
     the code before this change.
   · The refresh keeps the note true when the wave changes behind it (the Rally reader's second pass, "AB-F2", 6 Oct 26 —
     [WINDOWS-KEEP-KEYS]'s leftover: it had no test of its own): a take-off committed elsewhere rewrites the note at once,
     text only; the block the caret is typing in is left alone. A pin of behaviour already built — it is red if the
     refresh's note half is taken out (checked by hand, 5 Nov 26). */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { setSession } from '../state/auth'
import { HOOKS } from '../engine/hooks'
import { initStore } from '../state/store'
import { reportingIssuesForWave } from '../engine/reporting'
import { intimesInner, refreshWaveReports, reportNote } from './html'
import { routeFocusOut, routeReportingInput } from './textedit'

const original = JSON.stringify(DAYS), book = JSON.stringify(SCHED)
const SAID = 'WAVE 3: reporting line 1 has no recognised clock. Check the time.'
const w = () => DAYS[0].waves[0]
const draw = () => { document.body.innerHTML = `<div class="intimes iedit" data-intimes="0|0" data-warnkey="it:0.0">${intimesInner(w(), '0|0')}</div>` }
const note = () => document.querySelector('[data-reporting-feedback]')!.textContent || ''
const times = (s: string, part: string) => s.split(part).length - 1
const fm = (cs = '') => ({ cs, to: '', ld: '', br: '', aircraft: [{ p: '', w: '', opts: {}, rmks: '' }] })

beforeEach(() => {
  DAYS.splice(0, DAYS.length, ...JSON.parse(original))
  /* three unnamed lines and no take-off yet, the in-time typed with a clock nobody can read */
  DAYS[0].waves = [{ label: 'WAVE 3', intimes: ['25:90 in time'], formations: [fm(), fm(), fm()] }]
  setSession({ user: 'ad', role: 'admin' }); initStore(); vi.spyOn(HOOKS, 'editMode').mockReturnValue(true); draw()
})
afterEach(() => {
  vi.restoreAllMocks(); document.body.innerHTML = ''
  DAYS.splice(0, DAYS.length, ...JSON.parse(original))
  Object.keys(SCHED).forEach(k => delete SCHED[k]); Object.assign(SCHED, JSON.parse(book))
})

describe('[D1648] an unreadable clock is said once under the wave\'s lines', () => {
  it('the day\'s issues list keeps one issue a line, as it was', () => {
    expect(reportingIssuesForWave(w(), 0).filter(i => i.code === 'REPORT_UNRESOLVED')).toHaveLength(3)
  })
  it('the builder says it once', () => {
    expect(times(note(), SAID), note()).toBe(1)
    expect(reportNote(w(), 0)).toBe(SAID)
  })
  it('the line being typed says it once', () => {
    const line = document.querySelector('[data-itline="0|0|0"]') as HTMLElement
    line.textContent = '26:99 in time'
    routeReportingInput({ target: line } as unknown as Event)
    expect(times(note(), SAID), note()).toBe(1)
  })
  it('the line committed says it once', () => {
    const line = document.querySelector('[data-itline="0|0|0"]') as HTMLElement
    line.textContent = '25:91 in time'
    routeFocusOut({ target: line } as unknown as FocusEvent)
    expect(w().intimes[0]).toBe('25:91 in time')
    expect(times(note(), SAID), note()).toBe(1)
  })
  it('the refresh says it once', () => {
    document.querySelector('[data-reporting-feedback]')!.textContent = 'stale'
    refreshWaveReports(document)
    expect(note()).toBe(SAID)
  })
  it('two different sentences are both said, each once, in the order met', () => {
    DAYS[0].waves[0].formations[1].cs = 'VL'
    refreshWaveReports(document)
    expect(note()).toBe(`${SAID} VL: reporting line 1 has no recognised clock. Check the time.`)
  })
})

describe('the refresh keeps the red note true (AB-F2)', () => {
  beforeEach(() => {
    DAYS[0].waves = [{ label: 'WAVE', intimes: ['09:00 IN TIME'], formations: [{ ...fm('VL'), to: '12:00', ld: '13:00', br: '10:00' }] }]
    draw()
  })
  it('a take-off committed elsewhere that puts the brief before the in-time: the note says so at once, and clears again', () => {
    expect(note()).toBe('')
    const span = document.querySelector('[data-reporting-feedback]')!
    DAYS[0].waves[0].formations[0].br = '08:30'          // committed by Tab in a box outside this block
    refreshWaveReports(document)
    expect(note()).toContain('VL: in-time 09:00 is later than brief 08:30.')
    expect(document.querySelector('[data-reporting-feedback]'), 'text only: the same element').toBe(span)
    DAYS[0].waves[0].formations[0].br = '10:00'
    refreshWaveReports(document)
    expect(note()).toBe('')
  })
  it('the block the caret is typing in is left alone', () => {
    const line = document.querySelector('[data-itline="0|0|0"]') as HTMLElement
    line.setAttribute('tabindex', '0'); line.focus()
    expect(document.activeElement).toBe(line)
    DAYS[0].waves[0].formations[0].br = '08:30'
    refreshWaveReports(document)
    expect(note(), 'nothing near the caret is written').toBe('')
  })
})

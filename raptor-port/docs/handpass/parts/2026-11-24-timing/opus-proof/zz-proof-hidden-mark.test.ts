// @vitest-environment jsdom
/* PROOF (fresh Opus read): a page asked for while the tab is ALREADY hidden (a timer's page change — the role check at
   midnight) is timed across the hidden spell: the row reads the minutes the tab stayed hidden. F9 drops only a wait that
   was running when the tab went hidden. */
import { afterEach, beforeEach, expect, it } from 'vitest'
import { setFrameForTest, setTimingOnForTest, timingMark, timingSink, type TimingEvent } from './timing'

let clock = 0
let frames: (() => void)[] = []
const step = (n = 1) => { for (let i = 0; i < n; i++) { const f = frames; frames = []; f.forEach(x => x()) } }
let got: TimingEvent[] = []
const setVis = (v: 'hidden' | 'visible') => { Object.defineProperty(document, 'visibilityState', { value: v, configurable: true }); document.dispatchEvent(new Event('visibilitychange')) }

beforeEach(() => {
  clock = 0; frames = []; got = []
  document.body.innerHTML = '<section id="page-viewsched" class="page"></section><section id="page-editsched" class="page"></section>'
  setTimingOnForTest(true)
  setFrameForTest(f => { frames.push(f) }, () => clock)
  timingSink(e => got.push(e))
})
afterEach(() => { setVis('visible'); setTimingOnForTest(false); setFrameForTest(null, null) })

it('a page change made while the tab is hidden gives no row', () => {
  document.getElementById('page-editsched')!.classList.add('on')
  setVis('hidden')
  clock = 1000; timingMark({ kind: 'page', page: 'viewsched', t: 1000 })   // made by a timer while hidden
  document.getElementById('page-editsched')!.classList.remove('on'); document.getElementById('page-viewsched')!.classList.add('on')
  /* a hidden tab draws no frames; he comes back 40 s later */
  clock = 41_000; setVis('visible')
  step(); clock = 41_020; step(); clock = 41_040; step()
  expect(got.filter(e => e.kind === 'page')).toEqual([])
})

// @vitest-environment jsdom
/* PROOF (fresh Opus read): after a sign-out that could not reload the page (a save still waiting — ui/logout.ts), the
   shell is drawn again from nothing for the next sign-in, the Leave War's built grid with it; its next open is a first
   build, yet the row reads "opened before" because the stopwatch's list of pages seen outlives the sign-in. */
import { afterEach, beforeEach, expect, it } from 'vitest'
import { flushLandingForTest, setFrameForTest, setTimingOnForTest, timingMark, timingSink, type TimingEvent } from './timing'

let clock = 0
let frames: (() => void)[] = []
const step = (n = 1) => { for (let i = 0; i < n; i++) { const f = frames; frames = []; f.forEach(x => x()) } }
let got: TimingEvent[] = []
const show = (p: string) => { for (const s of document.querySelectorAll('section.page')) s.classList.toggle('on', s.id === 'page-' + p) }

beforeEach(() => {
  clock = 0; frames = []; got = []
  document.body.innerHTML = '<section id="page-viewsched" class="page on"></section><section id="page-leavewar" class="page"></section>'
  setTimingOnForTest(true)
  setFrameForTest(f => { frames.push(f) }, () => clock)
  timingSink(e => got.push(e))
})
afterEach(() => { setTimingOnForTest(false); setFrameForTest(null, null) })

it('the first open of a page after a new sign-in reads "first time"', () => {
  timingMark({ kind: 'signin', t: 0 }); flushLandingForTest()
  clock = 100; timingMark({ kind: 'page', page: 'leavewar', t: 100 }); show('leavewar'); clock = 200; step(3)
  /* signed out without a reload (a save waiting), the shell gone; signed in again — the shell drawn afresh */
  clock = 5000; timingMark({ kind: 'page', page: 'viewsched', t: 5000 }); show('viewsched')
  clock = 9000; timingMark({ kind: 'signin', t: 9000 }); flushLandingForTest(); step(3)
  clock = 10_000; timingMark({ kind: 'page', page: 'leavewar', t: 10_000 }); show('leavewar'); clock = 11_000; step(3)
  const lw = got.filter(e => e.kind === 'page' && e.page === 'leavewar') as Extract<TimingEvent, { kind: 'page' }>[]
  expect(lw.map(e => e.first)).toEqual([true, true])
})

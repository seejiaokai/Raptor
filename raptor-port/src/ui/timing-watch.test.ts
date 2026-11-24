// @vitest-environment jsdom
/* THE STOPWATCH ITSELF (ui/timing.ts — [APP-SPEED] step 1, D2481): the faults Fable's and Astra's blind scenario designs
   of 24 Nov 26 found by reading the first build, each pinned here before its fix. The rule they share: a row that is
   never timed is better than a wrong one — the figures choose the next speed fix. Frames are stepped by hand. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { flushLandingForTest, setFrameForTest, setTimingOnForTest, timingMark, timingSink, type TimingEvent } from './timing'

let clock = 0
let frames: (() => void)[] = []
const step = (n = 1) => { for (let i = 0; i < n; i++) { const f = frames; frames = []; f.forEach(x => x()) } }
const at = (t: number) => { clock = t }
let got: TimingEvent[] = []
const rows = () => got.filter(e => e.kind === 'page').map(e => e.kind === 'page' ? `${e.page} ${e.first ? 'first' : 'again'} ${e.ms}` : '')
/* the sign-in figures given (a new press first withdraws the old one with a null — pinned on its own below) */
const signins = () => got.flatMap(e => e.kind === 'signin' && e.ms != null ? [e.ms] : [])

function section(page: string, on = true): HTMLElement {
  const s = document.createElement('section')
  s.id = 'page-' + page
  s.className = 'page' + (on ? ' on' : '')
  document.body.appendChild(s)
  return s
}
const show = (page: string) => { for (const s of document.querySelectorAll('section.page')) s.classList.toggle('on', s.id === 'page-' + page) }

beforeEach(() => {
  clock = 0; frames = []; got = []
  document.body.innerHTML = ''
  setTimingOnForTest(true)
  setFrameForTest(f => { frames.push(f) }, () => clock)
  timingSink(e => got.push(e))
})
afterEach(() => { setTimingOnForTest(false); setFrameForTest(null, null) })

describe('a page is timed to its screen drawn — two frames after it is on and nothing loading stands over it', () => {
  it('an ordinary page: from the tap to the second frame after it shows', () => {
    section('viewsched'); section('inputs', false)
    at(1000); timingMark({ kind: 'page', page: 'inputs', t: 1000 })
    at(1100); show('inputs'); step()          // seen on
    at(1120); step()                           // first frame after
    at(1140); step()                           // second: done
    expect(rows()).toEqual(['inputs first 140'])
  })
  it('F1 (both readers): the Leave War is not done while its loading claw — drawn on the page body — stands over it', () => {
    section('viewsched'); section('leavewar', false)
    at(0); timingMark({ kind: 'page', page: 'leavewar', t: 0 })
    show('leavewar')
    const claw = document.createElement('div'); claw.className = 'pgclaw'; claw.dataset.page = 'leavewar'
    document.body.appendChild(claw)
    for (let t = 20; t < 2000; t += 20) { at(t); step() }
    expect(rows()).toEqual([])
    claw.classList.add('gone')
    at(2000); step(); at(2020); step(); at(2040); step()
    expect(rows()).toEqual(['leavewar first 2040'])
  })
  it('F1b: a page whose download failed is not given a time — its failure card is not the page', () => {
    section('viewsched'); const lw = section('leavewar', false)
    timingMark({ kind: 'page', page: 'leavewar', t: 0 })
    show('leavewar')
    const card = document.createElement('div'); card.setAttribute('data-testid', 'page-load-fail'); lw.appendChild(card)
    for (let t = 20; t < 400; t += 20) { at(t); step() }
    expect(rows()).toEqual([])
  })
  it('a page left before it was drawn gets no row; the page opened instead is timed on its own', () => {
    section('viewsched'); section('leavewar', false); section('quals', false)
    at(0); timingMark({ kind: 'page', page: 'leavewar', t: 0 })
    at(300); timingMark({ kind: 'page', page: 'quals', t: 300 }); show('quals')
    at(320); step(); at(340); step(); at(360); step()
    expect(rows()).toEqual(['quals first 60'])
  })
  it('the frame that would finish it re-checks the page: shown no longer, no row', () => {
    section('viewsched'); section('inputs', false)
    timingMark({ kind: 'page', page: 'inputs', t: 0 })
    show('inputs'); at(20); step(); at(40); step()
    show('viewsched')                        // gone between the frames
    at(60); step()
    expect(rows()).toEqual([])
  })
  it('the second visit of a page in the same tab reads "opened before"', () => {
    section('viewsched'); section('inputs', false)
    timingMark({ kind: 'page', page: 'inputs', t: 0 }); show('inputs'); step(3)
    timingMark({ kind: 'page', page: 'viewsched', t: 100 }); show('viewsched'); step(3)
    timingMark({ kind: 'page', page: 'inputs', t: 200 }); show('inputs'); step(3)
    expect(rows().map(r => r.split(' ').slice(0, 2).join(' '))).toEqual(['inputs first', 'viewsched again', 'inputs again'])
  })
})

describe('the sign-in', () => {
  const week = () => { const s = section('viewsched'); const w = document.createElement('div'); w.id = 'vWeek'; const d = document.createElement('div'); d.className = 'day'; w.appendChild(d); s.appendChild(w) }
  it('from the press to the week\'s days drawn, two frames after', () => {
    at(0); timingMark({ kind: 'signin', t: 0 })
    at(500); week(); step(); at(520); step(); at(540); step()
    expect(signins()).toEqual([540])
  })
  it('F3: left for another page before the week was drawn — no sign-in time, ever (not the minutes until he comes back)', () => {
    section('inputs', false)
    at(0); timingMark({ kind: 'signin', t: 0 })
    await0()
    at(200); timingMark({ kind: 'page', page: 'inputs', t: 200 }); show('inputs'); step(3)
    at(30_000); week(); show('viewsched'); timingMark({ kind: 'page', page: 'viewsched', t: 30_000 }); step(3)
    expect(signins()).toEqual([])
  })
  it('F3: a sign-in that lands on another page (Retry\'s reopen) times that page as its landing, and no week time follows', () => {
    section('viewsched', false); section('leavewar', false)
    at(0); timingMark({ kind: 'signin', t: 0 })
    timingMark({ kind: 'page', page: 'leavewar', t: 1 })   // the same moment: the landing
    show('leavewar'); at(400); step(3)
    expect(rows()).toEqual(['leavewar first 400'])
    at(60_000); week(); show('viewsched'); step(3)
    expect(signins()).toEqual([])
  })
  it('F4: a sign-out leaves no page wait running into the next sign-in', () => {
    section('inputs')
    at(0); timingMark({ kind: 'page', page: 'viewsched', t: 0 })  // the sign-out's own move, no week drawn (signed out)
    for (let t = 20; t < 400; t += 20) { at(t); step() }
    at(40_000); timingMark({ kind: 'signin', t: 40_000 })
    await0()
    week(); show('viewsched'); at(40_300); step(3)
    expect(rows()).toEqual([])
    expect(signins()).toEqual([300])
  })
  it('a second sign-in starts afresh: the earlier figure is withdrawn the moment the new press is made', () => {
    timingMark({ kind: 'signin', t: 0 }); week(); at(100); step(3)
    expect(signins()).toEqual([100])
    at(5000); timingMark({ kind: 'signin', t: 5000 })
    expect(got.at(-1)).toEqual({ kind: 'signin', ms: null })
  })
})

describe('F9: a hidden tab', () => {
  it('a wait that spans the tab being hidden is dropped, never counted', () => {
    section('viewsched'); section('inputs', false)
    timingMark({ kind: 'page', page: 'inputs', t: 0 })
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
    at(30_000); show('inputs'); step(3)
    expect(rows()).toEqual([])
  })
})

/* THE WALK OF 24 NOV 26 (chat 164, W24): ?timing opened in a tab behind another read "Sign-in shown at 36.3 s" — the
   browser draws nothing for a tab that is not in front, so the first screen waited for him to switch to it */
describe('the start-up, with the tab behind another before its first screen', () => {
  const hide = (v: 'hidden' | 'visible') => {
    Object.defineProperty(document, 'visibilityState', { value: v, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  }
  afterEach(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }) })
  it('hidden at any moment before the first screen: the app\'s load and the first screen are handed over untimed', () => {
    hide('hidden'); hide('visible')
    timingMark({ kind: 'boot', t: 500 })
    timingMark({ kind: 'first', t: 36_300, screen: 'signin' })
    expect(got).toEqual([{ kind: 'boot', t: 500, behind: true }, { kind: 'first', t: 36_300, screen: 'signin', behind: true }])
  })
  it('already behind another as it loaded (opened in the background): untimed too', () => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    setTimingOnForTest(true); timingSink(e => got.push(e))
    timingMark({ kind: 'boot', t: 500 })
    expect(got).toEqual([{ kind: 'boot', t: 500, behind: true }])
  })
  it('hidden only after the first screen: the start-up keeps its figures', () => {
    timingMark({ kind: 'boot', t: 500 })
    timingMark({ kind: 'first', t: 900, screen: 'signin' })
    hide('hidden'); hide('visible')
    expect(got).toEqual([{ kind: 'boot', t: 500 }, { kind: 'first', t: 900, screen: 'signin' }])
  })
})

describe('F2: the window\'s own download arriving late changes nothing', () => {
  it('a page done before the readout takes the events is handed over with its true time', () => {
    setTimingOnForTest(true)                 // no sink yet
    section('viewsched'); section('inputs', false)
    timingMark({ kind: 'page', page: 'inputs', t: 0 }); show('inputs'); at(150); step(3)
    at(10_000)
    const late: TimingEvent[] = []
    timingSink(e => late.push(e))
    expect(late).toEqual([{ kind: 'page', page: 'inputs', first: true, ms: 150, downloaded: 0 }])
  })
})

/* THE PRESS'S OWN MOMENT (the walk of 24 Nov 26, chat 164, W5): at 4× slow-down a tap on View-only Sched waited 0.86 s
   before the app heard it — the computer was still busy — and the row left that wait out. On the slow office computer
   that wait is what he sits through. */
describe('timed from the press as the browser received it, not from when the app got to it', () => {
  const press = (type: 'click' | 'keydown', stamp: number, then: () => void) => {
    const b = document.createElement('button'); document.body.appendChild(b)
    b.addEventListener(type, then)
    const e = type === 'click' ? new MouseEvent('click', { bubbles: true }) : new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    Object.defineProperty(e, 'timeStamp', { value: stamp })
    b.dispatchEvent(e)
  }
  it('a page asked for by a tap the app heard late: the wait before it heard counts', () => {
    section('viewsched'); section('inputs', false)
    at(1000); press('click', 400, () => timingMark({ kind: 'page', page: 'inputs', t: 1000 }))
    at(1100); show('inputs'); step(); at(1120); step(); at(1140); step()
    expect(rows()).toEqual(['inputs first 740'])
  })
  it('the sign-in, pressed by Enter, the same', () => {
    const week = () => { const s = section('viewsched'); const w = document.createElement('div'); w.id = 'vWeek'; const d = document.createElement('div'); d.className = 'day'; w.appendChild(d); s.appendChild(w) }
    at(1000); press('keydown', 300, () => timingMark({ kind: 'signin', t: 1000 }))
    at(1500); week(); step(); at(1520); step(); at(1540); step()
    expect(signins()).toEqual([1240])
  })
  it('a page change made after the press was answered (a timer, a landing) is timed from its own mark', async () => {
    section('viewsched'); section('inputs', false)
    at(1000); press('click', 400, () => {})
    await new Promise(r => setTimeout(r, 0))
    timingMark({ kind: 'page', page: 'inputs', t: 1000 })
    at(1100); show('inputs'); step(); at(1120); step(); at(1140); step()
    expect(rows()).toEqual(['inputs first 140'])
  })
  it('a stamp on another clock (after the mark, or more than a minute before it) is not used', () => {
    section('viewsched'); section('inputs', false); section('quals', false)
    at(1000); press('click', 5000, () => timingMark({ kind: 'page', page: 'inputs', t: 1000 }))
    at(1100); show('inputs'); step(3)
    at(100_000); press('click', 30_000, () => timingMark({ kind: 'page', page: 'quals', t: 100_000 }))
    at(100_100); show('quals'); step(3)
    expect(rows()).toEqual(['inputs first 100', 'quals first 100'])
  })
})

/* THE WALK OF 24 NOV 26 (chat 164, W14): a page file asked about again and told "unchanged" comes with no body and
   only its answer's header — it was not downloaded, and must not read "downloaded 0 KB" */
describe('what came down the line for the Leave War', () => {
  it('counts a file that came with its body; never one the site answered "unchanged"', () => {
    const entries = [
      { name: 'http://x/assets/LeaveWarPage-a.js', startTime: 10, responseEnd: 60, transferSize: 300, encodedBodySize: 0 },
      { name: 'http://x/assets/LeaveWarPage-b.css', startTime: 10, responseEnd: 60, transferSize: 5_300, encodedBodySize: 5_000 },
    ]
    const was = performance.getEntriesByType
    ;(performance as any).getEntriesByType = (t: string) => (t === 'resource' ? entries : [])
    try {
      section('viewsched'); section('leavewar', false)
      at(0); timingMark({ kind: 'page', page: 'leavewar', t: 0 })
      at(100); show('leavewar'); step(3)
      expect(got.filter(e => e.kind === 'page').map(e => e.kind === 'page' ? e.downloaded : -1)).toEqual([5_300])
    } finally { (performance as any).getEntriesByType = was }
  })
  /* THE WALK OF 24 NOV 26 (chat 164, W7): after Retry's reload the Leave War's first open read "downloaded 1 KB". Chrome
     reports a file it already held with its body's size all the same — "unchanged" (the header only came) or straight
     from its memory (nothing came) — so a file counts only when what came is more than its body: the body came too */
  it('never counts a file the browser already held — "unchanged", or from its memory — though Chrome gives its body size', () => {
    const entries = [
      { name: 'http://x/assets/LeaveWarPage-a.js', startTime: 10, responseEnd: 60, transferSize: 310, encodedBodySize: 41_000 },
      { name: 'http://x/assets/LeaveWarPage-b.css', startTime: 10, responseEnd: 60, transferSize: 0, encodedBodySize: 5_000 },
      { name: 'http://x/assets/LeaveWarPage-c.js', startTime: 10, responseEnd: 60, transferSize: 9_300, encodedBodySize: 9_000 },
    ]
    const was = performance.getEntriesByType
    ;(performance as any).getEntriesByType = (t: string) => (t === 'resource' ? entries : [])
    try {
      section('viewsched'); section('leavewar', false)
      at(0); timingMark({ kind: 'page', page: 'leavewar', t: 0 })
      at(100); show('leavewar'); step(3)
      expect(got.filter(e => e.kind === 'page').map(e => e.kind === 'page' ? e.downloaded : -1)).toEqual([9_300])
    } finally { (performance as any).getEntriesByType = was }
  })
})

/* the sign-in's landing window closes with the task that made the sign-in mark (a timer of 0 in the app) */
function await0() { flushLandingForTest() }

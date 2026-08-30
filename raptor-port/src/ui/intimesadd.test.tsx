// @vitest-environment jsdom
/* IN-TIME LINES CAN BE ADDED AND REMOVED (owner, 21 Aug 26 — "allow me to
   input lines at the top of each wave where I can reflect the in time
   likewise to be able to edit or delete it"). Closes the known gap where
   deleting the last in-time dropped the whole block out of the DOM with no
   control to bring it back (undo was the only way home).

   What this pins is the SHAPE of the answer, which is the part a later pass
   could get wrong:
     - the "+ In time" button renders in EDIT mode only, on every non-standalone
       wave, WHETHER OR NOT the wave currently has in-time lines — the always-
       there add control IS the vanishing-box fix;
     - a standalone wave (SC/AVALON/BB) gets no add button: it is a shift, not a
       sortie, and a typed in-time there would silently move the wave windows;
     - both writers go through the SAME `it:` key the typed contenteditable path
       uses, so the AL diff, the changes list and undo read identically — and the
       engine needs no wiring at all, because intimeMap/waveInTime parse the
       w.intimes strings themselves;
     - the minted line carries the wave's own derived in-time (waveInTime — the
       exact number the engine already assumes) and NO callsign, because
       "<CS> IN TIME" is the phrase that sets a formation's report time and the
       button must not pick a jet nobody chose;
     - a member is refused at routeClick even with a hand-made button. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { waveInTime, intimeFold } from '../engine/events'
import { hhmm } from '../engine/time'
import { makeStandalone } from '../engine/waves'
import { HOOKS } from '../engine/hooks'
import { elogRows } from '../engine/editlog'
import { dayHTML } from './html'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
/* the deferred focus lands on a macrotask (interactions.ts, LogicPage's own
   idiom) — drain it so a test never leaves a timer firing into the next one */
const drain = () => act(async () => { await new Promise(r => setTimeout(r, 1)) })

let TOASTS: string[] = []
const W0 = () => DAYS[0].waves[0]

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  HOOKS.toast = (m: any) => { TOASTS.push(String(m)) }
})
beforeEach(() => { TOASTS = [] })

describe('adding and removing in-time lines', () => {
  it('the edit week offers "+ In time" on a flying wave and a ✕ per line; the view render offers neither', () => {
    const ed = dayHTML(0, true)
    expect(ed, 'add button on the edit surface').toContain(`data-itadd="0|0"`)
    expect(ed, 'a ✕ per line on the edit surface').toContain(`data-itdel="0|0|0"`)
    /* per-line since the owner's iPhone pass (21 Aug 26): each LINE is the
       contenteditable, the wrapper is not, and the ✕ sits outside any
       editable region — iOS does not reliably tap a button inside one */
    expect(ed).toContain(`data-itline="0|0|0"`)
    expect(ed, 'the wrapper is not editable any more').not.toContain(`contenteditable="true" spellcheck="false" data-intimes=`)
    const ro = dayHTML(0, false)
    expect(ro, 'no add button read-only').not.toContain('data-itadd')
    expect(ro, 'no ✕ read-only').not.toContain('data-itdel')
    expect(ro, 'no editable lines read-only').not.toContain('data-itline')
    /* the block itself still renders read-only — the lines are published text */
    expect(ro).toContain('class="intimes"')
  })

  it('editing ONE line commits that line alone, and a stray span WebKit mints is invisible to it', async () => {
    const w = W0()
    const keep = w.intimes.slice()
    try {
      await act(async () => { notify() })
      const line = $(`#eWeek [data-itline="0|0|0"]`)
      /* the duplicate bug's shape: iOS cloned a span inside the old shared
         block and the scrape read it as a line. A stray span beside the
         per-line spans must commit NOTHING. */
      const ghost = document.createElement('span')
      ghost.textContent = 'GHOST LINE'
      line.parentElement!.appendChild(ghost)
      line.textContent = '0930H: EDITED LINE'
      await act(async () => { line.dispatchEvent(new Event('focusout', { bubbles: true })) })
      /* the commit folds the typed time to hh:mm (owner, 30 Aug 26) — the
         colon appears on its own; the words stay as typed */
      expect(w.intimes[0]).toBe('09:30H: EDITED LINE')
      expect(w.intimes[1], 'the second line untouched').toBe(keep[1])
      expect(w.intimes.join('|'), 'no ghost committed').not.toContain('GHOST')
      expect(w.intimes.length).toBe(keep.length)
      ghost.remove()
    } finally {
      w.intimes = keep.slice()
      await act(async () => { notify() })
    }
  })

  it('Escape puts the model line back under the caret', async () => {
    const w = W0()
    const keep = w.intimes.slice()
    try {
      await act(async () => { notify() })
      const line = $(`#eWeek [data-itline="0|0|0"]`)
      line.textContent = 'MANGLED MID-TYPE'
      await act(async () => { line.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })) })
      /* the restore repaints the DISPLAY, which folds the leading time to
         hh:mm (owner, 30 Aug 26); the model line stays exactly keep[0] */
      expect(line.textContent).toBe(intimeFold(keep[0]))
      expect(w.intimes[0], 'the model never took the mangle').toBe(keep[0])
    } finally {
      w.intimes = keep.slice()
      await act(async () => { notify() })
    }
  })

  it('clearing a line\'s text deletes it, and its ✕ leaves the DOM with it before the repaint', async () => {
    const w = W0()
    const keep = w.intimes.slice()
    try {
      await act(async () => { notify() })
      const line = $(`#eWeek [data-itline="0|0|0"]`)
      line.textContent = '   '
      await act(async () => { line.dispatchEvent(new Event('focusout', { bubbles: true })) })
      expect(w.intimes.length).toBe(keep.length - 1)
      expect(w.intimes[0], 'the second line moved up').toBe(keep[1])
    } finally {
      w.intimes = keep.slice()
      await act(async () => { notify() })
    }
  })

  it('a standalone wave gets no add button — a typed in-time there would move the wave windows', () => {
    const d = DAYS[0]
    d.waves.push(makeStandalone('sc'))
    try {
      const gi = d.waves.length - 1
      const ed = dayHTML(0, true)
      expect(ed, 'no add button on the standalone wave').not.toContain(`data-itadd="0|${gi}"`)
      expect(ed, 'the flying wave still has its own').toContain(`data-itadd="0|0"`)
    } finally { d.waves.pop() }
  })

  it('clicking + In time appends a line seeded with the wave\'s own derived in-time and logs through the it: key', async () => {
    await act(async () => { notify() })
    const w = W0()
    const before = w.intimes.length
    const t0 = waveInTime(w)
    await click($(`#eWeek [data-itadd="0|0"]`))
    expect(w.intimes.length, 'one line added').toBe(before + 1)
    const line = w.intimes[w.intimes.length - 1]
    /* hh:mm since 30 Aug 26 — the mint states its time in the one colon form */
    expect(line).toBe(hhmm(t0) + 'H: IN TIME + WX/NOTAMS')
    /* engine-neutral: the seeded time IS the wave's derived in-time, so the
       number the engine reads has not moved */
    expect(waveInTime(w), 'derived in-time unmoved by the seed').toBe(t0)
    /* no callsign — "<CS> IN TIME" would set a formation report time */
    expect(line).not.toMatch(/\b[A-Z]{2}\s+IN\s+TIME/)
    const row = elogRows(0).find(r => r.key === 'it:0.0')
    expect(row, 'the changes list carries the it: row').toBeTruthy()
    expect(row!.lbl).toContain('in-times')
    await drain()
    /* put the seed back so later tests read the pristine wave */
    w.intimes = w.intimes.slice(0, before)
    await act(async () => { notify() })
  })

  it('deleting every line leaves the + button as the way back, and clicking it brings the block home', async () => {
    const w = W0()
    const keep = w.intimes.slice()
    w.intimes = []
    await act(async () => { notify() })
    try {
      expect($(`#eWeek .intimes[data-intimes="0|0"]`), 'block gone with its last line').toBeFalsy()
      const add = $(`#eWeek [data-itadd="0|0"]`)
      expect(add, 'the add button is still there — the vanishing-box fix').toBeTruthy()
      await click(add)
      expect(w.intimes.length, 'a line again').toBe(1)
      expect($(`#eWeek .intimes[data-intimes="0|0"]`), 'the block is back').toBeTruthy()
      await drain()
    } finally {
      w.intimes = keep
      await act(async () => { notify() })
    }
  })

  it('the ✕ removes exactly its own line, and only that one', async () => {
    const w = W0()
    const keep = w.intimes.slice()
    expect(keep.length, 'the seed carries two lines').toBeGreaterThan(1)
    try {
      await click($(`#eWeek [data-itdel="0|0|0"]`))
      expect(w.intimes.length).toBe(keep.length - 1)
      expect(w.intimes[0], 'the SECOND line survived').toBe(keep[1])
      expect(TOASTS.join(' ')).toContain('In-time line removed')
    } finally {
      w.intimes = keep.slice()
      await act(async () => { notify() })
    }
  })

  it('a member is refused at routeClick, even with a hand-made button', async () => {
    await act(async () => { setSession({ user: 'm', role: 'main' }); notify() })
    const w = W0()
    const before = w.intimes.slice()
    try {
      const b = document.createElement('button')
      b.setAttribute('data-itadd', '0|0')
      const x = document.createElement('button')
      x.setAttribute('data-itdel', '0|0|0')
      document.body.append(b, x)
      await click(b); await click(x)
      expect(w.intimes).toEqual(before)
      expect(TOASTS.some(t => /Only a scheduler/.test(t)), 'the refusal answered').toBe(true)
      b.remove(); x.remove()
    } finally {
      await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
    }
  })
})

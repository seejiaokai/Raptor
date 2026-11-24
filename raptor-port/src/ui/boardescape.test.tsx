// @vitest-environment jsdom
/* ESCAPE CLOSES THE SCHEDULER BOARD AS ✓ DONE DOES ([BOARD-ESCAPE-CLOSE], 30 Oct 26 — ui/boardescape.ts).
   With the keyboard nowhere or on one of the board's buttons, and nothing over the board, Escape closes it. In one of its
   own boxes Escape puts the old value back and leaves the box first (D1011), the board staying; a window, sheet or menu
   over the board answers (or ignores) it first; a picked seat is put down first; a held key's repeats are not a second
   press; and the keyboard goes back to where it was when the board opened. Driven through the real App, the keys sent
   where the keyboard is, as windowkeys.test.tsx does. Every case but the box and the window ones is red on `main`, where
   Escape closed nothing. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import * as view from '../state/view'
import { DAYS } from '../engine/data'
import { setAirKey } from './pops'
import { boardEscapeWants } from './boardescape'
import * as React from 'react'
import { FloatWin } from './FloatWindow'
import { makeTimingReadout } from './TimingReadout'
import type { TimingView } from './timingtext'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
/* a key pressed where the keyboard is, as a person presses it */
const key = async (k: string, repeat = false) => {
  await act(async () => {
    const at = (document.activeElement as HTMLElement) || document.body
    at.dispatchEvent(new KeyboardEvent('keydown', { key: k, repeat, bubbles: true, cancelable: true }))
  })
}
const openBoard = async (di = 2) => {
  await click($(`#eWeek .day[data-day="${di}"] .dt.sb-open`))
  expect(view.SBDAY, 'the board is open').toBe(di)
}
const boardOpen = () => view.SBDAY != null && !($('#schedBoard') as any).hidden

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
})
beforeEach(async () => {
  ;(document.activeElement as HTMLElement | null)?.blur?.()
  if (view.SBDAY != null) await click($('#sbDone'))
})

describe('Escape with the keyboard nowhere, or on a button of the board', () => {
  it('closes the board, as ✓ Done does — the board\'s day carried back to the week', async () => {
    await openBoard(2)
    expect(document.activeElement === document.body || document.activeElement == null).toBe(true)
    await key('Escape')
    expect(boardOpen(), 'the board closed').toBe(false)
    expect(view.SBDAY).toBe(null)
    /* the same way out as ✓ Done: the day the board was on comes back out with it (closeBoardState's CARRYDAY) — the
       week reads it on its next paint and clears it, so it is the week left on the board's day that proves it */
    expect(view.CURPAGE).toBe('editsched')
  })

  it('closes it from a button of the board', async () => {
    await openBoard(1)
    $('#sbCal').focus()
    expect(document.activeElement).toBe($('#sbCal'))
    await key('Escape')
    expect(boardOpen()).toBe(false)
  })

  it('then ✓ Done and a reopen: Escape closes the board again (the other order)', async () => {
    await openBoard(3)
    await click($('#sbDone'))
    expect(boardOpen()).toBe(false)
    await openBoard(3)
    await key('Escape')
    expect(boardOpen()).toBe(false)
  })

  it('a held key\'s repeat is not a press: it closes nothing', async () => {
    await openBoard(2)
    await key('Escape', true)
    expect(boardOpen(), 'a repeat alone leaves the board open').toBe(true)
    await key('Escape')
    expect(boardOpen()).toBe(false)
  })
})

describe('Escape in one of the board\'s own boxes', () => {
  it('a take-off time typed then Escape: the old time back, the box left, the board kept — the next Escape closes it', async () => {
    await openBoard(2)
    const box = $('#sbBoard input.tm[data-bfld$=".to"]') as HTMLInputElement
    expect(box, 'a take-off box on the board').toBeTruthy()
    const was = box.value
    box.focus()
    box.value = '23:59'
    await key('Escape')
    const now = $(`#sbBoard input[data-bfld="${box.dataset.bfld}"]`) as HTMLInputElement
    expect(now.value, 'D1011: the old time is put back').toBe(was)
    expect(boardOpen(), 'the board stays').toBe(true)
    expect(now.contains(document.activeElement), 'the box is left').toBe(false)
    await key('Escape')
    expect(boardOpen(), 'the second Escape closes the board').toBe(false)
  })

  it('the board\'s search box: Escape leaves it, its words kept, the board open — the next Escape closes it', async () => {
    await openBoard(2)
    const s = $('#searchB') as HTMLInputElement
    s.focus()
    expect(document.activeElement).toBe(s)
    await key('Escape')
    expect(boardOpen()).toBe(true)
    expect(document.activeElement).not.toBe(s)
    await key('Escape')
    expect(boardOpen()).toBe(false)
  })
})

describe('something over the board answers first', () => {
  it('a picked seat is put down first; the next Escape closes the board', async () => {
    await openBoard(2)
    await act(async () => { view.armSlot('d:2.0.0'); notify() })
    expect(view.ARM).toBeTruthy()
    await key('Escape')
    expect(view.ARM, 'the seat is put down').toBe(null)
    expect(boardOpen(), 'the board stays').toBe(true)
    await key('Escape')
    expect(boardOpen()).toBe(false)
  })

  it('the ⋯ menu closes on Escape and the board stays', async () => {
    await openBoard(2)
    await click($('#sbMore'))
    expect($('#sbMoreMenu')).toBeTruthy()
    await key('Escape')
    expect($('#sbMoreMenu'), 'the menu closed').toBeNull()
    expect(boardOpen(), 'the board stays').toBe(true)
    await key('Escape')
    expect(boardOpen()).toBe(false)
  })

  it('a small menu of the board (+ Block) leaves the board open', async () => {
    await openBoard(2)
    await click($('#sbBoard [data-dwadd="2"]'))
    expect($('.wavemenu'), 'the + Block menu is up').toBeTruthy()
    await key('Escape')
    expect(boardOpen(), 'the board stays under its menu').toBe(true)
    $$('.wavemenu').forEach(m => m.remove())
  })

  it('the Sort all question over the board: the board stays', async () => {
    await openBoard(2)
    await click($('#sbSortAll'))
    expect(($('#sortAllPop') as any).hidden).toBe(false)
    await key('Escape')
    expect(boardOpen()).toBe(true)
    await click($('#sortAllCancel'))
  })

  /* since [VEILED-WINDOWS-BAR]'s Escape part (3 Nov 26) the window closes on that Escape — and only it */
  it('the Traffic window over the board: Escape closes the window, the board stays', async () => {
    await openBoard(2)
    const w = DAYS[2].waves.findIndex((x: any) => x && !x.sa)
    await act(async () => { setAirKey(`2|${w}`); notify() })
    expect(($('#airpop') as any).hidden).toBe(false)
    await key('Escape')
    expect(($('#airpop') as any).hidden, 'the window closed').toBe(true)
    expect(boardOpen()).toBe(true)
  })

  /* Escape now closes the changes window itself, the last thing opened (his D2112, 17 Nov 26 — escwindows.test.tsx); the
     board still waits for it, and the next Escape closes the board */
  it('the changes window (History) over the board: Escape closes the window, the board stays', async () => {
    await openBoard(2)
    await click($('#sbHist'))
    expect(view.CHGWIN, 'the changes window is open').toBeTruthy()
    await key('Escape')
    expect(view.CHGWIN, 'the window closed').toBe(null)
    expect(boardOpen()).toBe(true)
    await key('Escape')
    expect(boardOpen(), 'the next Escape closes the board').toBe(false)
  })

  /* THE ?timing READOUT'S WINDOW (the walk of 24 Nov 26, chat 164, W19 (f)): it opens by itself as the app starts and
     stays up all session, so the board opened after it is the last thing opened — his D2112, Escape closes what opened
     last. It was answering first: one Escape folded the readout, a second closed the board. The real readout, drawn
     in a root of its own as ui/timingwindow.tsx draws it */
  it('the ?timing window, up since the start: Escape closes the board first, then folds the window', async () => {
    const tHost = document.createElement('div'); document.body.appendChild(tHost)
    const tRoot = createRoot(tHost)
    const Readout = makeTimingReadout({ React, FloatWin })
    const tv: TimingView = { site: 300, app: 800, first: { screen: 'signin', t: 840 }, signin: null, pages: [],
      freezes: { supported: true, n: 0, total: 0, max: 0 }, files: { supported: true, n: 1, bytes: 1, kept: 0, asked: 0 },
      env: { browser: { name: 'Chrome', version: '131' }, cores: 4, memGB: 8, screen: '1366×768', window: '1366×657', scale: 1, openFor: 1 } }
    try {
      await act(async () => { tRoot.render(<Readout read={() => tv} subscribe={() => () => {}} version={() => 0} startOpen copy={async () => true} now={() => new Date()} />) })
      expect($('.timingwin'), 'the readout is open').toBeTruthy()
      ;(document.activeElement as HTMLElement | null)?.blur?.()
      await openBoard(2)
      await key('Escape')
      expect(boardOpen(), 'the board, opened last, closes first').toBe(false)
      expect($('.timingwin'), 'the readout stays open').toBeTruthy()
      /* opened by itself, it is a bystander (the code reads of chat 165): Escape is its own only with the keys in it */
      await key('Escape')
      expect($('.timingwin'), 'the keys on nothing: the readout stays').toBeTruthy()
      ;($('.timingwin .win-x') as HTMLElement).focus()
      await key('Escape')
      expect($('.timingwin'), 'the keys in it: Escape folds the readout').toBe(null)
      expect($('.timing-pill')).toBeTruthy()
    } finally {
      await act(async () => { tRoot.unmount() }); tHost.remove()
    }
  })

  /* THE CODE READS OF CHAT 165 (the fresh Opus read's F4; Astra's 1 and 6): with the readout up, (a) a picked seat put
     down AND the readout folded on one Escape; (b) with the keys IN the readout, a sheet or panel underneath that hears
     Escape at the page first (the Leave War's person window, the Tracker's Show All with a name half typed) closed
     instead — one press, the wrong thing */
  it('the ?timing window up: Escape puts a picked seat down and nothing else', async () => {
    const tHost = document.createElement('div'); document.body.appendChild(tHost)
    const tRoot = createRoot(tHost)
    const Readout = makeTimingReadout({ React, FloatWin })
    const tv: TimingView = { site: 300, app: 800, first: { screen: 'signin', t: 840 }, signin: null, pages: [],
      freezes: { supported: true, n: 0, total: 0, max: 0 }, files: { supported: true, n: 1, bytes: 1, kept: 0, asked: 0 },
      env: { browser: { name: 'Chrome', version: '131' }, cores: 4, memGB: 8, screen: '1366×768', window: '1366×657', scale: 1, openFor: 1 } }
    try {
      await act(async () => { tRoot.render(<Readout read={() => tv} subscribe={() => () => {}} version={() => 0} startOpen copy={async () => true} now={() => new Date()} />) })
      await act(async () => { view.armSlot('d:2.0.0'); notify() })
      expect(view.ARM, 'a seat is picked').toBeTruthy()
      ;(document.activeElement as HTMLElement | null)?.blur?.()
      await key('Escape')
      expect({ seatDown: view.ARM == null, readoutOpen: !!$('.timingwin') }).toEqual({ seatDown: true, readoutOpen: true })
    } finally {
      await act(async () => { tRoot.unmount() }); tHost.remove()
    }
  })
  it('the keys in the ?timing window: Escape folds it, and a panel listening at the page underneath never hears it', async () => {
    const tHost = document.createElement('div'); document.body.appendChild(tHost)
    const tRoot = createRoot(tHost)
    const Readout = makeTimingReadout({ React, FloatWin })
    const tv: TimingView = { site: 300, app: 800, first: { screen: 'signin', t: 840 }, signin: null, pages: [],
      freezes: { supported: true, n: 0, total: 0, max: 0 }, files: { supported: true, n: 1, bytes: 1, kept: 0, asked: 0 },
      env: { browser: { name: 'Chrome', version: '131' }, cores: 4, memGB: 8, screen: '1366×768', window: '1366×657', scale: 1, openFor: 1 } }
    let heard = 0
    /* as the Leave War's sheet (leavewar/ui/Sheet.tsx) and the Tracker (tracker/App.jsx) listen: at the page, first */
    const panel = (e: KeyboardEvent) => { if (e.key === 'Escape') { heard++; e.preventDefault(); e.stopPropagation() } }
    document.addEventListener('keydown', panel, true)
    try {
      await act(async () => { tRoot.render(<Readout read={() => tv} subscribe={() => () => {}} version={() => 0} startOpen copy={async () => true} now={() => new Date()} />) })
      ;($('.timingwin .win-x') as HTMLElement).focus()
      await key('Escape')
      expect({ readoutOpen: !!$('.timingwin'), panelHeard: heard }).toEqual({ readoutOpen: false, panelHeard: 0 })
    } finally {
      document.removeEventListener('keydown', panel, true)
      await act(async () => { tRoot.unmount() }); tHost.remove()
    }
  })

  /* THE BELL'S LIST OVER THE ?timing WINDOW (the re-walk of 24 Nov 26, chat 165, W19 (e)): one Escape closed the list
     AND folded the window — the list closed itself on the key without marking it used, and the window in front took the
     same press (D2112: one press, one thing). Any movable window in front met the same; the readout, up all session,
     made it the ordinary case */
  it('the bell\'s list opened over the ?timing window: Escape closes the list only', async () => {
    const tHost = document.createElement('div'); document.body.appendChild(tHost)
    const tRoot = createRoot(tHost)
    const Readout = makeTimingReadout({ React, FloatWin })
    const tv: TimingView = { site: 300, app: 800, first: { screen: 'signin', t: 840 }, signin: null, pages: [],
      freezes: { supported: true, n: 0, total: 0, max: 0 }, files: { supported: true, n: 1, bytes: 1, kept: 0, asked: 0 },
      env: { browser: { name: 'Chrome', version: '131' }, cores: 4, memGB: 8, screen: '1366×768', window: '1366×657', scale: 1, openFor: 1 } }
    try {
      await act(async () => { tRoot.render(<Readout read={() => tv} subscribe={() => () => {}} version={() => 0} startOpen copy={async () => true} now={() => new Date()} />) })
      ;(document.activeElement as HTMLElement | null)?.blur?.()
      await click($('#notifyBell'))
      expect($('.bell-list'), 'the bell\'s list is open').toBeTruthy()
      await key('Escape')
      expect($('.bell-list'), 'the list closed').toBe(null)
      expect($('.timingwin'), 'the readout, opened before it, stays open').toBeTruthy()
    } finally {
      await act(async () => { tRoot.unmount() }); tHost.remove()
    }
  })

  it('nothing is decided for a closed board, or off Edit Schedule', () => {
    expect(view.SBDAY).toBe(null)
    expect(boardEscapeWants(document.body)).toBe('')
  })
})

describe('the keyboard comes back', () => {
  /* the state is set directly: this proves the way back from any control of the week (an undo reopening the board, say);
     the day's date, which takes the keys since 3 Nov 26, is driven by its own keys in boardkeys.test.tsx */
  it('to the control of the week it was on when the board opened, after Escape', async () => {
    const opener = $('#eWeek [data-air]') as HTMLElement
    expect(opener, 'a Traffic button on the week').toBeTruthy()
    opener.focus()
    expect(document.activeElement).toBe(opener)
    await openBoard(2)
    /* the keys then go onto the board (a Tab to its Calendar button), and Escape is pressed there */
    $('#sbCal').focus()
    expect(document.activeElement).toBe($('#sbCal'))
    await key('Escape')
    expect(boardOpen()).toBe(false)
    const back = document.activeElement as HTMLElement
    expect(back && back.dataset && back.dataset.air, "the keyboard is on the week's Traffic button again").toBe(opener.dataset.air)
  })

  it("✓ Done pressed by the keys leaves no keyboard on the board's hidden buttons", async () => {
    await openBoard(1)
    $('#sbDone').focus()
    expect(document.activeElement).toBe($('#sbDone'))
    await click($('#sbDone'))
    expect(boardOpen()).toBe(false)
    expect($('#schedBoard').contains(document.activeElement), 'the keyboard is off the closed board').toBe(false)
  })
})

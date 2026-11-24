// @vitest-environment jsdom
/* THE FIX READ OF CHAT 167 (a fresh, blind Opus, 24 Nov 26), pinned before its fix: the ?timing readout's Escape listener sits on the WINDOW's capture, the same
   node and phase as the app's own "peel one layer" listeners (leavewar/ui/OpenDatesSheet.tsx:173, Matrix.tsx popovers,
   FlyEdit, SettingsSheet palette, ui/InputsPage.tsx:402, TypeLegend.tsx:58 …). stopPropagation() does not stop other
   listeners on the same node, so whichever was registered second still runs: one Escape closes two things. */
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { FloatWin } from './FloatWindow'
import { makeTimingReadout } from './TimingReadout'
import type { TimingView } from './timingtext'

const TimingReadout = makeTimingReadout({ React, FloatWin })
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const VIEW: TimingView = {
  site: 300, app: 812, first: { screen: 'signin', t: 840 }, signin: 1700, pages: [],
  freezes: { supported: true, n: 0, total: 0, max: 0 },
  files: { supported: true, n: 1, bytes: 1, kept: 0, asked: 0 },
  env: { browser: { name: 'Chrome', version: '131' }, cores: 4, memGB: 8, screen: '1366×768', window: '1366×657', scale: 1, openFor: 1 },
}
let host: HTMLDivElement, root: Root
beforeEach(() => { host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host) })
afterEach(() => { act(() => root.unmount()); host.remove() })
const draw = (startOpen: boolean) => act(() => root.render(<TimingReadout read={() => VIEW} subscribe={() => () => {}} version={() => 0} startOpen={startOpen} copy={async () => true} now={() => new Date()} />))
const win = () => document.querySelector('.floatwin.timingwin')
const pill = () => document.querySelector('button.timing-pill') as HTMLButtonElement | null
const esc = (at: Element) => act(() => { at.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })

describe('one Escape, one thing — with the keys in the readout', () => {
  it('a layer opened BEFORE the readout was reopened (OpenDatesSheet\'s calendar shape: window capture, stopPropagation only)', () => {
    draw(false)                         // folded (he folded it, or a phone)
    let calendarOpen = true
    /* exactly OpenDatesSheet.tsx's listener: window, capture, no defaultPrevented check, stopPropagation only */
    const layer = (e: KeyboardEvent) => { if (e.key !== 'Escape' || !calendarOpen) return; e.stopPropagation(); calendarOpen = false }
    window.addEventListener('keydown', layer, true)
    try {
      act(() => { pill()!.click() })   // the pill stands at z 409, over a Leave War sheet's scrim (79)
      expect(win()!.contains(document.activeElement), 'opened from the pill, the keys are in it').toBe(true)
      esc(document.activeElement!)
      expect({ calendarOpen, readoutOpen: !!win() }, 'one press, one thing').toEqual({ calendarOpen: false, readoutOpen: true })
    } finally { window.removeEventListener('keydown', layer, true) }
  })
  it('a layer opened AFTER the readout (InputsPage range calendar / TypeLegend shape: window capture, no defaultPrevented check)', () => {
    draw(true)                          // open since the start: its listener was the first registered
    let calendarOpen = true
    const layer = (e: KeyboardEvent) => { if (e.key !== 'Escape') return; e.preventDefault(); e.stopPropagation(); calendarOpen = false }
    window.addEventListener('keydown', layer, true)
    try {
      ;(win()!.querySelector('.win-x') as HTMLButtonElement).focus()   // Tab walked on into the readout (its root is last in the page)
      esc(document.activeElement!)
      expect({ calendarOpen, readoutOpen: !!win() }, 'one press, one thing').toEqual({ calendarOpen: true, readoutOpen: false })
    } finally { window.removeEventListener('keydown', layer, true) }
  })
})

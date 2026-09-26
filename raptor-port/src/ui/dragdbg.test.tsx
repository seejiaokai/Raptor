// @vitest-environment jsdom
/* The optional drag readout (ui/dragdbg.ts) must be INERT until switched on —
   it can never reach a normal user or touch the surface it measures. These pin
   that, and that once armed it latches a drag's fields for a photo. */
import { afterEach, describe, expect, it } from 'vitest'
import { DBG, initDragDbg } from './dragdbg'

let detach: (() => void) | null = null
const setUrl = (s: string) => window.history.replaceState(null, '', s)
/* the drag counter #N is module state that climbs across a session (and so
   across tests in this file), so assert on it relatively, never absolutely */
const dragNo = (t: string | null) => parseInt((t || '').match(/DRAG #(\d+)/)![1], 10)
afterEach(() => { if (detach) { detach(); detach = null } setUrl('/') })

describe('the drag readout is inert unless switched on', () => {
  it('attaches nothing, and every hook is a no-op, with no flag', () => {
    setUrl('/')
    detach = initDragDbg()
    expect(document.getElementById('dragdbg'), 'no panel with no flag').toBeNull()
    DBG.pd(10, 20, 'mouse'); DBG.mv(); DBG.arm(); DBG.nat(true); DBG.pu(30, 40); DBG.efp(null); DBG.drop('OK')
    expect(document.getElementById('dragdbg'), 'still nothing after the hooks fire').toBeNull()
  })

  it('?dragdbg=1 attaches a pointer-events:none panel that latches the drag', () => {
    setUrl('/?dragdbg=1')
    detach = initDragDbg()
    const p = document.getElementById('dragdbg')!
    expect(p, 'panel attached').toBeTruthy()
    expect(p.style.pointerEvents, 'cannot eat the gesture it measures').toBe('none')
    DBG.pd(12, 34, 'mouse'); DBG.mv(); DBG.mv(); DBG.arm(); DBG.nat(true); DBG.pu(56, 78); DBG.efp(null); DBG.drop('NONE')
    const t = p.textContent!
    expect(t).toMatch(/DRAG #\d+/); expect(t).toContain('mouse')
    expect(t).toContain('PD 1 @12,34'); expect(t).toContain('MV 2'); expect(t).toContain('ARM 1')
    expect(t).toContain('NAT 1'); expect(t).toContain('PU 1 @56,78'); expect(t).toContain('DROP NONE')
  })

  it('a native dragstart counts only when trusted (a real browser drag), and EFP reads tag+class', () => {
    setUrl('/?dragdbg=1')
    detach = initDragDbg()
    const p = document.getElementById('dragdbg')!
    DBG.pd(1, 1, 'mouse')
    DBG.nat(false)                       // a synthetic test dragstart — not a real drag
    expect(p.textContent).toContain('NAT 0')
    DBG.nat(true)                        // the browser started its own — the SIS detector
    expect(p.textContent).toContain('NAT 1')
    const seat = document.createElement('div'); seat.className = 'seat data-x'
    DBG.efp(seat as any)
    expect(p.textContent).toContain('EFP DIV.seat')
  })

  it('a fresh pointerdown starts a new latch group and resets the counters', () => {
    setUrl('/?dragdbg=1')
    detach = initDragDbg()
    const p = document.getElementById('dragdbg')!
    DBG.pd(1, 1, 'mouse'); DBG.mv(); DBG.nat(true)
    const first = dragNo(p.textContent)
    DBG.pd(2, 2, 'touch')
    const t = p.textContent!
    expect(dragNo(t), 'a new press bumps the drag counter').toBe(first + 1)
    expect(t).toContain('touch')
    expect(t).toContain('MV 0'); expect(t).toContain('NAT 0')
  })

  it('#dragdbg in the hash arms it too (for a locked address bar)', () => {
    setUrl('/#dragdbg')
    detach = initDragDbg()
    expect(document.getElementById('dragdbg')).toBeTruthy()
  })

  it('detach removes the panel and disarms the hooks', () => {
    setUrl('/?dragdbg=1')
    const d = initDragDbg()
    expect(document.getElementById('dragdbg')).toBeTruthy()
    d()
    expect(document.getElementById('dragdbg'), 'panel gone on detach').toBeNull()
    DBG.pd(1, 2, 'mouse')
    expect(document.getElementById('dragdbg'), 'hooks inert again after detach').toBeNull()
  })
})

/* A PRESS ON A CONTROL NEVER COUNTS TOWARD THE CORNER SWITCH (the absence-record re-test's re-walk, W1's NEW-2, 26 Sep
   26): the Inputs calendar's "previous month" arrow sits inside the top-left 64 px, so paging back five months switched
   the readout on — a green strip over the month title and the top bar on every page until a reload. The switch is for
   the EMPTY corner of a locked-down browser; a button, a link or a field there is the app's own. */
describe('the corner switch counts only presses on no control', () => {
  it('a press on a button, a link or a field in the corner does not count; bare corner does', async () => {
    const { cornerTapCounts } = await import('./dragdbg')
    document.body.innerHTML = '<div id="bare"></div><button id="b"><span id="in">‹</span></button><a id="l" href="#">x</a><input id="i">'
    const at = (id: string, x = 10, y = 10) => cornerTapCounts({ clientX: x, clientY: y, target: document.getElementById(id) })
    expect(at('bare')).toBe(true)
    expect(at('b')).toBe(false)
    expect(at('in')).toBe(false)
    expect(at('l')).toBe(false)
    expect(at('i')).toBe(false)
    expect(at('bare', 100, 10)).toBe(false)
    document.body.innerHTML = ''
  })
})

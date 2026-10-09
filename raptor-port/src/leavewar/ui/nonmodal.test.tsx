// @vitest-environment jsdom
/* THE TWO WINDOWS THAT DO NOT BLOCK THE GRID (owner, D641, D642 — 7 Oct 26; the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.3, §3.7).

   "All those pop up windows … should be able to drag around and the background still works (clickable editable) when
   this window is up" (D641) — and, of the Leave War's existing windows, ONE is brought into line in this job: the
   panel for a picked block of people's days (D642). `Sheet` gains a `modal={false}` form for it and for the Required
   panel: no veil, no close on a press outside, no keyboard held inside. Its ✕, Escape and its own buttons close it.
   While the people's-days panel is up, a NEW drag on the grid replaces what it acts on, and a plain click on a cell
   opens that cell's own sheet and closes the panel. Every OTHER Leave War window keeps blocking
   (`[LW-WINDOWS-NONBLOCKING]`) — pinned here too, so the new form cannot leak. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { storeBackend } from '../../engine/hooks'
import { initStore as raptorInitStore } from '../../state/store'
import { setSession } from '../../state/auth'
import { getState, initStore as lwInitStore, setCell, setPeople, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { projectPeople } from '../state/raptorRoster'
import { Matrix } from './Matrix'
import { Sheet } from './Sheet'

const origEFP = document.elementFromPoint
const origMM = window.matchMedia
afterEach(() => { cleanup(); document.elementFromPoint = origEFP; (window as any).matchMedia = origMM })

describe('Sheet, modal={false}', () => {
  const mount = (onClose = vi.fn(), modal = false) => {
    render(
      <div>
        <button data-testid="behind">a control on the page behind</button>
        <Sheet testid="s" label="A window" onClose={onClose} modal={modal}>
          <div className="bidsheet-hd"><span className="who">Title</span><button className="x" data-testid="x" onClick={onClose}>✕</button></div>
          <button data-testid="in1">one</button><button data-testid="in2">two</button>
        </Sheet>
      </div>,
    )
    return onClose
  }
  it('draws no veil over the page', () => {
    mount()
    expect(screen.queryByTestId('sheet-scrim')).toBeNull()
    expect(screen.getByTestId('s').className).toContain('nonmodal')
  })
  it('a press and a click on the page behind reach it, and do not close the window', () => {
    const onClose = mount()
    const hit = vi.fn()
    screen.getByTestId('behind').addEventListener('click', hit)
    fireEvent.pointerDown(screen.getByTestId('behind')); fireEvent.click(screen.getByTestId('behind'))
    expect(hit).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
  })
  it('on a touch screen too: no tap shield is put on the page', () => {
    ;(window as any).matchMedia = (q: string) => ({ matches: q.includes('coarse'), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
    const onClose = mount()
    const hit = vi.fn()
    screen.getByTestId('behind').addEventListener('click', hit)
    fireEvent.click(screen.getByTestId('behind'))
    expect(hit).toHaveBeenCalledTimes(1); expect(onClose).not.toHaveBeenCalled()
  })
  it('Escape closes it', () => {
    const onClose = mount()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('Tab is not held inside it: from its last control the keyboard goes on to the page', () => {
    mount()
    screen.getByTestId('in2').focus()
    const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    document.dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(false)
  })
  it('its title strip still drags it', () => {
    mount()
    const panel = screen.getByTestId('s'), hd = panel.querySelector('.bidsheet-hd') as HTMLElement
    hd.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 3, clientX: 100, clientY: 100 }))
    hd.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 3, clientX: 130, clientY: 100 }))
    hd.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 3 }))
    expect(panel.style.getPropertyValue('--lw-dx')).not.toBe('')
  })
  it('the blocking form is untouched: a veil, a click on it closes, Tab is held', () => {
    const onClose = mount(vi.fn(), true)
    expect(screen.getByTestId('s').className).not.toContain('nonmodal')
    screen.getByTestId('in2').focus()
    const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    document.dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(true)
    fireEvent.pointerDown(screen.getByTestId('sheet-scrim')); fireEvent.click(screen.getByTestId('sheet-scrim'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe('the panel for a picked block of people’s days stays up, and the grid behind it works (D642)', () => {
  const mem = new Map<string, string>()
  beforeEach(() => {
    mem.clear()
    storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
    raptorInitStore()
    setSession({ user: 'admin-test', role: 'admin' })
    lwInitStore(memoryBackend())
    setRole('admin')
    setPeople(projectPeople())
  })
  afterEach(() => { setSession(null); storeBackend.impl = null })

  const two = () => getState().people.filter(p => !p.pers && !p.san).slice(0, 2).map(p => p.id)
  const cell = (pid: string, iso: string) => screen.getByTestId(`cell-${pid}-${iso}`)
  async function drag(from: Element, to: Element) {
    document.elementFromPoint = () => to
    from.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'mouse', clientX: 5, clientY: 5, button: 0 }))
    act(() => { window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', clientX: 40, clientY: 5 })) })
    act(() => { window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, pointerType: 'mouse', button: 0 })) })
    await act(async () => { await new Promise(r => setTimeout(r, 2)) })
  }
  const sheet = () => screen.queryByTestId('select-sheet')

  it('opens with no veil; a press on the page behind leaves it up', async () => {
    const [a] = two()
    render(<Matrix />)
    await drag(cell(a!, '2026-01-06'), cell(a!, '2026-01-07'))
    expect(sheet()).toBeTruthy()
    expect(screen.queryByTestId('sheet-scrim')).toBeNull()
    fireEvent.pointerDown(document.body); fireEvent.click(document.body)
    fireEvent.click(screen.getByTestId('counts-toggle'))                // a control of the grid's own bar answers
    expect(screen.queryByTestId('fly-row-req-p')).toBeNull()
    expect(sheet()).toBeTruthy()
  })
  it('its ✕ and Escape close it', async () => {
    const [a] = two()
    render(<Matrix />)
    await drag(cell(a!, '2026-01-06'), cell(a!, '2026-01-07'))
    fireEvent.click(screen.getByTestId('sel-cancel'))
    expect(sheet()).toBeNull()
    await drag(cell(a!, '2026-01-06'), cell(a!, '2026-01-07'))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(sheet()).toBeNull()
  })
  it('a NEW drag while it is up replaces what it acts on — and starts it afresh (an armed Delete does not carry over)', async () => {
    const [a, b] = two()
    setCell(a!, '2026-01-06', 'LL'); setCell(b!, '2026-01-13', 'LL')
    render(<Matrix />)
    await drag(cell(a!, '2026-01-06'), cell(a!, '2026-01-07'))
    const before = screen.getByTestId('sel-span').textContent
    fireEvent.click(screen.getByTestId('sel-delete'))                   // armed: "Tap Delete again"
    expect(screen.getByTestId('sel-note').textContent).toMatch(/Tap Delete again/)
    await drag(cell(b!, '2026-01-13'), cell(b!, '2026-01-14'))
    expect(screen.getAllByTestId('select-sheet')).toHaveLength(1)
    expect(screen.getByTestId('sel-span').textContent).not.toBe(before)
    expect(screen.queryByTestId('sel-note')).toBeNull()
    fireEvent.click(screen.getByTestId('sel-delete'))                   // the FIRST tap for the new block: it asks, it does not delete
    expect(getState().grid[b!]?.['2026-01-13']).toBe('LL')
    expect(getState().grid[a!]?.['2026-01-06']).toBe('LL')
  })
  it('a plain click on a cell opens that cell’s own sheet and closes the panel', async () => {
    const [a, b] = two()
    render(<Matrix />)
    await drag(cell(a!, '2026-01-06'), cell(a!, '2026-01-07'))
    fireEvent.click(cell(b!, '2026-01-09'))
    expect(sheet()).toBeNull()
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
    expect(screen.getByTestId('sheet-scrim')).toBeTruthy()             // the one-day sheet still blocks, as before
  })
  it('a drag over the Required rows closes it and opens the Required panel; a drag back over people closes that', async () => {
    const [a] = two()
    render(<Matrix />)
    await drag(cell(a!, '2026-01-06'), cell(a!, '2026-01-07'))
    await drag(screen.getByTestId('req-p-2026-01-06'), screen.getByTestId('req-w-2026-01-07'))
    expect(sheet()).toBeNull(); expect(screen.getByTestId('req-panel')).toBeTruthy()
    await drag(cell(a!, '2026-01-08'), cell(a!, '2026-01-09'))
    expect(screen.queryByTestId('req-panel')).toBeNull(); expect(sheet()).toBeTruthy()
  })
  it('Move is unchanged: it closes the panel and hands the block to the grid’s move mode', async () => {
    const [a] = two()
    setCell(a!, '2026-01-06', 'LL')
    render(<Matrix />)
    await drag(cell(a!, '2026-01-06'), cell(a!, '2026-01-07'))
    fireEvent.click(screen.getByTestId('sel-move'))
    expect(sheet()).toBeNull()
    expect(screen.getByTestId('move-banner')).toBeTruthy()
  })
})

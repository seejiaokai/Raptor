// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import { SaveStatus, SaveBand, useSaveFailed, setSaveStatusSource } from './SaveStatus'
import { Postman } from '../storage/postman'
import { Whiteboard } from '../storage/whiteboard'
import { MemoryBackend } from '../storage/memory'

afterEach(() => { cleanup(); vi.useRealTimers() })

describe('SaveStatus', () => {
  it('renders nothing while saved, "Saving…" while a letter is queued or in flight, and Retry when failed', async () => {
    vi.useFakeTimers()
    const be = new MemoryBackend()
    const wb = new Whiteboard()
    const pm = new Postman(be); pm.attach(wb)
    setSaveStatusSource(pm)
    render(<SaveStatus />)
    expect(screen.queryByRole('status')).toBeNull()
    be.failNext(1)
    act(() => { wb.set('inputs', 'all', '[]') })
    expect(screen.getByRole('status').textContent).toContain('Saving')
    await act(async () => { await vi.advanceTimersByTimeAsync(300) })
    expect(screen.getByRole('status').textContent).toContain('Not saved')
    await act(async () => { screen.getByRole('button', { name: 'Retry' }).click(); await vi.advanceTimersByTimeAsync(1000) })
    expect(screen.queryByRole('status')).toBeNull()
  })

  /* [SAVE-NOTE-COVERS] (D587): the warning's words, and the same warning in the flow of a full-screen surface */
  it('a failed save reads "Not saved — keep this page open"; SaveBand shows it only while failed, and its Retry saves', async () => {
    vi.useFakeTimers()
    const be = new MemoryBackend()
    const wb = new Whiteboard()
    const pm = new Postman(be); pm.attach(wb)
    setSaveStatusSource(pm)
    const Flag = () => <i data-testid="failed">{String(useSaveFailed())}</i>
    render(<><SaveStatus /><SaveBand /><Flag /></>)
    expect(document.querySelector('.saveband')).toBeNull()
    expect(screen.getByTestId('failed').textContent).toBe('false')
    be.failNext(1)
    act(() => { wb.set('inputs', 'all', '[]') })
    /* "Saving…" is not a failure: no band, and the bar is not asked to make room */
    expect(document.querySelector('.saveband')).toBeNull()
    expect(screen.getByTestId('failed').textContent).toBe('false')
    await act(async () => { await vi.advanceTimersByTimeAsync(300) })
    expect(screen.getByTestId('failed').textContent).toBe('true')
    const band = document.querySelector('.saveband') as HTMLElement, bar = document.querySelector('.savestat.failed') as HTMLElement
    for (const n of [band, bar]) {
      expect(n.textContent).toContain('Not saved — keep this page open')
      expect(n.querySelector('button')!.textContent).toBe('Retry')
      expect(n.querySelector('.sv-ico')!.getAttribute('aria-hidden')).toBe('true')   // the ⚠ is not read out
    }
    /* one warning for a screen reader and the keyboard: while a band shows, the bar's copy is inert and hidden */
    expect([bar.getAttribute('aria-hidden'), bar.hasAttribute('inert')]).toEqual(['true', true])   // jsdom has no .inert property: the attribute
    expect(band.getAttribute('aria-hidden')).toBeNull()
    /* Retry's OWN click saves: 20ms on, long before the automatic retry (a second after the failure) could have */
    await act(async () => { band.querySelector('button')!.click(); await vi.advanceTimersByTimeAsync(20) })
    expect(document.querySelector('.saveband')).toBeNull()
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByTestId('failed').textContent).toBe('false')
  })

  it('a closed surface’s band does not hide the bar’s warning; and without Retry the automatic retry still saves', async () => {
    vi.useFakeTimers()
    const be = new MemoryBackend()
    const wb = new Whiteboard()
    const pm = new Postman(be); pm.attach(wb)
    setSaveStatusSource(pm)
    render(<><SaveStatus /><SaveBand active={false} /></>)
    be.failNext(1)
    act(() => { wb.set('inputs', 'all', '[]') })
    await act(async () => { await vi.advanceTimersByTimeAsync(300) })
    const bar = document.querySelector('.savestat.failed') as HTMLElement
    expect([bar.getAttribute('aria-hidden'), bar.hasAttribute('inert')]).toEqual([null, false])
    /* nobody presses Retry: 20ms on it is still failed; the app's own retry lands it a second after the failure */
    await act(async () => { await vi.advanceTimersByTimeAsync(20) })
    expect(document.querySelector('.savestat.failed')).not.toBeNull()
    await act(async () => { await vi.advanceTimersByTimeAsync(1100) })
    expect(screen.queryByRole('status')).toBeNull()
  })
})

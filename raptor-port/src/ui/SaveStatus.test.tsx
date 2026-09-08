// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import { SaveStatus, setSaveStatusSource } from './SaveStatus'
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
})

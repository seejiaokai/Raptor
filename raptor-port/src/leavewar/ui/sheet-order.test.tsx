// ESCAPE AND TAB GO BY WHICH WAR WINDOW OPENED LAST, NOT BY WHERE IT SITS IN THE PAGE (the fresh read of the M5a fixes,
// finding 1, 29 Oct 26). The person window is portalled to the end of the Leave War page, so it was always the last
// window in the document whatever opened after it: with it up, a bid window (or Grades) opened over it lost Escape to it —
// one Escape closed the person window and left the bid window standing — and the bid window no longer held Tab, which
// walked out to the grid behind it (W5-F3's failure). Sheet.tsx now keeps the order the war's windows opened in.
import { fireEvent, render, screen } from '@testing-library/react'
import { createPortal } from 'react-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initStore } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Sheet } from './Sheet'

beforeEach(() => { initStore(memoryBackend()) })

function Pair({ showB, onA, onB }: { showB: boolean; onA: () => void; onB: () => void }) {
  return <>
    <button data-testid="behind">behind</button>
    {/* the bid window: drawn inline, earlier in the page, but opened second */}
    {showB && <Sheet testid="b" label="b" onClose={onB}>
      <button data-testid="b-first">first</button>
      <button data-testid="b-last">last</button>
    </Sheet>}
    {/* the person window: opened first, portalled to the page's end, as Matrix does */}
    {createPortal(<Sheet testid="a" label="a" onClose={onA} modal={false}><button data-testid="a-btn">a</button></Sheet>, document.body)}
  </>
}

describe('two war windows: the one opened last answers the keys', () => {
  it('Escape closes the window opened last, though the other stands later in the page', () => {
    const onA = vi.fn(), onB = vi.fn()
    const r = render(<Pair showB={false} onA={onA} onB={onB} />)
    r.rerender(<Pair showB onA={onA} onB={onB} />)
    const all = document.querySelectorAll('.bidsheet')
    expect(all[all.length - 1]).toBe(screen.getByTestId('a'))   // the set-up: the first-opened window IS last in the page
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onB).toHaveBeenCalledTimes(1)
    expect(onA).not.toHaveBeenCalled()
  })

  it('Tab stays inside the window opened last', () => {
    const onA = vi.fn(), onB = vi.fn()
    const r = render(<Pair showB={false} onA={onA} onB={onB} />)
    r.rerender(<Pair showB onA={onA} onB={onB} />)
    screen.getByTestId('b-last').focus()
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' })
    expect(document.activeElement).toBe(screen.getByTestId('b-first'))
  })

  it('once the last-opened window closes, Escape goes to the one under it', () => {
    const onA = vi.fn(), onB = vi.fn()
    const r = render(<Pair showB={false} onA={onA} onB={onB} />)
    r.rerender(<Pair showB onA={onA} onB={onB} />)
    r.rerender(<Pair showB={false} onA={onA} onB={onB} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onA).toHaveBeenCalledTimes(1)
    expect(onB).not.toHaveBeenCalled()
  })
})

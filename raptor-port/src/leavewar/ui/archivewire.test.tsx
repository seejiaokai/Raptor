import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { initStore, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'

/* THE GRID HANDS THE MANNING BLOCK ITS RE-MEASURE ([LW-MONTHJUMP-PHONE] review,
   Astra LW-101, 23 Sep 26). The Archive's rows are cells of the grid's own
   table, so opening or closing it can widen a day column — and the grid caches
   month widths it later trusts as exact. counts.test.tsx proves the block calls
   `onArchiveChange` at the right moment; this proves Matrix actually GIVES it
   one (the other half of the wire), and that running it in jsdom — where every
   rect is 0×0 — throws nothing. A pass-through records the props Matrix passes
   to the real block; the block itself is unchanged. */
const seen: { onArchiveChange?: unknown }[] = []
vi.mock('./CountRows', async importOriginal => {
  const real = await importOriginal<typeof import('./CountRows')>()
  return {
    CountRows: (p: Parameters<typeof real.CountRows>[0]) => {
      seen.push(p)
      return <real.CountRows {...p} />
    },
  }
})
const { Matrix } = await import('./Matrix')

beforeEach(() => {
  initStore(memoryBackend())
  seen.length = 0
})

it('Matrix hands the manning block a way to tell it the Archive opened or closed', () => {
  setRole('admin')
  render(<Matrix />)
  expect(seen.length).toBeGreaterThan(0)
  expect(typeof seen[seen.length - 1]!.onArchiveChange).toBe('function')
  // ...and the re-measure it runs is safe with no layout at all
  fireEvent.click(screen.getByTestId('roster-arrange'))
  fireEvent.click(screen.getByTestId('manning-hide-ip'))
  fireEvent.click(screen.getByTestId('manning-archive'))
  expect(screen.getByTestId('count-ip')).toBeTruthy()
  fireEvent.click(screen.getByTestId('manning-archive'))
  expect(screen.queryByTestId('count-ip')).toBeNull()
})

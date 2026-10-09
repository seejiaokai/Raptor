import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { initStore, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { elevenCounters } from '../testkit'

/* THE GRID HANDS THE MANNING BLOCK ITS RE-MEASURE ([LW-MONTHJUMP-PHONE] review,
   Astra LW-101, 23 Sep 26). The block's rows are cells of the grid's own table,
   standing above the dates, so a row going in or out can widen a day column and
   moves everything placed off the rows below it — and the grid caches month
   widths it later trusts as exact. It was the ARCHIVE opening and closing that
   needed this; since D669 (8 Oct 26) there is no Archive, and it is a counter
   made or deleted with the cross. counts.test.tsx proves the block calls
   `onRowsChange` at the right moment; this proves Matrix actually GIVES it one
   (the other half of the wire), and that running it in jsdom — where every rect
   is 0×0 — throws nothing. A pass-through records the props Matrix passes to
   the real block; the block itself is unchanged. */
const seen: { onRowsChange?: unknown }[] = []
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
  elevenCounters()   // the app starts with NO counters (D669); this test deletes one, so it makes the old eleven — testkit
  seen.length = 0
})

it('Matrix hands the manning block a way to tell it a count row went in or out', () => {
  setRole('admin')
  render(<Matrix />)
  expect(seen.length).toBeGreaterThan(0)
  expect(typeof seen[seen.length - 1]!.onRowsChange).toBe('function')
  // ...and the re-measure it runs is safe with no layout at all
  fireEvent.click(screen.getByTestId('roster-arrange'))
  expect(screen.getByTestId('count-ip')).toBeTruthy()
  fireEvent.click(screen.getByTestId('manning-delete-ip'))
  expect(screen.queryByTestId('count-ip')).toBeNull()
})

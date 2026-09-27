// [ONE-DOOR] (27 Sep 26) — THE LEAVE WAR'S TWO POSTING SHEETS, after the one door.
// Round 1 (Fable F1 / Astra 2): a man archived on Admin → Users comes back only by Restore there — his Post out sheet on
// the war is read-only: it says where to go, its date is fixed, and it offers no chips and no Undo.
// D320 (and round 1 — Fable F2 / Astra 1, past stints read-only): the Post in sheet of a man back from a posting says so,
// and its Undo is not offered (clearing his post-in would lay "here from always" over the stint he left).
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PostInSheet, PostOutSheet } from './BidPicker'

const noop = () => {}

describe('Fable F1 / Astra 2 — the Post out sheet of a man archived on Admin → Users', () => {
  it('reads only: the reason, the date fixed, no chips, no Undo', () => {
    render(<PostOutSheet callsign="HEX" date="2026-08-01" poFrom="2026-07-15" outcome="overseas" onChange={noop} onUndo={noop}
      onClose={noop} lockedWhy="Hex was archived on Admin → Users — restore him there" />)
    expect(screen.getByTestId('postout-locked').textContent).toBe('Hex was archived on Admin → Users — restore him there')
    expect((screen.getByTestId('postout-date') as HTMLInputElement).disabled).toBe(true)
    expect(screen.queryByTestId('postout-undo')).toBeNull()
    expect(screen.queryByRole('group', { name: /posting/i })).toBeNull()
    expect(screen.queryByTestId('postout-line')).toBeNull()
  })
  it('pinned unchanged: a posting\'s own sheet still has its chips and its Undo', () => {
    render(<PostOutSheet callsign="HEX" date="2026-08-01" poFrom="2026-07-15" outcome="overseas" onChange={noop} onUndo={noop} onClose={noop} />)
    expect(screen.queryByTestId('postout-locked')).toBeNull()
    expect(screen.getByTestId('postout-undo')).toBeTruthy()
    expect((screen.getByTestId('postout-date') as HTMLInputElement).disabled).toBe(false)
  })
})

describe('D320 — the Post in sheet of a man back from a posting', () => {
  it('says he is back, and offers no Undo', () => {
    render(<PostInSheet callsign="HEX" date="2026-08-01" piFrom="2026-09-01" backFrom="2026-06-15" onChange={noop} onUndo={noop} onClose={noop} />)
    expect(screen.getByTestId('postin-note').textContent).toMatch(/Back from a posting on 2026-06-15 — on the manpower from 2026-09-01\. The days between count nobody/)
    expect(screen.queryByTestId('postin-undo')).toBeNull()
  })
  it('pinned unchanged: one stint — its note and its Undo as before', () => {
    render(<PostInSheet callsign="HEX" date="2026-01-15" piFrom="2026-02-01" onChange={noop} onUndo={noop} onClose={noop} />)
    expect(screen.getByTestId('postin-note').textContent).toMatch(/Posted in on 2026-02-01 — on the manpower from that day/)
    expect(screen.getByTestId('postin-undo')).toBeTruthy()
  })
})

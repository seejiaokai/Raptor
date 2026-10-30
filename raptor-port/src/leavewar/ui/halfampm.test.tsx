/* HIS D1525 (30 Oct 26 — "Yeah those areas that write that change it to AM and PM"): WHEREVER THE LEAVE WAR WRITES A HALF
   DAY IN WORDS, IT READS AM OR PM AFTER THE CODE — "LL (AM)", "HO* (PM)" — and a whole day the code alone. The places that
   still wrote the old way ([LW-HALF-WORDS-ELSEWHERE]): the day's list (its entries "Morning · approved", the clash line's
   bids "<LL (morning)", a replaced bid's notice "Your <LL bid…", an HO's ", morning"), a member's approved-leave window
   ("<LL" in its title), his closed-day window ("LL Morning · pending"), the bell ("LL approved", the half dropped) and the
   sentence a filing over a bid says ("your LL bid on 10 Feb (morning)"). The clash note and the credited-OIL window
   (codeInWords) are pinned in leavewar/halfwords.test.tsx. The grid's boxes are untouched: a half is drawn by its box's
   half (D1160). */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initStore } from '../state/store'
import { memoryBackend } from '../state/storage'
import { noticeWords, type Notice } from '../../state/notices'
import { RemarksSheet } from './RemarksSheet'
import { ClosedNoteSheet } from './ClosedNoteSheet'
import { halfWord } from './awardwords'
import type { RequestRec } from '../engine'

beforeEach(() => { initStore(memoryBackend()) })
afterEach(() => { cleanup() })

const lwLine = (part: Record<string, unknown>): string =>
  noticeWords({ id: 'n1', at: 0, name: 'Your leave', by: null, what: [{ k: 'lw', a: '2026-02-10', b: '2026-02-10', ...part }] } as unknown as Notice).what

describe('the bell names the half after the code (D1525)', () => {
  it('a morning approved reads "LL (AM) approved", an afternoon "OL (PM) refused", a whole day the code alone', () => {
    expect(lwLine({ c: '*LL', d: 'approved' })).toBe('LL (AM) approved')
    expect(lwLine({ c: 'OL*', d: 'refused' })).toBe('OL (PM) refused')
    expect(lwLine({ c: 'LL', d: 'approved' })).toBe('LL approved')
    expect(lwLine({ c: '*LL', d: 'biddel' })).toBe('LL (AM) bid deleted')
  })
  it('a bid changed to another kind names both halves', () => {
    expect(lwLine({ c: '*OL', w: '*LL', d: 'retyped' })).toBe('LL (AM) bid changed to OL (AM)')
  })
  it('a filing that replaced his half-day bid: "replaces your LL (PM) bid"', () => {
    const w = noticeWords({ id: 'n2', at: 0, name: 'Course', day: 'Feb 10', by: null, what: [{ k: 'in' }, { k: 'rbid', c: 'LL*' }] } as unknown as Notice)
    expect(w.what).toBe('You were added · replaces your LL (PM) bid')
  })
})

describe('a member’s approved-leave window names its half after the code', () => {
  const title = () => screen.getByTestId('remarks-sheet').querySelector('.bidsheet-hd .cur')!.textContent
  const row = { iid: 'r1', person: 'dusk', type: 'LL', date: 'Feb 11', yr: 2026, remarks: '' }
  it('a morning: "LL (AM)", never "<LL"', () => {
    render(<RemarksSheet callsign="Dusk" personId="dusk" row={row} code="*LL" onClose={() => {}} />)
    expect(title()).toBe('LL (AM)')
  })
  it('an afternoon: "LL (PM)"; a whole day: "LL"', () => {
    const { unmount } = render(<RemarksSheet callsign="Dusk" personId="dusk" row={row} code="LL*" onClose={() => {}} />)
    expect(title()).toBe('LL (PM)')
    unmount()
    render(<RemarksSheet callsign="Dusk" personId="dusk" row={row} code="LL" onClose={() => {}} />)
    expect(title()).toBe('LL')
  })
})

describe('his closed-day window names a pending half after its code', () => {
  const bidOf = (id: string, code: string): RequestRec => ({ id, kind: 'request', code, state: 'pending' } as RequestRec)
  it('"LL (AM) · pending" and "OL (PM) · pending"; a whole day "LL · pending", never "Whole day"', () => {
    render(<ClosedNoteSheet personId="dusk" callsign="Dusk" date="2026-02-11" pending={[bidOf('a', '*LL'), bidOf('b', 'OL*')]} onClose={() => {}} />)
    expect(screen.getByTestId('closed-bid-a').textContent).toBe('LL (AM) · pending')
    expect(screen.getByTestId('closed-bid-b').textContent).toBe('OL (PM) · pending')
    cleanup()
    render(<ClosedNoteSheet personId="dusk" callsign="Dusk" date="2026-02-11" pending={[bidOf('c', 'LL')]} onClose={() => {}} />)
    expect(screen.getByTestId('closed-bid-c').textContent).toBe('LL · pending')
  })
})

describe('an HO’s half, in a sentence beside its box', () => {
  it('reads AM or PM', () => {
    expect(halfWord('am')).toBe('AM')
    expect(halfWord('pm')).toBe('PM')
  })
})


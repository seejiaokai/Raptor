// @vitest-environment jsdom
/* TYPED WORK AT THE SWAP — THE HOLD AND ITS BAND (the reshape plan docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md
   §3.2 A-iv, §3.4 "a war window and a Tracker pop-up open at midnight (the swap waits; nothing saved into 149)"; his D2243
   Q7 — the drawing docs/mock/2026-11-20-multi-sqn-reshape/page.html §7). Ranger has a Leave War window open at 23:58 on Wed
   15 Jul, his move to 149 counting from Thu 16 Jul. The window is the war's real frame (leavewar/ui/Sheet.tsx); the clock
   passes midnight by the app's own wake (test-support/msq-world.ts pastMidnight). */
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { useState } from 'react'
import { useMsqWorld, signInAs, PID, on, moveMan, pastMidnight } from '../test-support/msq-world'
import { Sheet } from '../leavewar/ui/Sheet'
import { worldUnit, setCell, recordsAt } from '../leavewar/state/store'
import { UNIT } from '../engine/unitview'
import { setTrkUnitProbe, ownershipViolation } from './perms'
import { warBand, trackerBand, warWindowOpen } from './typing-hold'
import { deriveActor } from '../command'

useMsqWorld()
afterEach(() => { cleanup(); setTrkUnitProbe(null) })

const WORDS = 'Family wedding in Perth, back Sunday'
/* a war window as the bid window is drawn: its title strip, then a remarks box with his words */
function BidWindow() {
  const [open, setOpen] = useState(true)
  if (!open) return null
  return (
    <Sheet testid="bid-sheet" label="Ranger Fri 24 Jul" onClose={() => setOpen(false)}>
      <div className="bidsheet-hd"><b>Ranger</b> Fri 24 Jul</div>
      <textarea data-testid="remarks" defaultValue={WORDS} />
    </Sheet>
  )
}
const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve() })

describe('a Leave War window open at midnight of his move', () => {
  it('before midnight: no band, the war is 142’s', () => {
    signInAs('saber'); moveMan(PID.ranger, 'u149')
    signInAs('ranger')
    on(15, 23, 58)
    render(<BidWindow />)
    expect(warWindowOpen()).toBe(true)
    expect(screen.queryByTestId('move-band')).toBeNull()
    expect(worldUnit()).toBe('u142')
  })

  it('at midnight the window holds the war’s swap: it stays, its words visible, one band across its top with the approved words', async () => {
    signInAs('saber'); moveMan(PID.ranger, 'u149')
    signInAs('ranger')
    on(15, 23, 58)
    render(<BidWindow />)
    act(() => { pastMidnight() })
    expect(UNIT, 'the schedule in view moved: it holds no typed work').toBe('u149')
    expect(worldUnit(), 'the war waits for the window').toBe('u142')
    const band = screen.getByTestId('move-band')
    expect(band.querySelector('b')!.textContent).toBe("You are 149's from today.")
    expect(band.querySelector('.sv-rest')!.textContent).toBe("This can't be saved in 142's Leave War.")
    expect(band.textContent).toBe("You are 149's from today. This can't be saved in 142's Leave War.Close")
    expect([...band.querySelectorAll('button')].map(b => b.textContent)).toEqual(['Close'])
    /* across the window's top, under its title strip */
    const panel = screen.getByTestId('bid-sheet')
    const kids = [...panel.children]
    expect(kids[0]!.className).toBe('bidsheet-hd')
    expect(kids[1]!.contains(band), 'the band right under the title strip').toBe(true)
    expect((screen.getByTestId('remarks') as HTMLTextAreaElement).value, 'his typed words stay').toBe(WORDS)
    expect(warBand()).toEqual({ lead: "You are 149's from today.", rest: "This can't be saved in 142's Leave War." })
  })

  it('a save the old squadron refuses after midnight is the one the band names: his bid in 142’s war is not saved', () => {
    signInAs('saber'); moveMan(PID.ranger, 'u149')
    signInAs('ranger')
    on(15, 23, 58)
    render(<BidWindow />)
    act(() => { pastMidnight() })
    expect(screen.getByTestId('move-band')).toBeTruthy()
    expect(worldUnit()).toBe('u142')
    let ok: unknown
    act(() => { ok = setCell(PID.ranger, '2026-07-24', 'LL') })
    expect(ok, 'refused').toBe(false)
    expect(recordsAt(PID.ranger, '2026-07-24').filter((r: any) => r.kind === 'request'), 'nothing saved into 142’s war').toEqual([])
  })

  it('Close closes the window and lets the swap run: 149’s Leave War opens, the band gone; nothing was saved into either war', async () => {
    signInAs('saber'); moveMan(PID.ranger, 'u149')
    signInAs('ranger')
    on(15, 23, 58)
    render(<BidWindow />)
    act(() => { pastMidnight() })
    expect(worldUnit()).toBe('u142')
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    await flush()
    expect(screen.queryByTestId('bid-sheet'), 'the window closed').toBeNull()
    expect(worldUnit(), '149’s Leave War opens').toBe('u149')
    expect(warBand()).toBeNull()
    expect(recordsAt(PID.ranger, '2026-07-24').filter((r: any) => r.kind === 'request'), 'nothing saved into 149’s war').toEqual([])
  })

  it('the window closed by its own way out (Escape) lets the swap run too — the band had said so', async () => {
    signInAs('saber'); moveMan(PID.ranger, 'u149')
    signInAs('ranger')
    on(15, 23, 58)
    render(<BidWindow />)
    act(() => { pastMidnight() })
    fireEvent.keyDown(document, { key: 'Escape' })
    await flush()
    expect(screen.queryByTestId('bid-sheet')).toBeNull()
    expect(worldUnit()).toBe('u149')
  })

  it('(control) no window open at midnight: the war moves at once, no band', () => {
    signInAs('saber'); moveMan(PID.ranger, 'u149')
    signInAs('ranger')
    on(15, 23, 58)
    pastMidnight()
    expect([UNIT, worldUnit()]).toEqual(['u149', 'u149'])
    expect(warBand()).toBeNull()
  })
})

describe('the Tracker at midnight of his move (the plan §14 item 3 — it cannot be re-read in place once loaded)', () => {
  /* a change to the Tracker's marks as its door sends one to the gate (state/units-sqn-fixread2.test.ts's shape) */
  const env = (): any => ({ seq: 1, at: '', origin: 'local', scope: { module: 'trk' }, type: 'trk.marks', actor: deriveActor(),
    changes: [{ op: 'put', collection: 'trk.marks', id: 'v3:c1:sb2024:m:e1', before: null, after: '{"ST-01":{"g":2}}' }] })
  it('it keeps 142’s records; its chart editor carries the band “…in 142’s Tracker.”; a change of his to it is refused', () => {
    signInAs('saber'); moveMan(PID.ranger, 'u149')
    signInAs('ranger')
    setTrkUnitProbe(() => 'u142')                     // the doorway bound to 142's at load, kept (tracker/storage.js)
    on(15, 23, 58)
    expect(trackerBand()).toBeNull()
    expect(ownershipViolation(env()), 'his own squadron’s Tracker, before midnight').toBeNull()
    pastMidnight()
    expect(worldUnit(), 'the war moved').toBe('u149')
    expect(trackerBand()).toEqual({ lead: "You are 149's from today.", rest: "This can't be saved in 142's Tracker." })
    expect(ownershipViolation(env()), 'refused by the gate (7f): he is no longer one of 142').toMatch(/another squadron's Tracker/)
  })
})

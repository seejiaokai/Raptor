// @vitest-environment jsdom
/* R6 — THE PAGE RE-ENTERS HIS OWN SQUADRON WHEN WHAT IT SHOWS NO LONGER STANDS (the blind read's R6, the reshape plan
   §19b and §3.2 A-iv; dormant until P1/P3, when nothing yet makes these cases in the app): at a notify, the page enters
   again (state/store.ts enterSquadron) when the squadron picked has no readable right behind it that day
   (perms.ts pickStandsOn — the host's), or when the Leave War or the Tracker loaded is not the page's own squadron
   (pageUnit('own', today)); an open war window holds the war's step and carries the band, as at midnight. Here the cases
   are made directly — a pick by switchUnit, a right taken away from another device, a world bound elsewhere. */
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { useState } from 'react'
import { useMsqWorld, signInAs, ACCT, PID, on } from '../test-support/msq-world'
import { notify, switchUnit } from './store'
import { UNIT } from '../engine/unitview'
import { setGrant, removeGrant, todayIso } from './units'
import { pickStandsOn, setTrkUnitProbe } from './perms'
import { signIn, sessionFor } from './accounts'
import { setSession, SESSION } from './auth'
import { worldUnit } from '../leavewar/state/store'
import { swapWarWorld } from '../leavewar/sync'
import { warBand } from './typing-hold'
import { Sheet } from '../leavewar/ui/Sheet'
import { setStorageMaker, bindStorageUnit, storageUnit, setStorageImpl } from '../tracker/storage.js'

useMsqWorld()
afterEach(() => { cleanup(); setTrkUnitProbe(null); setStorageMaker(null, null); setStorageImpl(null) })

/* a right taken away from another device: the master admin's own session does it, then this page's session is back —
   the page itself (its squadron, its war) is untouched by the round trip, as another browser would leave it */
function fromAnotherDevice(f: () => unknown): unknown {
  const mine = SESSION
  setSession(sessionFor(signIn('ad', 'a')))
  const r = f()
  setSession(mine)
  return r
}

describe('the pick half: a squadron picked with no readable right behind it', () => {
  it('Ranger, with no right in 149, on 149’s pages: the next notify brings him home to 142', () => {
    signInAs('ranger')
    /* nothing of his stands behind 149 (pick-stands.test.ts); the notify the pick itself raises is the next one */
    switchUnit('u149'); notify()
    expect(UNIT).toBe('u142')
    expect(pickStandsOn(todayIso())).toBe(true)
    expect(worldUnit()).toBe('u142')
  })
  it('Hunter’s Plan of 149 taken away while he is on 149’s pages: the next notify brings him home to 142', () => {
    on(14)
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter)).toMatchObject({ ok: true })
    signInAs('hunter')
    switchUnit('u149'); notify()
    expect(UNIT, 'his Plan holds: the pick stands').toBe('u149')
    expect(fromAnotherDevice(() => removeGrant(ACCT.hunter, 'u149'))).toMatchObject({ ok: true })
    notify()
    expect(UNIT).toBe('u142')
  })
  it('(control) a View that holds keeps the pick', () => {
    on(14)
    signInAs('saber')
    setGrant(ACCT.ranger, 'u149', 'view', PID.ranger)
    signInAs('ranger')
    switchUnit('u149'); notify()
    expect(UNIT).toBe('u149')
    expect(worldUnit(), 'the Leave War stays his own squadron’s (D2132)').toBe('u142')
  })
})

describe('the war half: a Leave War loaded that is not the page’s own squadron', () => {
  const WORDS = 'Back Sunday'
  function BidWindow() {
    const [open, setOpen] = useState(true)
    if (!open) return null
    return (
      <Sheet testid="bid-sheet" label="Ranger" onClose={() => setOpen(false)}>
        <div className="bidsheet-hd"><b>Ranger</b> Fri 24 Jul</div>
        <textarea data-testid="remarks" defaultValue={WORDS} />
      </Sheet>
    )
  }
  it('149’s war left loaded under Ranger, whose squadron is 142: the next notify loads 142’s', () => {
    signInAs('ranger')
    swapWarWorld('u149')
    expect(worldUnit()).toBe('u149')
    notify()
    expect(worldUnit()).toBe('u142')
  })
  it('with a war window open the war waits for it, under the band (no move, so its plain words); Close lets it run', async () => {
    signInAs('ranger')
    swapWarWorld('u149')
    render(<BidWindow />)
    act(() => { notify() })
    expect(worldUnit(), 'held by the open window').toBe('u149')
    const band = screen.getByTestId('move-band')
    expect(band.querySelector('b')!.textContent).toBe('This change could not be saved.')
    expect(warBand()).toEqual({ lead: 'This change could not be saved.', rest: '' })
    expect((screen.getByTestId('remarks') as HTMLTextAreaElement).value).toBe(WORDS)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    await act(async () => { await Promise.resolve(); await Promise.resolve() })
    expect(worldUnit()).toBe('u142')
    expect(warBand()).toBeNull()
  })
})

describe('the Tracker half: a Tracker bound to a squadron that is not the page’s own', () => {
  const mk = () => { const m = new Map<string, string>(); return { get: (k: string) => m.get(k) ?? null, set: (k: string, v: string) => { m.set(k, v) }, remove: (k: string) => { m.delete(k) }, keys: () => [...m.keys()] } }
  it('bound to 149’s before it loaded, under Ranger of 142: the next notify binds it to 142’s', () => {
    signInAs('ranger')
    setStorageMaker((_u: string) => mk(), () => 'u142')
    setTrkUnitProbe(() => storageUnit())
    expect(bindStorageUnit('u149')).toBe(true)
    notify()
    expect(storageUnit()).toBe('u142')
  })
})

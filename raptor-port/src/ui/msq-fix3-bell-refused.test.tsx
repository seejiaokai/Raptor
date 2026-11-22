// @vitest-environment jsdom
/* R1'S SECOND HALF (docs/superpowers/briefs/2026-11-23-msq-b1-final-read-opus.md finding 1): a press of the bell's "Show"
   button that did not save said nothing — the button stayed as it was, no word. A press that does not save now says
   "This change could not be saved." (the words the app already uses for a save that did not go through — Admin → Data's
   clears). The writer is held to refuse here (the refusal itself is the gate's — state/msq-fix3-bell-stale.test.ts).
   Red first: no word was said. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, cleanup, act, fireEvent } from '@testing-library/react'
import { useMsqWorld, signInAs } from '../test-support/msq-world'
import { HOOKS } from '../engine/hooks'
import { setBellList } from './pops'
import { BellList } from './topbits'

const HELD = vi.hoisted(() => ({ refuse: false }))
vi.mock('../state/bellsqn', async (importOriginal) => {
  const m: any = await importOriginal()
  return { ...m, setBellSquadron: (u: string, on: boolean) => (HELD.refuse ? false : m.setBellSquadron(u, on)) }
})

useMsqWorld()
afterEach(() => { cleanup(); setBellList(false); HELD.refuse = false; vi.restoreAllMocks() })

const chip = (num: string) => [...document.querySelectorAll<HTMLButtonElement>('[data-testid="bell-show"] button')].find(b => b.textContent === num)

describe('a press of the bell\'s Show button that does not save is never silent (R1)', () => {
  it('refused: "This change could not be saved."; the button unchanged', async () => {
    signInAs('saber')
    const said = vi.spyOn(HOOKS, 'toast')
    setBellList(true)
    render(<BellList />)
    expect(chip('149'), 'Saber\'s bell shows 142 and 149').toBeTruthy()
    const was = chip('149')!.getAttribute('aria-pressed')
    HELD.refuse = true
    await act(async () => { fireEvent.click(chip('149')!) })
    expect(said).toHaveBeenCalledWith('This change could not be saved.', 'warn')
    expect(chip('149')!.getAttribute('aria-pressed')).toBe(was)
  })
  it('saved: no word', async () => {
    signInAs('saber')
    const said = vi.spyOn(HOOKS, 'toast')
    setBellList(true)
    render(<BellList />)
    const was = chip('149')!.getAttribute('aria-pressed')
    await act(async () => { fireEvent.click(chip('149')!) })
    expect(said).not.toHaveBeenCalled()
    expect(chip('149')!.getAttribute('aria-pressed')).not.toBe(was)
  })
})

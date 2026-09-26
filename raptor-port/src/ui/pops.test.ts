// @vitest-environment jsdom
/* [ACCOUNTS] (26 Sep 26) — every window closes at a sign-in and a sign-out (Astra R1-3):
   POPS_RESET must list every flag ui/pops.ts holds, or a new window could survive into
   the next person's session (Fable R2-8). Register line AC15. */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as pops from './pops'
import { VIEW_RESET, resetViewState } from '../state/view'
import { toast } from './toast'

describe('POPS_RESET covers every window flag', () => {
  it('every `export let` in pops.ts has an entry', () => {
    const src = readFileSync(join(__dirname, 'pops.ts'), 'utf8')
    const flags = [...src.matchAll(/^export let (\w+)/gm)].map(m => m[1])
    const listed = pops.POPS_RESET.map(p => p.name)
    expect(flags.length).toBeGreaterThan(10)
    for (const f of flags) expect(listed, f).toContain(f)
  })
  it('it rides the session reset (resetSession → resetViewState("session"))', () => {
    expect(VIEW_RESET.some(e => e.name === 'POPS' && e.scopes.includes('session'))).toBe(true)
    pops.setInpEdit({ iid: 'x' }); pops.setDocView({ iid: 'y' }); pops.setHistList('all'); pops.setTplEdit(true); pops.setDrawer(true)
    resetViewState('session')
    expect(pops.INPEDIT).toBe(null); expect(pops.DOCVIEW).toBe(null); expect(pops.HISTLIST).toBe(false)
    expect(pops.TPLEDIT).toBe(false); expect(pops.DRAWER).toBe(false)
  })
})

describe('the toast ends with the session too (the walk, 26 Sep 26)', () => {
  it('a message one person raised is taken down when the next signs in', () => {
    toast('viper@mail can sign in now', null)
    const t = document.getElementById('toastEl')!
    expect(t.style.opacity).toBe('1')
    resetViewState('session')
    expect(t.style.opacity).toBe('0')
  })
})

describe('the board layout ends with the session too (Astra code read, 26 Sep 26)', () => {
  it('one person picks the desktop layout; the next person opens the standard one', async () => {
    const board = await import('./board')
    if (board.SBWIDE) board.toggleWide()
    board.toggleWide()
    expect(board.SBWIDE).toBe(true)
    resetViewState('session')
    expect(board.SBWIDE).toBe(false)
  })
})

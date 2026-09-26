/* [ACCOUNTS] (26 Sep 26) — every window closes at a sign-in and a sign-out (Astra R1-3):
   POPS_RESET must list every flag ui/pops.ts holds, or a new window could survive into
   the next person's session (Fable R2-8). Register line AC15. */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as pops from './pops'
import { VIEW_RESET, resetViewState } from '../state/view'

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

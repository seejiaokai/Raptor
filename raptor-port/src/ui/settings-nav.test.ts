/* F8 of the 3 Nov 26 re-check (the Inputs batch [INPUTS-FIXES-1103]): the Inputs and SANS settings windows stayed up over
   Edit Schedule after the page was changed. A page change closes them; a week change does not. */
import { describe, it, expect, afterEach } from 'vitest'
import { setPage, resetViewState } from '../state/view'
import { INPSET, SANSSET, setInpSet, setSansSet } from './pops'

afterEach(() => { setInpSet(false); setSansSet(false); setPage('inputs') })

describe('the settings windows and the page they belong to (F8)', () => {
  it('a page change closes both', () => {
    setPage('inputs')
    setInpSet(true); setSansSet(true)
    setPage('editsched')
    expect(INPSET, 'Inputs settings').toBe(false)
    expect(SANSSET, 'SANS settings').toBe(false)
  })
  it('staying on the page, or a week change, leaves them up', () => {
    setPage('inputs')
    setInpSet(true); setSansSet(true)
    setPage('inputs')
    resetViewState('week')
    expect(INPSET).toBe(true)
    expect(SANSSET).toBe(true)
  })
})

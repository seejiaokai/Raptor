/* [ACCOUNTS] (26 Sep 26; Fable's code read) — Edit history, its bubble and the pending list
   name who made a change by his LIVE callsign, through the person the row keeps (D166 (5), the
   one-identity rule): a rename since is followed; the name as recorded only when the row has no
   person. Register AC2. */
import { describe, expect, it } from 'vitest'
import { elogWho } from './editlog'
import { PEOPLE } from './people'
import { renameCallsign } from './slots'

describe('AC2 — "who" on a change follows a rename', () => {
  it('reads the live callsign through the person, and the recorded name without one', () => {
    const was = PEOPLE.bane.cs
    try {
      expect(elogWho({ who: was, pid: 'bane' })).toBe(was)
      renameCallsign('bane', 'Rgr')
      expect(elogWho({ who: was, pid: 'bane' })).toBe('Rgr')
      expect(elogWho({ who: 'Squadron member', pid: null })).toBe('Squadron member')
    } finally { renameCallsign('bane', was) }
  })
})

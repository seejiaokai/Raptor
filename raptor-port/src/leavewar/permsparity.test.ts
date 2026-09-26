/* [ACCOUNTS] D200 (3) — the Leave War's own writers agree with the ONE permissions matrix.
   The war is a second app with its own store (its architecture rule), so its writers keep
   their own role / row checks (`state.role`, canEditRow, canDecide); its role and viewer are
   written ONLY by Raptor's resetSession. This test drives its public writers as an admin, a
   member on his own row, a member on another's, and a guest (role member, viewer '' — which
   matches no row), and holds each outcome to state/perms.ts `allows` for the data-model §11
   row it belongs to (LeaveWar, LeaveBid, the hand-typed award, LeaveLedger / LeaveOpening,
   LeavePersonProfile). A war writer that grows a door the table refuses fails here.
   Register line AC9. */
import { beforeEach, describe, expect, it } from 'vitest'
import {
  initStore, getState, setRole, setViewer, setCell, setBidStates, setManualCredit, grantTo, advanceStage,
  setBidWindow, setBalance, setPostOut,
} from './state/store'
import { memoryBackend } from './state/storage'
import { allows, T, type Act, type Role } from '../state/perms'

beforeEach(() => { initStore(memoryBackend()) })

type Who = { role: Role; label: string; viewer: string | null }
const WHO: Who[] = [
  { role: 'admin', label: 'admin', viewer: 'ramp' },
  { role: 'member', label: 'member (own row = ramp)', viewer: 'ramp' },
  { role: 'guest', label: 'guest (viewer "")', viewer: '' },
]
const act = (w: Who) => { setRole(w.role === 'admin' ? 'admin' : 'member'); setViewer(w.viewer) }
const identity = (w: Who) => (w.role === 'guest' ? null : w.viewer)

/* each: the §11 table and letter, whose row it writes (null = no row), and the write */
const CASES: { what: string; table: string; letter: Act; owner: string | null; run: () => boolean }[] = [
  { what: 'a bid on his own row, in the window', table: T.bid, letter: 'C', owner: 'ramp', run: () => setCell('ramp', '2026-01-20', 'LL') },
  { what: 'a bid on ANOTHER row', table: T.bid, letter: 'C', owner: 'tata', run: () => setCell('tata', '2026-01-21', 'LL') },
  { what: 'deciding a bid', table: T.bid, letter: 'U', owner: null, run: () => {
      const was = getState().role; setRole('admin'); setCell('tata', '2026-01-22', 'LL'); setRole(was)
      return setBidStates([{ personId: 'tata', date: '2026-01-22' }], 'approved').decided > 0 } },
  { what: 'a hand-typed OIL award', table: T.award, letter: 'C', owner: null, run: () => setManualCredit('ramp', '2026-02-07', 'FO') === null },
  { what: 'a ledger grant', table: T.ledger, letter: 'C', owner: null, run: () => grantTo(['ramp'], 'oil', 1, '2026-02-07', 'weekend duty') === null },
  { what: 'a balance', table: T.ledger, letter: 'U', owner: null, run: () => setBalance('ramp', 'oil', 5) },
  { what: 'moving the war\'s stage forward', table: T.war, letter: 'U', owner: null, run: () => { const s = getState().period.stage; advanceStage(); return getState().period.stage !== s } },
  { what: 'the bid window', table: T.war, letter: 'U', owner: null, run: () => (setBidWindow('2026-01-05', '2026-03-30') as any)?.ok !== false && getState().period.bidFrom === '2026-01-05' },
  { what: 'a posting out', table: T.profile, letter: 'U', owner: null, run: () => setPostOut('tata', '2026-06-01') },
]

describe('D200 (3): the Leave War\'s writers agree with the permissions matrix (§11)', () => {
  for (const c of CASES) for (const w of WHO) {
    it(`${c.what} — ${w.label}`, () => {
      /* "deciding" needs the bid to exist first, so its run() plants it as an admin and
         puts the role back before deciding */
      act(w)
      const did = c.run()
      const want = allows(w.role, c.table, c.letter, c.owner, identity(w))
      expect(did, `the war ${did ? 'allowed' : 'refused'}; §11 says ${want ? 'allowed' : 'refused'}`).toBe(want)
    })
  }
})

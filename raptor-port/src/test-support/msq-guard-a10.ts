/* PART A'S A10 — "COUNTED MEANS DRAWN", SHARED BY ITS FIVE FILES (27 Nov 26, chat 204 — moved whole out of
   ui/msq-guard-open.test.tsx, not one assertion changed). The block was 151 of that file's 341 tests and about three
   quarters of its time: on GitHub the file ran 12.5 minutes on one worker, and a slow runner took its share past the
   unit job's 20-minute limit (runs 45897769035, 45916028974, 45921789895 — no hang, no leak; the investigator's report,
   chat 204). So each change he did not make has a file of its own — ui/msq-guard-drawn-{rights,midnight,role,landing,
   board}.test.tsx — each calling defineA10 with its one change, the worked case with the first; the six files together
   hold the 341 tests the one file held.
   A file that calls defineA10 calls withThird() itself (R9) and hands guardTeardown to its own afterEach, as every user
   of the test kit does. It lives under src/test-support/ because it imports the test world (no-app-import.test.ts), and
   is a plain .ts file: it registers tests, never a component. */
import { describe, it, expect } from 'vitest'
import { act } from '@testing-library/react'
import { third, signInAs, PID, ACCT, moveMan, pastMidnight } from './msq-world'
import { saveAccess } from '../state/accounts'
import { CURPAGE, setPage } from '../state/view'
import { closeScheduler } from '../ui/board'
import { GUARD_ROWS, whatIsOpen, rowRefuses } from '../ui/guard'
import { rawRole } from './raw-entry'
import { OPEN, app, doing, drawnBox, named, settle, topPick } from './msq-guard-testkit'

/* the changes he did not make that the test world can make, each from a fresh open */
export const A10_CHANGES: Record<string, { setup?: () => void; onPick?: string; change: () => Promise<void> }> = {
  'his right in the squadron lowered to View': {
    onPick: 'u149',
    change: async () => {
      signInAs('saber')
      expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
      signInAs('hunter')
      await doing(() => {})
    },
  },
  /* (step K7: the role moved with nothing asked — the stand-in for his account's role changed while he is signed in
     (state/store.ts refreshAccess), never the view switch's press — so through the test kit's raw role change, which
     tells the entry checker it is made on purpose) */
  'the role in force changed': { change: async () => { await doing(() => { rawRole('main') }) } },
  'his move at midnight': {
    setup: () => { signInAs('saber'); expect(moveMan(PID.hunter, third.u150).ok).toBe(true) },
    change: async () => { await act(async () => { pastMidnight() }); await settle() },
  },
  'the page changed by a landing': { change: async () => { await doing(() => setPage(CURPAGE === 'inputs' ? 'viewsched' : 'inputs')) } },
  'the board closed under its dialog': { change: async () => { await doing(() => closeScheduler()) } },
}

/* registers A10 for the changes named — every counting row against each — and, with `worked`, the worked case */
export function defineA10(changes: string[], opts: { worked?: boolean } = {}) {
  for (const what of changes) if (!A10_CHANGES[what]) throw new Error(`A10 has no change "${what}"`)
  describe('A10 — counted means drawn', () => {
    const counting = GUARD_ROWS.filter(rowRefuses)
    for (const r of counting) {
      for (const what of changes) {
        const c = A10_CHANGES[what]!
        it(`${r.id}, then ${what}: not named, or its box is on the page`, async () => {
          c.setup?.()
          await app('hunter')
          if (c.onPick) await topPick(c.onPick)
          await OPEN[r.id]!.open()
          expect(named(), `the premise: ${r.id} open`).toBe(r.id)
          expect(r.counts === 'unsaved' || drawnBox(r.sel), `the premise: ${r.id}'s box ${r.sel} is drawn`).toBe(true)
          await c.change()
          const still = whatIsOpen()?.row.id === r.id || r.open()
          if (still && r.counts !== 'unsaved') expect(drawnBox(r.sel), `${r.id} still counts after "${what}" — its box ${r.sel} must be on the page`).toBe(true)
        })
      }
    }
    if (opts.worked) it('the worked case: Duty templates under a lowered Plan — the flag still set, no dialog, nothing open', async () => {
      await app('hunter')
      await topPick('u149')
      await OPEN.dutytpl!.open()
      expect(named()).toBe('dutytpl')
      await A10_CHANGES['his right in the squadron lowered to View']!.change()
      expect(drawnBox('#tplModal'), 'no dialog').toBe(false)
      expect(whatIsOpen()).toBeNull()
    })
  })
}

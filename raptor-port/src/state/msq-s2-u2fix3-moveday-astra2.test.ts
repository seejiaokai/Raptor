// @vitest-environment jsdom
/* U2 FIX ROUND 3, FIX 5 — Astra's proof 2 of round 2's fix 3 (a move told to a reader who came into force after the move
   day), copied as he wrote it. He prepared it from source in a read-only copy and could not run it; run here it failed
   before the fix and passes by the one rule "a move is told once" (acctlines.ts moveTold). */
import { expect, it } from 'vitest'
import {
  withThird, signInAs, moveMan, pastMidnight,
  on, PID, ACCT, third,
} from '../test-support/msq-world'
import { saveAccess, accountsLoad, levelIn } from './accounts'
import { unitsLoad, todayIso } from './units'
import { NOTICES } from './notices'
import { globalUndo } from '../undo/timeline'

withThird()

const reload = (): void => {
  unitsLoad()
  accountsLoad()
}

const movesTo = (pid: string) => NOTICES.filter(n => {
  const p: any = n.what?.[0]
  return String(n.to) === pid
    && n.u === 'u149'
    && n.day === '2026-07-16'
    && p?.k === 'sqplan'
    && p.who === PID.hunter
    && p.c === 'moved'
})

it.each(['none', 'view'] as const)(
  'Undo of Plan changed to %s does not backfill a move during its absence',
  endedAs => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })

    on(15, 10)
    signInAs('kestrel')
    expect(saveAccess(ACCT.mako, {
      grants: { u149: 'plan' },
    })).toBeNull()
    reload()
    expect(levelIn(ACCT.mako, 'u149', todayIso())).toBe('admin')

    on(15, 11)
    expect(saveAccess(ACCT.mako, {
      grants: { u149: endedAs },
    })).toBeNull()
    reload()

    expect(levelIn(ACCT.mako, 'u149', todayIso()))
      .toBe(endedAs === 'none' ? null : 'view')

    pastMidnight()
    reload()

    expect(todayIso()).toBe('2026-07-16')
    expect(movesTo(PID.mako)).toHaveLength(0)
    expect(movesTo(PID.kestrel)).toHaveLength(1)

    // Keep Kestrel's session and Undo history across the date change.
    on(17, 9)
    const undone = globalUndo()
    expect(undone.ok, undone.reason).toBe(true)
    reload()
    expect(levelIn(ACCT.mako, 'u149', todayIso())).toBe('admin')

    pastMidnight()
    reload()

    expect({
      makoEarlierMoveLines: movesTo(PID.mako).length,
      kestrelMoveLines: movesTo(PID.kestrel).length,
    }).toEqual({
      makoEarlierMoveLines: 0,
      kestrelMoveLines: 1,
    })
  },
)

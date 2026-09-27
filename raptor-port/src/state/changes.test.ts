/* NEW TO YOU — each person's own "seen" ([DRAFT-PENDING], 28 Sep 26 — D170: "a change made by someone else shows as new
   to you … until you press Mark all as seen … which affects only your own view"; D170's reading: a member's is his own
   too).

   The history is the squadron's (engine/editlog.ts); what is NEW is per person — a record `changeseen`, one entry per
   person, written by ONE command (`changes.seen`) that may only touch the signed-in person's own entry (perms.ts —
   `EditLogSeen`, own row; data-model.md §11). */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { storeBackend, store } from '../engine/hooks'
import { ELOG, elogClear, logAction } from '../engine/editlog'
import { initStore, resetSession } from './store'
import { signIn, sessionFor } from './accounts'
import { isNewToMe, markSeen, changesLoad } from './changes'
import { commitSettingsIntent } from './people-settings-commit'

const fake = new Map<string, string>()
const as = (u: string, p: string) => resetSession(sessionFor(signIn(u, p) as any))   // ad = Saber (admin, person stiff), us = Ranger (member, person bane)
beforeAll(() => {
  storeBackend.impl = { getItem: k => (fake.has(k) ? fake.get(k)! : null), setItem: (k, v) => { fake.set(k, v) } }
  initStore()
})
afterAll(() => { storeBackend.impl = null })
beforeEach(() => { elogClear(); fake.delete('sqn142_changeseen'); changesLoad() })

describe('what is new to you', () => {
  it('a change someone else made is new to you; your own never is', () => {
    as('ad', 'a'); logAction(0, 'Saber moved a man')
    as('us', 'us'); logAction(0, 'Ranger filed leave')
    const [saber, ranger] = ELOG.rows
    expect(isNewToMe(saber!)).toBe(true)        // Ranger signed in
    expect(isNewToMe(ranger!)).toBe(false)
    as('ad', 'a')
    expect(isNewToMe(saber!)).toBe(false)
    expect(isNewToMe(ranger!)).toBe(true)
  })

  it('Mark all as seen clears what it was shown, for you alone, and it survives a sign-out and a reload', () => {
    as('ad', 'a'); logAction(0, 'one'); logAction(1, 'two')
    as('us', 'us')
    const [one, two] = ELOG.rows
    expect(markSeen([one!])).toBe(true)
    expect(isNewToMe(one!)).toBe(false)
    expect(isNewToMe(two!), 'a line it was not shown stays new').toBe(true)
    resetSession(null); changesLoad(); as('us', 'us')
    expect(isNewToMe(one!)).toBe(false)
    expect(isNewToMe(two!)).toBe(true)
    /* another member's view is untouched */
    as('ad', 'a'); logAction(2, 'three')
    expect(isNewToMe(ELOG.rows[2]!)).toBe(false)
  })

  it('nothing is new to someone signed in without a person, and he cannot mark anything', () => {
    as('ad', 'a'); logAction(0, 'one')
    resetSession({ user: 'nobody@x', role: 'pending', pid: null })   // signed in, on no list
    expect(isNewToMe(ELOG.rows[0]!)).toBe(false)
    expect(markSeen(ELOG.rows)).toBe(false)
  })

  it('a line with no person behind it (written with nobody signed in) is never new', () => {
    resetSession(null); logAction(0, 'boot')
    as('us', 'us')
    expect(isNewToMe(ELOG.rows[0]!)).toBe(false)
  })

  it('the seen lines fold into one number, so the record never grows with the history', () => {
    as('ad', 'a'); for (let i = 0; i < 30; i++) logAction(0, 'x' + i)
    as('us', 'us')
    expect(markSeen(ELOG.rows)).toBe(true)
    const saved = JSON.parse(fake.get('sqn142_changeseen')!)
    expect(saved.bane.extra).toEqual([])
    expect(saved.bane.upto).toBe(ELOG.rows[29]!.seq)
  })
})

describe('the command gate', () => {
  it('a member may mark his own entry, never another person\'s', () => {
    as('us', 'us')
    const r = commitSettingsIntent('changes.seen', { owner: 'stiff' }, () => store.set('changeseen', { stiff: { upto: 99, extra: [] } }))
    expect((r as any).ok).toBe(false)
    expect(fake.get('sqn142_changeseen')).toBeUndefined()
  })
})

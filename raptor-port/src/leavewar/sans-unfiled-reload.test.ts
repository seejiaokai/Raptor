/* D2338'S STRUCK LINE SURVIVES A RELOAD (his D1693, D1699, D1710 with D2338): the line a posting's take-back strikes is a
   STORED notice, saved by its command; the man's live line is worked out again from the saved posting. A real saved
   store (the demo world on a memory backend), booted twice as main.tsx boots it. The demo week of Mon 13 Jul 26; id
   `rocky` is Hex, a WSO, named on Thursday's schedule in the demo. His posting is dated Thu 16 Jul, so on that day his
   bell lists Thursday, planned and unfiled. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryBackend } from '../storage/memory'
import { bootApp } from '../boot'
import { signIn, sessionFor } from '../state/accounts'
import { resetSession, notify as raptorNotify } from '../state/store'
import { NOTICES, noticesFor, noticeWords, type Notice } from '../state/notices'
import { markAllNoticesRead, unreadFor } from '../state/noticeseen'
import { postOut, runPoOutcomes, undoPostOut } from './sync'

const THU_ISO = '2026-07-16'
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
async function boot(be: MemoryBackend) {
  const p = bootApp(be)
  const settled = p.then(() => null, (e: unknown) => e)
  await vi.advanceTimersByTimeAsync(be.latency + 1)
  const err = await settled
  if (err) throw err
  return p
}
/* every write the session made reaches the store, as it does before a reload */
const flush = async (p: Awaited<ReturnType<typeof boot>>) => { await vi.advanceTimersByTimeAsync(2000); await p.postman.flush() }
const kindOf = (n: Notice) => String((n.what || [])[0]?.k)
const struck = () => NOTICES.filter(n => n.to === 'rocky' && kindOf(n) === 'sansback')
const live = () => noticesFor('rocky').filter(n => kindOf(n) === 'sansdue')

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0)) })
afterEach(() => { resetSession(null); vi.useRealTimers() })

describe('D2338 — the struck line after a reload', () => {
  it('taken back after he read it: struck once, and still struck once after a reload; made again: one new line too, after a reload', async () => {
    const be = new MemoryBackend()
    let app = await boot(be)
    signInAs('ad', 'a')
    expect(postOut('rocky', THU_ISO, 'sans')).toBe(true); raptorNotify()
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0)); runPoOutcomes(); raptorNotify()
    expect(live().map(n => (n.what[0] as any).days), 'Thursday, planned and unfiled').toEqual([[THU_ISO]])
    signInAs('hex'); expect(markAllNoticesRead()).toBe(true); signInAs('ad', 'a')
    expect(undoPostOut('rocky')).toBe(true); raptorNotify()
    expect(struck().length).toBe(1)
    await flush(app)

    /* a reload */
    app = await boot(be)
    signInAs('ad', 'a')
    expect(struck().length, 'the struck line is saved, once').toBe(1)
    /* (his D2342 words; D2341's shape: the first sentence struck as the name) */
    expect(noticeWords(struck()[0]!)).toEqual({ name: 'You\'re SANS from Thu 16 Jul.', nameStruck: true, day: '', struck: 'You\'re planned on Thu 16 Jul with nothing filed.', what: 'taken back', who: 'Saber' })
    expect(live()).toEqual([])

    /* the same SANS posting made again: the struck line and one new line, unread */
    expect(postOut('rocky', THU_ISO, 'sans')).toBe(true); raptorNotify(); runPoOutcomes(); raptorNotify()
    expect(live().length).toBe(1)
    expect(struck().length).toBe(1)
    await flush(app)

    app = await boot(be)
    signInAs('ad', 'a')
    expect(struck().length, 'still once after the second reload').toBe(1)
    expect(live().length, 'the new line, worked out again from the saved posting').toBe(1)
    expect(unreadFor('rocky'), 'both unread').toBe(2)
  })
})

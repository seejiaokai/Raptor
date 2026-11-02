/* THE PC LOCK'S HEARTBEAT ([GATELOCK-STALE-LIVE], 2 Nov 26). A waiting run broke any lock older than two hours, and a lock
   taken by hand carried only the take command's process — gone at once — so nothing told a live run from a dead one: on
   28 Sep 26 a queued run came within three minutes of cutting into a Tracker smoke still running under a hand-taken lock.
   Now the lock folder's time stamp is its sign of life: `run` and `exec` refresh it while their command runs, `beat`
   refreshes a hand-taken one, and "stale" is two hours with no sign of life. The push guard reads the same stamp. */
import { afterEach, describe, expect, it } from 'vitest'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, utimesSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { beat, breakLock, breakReason, keepBeating, mayBeat, status, STALE_MS, tryTake } from '../../scripts/gatelock.mjs'

const GL = resolve(__dirname, '../../scripts/gatelock.mjs')
const dirs: string[] = []
const fresh = () => { const d = mkdtempSync(join(tmpdir(), 'gl-beat-')); dirs.push(d); return join(d, 'lock') }
const age = (lock: string, ms: number) => { const t = new Date(Date.now() - ms); utimesSync(lock, t, t) }
afterEach(() => { for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true }) })

describe('the lock’s heartbeat', () => {
  it('a beat makes an old lock young again; with no lock there is nothing to beat', () => {
    const lock = fresh()
    expect(beat(lock)).toBe(false)
    expect(tryTake('claude/a — unit', lock)).toBe(true)
    age(lock, STALE_MS + 60_000)
    expect(breakReason(status(lock))).toBe('stale')
    expect(beat(lock)).toBe(true)
    expect(status(lock)!.ageMs).toBeLessThan(5_000)
    expect(breakReason(status(lock)), 'a beaten lock is live').toBeNull()
  })

  it('a hand-taken lock names the chat and says how it is kept, not a process that has already ended', () => {
    const lock = fresh()
    const was = process.env.CLAUDE_CODE_HOST_SESSION_ID
    process.env.CLAUDE_CODE_HOST_SESSION_ID = 'test-session-7'
    try { tryTake('claude/a — smoke', lock) } finally { if (was === undefined) delete process.env.CLAUDE_CODE_HOST_SESSION_ID; else process.env.CLAUDE_CODE_HOST_SESSION_ID = was }
    const owner = readFileSync(join(lock, 'owner.txt'), 'utf8')
    expect(owner.split('\n')[0]).toBe('claude/a — smoke')
    expect(owner).toMatch(/^session: test-session-7$/m)
    expect(owner).toMatch(/^taken by hand: .*gatelock\.mjs beat/m)
    expect(owner).not.toMatch(/^pid: /m)
  })

  it('a lock with no sign of life for two hours is broken by the next take; under two hours it is waited on', () => {
    const lock = fresh()
    tryTake('claude/a — unit', lock)
    age(lock, STALE_MS - 60_000)
    expect(breakReason(status(lock))).toBeNull()
    age(lock, STALE_MS + 60_000)
    const r = spawnSync(process.execPath, [GL, 'take', 'claude/b — unit'], { env: { ...process.env, RAPTOR_GATE_LOCK: lock }, encoding: 'utf8', timeout: 20_000 })
    expect(r.stdout).toMatch(/broke a stale lock \(no sign of life for 12\d min\)/)
    expect(readFileSync(join(lock, 'owner.txt'), 'utf8').split('\n')[0]).toBe('claude/b — unit')
  })

  it('exec keeps its lock young while its command runs, however long ago it was taken', () => {
    const lock = fresh(), out = join(lock + '-seen.txt')
    /* the command ages the lock past two hours, waits two heartbeats, then writes the lock's age as it finds it */
    const probe = join(lock + '-probe.mjs')
    writeFileSync(probe, [
      "import { utimesSync, statSync, writeFileSync } from 'node:fs'",
      'const [lock, out] = process.argv.slice(2)',
      `const old = new Date(Date.now() - ${STALE_MS + 60_000}); utimesSync(lock, old, old)`,
      /* polled, not a fixed wait: a busy PC may hold the holder's timer back (the fresh read, 2 Nov 26) */
      'const until = Date.now() + 15000; let ageMs = Date.now() - statSync(lock).mtimeMs',
      'while (ageMs > 5000 && Date.now() < until) { await new Promise(r => setTimeout(r, 100)); ageMs = Date.now() - statSync(lock).mtimeMs }',
      'writeFileSync(out, String(ageMs))',
    ].join('\n'))
    mkdirSync(join(lock, '..'), { recursive: true })
    const r = spawnSync(process.execPath, [GL, 'exec', 'claude/a — beat', '--', process.execPath, probe, lock, out],
      { env: { ...process.env, RAPTOR_GATE_LOCK: lock, GATELOCK_BEAT_MS: '200' }, encoding: 'utf8', timeout: 30_000 })
    expect(r.status, r.stdout + r.stderr).toBe(0)
    expect(Number(readFileSync(out, 'utf8')), 'the lock was refreshed while the command ran').toBeLessThan(5_000)
    expect(existsSync(lock), 'released after').toBe(false)
  })

  it('a run whose lock was broken and taken by another chat leaves that chat’s lock alone when it ends', () => {
    const lock = fresh(), probe = join(lock + '-probe.mjs')
    /* the command plays the other chat: the lock broken under the run and taken afresh, owned by someone else */
    writeFileSync(probe, [
      "import { rmSync, mkdirSync, writeFileSync } from 'node:fs'",
      "import { join } from 'node:path'",
      'const [lock] = process.argv.slice(2)',
      'rmSync(lock, { recursive: true, force: true }); mkdirSync(lock)',
      "writeFileSync(join(lock, 'owner.txt'), 'claude/b — unit\\nstarted: x\\nsession: other\\nholder-pid: 1\\n')",
    ].join('\n'))
    const r = spawnSync(process.execPath, [GL, 'exec', 'claude/a — long', '--', process.execPath, probe, lock],
      { env: { ...process.env, RAPTOR_GATE_LOCK: lock }, encoding: 'utf8', timeout: 30_000 })
    expect(r.status, r.stdout + r.stderr).toBe(0)
    expect(existsSync(lock), 'the other chat’s lock is still there').toBe(true)
    expect(readFileSync(join(lock, 'owner.txt'), 'utf8').split('\n')[0]).toBe('claude/b — unit')
  })

  it('a holder stops beating after its ceiling, so a hung command still frees the PC in the end', async () => {
    const lock = fresh(); tryTake('claude/a — hung', lock)
    const said: string[] = []
    const stop = keepBeating(lock, 20, 120, m => said.push(m))
    await new Promise(r => setTimeout(r, 400))
    age(lock, STALE_MS + 60_000)
    await new Promise(r => setTimeout(r, 120))
    stop()
    expect(breakReason(status(lock)), 'no beat after the ceiling').toBe('stale')
    expect(said.join('\n')).toMatch(/stopped refreshing the lock .* may be hung/)
  })

  it('a lock refreshed after a waiter judged it is not broken', () => {
    const lock = fresh(); tryTake('claude/a — smoke', lock)
    age(lock, STALE_MS + 60_000)
    const judged = status(lock)!
    beat(lock)                                                       // the holder's beat lands between the judging and the break
    expect(breakLock(lock, judged)).toBe(false)
    expect(existsSync(lock)).toBe(true)
    expect(breakLock(lock, status(lock)!), 'judged afresh, the same lock is live and the wait goes on — but a break by its own judging still works').toBe(true)
  })

  it('beat refreshes only this chat’s own lock', () => {
    const own = { owner: 'claude/a — smoke\nstarted: x\nsession: S1\ntaken by hand: …' }
    expect(mayBeat(own as any, 'S1', '')).toBe(true)
    expect(mayBeat(own as any, 'S2', 'claude/a'), 'another session, even on the same branch').toBe(false)
    const old = { owner: 'claude/a — smoke\nstarted: x\nsession: unknown' }
    expect(mayBeat(old as any, 'S2', 'claude/a'), 'no session known: the branch decides').toBe(true)
    expect(mayBeat(old as any, 'S2', 'claude/b')).toBe(false)
    expect(mayBeat(null, 'S1', 'claude/a')).toBe(false)
  })

  it('the beat command refreshes a lock taken by hand, and says when there is none', () => {
    /* a session of its own, the same for the taking and the beat — GitHub's machines have none, and a detached checkout no branch */
    const lock = fresh(), env = { ...process.env, RAPTOR_GATE_LOCK: lock, CLAUDE_CODE_HOST_SESSION_ID: 'beat-test-session' }
    const none = spawnSync(process.execPath, [GL, 'beat'], { env, encoding: 'utf8', timeout: 20_000 })
    expect(none.status).toBe(1); expect(none.stdout).toMatch(/no lock to refresh/)
    const was = process.env.CLAUDE_CODE_HOST_SESSION_ID
    process.env.CLAUDE_CODE_HOST_SESSION_ID = 'beat-test-session'
    try { tryTake('claude/a — smoke', lock) } finally { if (was === undefined) delete process.env.CLAUDE_CODE_HOST_SESSION_ID; else process.env.CLAUDE_CODE_HOST_SESSION_ID = was }
    age(lock, STALE_MS + 60_000)
    const r = spawnSync(process.execPath, [GL, 'beat'], { env, encoding: 'utf8', timeout: 20_000 })
    expect(r.status).toBe(0); expect(r.stdout).toMatch(/refreshed — held by claude\/a — smoke/)
    expect(status(lock)!.ageMs).toBeLessThan(5_000)
    /* another session's beat is refused, and leaves the lock as it was */
    age(lock, STALE_MS + 60_000)
    const other = spawnSync(process.execPath, [GL, 'beat'], { env: { ...env, CLAUDE_CODE_HOST_SESSION_ID: 'someone-else' }, encoding: 'utf8', timeout: 20_000 })
    expect(other.status).toBe(1); expect(other.stdout).toMatch(/not yours — not refreshed/)
    expect(breakReason(status(lock))).toBe('stale')
  })
})

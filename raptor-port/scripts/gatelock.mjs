#!/usr/bin/env node
/* THE PC-WIDE GATE LOCK (D228, 26 Sep 26 — the owner: "why not both? and deconflict the full checks").
 *
 * Several chats work in parallel worktrees on his one PC, and two full check runs at once give false failures
 * (D86 — measured: one run held the processor at 86–97%). So every chat takes ONE lock before a heavy run: the
 * full unit suite, a browser-test run of more than one file, the Tracker smoke, a fanned-out walk. The lock is a
 * FOLDER outside every checkout (so every worktree shares it): making it fails if it exists, which is the atomic
 * "is anyone running?" test on every file system. Inside, owner.txt says who and since when.
 *
 *   node raptor-port/scripts/gatelock.mjs status               who holds it, if anyone
 *   node raptor-port/scripts/gatelock.mjs take "<who — what>"  wait until free (checks every 30 s), then take it
 *   node raptor-port/scripts/gatelock.mjs release              give it back (only when this run is over)
 *   node raptor-port/scripts/gatelock.mjs run [--from raptor-port] [--logs <dir>]
 *        take it, run the whole gate set in order into log files, print one line per gate, ALWAYS release.
 *        The browser tests use E2E_PORT from the environment (each parallel chat its own port); with none set, a port
 *        found free at that moment is used and printed, and a set one that is already answering is refused
 *        ([GATELOCK-STALE-PORT]) — the Tracker smoke's SMOKE_PORT the same.
 *   node raptor-port/scripts/gatelock.mjs exec "<who — what>" -- <command …>
 *        take it (waiting while another chat holds it), run that one command in this folder with its output shown,
 *        ALWAYS release, and exit with the command's code. The push-and-lock guard ([PUSH-LOCK-GUARD], D976) points
 *        here when it refuses a full check run made without the lock.
 *   node raptor-port/scripts/gatelock.mjs beat                 refresh a lock taken by hand while its long run goes on
 *
 * Stale: a lock with no sign of life for 2 hours is broken by `take` with a line saying so (a run that died without
 * releasing). Its sign of life is the lock folder's own time stamp — the HEARTBEAT ([GATELOCK-STALE-LIVE], 2 Nov 26):
 * `run` and `exec` refresh it every minute while their command runs, and `beat` refreshes a lock taken by hand. Before
 * it, age alone decided, and a waiting run came within three minutes of breaking a hand-taken lock whose Tracker smoke
 * was still running (28 Sep 26). The push guard (.claude/hooks/push-guard.mjs) reads the same time stamp, so the two
 * agree on what is stale without either changing its two hours.
 * RAPTOR_GATE_LOCK overrides the folder (the tests use a temporary one); GATELOCK_BEAT_MS the heartbeat (the tests'). */
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, statSync, createWriteStream, renameSync, appendFileSync, utimesSync } from 'node:fs'
import { spawn, spawnSync } from 'node:child_process'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir, tmpdir } from 'node:os'
import { createServer, connect } from 'node:net'

export const LOCK = process.env.RAPTOR_GATE_LOCK || join(homedir(), '.raptor-gates-lock')
export const STALE_MS = 2 * 60 * 60 * 1000
export const BEAT_MS = Number(process.env.GATELOCK_BEAT_MS) || 60_000
/* how long a holder goes on beating: past it the lock is left to go stale as before, so a command that HANGS (a web server
   that never comes up, a prompt nobody answers) frees the PC 2 h later instead of never (the fresh read, 2 Nov 26) — the
   longest honest run, the whole gate set or a fanned-out walk, is well inside it */
export const MAX_BEAT_MS = Number(process.env.GATELOCK_MAX_BEAT_MS) || 4 * 60 * 60 * 1000

export function status(lock = LOCK) {
  if (!existsSync(lock)) return null
  let owner = ''
  try { owner = readFileSync(join(lock, 'owner.txt'), 'utf8').trim() } catch { owner = '(no owner.txt)' }
  const since = statSync(lock).mtimeMs
  return { owner, since, ageMs: Date.now() - since }
}
/* Is a process still running? (EPERM: it is, but not ours to signal.) */
const alive = pid => { try { process.kill(pid, 0); return true } catch (e) { return !!(e && e.code === 'EPERM') } }
/* The holder that went away (D976, the guard's fresh read): `exec` and `run` write `holder-pid:` — their own process, which
 * lives as long as the run — so a lock whose run was killed (a tool timeout, a stop, a tree kill that no signal handler
 * sees) is known to be dead at once, not only after two hours. A lock taken by hand with `take` has no holder-pid. */
export function holderGone(s) {
  const m = s && /^holder-pid: (\d+)$/m.exec(s.owner); const c = s && /^child-pid: (\d+)$/m.exec(s.owner)
  // the run is over only when both are gone: a holder killed without its tree leaves the checks still running
  return !!(m && !alive(Number(m[1])) && !(c && alive(Number(c[1]))))
}
/* the running command's own process, written beside holder-pid once it starts */
function noteChild(p, lock = LOCK) { try { if (p && p.pid) appendFileSync(join(lock, 'owner.txt'), `child-pid: ${p.pid}\n`) } catch {} }
/* one attempt: true when this caller now holds it. The owner file names the chat — its branch in the first line, and the
   app's own number for the session that took it — never the take command's process, which is gone the moment a lock is
   taken by hand and so told a waiter nothing ([GATELOCK-STALE-LIVE]). */
export function tryTake(who, lock = LOCK, holderPid = null) {
  try { mkdirSync(lock) } catch (e) { if (e && e.code === 'EEXIST') return false; throw e }
  writeFileSync(join(lock, 'owner.txt'), `${who}\nstarted: ${new Date().toISOString()}\nsession: ${mySession()}\n${holderPid ? `holder-pid: ${holderPid}\n` : 'taken by hand: refresh it with `gatelock.mjs beat` while its run goes on\n'}`)
  return true
}
export function release(lock = LOCK) { rmSync(lock, { recursive: true, force: true }) }
/* A RUN RELEASES ONLY ITS OWN LOCK (the narrow read, 2 Nov 26): a run that outlived its heartbeat's ceiling may have had
   its lock broken as stale and taken by another chat; when it finally ends, a plain release would delete THAT chat's lock
   and let a third run start beside it. So `run`, `exec` and their signal path release only a lock whose owner file still
   names their own process; the `release` command, used by hand, stays as it is. */
export function releaseIfMine(lock = LOCK, pid = process.pid) {
  let owner = ''
  try { owner = readFileSync(join(lock, 'owner.txt'), 'utf8') } catch { return false }
  if (!new RegExp(`^holder-pid: ${pid}$`, 'm').test(owner)) return false
  release(lock)
  return true
}
/* THE HEARTBEAT: the lock folder's time stamp moved to now — the sign of life `take` and the push guard read. False when
   there is no lock to refresh. */
export function beat(lock = LOCK) {
  try { const now = new Date(); utimesSync(lock, now, now); return true } catch { return false }
}
/* a holder's heartbeat for as long as its command runs, up to MAX_BEAT_MS; returns the stop, called before the lock is released */
export function keepBeating(lock = LOCK, everyMs = BEAT_MS, maxMs = MAX_BEAT_MS, log = console.log) {
  const t0 = Date.now()
  const t = setInterval(() => {
    if (Date.now() - t0 > maxMs) {
      clearInterval(t)
      log(`gatelock: stopped refreshing the lock after ${Math.round(maxMs / 60000)} min — the command may be hung; the lock goes stale 2 h from now`)
      return
    }
    beat(lock)
  }, everyMs)
  return () => clearInterval(t)
}
/* this chat's session, and the branch of a folder — what `beat` asks before it refreshes a lock taken by hand */
export const mySession = () => process.env.CLAUDE_CODE_HOST_SESSION_ID || process.env.CLAUDE_CODE_SESSION_ID || 'unknown'
/* May this caller refresh this lock? Only its own (the fresh read): a beat left running after its release would otherwise
   keep the NEXT holder's lock alive, and a hand-taken lock has no process for a waiter to find dead. The session decides
   where both sides know it; otherwise the branch, against the owner file's first line. */
export function mayBeat(s, session = mySession(), branch = '') {
  if (!s) return false
  const m = /^session: (.+)$/m.exec(s.owner), theirs = m ? m[1].trim() : 'unknown'
  if (theirs !== 'unknown' && session !== 'unknown') return theirs === session
  return !!branch && s.owner.split('\n')[0].split(' — ')[0].trim() === branch
}
/* why a lock may be broken now, or null while it is live: its holder process is gone, or it has had no sign of life for
   STALE_MS. A heartbeat keeps a long run's lock young, so age alone never cuts into a run that is still beating. */
export function breakReason(s) {
  if (!s) return null
  if (holderGone(s)) return 'gone'
  if (s.ageMs > STALE_MS) return 'stale'
  return null
}
/* Break a dead or stale lock without breaking a fresh one (the guard's second read, 17 Oct 26): two waiting chats can
 * both judge the same lock dead, and the slower one would delete the lock the faster one has just taken. Renaming the
 * folder is atomic — only one rename succeeds — and the renamed folder's owner.txt is compared with the one judged: if
 * it is not the same lock, it is put back. */
export function breakLock(lock, judged) {
  /* LOOK BEFORE MOVING ([PUSH-GUARD-LEFTOVERS] (4), 17 Oct 26): a lock that is no longer the one judged is left where it
     is. Moved first and put back after, a third waiter could take the empty name in that instant and the put-back would
     fail, leaving the real holder's lock set aside and two runs at once. The check below the move stays for the gap
     between these two reads. */
  /* a lock whose owner.txt is not written yet is named as status() names it — a chat that has just made the folder is
     never moved aside before it can write its name (the fix's read, 17 Oct 26) */
  /* a lock that beat since it was judged is alive after all (the heartbeat's fresh read): its time stamp, not only its
     owner, is compared — before the move and after it, as the owner is */
  const beatSince = dir => { try { return judged && judged.since != null && statSync(dir).mtimeMs > judged.since } catch { return false } }
  if (judged) {
    if (!existsSync(lock)) return false
    let now = '(no owner.txt)'; try { now = readFileSync(join(lock, 'owner.txt'), 'utf8').trim() } catch {}
    if (now !== judged.owner || beatSince(lock)) return false
  }
  const aside = `${lock}.broken-${process.pid}-${Date.now()}`
  try { renameSync(lock, aside) } catch { return false }                 // someone else broke (or released) it first
  let owner = ''
  try { owner = readFileSync(join(aside, 'owner.txt'), 'utf8').trim() } catch { owner = '(no owner.txt)' }
  if (judged && (owner !== judged.owner || beatSince(aside))) { try { renameSync(aside, lock) } catch {} return false }
  rmSync(aside, { recursive: true, force: true })
  return true
}
let child = null                                                           // the command a run or an exec is running
const sleep = ms => new Promise(r => setTimeout(r, ms))
export async function take(who, { lock = LOCK, everyMs = 30_000, log = console.log, holderPid = null } = {}) {
  let said = false, warned = false
  for (;;) {
    if (tryTake(who, lock, holderPid)) return true
    const s = status(lock)
    // a lock that cannot be broken (a folder still in use) is waited on like any other — never retried without a pause
    const why = breakReason(s)
    if (why === 'gone' && breakLock(lock, s)) { log(`gatelock: broke a lock whose run ended without releasing it — ${s.owner.split('\n')[0]}`); continue }
    if (why === 'stale' && breakLock(lock, s)) { log(`gatelock: broke a stale lock (no sign of life for ${Math.round(s.ageMs / 60000)} min) — ${s.owner.split('\n')[0]}`); continue }
    if (!said && s) {
      log(`gatelock: waiting — held by ${s.owner.split('\n')[0]} (last sign of life ${Math.round(s.ageMs / 60000)} min ago)`)
      said = true
    }
    /* a lock taken by hand beats only when its holder says so: past an hour without one, the holder is the one to ask (D302) */
    if (!warned && s && /^taken by hand/m.test(s.owner) && s.ageMs > STALE_MS / 2) {
      log('gatelock: it was taken by hand and is broken after 2 h with no beat — ask its holder before then (D302)')
      warned = true
    }
    await sleep(everyMs)
  }
}

/* A PORT NOBODY IS ANSWERING ON ([GATELOCK-STALE-PORT], 18 Oct 26 — built the night of 20 Oct 26). Outside CI the browser
 * tests REUSE a server already on their port (playwright.config.ts reuseExistingServer), so a preview another chat left on
 * 4173 had the whole check run test that chat's old build: seven false failures one night, twenty-nine the next. A port is
 * taken as busy when anything answers a connection on localhost, or when it cannot be listened on. */
export function portAnswering(port, host = '127.0.0.1', ms = 400) {
  return new Promise(res => {
    const s = connect({ port, host }); let done = false
    const end = v => { if (!done) { done = true; s.destroy(); res(v) } }
    s.once('connect', () => end(true)); s.once('error', () => end(false)); s.setTimeout(ms, () => end(false))
  })
}
export function portListenable(port) {
  return new Promise(res => {
    const srv = createServer(); srv.once('error', () => res(false))
    srv.listen(port, () => srv.close(() => res(true)))
  })
}
export async function portBusy(port) {
  return (await portAnswering(port)) || (await portAnswering(port, '::1')) || !(await portListenable(port))
}
export async function freePort(from = 4300, to = 4399, busy = portBusy) {
  for (let p = from; p <= to; p++) if (!(await busy(p))) return p
  throw new Error(`gatelock: no free port between ${from} and ${to}`)
}
/* the ports the browser runs use: a set one must be free (a busy one would be REUSED — another build tested), an unset one is
 * chosen free; returns the env to run with, or throws with the reason */
export async function browserPorts(env, busy = portBusy) {
  const out = { ...env }, said = []
  for (const [name, from] of [['E2E_PORT', 4300], ['SMOKE_PORT', 4350]]) {
    if (out[name]) {
      if (await busy(Number(out[name]))) throw new Error(`gatelock: ${name}=${out[name]} is already answering — another chat's preview would be tested instead of this build. Stop it, or unset ${name} and a free port is chosen.`)
      said.push(`${name}=${out[name]}`)
    } else { out[name] = String(await freePort(from, from + 49, busy)); said.push(`${name}=${out[name]} (free)`) }
  }
  return { env: out, said: said.join(', ') }
}
/* a command that serves the bundle for browser tests */
export const runsBrowser = cmd => /playwright\s+test|test:e2e|smoke:tracker|smoke\.mjs/.test(cmd)

/* the gate set, in the order raptor-port/CLAUDE.md §Build & verify gives */
const GATES = [
  ['unit', 'npx', ['vitest', 'run']],
  ['build', 'npm', ['run', 'build']],
  ['tfin', 'node', ['reference/tfin.js']],
  ['e2e', 'npx', ['playwright', 'test', '--reporter=line']],
  ['smoke', 'npm', ['run', 'smoke:tracker']],
  ['rulecheck', 'node', ['scripts/rulecheck.mjs']],
  ['docsize', 'node', ['scripts/docsize.mjs']],
]
function runOne(cmd, args, cwd, file, env = process.env) {
  return new Promise(res => {
    const out = createWriteStream(file)
    const p = child = spawn(cmd, args, { cwd, shell: process.platform === 'win32', env }); noteChild(p)
    p.stdout.pipe(out); p.stderr.pipe(out)
    p.on('close', code => { out.end(); res(code ?? 1) })
    p.on('error', () => { out.end(); res(1) })
  })
}
async function runAll(from, logs) {
  mkdirSync(logs, { recursive: true })
  const who = `${process.env.GATELOCK_WHO || branchName(from)} — the full gate set`
  await take(who, { holderPid: process.pid })
  releaseOnSignal()
  const stopBeat = keepBeating()
  let bad = 0
  try {
    /* the port is chosen once the lock is ours, not before a wait behind another chat (the night's blind read, L2) */
    const ports = await browserPorts(process.env)
    console.log(`gatelock: the browser runs on ${ports.said}`)
    for (const [name, cmd, args] of GATES) {
      const t = Date.now(), file = join(logs, `gate-${name}.log`)
      const code = await runOne(cmd, args, from, file, ports.env)
      if (code !== 0) bad++
      console.log(`${code === 0 ? 'PASS' : 'FAIL'} ${name} (${Math.round((Date.now() - t) / 1000)} s) → ${file}`)
    }
  } finally { stopBeat(); releaseIfMine() }
  return bad
}
/* an interrupt (Ctrl-C, a stop) stops the command it is running, THEN releases — a run must never go on after the lock is
 * free; a hard kill of this process is caught by holder-pid instead */
function releaseOnSignal() {
  const stop = () => {
    try {
      if (child && child.exitCode === null && child.pid) {
        if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true })
        else child.kill('SIGTERM')
      }
    } catch {}
    try { releaseIfMine() } finally { process.exit(130) }
  }
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGBREAK', 'SIGHUP']) { try { process.on(sig, stop) } catch {} }
}
/* the branch, so the lock's owner line names it (the guard matches "<branch> — …"); a worktree's .git is a file, so ask git */
function branchName(from) {
  try { const r = spawnSync('git', ['symbolic-ref', '--short', '-q', 'HEAD'], { cwd: from, encoding: 'utf8', windowsHide: true }); return (r.status === 0 && r.stdout.trim()) || 'a chat' } catch { return 'a chat' }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
if (isMain) {
  const [verb, ...rest] = process.argv.slice(2)
  const opt = n => { const i = rest.indexOf(n); return i >= 0 ? rest[i + 1] : null }
  if (verb === 'status') { const s = status(); console.log(s ? `held by ${s.owner.replace(/\n/g, ' · ')} (${Math.round(s.ageMs / 60000)} min)` : 'free') }
  else if (verb === 'take') { await take(rest[0] || 'a chat'); console.log('gatelock: taken') }
  else if (verb === 'release') { release(); console.log('gatelock: released') }
  else if (verb === 'beat') {
    const s = status()
    if (!s) { console.log('gatelock: no lock to refresh'); process.exitCode = 1 }
    else if (!mayBeat(s, mySession(), branchName(process.cwd()))) { console.log(`gatelock: not yours — not refreshed (held by ${s.owner.split('\n')[0]})`); process.exitCode = 1 }
    else if (beat()) console.log(`gatelock: refreshed — held by ${s.owner.split('\n')[0]}`)
    else { console.log('gatelock: no lock to refresh'); process.exitCode = 1 }
  }
  else if (verb === 'run') {
    const from = resolve(opt('--from') || join(dirname(fileURLToPath(import.meta.url)), '..'))
    const logs = resolve(opt('--logs') || join(tmpdir(), 'raptor-gates'))
    try { process.exitCode = (await runAll(from, logs)) ? 1 : 0 } catch (e) { console.log(String(e && e.message || e)); process.exitCode = 1 }
  } else if (verb === 'exec' && rest.indexOf('--') > 0 && rest.length > rest.indexOf('--') + 1) {
    // one word after "--" is a whole command line, run as written; several are words, each kept whole
    const parts = rest.slice(rest.indexOf('--') + 1)
    const cmd = parts.length === 1 ? parts[0] : parts.map(a => /[\s"&|;<>]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a).join(' ')
    await take(rest[0], { holderPid: process.pid })
    releaseOnSignal()
    const stopBeat = keepBeating()
    let code = 1
    try {
      /* the port is chosen once the lock is ours (the night's blind read, L2); a refusal still releases it (finally) */
      let env = process.env
      if (runsBrowser(cmd)) {
        try { const ports = await browserPorts(process.env); env = ports.env; console.log(`gatelock: the browser runs on ${ports.said}`) }
        catch (e) { console.log(String(e && e.message || e)); env = null }
      }
      if (env) code = await new Promise(res => {
        const p = child = spawn(cmd, { shell: true, stdio: 'inherit', env }); noteChild(p)
        p.on('close', c => res(c ?? 1)); p.on('error', () => res(1))
      })
    } finally { stopBeat(); releaseIfMine() }
    console.log(`gatelock: released (the command exited ${code})`)
    process.exitCode = code
  } else { console.log('usage: gatelock.mjs status | take "<who — what>" | release | beat | run [--from raptor-port] [--logs dir] | exec "<who — what>" -- <command>'); process.exitCode = 2 }
}

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
 *
 * Stale: a lock older than 2 hours is broken by `take` with a line saying so (a run that died without releasing).
 * RAPTOR_GATE_LOCK overrides the folder (the tests use a temporary one). */
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, statSync, createWriteStream, renameSync, appendFileSync } from 'node:fs'
import { spawn, spawnSync } from 'node:child_process'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir, tmpdir } from 'node:os'
import { createServer, connect } from 'node:net'

export const LOCK = process.env.RAPTOR_GATE_LOCK || join(homedir(), '.raptor-gates-lock')
export const STALE_MS = 2 * 60 * 60 * 1000

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
/* one attempt: true when this caller now holds it */
export function tryTake(who, lock = LOCK, holderPid = null) {
  try { mkdirSync(lock) } catch (e) { if (e && e.code === 'EEXIST') return false; throw e }
  writeFileSync(join(lock, 'owner.txt'), `${who}\nstarted: ${new Date().toISOString()}\npid: ${process.pid}\n${holderPid ? `holder-pid: ${holderPid}\n` : ''}`)
  return true
}
export function release(lock = LOCK) { rmSync(lock, { recursive: true, force: true }) }
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
  if (judged) {
    if (!existsSync(lock)) return false
    let now = '(no owner.txt)'; try { now = readFileSync(join(lock, 'owner.txt'), 'utf8').trim() } catch {}
    if (now !== judged.owner) return false
  }
  const aside = `${lock}.broken-${process.pid}-${Date.now()}`
  try { renameSync(lock, aside) } catch { return false }                 // someone else broke (or released) it first
  let owner = ''
  try { owner = readFileSync(join(aside, 'owner.txt'), 'utf8').trim() } catch { owner = '(no owner.txt)' }
  if (judged && owner !== judged.owner) { try { renameSync(aside, lock) } catch {} return false }
  rmSync(aside, { recursive: true, force: true })
  return true
}
let child = null                                                           // the command a run or an exec is running
const sleep = ms => new Promise(r => setTimeout(r, ms))
export async function take(who, { lock = LOCK, everyMs = 30_000, log = console.log, holderPid = null } = {}) {
  let said = false
  for (;;) {
    if (tryTake(who, lock, holderPid)) return true
    const s = status(lock)
    // a lock that cannot be broken (a folder still in use) is waited on like any other — never retried without a pause
    if (s && holderGone(s) && breakLock(lock, s)) { log(`gatelock: broke a lock whose run ended without releasing it — ${s.owner.split('\n')[0]}`); continue }
    if (s && s.ageMs > STALE_MS && breakLock(lock, s)) { log(`gatelock: broke a stale lock (${Math.round(s.ageMs / 60000)} min old) — ${s.owner.split('\n')[0]}`); continue }
    if (!said && s) { log(`gatelock: waiting — held by ${s.owner.split('\n')[0]} (${Math.round(s.ageMs / 60000)} min)`); said = true }
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
  } finally { release() }
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
    try { release() } finally { process.exit(130) }
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
    } finally { release() }
    console.log(`gatelock: released (the command exited ${code})`)
    process.exitCode = code
  } else { console.log('usage: gatelock.mjs status | take "<who — what>" | release | run [--from raptor-port] [--logs dir] | exec "<who — what>" -- <command>'); process.exitCode = 2 }
}

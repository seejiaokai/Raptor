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
 *        The browser tests use E2E_PORT from the environment (each parallel chat its own port).
 *
 * Stale: a lock older than 2 hours is broken by `take` with a line saying so (a run that died without releasing).
 * RAPTOR_GATE_LOCK overrides the folder (the tests use a temporary one). */
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, statSync, createWriteStream } from 'node:fs'
import { spawn } from 'node:child_process'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir, tmpdir } from 'node:os'

export const LOCK = process.env.RAPTOR_GATE_LOCK || join(homedir(), '.raptor-gates-lock')
export const STALE_MS = 2 * 60 * 60 * 1000

export function status(lock = LOCK) {
  if (!existsSync(lock)) return null
  let owner = ''
  try { owner = readFileSync(join(lock, 'owner.txt'), 'utf8').trim() } catch { owner = '(no owner.txt)' }
  const since = statSync(lock).mtimeMs
  return { owner, since, ageMs: Date.now() - since }
}
/* one attempt: true when this caller now holds it */
export function tryTake(who, lock = LOCK) {
  try { mkdirSync(lock) } catch (e) { if (e && e.code === 'EEXIST') return false; throw e }
  writeFileSync(join(lock, 'owner.txt'), `${who}\nstarted: ${new Date().toISOString()}\npid: ${process.pid}\n`)
  return true
}
export function release(lock = LOCK) { rmSync(lock, { recursive: true, force: true }) }
const sleep = ms => new Promise(r => setTimeout(r, ms))
export async function take(who, { lock = LOCK, everyMs = 30_000, log = console.log } = {}) {
  let said = false
  for (;;) {
    if (tryTake(who, lock)) return true
    const s = status(lock)
    if (s && s.ageMs > STALE_MS) { log(`gatelock: breaking a stale lock (${Math.round(s.ageMs / 60000)} min old) — ${s.owner.split('\n')[0]}`); release(lock); continue }
    if (!said && s) { log(`gatelock: waiting — held by ${s.owner.split('\n')[0]} (${Math.round(s.ageMs / 60000)} min)`); said = true }
    await sleep(everyMs)
  }
}

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
function runOne(cmd, args, cwd, file) {
  return new Promise(res => {
    const out = createWriteStream(file)
    const p = spawn(cmd, args, { cwd, shell: process.platform === 'win32', env: process.env })
    p.stdout.pipe(out); p.stderr.pipe(out)
    p.on('close', code => { out.end(); res(code ?? 1) })
    p.on('error', () => { out.end(); res(1) })
  })
}
async function runAll(from, logs) {
  mkdirSync(logs, { recursive: true })
  const who = `${process.env.GATELOCK_WHO || branchName(from)} — the full gate set`
  await take(who)
  let bad = 0
  try {
    for (const [name, cmd, args] of GATES) {
      const t = Date.now(), file = join(logs, `gate-${name}.log`)
      const code = await runOne(cmd, args, from, file)
      if (code !== 0) bad++
      console.log(`${code === 0 ? 'PASS' : 'FAIL'} ${name} (${Math.round((Date.now() - t) / 1000)} s) → ${file}`)
    }
  } finally { release() }
  return bad
}
function branchName(from) {
  try { return readFileSync(join(from, '..', '.git', 'HEAD'), 'utf8').trim().replace('ref: refs/heads/', '') } catch { return 'a chat' }
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
    process.exitCode = (await runAll(from, logs)) ? 1 : 0
  } else { console.log('usage: gatelock.mjs status | take "<who — what>" | release | run [--from raptor-port] [--logs dir]'); process.exitCode = 2 }
}

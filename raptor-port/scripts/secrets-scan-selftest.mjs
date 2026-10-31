#!/usr/bin/env node
/* PROOF THAT THE SECRETS SCAN STILL CATCHES A KEY, AND NEVER PRINTS ONE — his D1408 (27 Oct 26), [REVIEW-LAYERS] step 4.
 *
 * A check nobody has seen go red is a check nobody knows works, and on a PUBLIC repository a scan that prints what it
 * found would publish the very key it caught. So before every real scan, .github/workflows/secrets-scan.yml runs:
 *
 *   node raptor-port/scripts/secrets-scan-selftest.mjs <path to the gitleaks program>
 *
 * Since fix round 1 (31 Oct 26) it drives the SAME code the workflow scans with — `scan()` of secrets-scan.mjs: the
 * same gitleaks arguments, the same --log-opts (a range, the binary files left out, the merge pass), the same summary
 * and the same red-or-green decision — over throwaway repositories in the temp folder whose fakes are made here from
 * pieces at run time, so no file of this repository holds any. (Round 1's self-test ran gitleaks its own way, and
 * passed while the real step died under `bash -e` before its summary.) It passes only if:
 *   1. a range holding a commit that adds two fakes (a password line, a private-key block) is RED, with both found by
 *      their rules (`generic-api-key`, `private-key`), and gitleaks' own output and report hold no eight characters
 *      running of either fake (every value REDACTED);
 *   2. a range of a clean commit is GREEN, and gitleaks says it scanned it;
 *   3. a fake added only by a MERGE's conflict resolution is missed by the commits pass and found by the landed pass —
 *      so the range is RED only with the landed pass, as the workflow runs it;
 *   4. a whole-history scan that finds something is a WARNING (green) on a pull request and RED on a manual run.
 * It prints only rule names, counts and pass/fail — never a line of a file.
 *
 *   node raptor-port/scripts/secrets-scan-selftest.mjs --self-check
 * proves THIS proof without gitleaks (his PC has none, and nothing is downloaded to it): the same four checks against
 * stand-in scanners — one that behaves, which must be accepted; one that prints the secret and keeps it in its report,
 * one that exits 0 on a finding, and one that reads nothing ("0 commits scanned"), which must each be caught — and the
 * one that reads nothing must turn the scan red by itself. It also reads the workflow and checks its promises: every
 * scan goes through secrets-scan.mjs (no shell step runs gitleaks git, so `bash -e` cannot cut a summary off), gitleaks
 * pinned by version and checksum, every action pinned by commit, read-only permissions, no path filter, a concurrency
 * group per event, and this self-test run before the scans.
 */
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { scan, gitleaks, passOneOpts } from './secrets-scan.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const WORKFLOW = join(HERE, '..', '..', '.github', 'workflows', 'secrets-scan.yml')
const RUNNER = join(HERE, 'secrets-scan.mjs')

/* The fakes, from pieces. Nothing here is, or ever was, a real credential: the words say so. They are shaped to meet
   gitleaks' own default rules (v8.30.1, config/gitleaks.toml — each password: 24 letters and digits, entropy 4.58
   against the rule's 3.5, none of its 1,453 stopwords) and to stay clear of every real provider's token shape, so
   GitHub's push protection has nothing to recognise either. */
const FAKE_PASSWORD = ['Rq7Zt2Vw', '9Lm4Xk8P', 'n3Hc6Jd1'].join('')
const FAKE_TOKEN = ['Wp4Nb8Qs', '2Ty6Gk9H', 'm3Lc7Vd5'].join('')
const KEY_LINES = Array.from({ length: 4 }, (_, i) => `RAPTORSELFTEST${i}NOTAREALKEYNOTAREALKEYNOTAREALKEYNOTAREALKEY${i}`)
const PLANTED = [
  '# A throwaway file made by raptor-port/scripts/secrets-scan-selftest.mjs. Everything below is fake.',
  `raptor_selftest_password = "${FAKE_PASSWORD}"`,
  ['-----BEGIN', 'PRIVATE', 'KEY-----'].join(' '),
  ...KEY_LINES,
  ['-----END', 'PRIVATE', 'KEY-----'].join(' '),
  '',
].join('\n')
const SECRETS = [FAKE_PASSWORD, KEY_LINES[0], FAKE_TOKEN]

const git = (cwd, ...args) => execFileSync('git', args, { cwd, stdio: 'ignore' })
const sha = (cwd, ref) => execFileSync('git', ['rev-parse', ref], { cwd, encoding: 'utf8' }).trim()
function newRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'raptor-secrets-'))
  git(dir, 'init', '-q', '-b', 'main')
  for (const [k, v] of [['user.email', 'selftest@example.invalid'], ['user.name', 'selftest'], ['commit.gpgsign', 'false'], ['core.autocrlf', 'false']]) git(dir, 'config', k, v)
  return dir
}
const commit = (dir, file, content, msg) => { writeFileSync(join(dir, file), content); git(dir, 'add', '.'); git(dir, 'commit', '-q', '-m', msg) }

/* Repo A, straight: a clean commit, the planted one, a clean one. */
function repoA() {
  const d = newRepo()
  commit(d, 'notes.txt', '# nothing secret\nhello = "world"\n', 'c0')
  commit(d, 'secrets.txt', PLANTED, 'c1 plants two fakes')
  commit(d, 'notes.txt', '# nothing secret\nhello = "there"\n', 'c2')
  return { d, c0: sha(d, 'HEAD~2'), c1: sha(d, 'HEAD~1'), c2: sha(d, 'HEAD') }
}
/* Repo B: a fake that only a merge's conflict resolution adds. */
function repoB() {
  const d = newRepo()
  commit(d, 'conflict.txt', 'x = 1\n', 'm0')
  const m0 = sha(d, 'HEAD')
  git(d, 'checkout', '-q', '-b', 'side')
  commit(d, 'conflict.txt', 'x = side\n', 's1')
  git(d, 'checkout', '-q', 'main')
  commit(d, 'conflict.txt', 'x = main\n', 'm1')
  const m1 = sha(d, 'HEAD')
  try { execFileSync('git', ['merge', '-q', 'side', '-m', 'merge'], { cwd: d, stdio: 'ignore' }) } catch { /* the conflict, on purpose */ }
  writeFileSync(join(d, 'conflict.txt'), `x = both\nraptor_selftest_token = "${FAKE_TOKEN}"\n`)
  git(d, 'add', '.')
  git(d, 'commit', '-q', '--no-edit')
  return { d, m0, m1, merge: sha(d, 'HEAD') }
}

const leaks = (text, secret) => { for (let i = 0; i + 8 <= secret.length; i++) if (text.includes(secret.slice(i, i + 8))) return true; return false }
const rules = (r) => new Set((r.found || []).map((f) => f.RuleID))
const printed = (r) => [...r.lines, ...r.annotations].join('\n')

/* The four checks. `bin` as secrets-scan.mjs takes it. Returns what failed, never a value. */
function check(bin) {
  const fails = []
  const A = repoA(), B = repoB()
  const tmp = mkdtempSync(join(tmpdir(), 'raptor-secrets-run-'))
  try {
    // 1. Red on the planted commit, both rules, nothing printed.
    const r1 = scan({ mode: 'change', bin, repo: A.d, range: `${A.c0}..${A.c2}`, event: 'pull_request', tmp })
    if (r1.exit !== 1) fails.push(`1: the planted range gave exit ${r1.exit}, not 1`)
    for (const rule of ['generic-api-key', 'private-key']) if (!rules(r1).has(rule)) fails.push(`1: no finding by the rule ${rule}`)
    if (/could not be read/.test(printed(r1))) fails.push('1: a pass could not be read')
    const raw = gitleaks(bin, A.d, passOneOpts([`${A.c0}..${A.c2}`]), join(tmp, 'raw.json'))
    const rawReport = JSON.stringify(raw.findings || [])
    SECRETS.slice(0, 2).forEach((s, i) => {
      if (leaks(raw.out, s)) fails.push(`1: fake ${i + 1} was PRINTED by the scanner`)
      if (leaks(rawReport, s)) fails.push(`1: fake ${i + 1} is in the report unredacted`)
      if (leaks(printed(r1), s)) fails.push(`1: fake ${i + 1} is in the summary`)
    })
    // 2. Green on a clean commit, and it was read.
    const r2 = scan({ mode: 'change', bin, repo: A.d, range: `${A.c1}..${A.c2}`, event: 'pull_request', tmp })
    if (r2.exit !== 0) fails.push(`2: a clean range gave exit ${r2.exit}, not 0 (${r2.lines.slice(1).join(' / ')})`)
    if (!/: [1-9]\d* commits scanned/.test(printed(r2))) fails.push('2: the clean range was not scanned')
    // 3. A merge-only fake: missed by the commits pass, found by the landed pass.
    const r3a = scan({ mode: 'change', bin, repo: B.d, range: `${B.m0}..${B.merge}`, event: 'pull_request', tmp })
    const r3b = scan({ mode: 'change', bin, repo: B.d, range: `${B.m0}..${B.merge}`, landed: `${B.m1}..${B.merge}`, event: 'pull_request', tmp })
    if (r3a.found && r3a.found.length) fails.push('3: the commits pass alone found the merge-only fake (the test no longer tests the merge pass)')
    if (r3b.exit !== 1 || !rules(r3b).has('generic-api-key')) fails.push(`3: the landed pass missed the merge-only fake (exit ${r3b.exit})`)
    if (leaks(printed(r3b), FAKE_TOKEN)) fails.push('3: the merge-only fake is in the summary')
    // 4. History: a warning on a pull request, red on a manual run.
    const r4p = scan({ mode: 'history', bin, repo: A.d, event: 'pull_request', tmp })
    const r4m = scan({ mode: 'history', bin, repo: A.d, event: 'workflow_dispatch', tmp })
    if (r4p.exit !== 0 || !r4p.annotations.some((a) => a.startsWith('::warning'))) fails.push(`4: history on a pull request gave exit ${r4p.exit} without its warning`)
    if (r4m.exit !== 1) fails.push(`4: history on a manual run gave exit ${r4m.exit}, not 1`)
    return { fails, r1 }
  } finally {
    for (const d of [A.d, B.d, tmp]) rmSync(d, { recursive: true, force: true })
  }
}

/* The workflow's own promises, read from the file (the self-check only). */
function workflowProblems() {
  if (!existsSync(WORKFLOW)) return ['the workflow file is missing']
  const p = []
  const code = readFileSync(WORKFLOW, 'utf8').split('\n').filter((l) => !l.trim().startsWith('#')).join('\n')
  const runner = readFileSync(RUNNER, 'utf8')
  // [ \t], never \s, at a line's start: \s would run across a blank line and read the top level as indented.
  if (/^[ \t]*paths(-ignore)?[ \t]*:/m.test(code)) p.push('it has a path filter — a notes-only pull request would go unscanned')
  if (!/pull_request:\s*\n\s*branches:\s*\[main\]/.test(code)) p.push('it does not run on pull requests into main')
  if (!/push:\s*\n\s*branches:\s*\[main\]/.test(code)) p.push('it does not run on pushes to main')
  if (!/workflow_dispatch:/.test(code)) p.push('it has no manual run (the one scan of the whole history)')
  if (!/^permissions:[ \t]*\n[ \t]+contents:[ \t]*read[ \t]*\n(?![ \t]+\S)/m.test(code)) p.push('it asks for more than to read the code')
  if (/^[ \t]+permissions:/m.test(code)) p.push('a job asks for permissions of its own')
  if (!/^concurrency:[ \t]*\n[ \t]+group:[^\n]*github\.event_name/m.test(code)) p.push('its concurrency group is not per event (a manual run and a push would cancel each other)')
  if (!/GITLEAKS_VERSION:\s*['"]?\d+\.\d+\.\d+['"]?/.test(code)) p.push('gitleaks is not pinned to an exact version')
  if (!/GITLEAKS_SHA256:\s*['"]?[0-9a-f]{64}['"]?/.test(code)) p.push('gitleaks is not pinned to a checksum')
  if (!/sha256sum\s+(-c|--check)/.test(code)) p.push('the checksum is never checked')
  for (const m of code.matchAll(/^\s*-?\s*uses:\s*(\S+)/gm)) if (!/@[0-9a-f]{40}$/.test(m[1])) p.push(`the action ${m[1]} is not pinned by commit`)
  // No shell step runs a scan itself: under `bash -e` its exit would end the step before the summary (round 1, HIGH).
  if (/\bgitleaks"?\s+(?:git|dir|detect|stdin)\b/.test(code)) p.push('a shell step runs gitleaks itself — the scans go through secrets-scan.mjs')
  if (!/secrets-scan\.mjs change\b/.test(code)) p.push('the change scan does not go through secrets-scan.mjs')
  if (!/secrets-scan\.mjs history\b/.test(code)) p.push('the history scan does not go through secrets-scan.mjs')
  if (!/secrets-scan-selftest\.mjs/.test(code)) p.push('the workflow does not run this self-test')
  if (!/'--redact'/.test(runner)) p.push('secrets-scan.mjs does not pass --redact')
  if (/--verbose|'-v'|--log-level|debug|trace/.test(runner.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n'))) p.push('secrets-scan.mjs runs gitleaks verbose or at debug level, which prints what it finds')
  return p
}

/* Stand-in scanners for the self-check: plain Node programs that read `git log -p` with the --log-opts they are given,
   as gitleaks does, and answer as a scanner would. good — redacts; leaky — prints the secret and keeps it in its
   report; lax — exits 0 on a finding; blind — reads nothing and says "0 commits scanned". */
function standIn(kind) {
  const dir = mkdtempSync(join(tmpdir(), 'raptor-standin-'))
  const js = join(dir, 'scanner.mjs')
  writeFileSync(js, `
import { writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const KIND = ${JSON.stringify(kind)}
const a = process.argv.slice(2), repo = a[1], rp = a[a.indexOf('--report-path') + 1]
const opts = (a.find((x) => x.startsWith('--log-opts=')) || '--log-opts=').slice(11).split(' ').filter(Boolean)
const log = KIND === 'blind' ? '' : execFileSync('git', ['-C', repo, 'log', '-p', '-U0', ...opts], { encoding: 'utf8' })
const out = [], commits = new Set()
let commit = '', file = '', ln = 0, prev = ''
for (const l of log.split('\\n')) {
  let m
  if ((m = l.match(/^commit ([0-9a-f]{40})/))) { commit = m[1]; continue }
  if (l.startsWith('+++ ')) { file = l.slice(6); continue }
  if ((m = l.match(/^@@ -\\S+ \\+(\\d+)/))) { ln = Number(m[1]); continue }
  if (l.startsWith('+')) {
    commits.add(commit)
    const t = l.slice(1)
    const pw = t.match(/(?:password|token) = "([^"]+)"/)
    const red = (s) => (KIND === 'leaky' ? s : 'REDACTED')
    if (pw) out.push({ RuleID: 'generic-api-key', File: file, StartLine: ln, Commit: commit, Fingerprint: commit + ':' + file + ':generic-api-key:' + ln, Secret: red(pw[1]), Match: red(t) })
    if (t.startsWith('-----BEGIN')) out.push({ RuleID: 'private-key', File: file, StartLine: ln, Commit: commit, Fingerprint: commit + ':' + file + ':private-key:' + ln, Secret: 'x', Match: 'x', next: true })
    if (prev && out.length && out[out.length - 1].next) { const f = out[out.length - 1]; delete f.next; f.Secret = red(t); f.Match = red(t) }
    prev = t.startsWith('-----BEGIN') ? t : ''
    ln++
  }
}
for (const f of out) delete f.next
writeFileSync(rp, JSON.stringify(out))
if (KIND === 'leaky') console.log('Finding: ' + out.map((f) => f.Secret).join(' '))
console.error((KIND === 'blind' ? 0 : commits.size) + ' commits scanned.')
process.exit(KIND === 'lax' || KIND === 'blind' ? 0 : out.length ? 1 : 0)
`)
  return { bin: [process.execPath, js], dir }
}

const argv = process.argv.slice(2)
if (argv[0] === '--self-check') {
  let bad = 0
  const say = (ok, what) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}`); if (!ok) bad++ }
  const wp = workflowProblems()
  say(!wp.length, `the workflow keeps its promises${wp.length ? ': ' + wp.join('; ') : ''}`)
  for (const [kind, accepted] of [['good', true], ['leaky', false], ['lax', false], ['blind', false]]) {
    const s = standIn(kind)
    try {
      const r = check(s.bin)
      say((r.fails.length === 0) === accepted, `a ${kind} scanner is ${accepted ? 'accepted' : 'caught'}${r.fails.length ? ' (' + r.fails.join('; ') + ')' : ''}`)
    } finally { rmSync(s.dir, { recursive: true, force: true }) }
  }
  // A scanner that reads nothing turns a clean range red by itself — the "0 commits scanned" guard.
  const blind = standIn('blind')
  const A = repoA()
  try {
    const r = scan({ mode: 'change', bin: blind.bin, repo: A.d, range: `${A.c1}..${A.c2}`, event: 'pull_request' })
    say(r.exit === 1 && /read nothing/.test(printed(r)), 'a scan that reads nothing is red by itself')
  } finally { rmSync(blind.dir, { recursive: true, force: true }); rmSync(A.d, { recursive: true, force: true }) }
  process.exit(bad ? 1 : 0)
}

const bin = argv[0]
if (!bin) { console.error('usage: secrets-scan-selftest.mjs <gitleaks program> | --self-check'); process.exit(2) }
const r = check(bin)
for (const f of r.r1.found || []) console.log(`found, as it should: ${f.RuleID} at line ${f.StartLine}`)
if (r.fails.length) { for (const f of r.fails) console.log(`FAIL  ${f}`); process.exit(1) }
console.log('PASS  red on a planted fake (none of it printed), green on a clean commit, a merge-only fake found, history warns on a pull request and is red on a manual run')

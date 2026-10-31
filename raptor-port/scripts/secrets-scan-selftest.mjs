#!/usr/bin/env node
/* PROOF THAT THE SECRETS SCAN STILL CATCHES A KEY, AND NEVER PRINTS ONE — his D1408 (27 Oct 26), [REVIEW-LAYERS] step 4.
 *
 * A check nobody has seen go red is a check nobody knows works, and on a PUBLIC repository a scan that prints what it
 * found would publish the very key it caught. So before every real scan, .github/workflows/secrets-scan.yml runs:
 *
 *   node raptor-port/scripts/secrets-scan-selftest.mjs <path to the gitleaks program>
 *
 * which builds a throwaway git repository in the temp folder, commits one file holding two CLEARLY FAKE secrets — a
 * password line and a private-key block, both made here from pieces at run time so no file in this repository holds
 * either — and runs gitleaks on it the way the workflow runs it on the real history (`gitleaks git … --redact`).
 * It passes only if:
 *   1. gitleaks EXITS 1 (the scan fails the check) on the planted secrets, finding BOTH by their rules
 *      (`generic-api-key` for the password line, `private-key` for the key block);
 *   2. no eight characters running of either fake value appear in what gitleaks printed or in its report;
 *   3. the same scan of a clean repository EXITS 0 (the check does not fail on everything).
 * It prints only rule names and line numbers — never a line of the file.
 *
 *   node raptor-port/scripts/secrets-scan-selftest.mjs --self-check
 * proves THIS harness without gitleaks (his PC has none, and nothing is downloaded to it): it runs the same checks
 * against three stand-in scanners — one that behaves, one that prints the secret, one that never fails — and requires
 * the first to be accepted and the other two to be caught. It also reads the workflow and checks that it still pins
 * gitleaks by version and checksum, pins every action by commit, passes --redact to every gitleaks run, asks only to
 * read the code, runs on pull requests and pushes into main with no path filter, and runs this self-test.
 */
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync, chmodSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawnSync, execFileSync } from 'node:child_process'

const HERE = dirname(fileURLToPath(import.meta.url))
const WORKFLOW = join(HERE, '..', '..', '.github', 'workflows', 'secrets-scan.yml')

/* The fakes, from pieces. Nothing here is, or ever was, a real credential: the words say so. They are shaped to meet
   gitleaks' own default rules (v8.30.1, config/gitleaks.toml — the password: 24 letters and digits, entropy 4.58
   against the rule's 3.5, none of its 1,453 stopwords) and to stay clear of every real provider's token shape, so
   GitHub's push protection has nothing to recognise either. */
const FAKE_PASSWORD = ['Rq7Zt2Vw', '9Lm4Xk8P', 'n3Hc6Jd1'].join('')
const KEY_HEAD = ['-----BEGIN', 'PRIVATE', 'KEY-----'].join(' ')
const KEY_FOOT = ['-----END', 'PRIVATE', 'KEY-----'].join(' ')
const KEY_LINES = Array.from({ length: 4 }, (_, i) => `RAPTORSELFTEST${i}NOTAREALKEYNOTAREALKEYNOTAREALKEYNOTAREALKEY${i}`)
const PLANTED = [
  '# A throwaway file made by raptor-port/scripts/secrets-scan-selftest.mjs. Everything below is fake.',
  `raptor_selftest_password = "${FAKE_PASSWORD}"`,
  KEY_HEAD,
  ...KEY_LINES,
  KEY_FOOT,
  '',
].join('\n')
const CLEAN = '# A throwaway file with nothing secret in it.\nhello = "world"\n'
const SECRETS = [FAKE_PASSWORD, KEY_LINES[0]]
const RULES = ['generic-api-key', 'private-key']

const git = (cwd, ...args) => execFileSync('git', args, { cwd, stdio: 'ignore' })
function repoWith(content) {
  const dir = mkdtempSync(join(tmpdir(), 'raptor-secrets-'))
  git(dir, 'init', '-q')
  git(dir, 'config', 'user.email', 'selftest@example.invalid')
  git(dir, 'config', 'user.name', 'selftest')
  git(dir, 'config', 'commit.gpgsign', 'false')
  writeFileSync(join(dir, 'notes.txt'), content)
  git(dir, 'add', '.')
  git(dir, 'commit', '-q', '-m', 'selftest')
  return dir
}

/* One scan, as the workflow makes it: git mode, --redact, no banner, a JSON report. `viaShell` is for the Windows
   stand-in (a .cmd file) only; the real gitleaks never runs through a shell. */
function scan(bin, dir, viaShell = false) {
  const report = join(dirname(dir), `${basename(dir)}-report.json`)
  const args = ['git', dir, '--redact', '--no-banner', '--exit-code', '1', '--report-format', 'json', '--report-path', report]
  const r = viaShell
    ? spawnSync(`"${bin}"`, args.map((a) => `"${a}"`), { encoding: 'utf8', shell: true })
    : spawnSync(bin, args, { encoding: 'utf8' })
  const text = existsSync(report) ? readFileSync(report, 'utf8') : ''
  rmSync(report, { force: true })
  return { status: r.status, out: (r.stdout || '') + (r.stderr || ''), report: text, error: r.error }
}
// Any eight characters running of a secret, so a scanner that redacted only part of one is caught too.
const leaks = (text, secret) => { for (let i = 0; i + 8 <= secret.length; i++) if (text.includes(secret.slice(i, i + 8))) return true; return false }

function check(bin, viaShell = false) {
  const fails = []
  const dirty = repoWith(PLANTED)
  const clean = repoWith(CLEAN)
  try {
    const d = scan(bin, dirty, viaShell)
    if (d.error) fails.push(`could not run the scanner (${d.error.code || 'error'})`)
    if (d.status !== 1) fails.push(`the planted secrets gave exit ${d.status}, not 1 — the check would not fail`)
    let found = []
    try { found = JSON.parse(d.report || '[]') } catch { fails.push('the report is not JSON') }
    for (const rule of RULES) if (!found.some((f) => f.RuleID === rule)) fails.push(`no finding by the rule ${rule}`)
    SECRETS.forEach((s, i) => {
      if (leaks(d.out, s)) fails.push(`fake secret ${i + 1} was PRINTED in the scanner's output`)
      if (leaks(d.report, s)) fails.push(`fake secret ${i + 1} is in the report unredacted`)
    })
    const c = scan(bin, clean, viaShell)
    if (c.status !== 0) fails.push(`a clean repository gave exit ${c.status}, not 0 — the check would fail on everything`)
    return { fails, found: found.map((f) => `${f.RuleID} at line ${f.StartLine}`) }
  } finally {
    rmSync(dirty, { recursive: true, force: true })
    rmSync(clean, { recursive: true, force: true })
  }
}

/* The workflow's own promises, read from the file (the self-check only). */
function workflowProblems() {
  if (!existsSync(WORKFLOW)) return ['the workflow file is missing']
  const p = []
  const code = readFileSync(WORKFLOW, 'utf8').split('\n').filter((l) => !l.trim().startsWith('#')).join('\n')
  // [ \t], never \s, at a line's start: \s would run across a blank line and read the top level as indented.
  if (/^[ \t]*paths(-ignore)?[ \t]*:/m.test(code)) p.push('it has a path filter — a notes-only pull request would go unscanned')
  if (!/pull_request:\s*\n\s*branches:\s*\[main\]/.test(code)) p.push('it does not run on pull requests into main')
  if (!/push:\s*\n\s*branches:\s*\[main\]/.test(code)) p.push('it does not run on pushes to main')
  if (!/workflow_dispatch:/.test(code)) p.push('it has no manual run (the one scan of the whole history)')
  if (!/^permissions:[ \t]*\n[ \t]+contents:[ \t]*read[ \t]*\n(?![ \t]+\S)/m.test(code)) p.push('it asks for more than to read the code')
  if (/^[ \t]+permissions:/m.test(code)) p.push('a job asks for permissions of its own')
  if (!/GITLEAKS_VERSION:\s*['"]?\d+\.\d+\.\d+['"]?/.test(code)) p.push('gitleaks is not pinned to an exact version')
  if (!/GITLEAKS_SHA256:\s*['"]?[0-9a-f]{64}['"]?/.test(code)) p.push('gitleaks is not pinned to a checksum')
  if (!/sha256sum\s+(-c|--check)/.test(code)) p.push('the checksum is never checked')
  for (const m of code.matchAll(/^\s*-?\s*uses:\s*(\S+)/gm)) if (!/@[0-9a-f]{40}$/.test(m[1])) p.push(`the action ${m[1]} is not pinned by commit`)
  const runs = [...code.matchAll(/\bgitleaks"?\s+(?:git|dir|detect|stdin)\b[^\n]*/g)].map((m) => m[0])
  if (!runs.length) p.push('gitleaks never runs')
  for (const r of runs) if (!/--redact\b/.test(r)) p.push(`a gitleaks run without --redact: ${r.trim()}`)
  if (/--verbose|\bgitleaks\b[^\n]*\s-v\b|--log-level[= ]+(debug|trace)/.test(code)) p.push('gitleaks runs verbose or at debug level, which prints what it finds')
  if (!/secrets-scan-selftest\.mjs/.test(code)) p.push('the workflow does not run this self-test')
  return p
}

/* Three stand-in scanners for the self-check: plain Node programs that read the planted file and answer as a scanner
   would. "good" redacts; "leaky" prints the secret and keeps it in the report; "lax" never fails. */
function standIn(kind) {
  const dir = mkdtempSync(join(tmpdir(), 'raptor-standin-'))
  const js = join(dir, 'scanner.mjs')
  const secretOf = { pw: kind === 'leaky' ? 'pw[1]' : "'REDACTED'", key: kind === 'leaky' ? 'lines[i + 1]' : "'REDACTED'" }
  writeFileSync(js, [
    "import { readFileSync, writeFileSync } from 'node:fs'",
    "import { join } from 'node:path'",
    "const a = process.argv.slice(2), rp = a[a.indexOf('--report-path') + 1]",
    "const lines = readFileSync(join(a[1], 'notes.txt'), 'utf8').split('\\n'), out = []",
    'lines.forEach((l, i) => {',
    '  const pw = l.match(/password = "([^"]+)"/)',
    `  if (pw) out.push({ RuleID: 'generic-api-key', StartLine: i + 1, Secret: ${secretOf.pw} })`,
    `  if (l.startsWith('-----BEGIN')) out.push({ RuleID: 'private-key', StartLine: i + 1, Secret: ${secretOf.key} })`,
    '})',
    'writeFileSync(rp, JSON.stringify(out))',
    kind === 'leaky' ? "console.log('Finding: ' + out.map((f) => f.Secret).join(' '))" : '',
    `process.exit(${kind === 'lax' ? '0' : 'out.length ? 1 : 0'})`,
    '',
  ].join('\n'))
  if (process.platform === 'win32') {
    const cmd = join(dir, 'scanner.cmd')
    writeFileSync(cmd, `@node "${js}" %*\r\n`)
    return { bin: cmd, dir, viaShell: true }
  }
  const sh = join(dir, 'scanner')
  writeFileSync(sh, `#!/bin/sh\nexec node "${js}" "$@"\n`)
  chmodSync(sh, 0o755)
  return { bin: sh, dir, viaShell: false }
}

const argv = process.argv.slice(2)
if (argv[0] === '--self-check') {
  let bad = 0
  const say = (ok, what) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}`); if (!ok) bad++ }
  const wp = workflowProblems()
  say(!wp.length, `the workflow keeps its promises${wp.length ? ': ' + wp.join('; ') : ''}`)
  for (const [kind, accepted] of [['good', true], ['leaky', false], ['lax', false]]) {
    const s = standIn(kind)
    try {
      const r = check(s.bin, s.viaShell)
      say((r.fails.length === 0) === accepted, `a ${kind} scanner is ${accepted ? 'accepted' : 'caught'}${r.fails.length ? ' (' + r.fails.join('; ') + ')' : ''}`)
    } finally { rmSync(s.dir, { recursive: true, force: true }) }
  }
  process.exit(bad ? 1 : 0)
}

const bin = argv[0]
if (!bin) { console.error('usage: secrets-scan-selftest.mjs <gitleaks program> | --self-check'); process.exit(2) }
const r = check(bin)
for (const f of r.found) console.log(`found, as it should: ${f}`)
if (r.fails.length) { for (const f of r.fails) console.log(`FAIL  ${f}`); process.exit(1) }
console.log('PASS  the scan fails on a planted secret, prints none of it, and passes a clean repository')

#!/usr/bin/env node
/* THE SECRETS SCAN'S ONE RUNNER — his D1408 (27 Oct 26), [REVIEW-LAYERS] step 4. Fix round 1 of 31 Oct 26.
 *
 * .github/workflows/secrets-scan.yml calls this, and the self-test (secrets-scan-selftest.mjs) imports it, so the
 * self-test runs the very code that scans, prints the summary and decides red or green — not a copy of it. (Round 1's
 * fault: the scan and its exit decision lived in the workflow's shell, which GitHub runs as `bash -e`; gitleaks' exit 1
 * ended the step before the summary or the warning, and the self-test, which ran gitleaks its own way, never saw it.)
 *
 *   node raptor-port/scripts/secrets-scan.mjs change  --bin <gitleaks> --range <a..b> [--landed <a..b>] [--event <e>]
 *   node raptor-port/scripts/secrets-scan.mjs history --bin <gitleaks> [--event <e>]
 *
 * WHAT EACH READS (every read: `gitleaks git … --redact`, the binary files left out by git's own pathspec):
 *   change  — pass 1: every commit of the range, each commit's own added lines (a key added and taken out again in the
 *             same pull request is still caught — it stays in the history). Pass 2, with --landed: what LANDED, each
 *             merge compared with its first parent (`-m --first-parent`) — the lines a merge adds that no commit of
 *             its own adds, i.e. a conflict resolution, which pass 1 never sees (git shows a merge no change without -m;
 *             `--cc` would show only those lines, but gitleaks' diff reader, go-gitdiff 0.9.1, reads only
 *             "diff --git" headers, so `-m` it is). On a pull request --landed is base..the merge GitHub tests (one
 *             commit: the pull request's whole net change); on a push, before..after on main.
 *   history — pass 1 over every commit of every branch (`--all`); pass 2 over main's line, each merge against main
 *             before it (merges only). A finding pass 2 repeats from pass 1 (the same lines, now under the merge) is
 *             listed once more, marked "as landed", with its own fingerprint.
 *
 * RED OR GREEN: change — any finding is red (the merge gate). history — a finding is red on a manual run, and on a pull
 * request or a push a warning only (it is old; the pull request did not add it). Red everywhere: gitleaks could not run,
 * wrote no report, or READ NOTHING — no commit scanned while git shows added lines in that same read.
 *
 * NEVER PRINTED: a value. gitleaks' report is redacted; the summary takes from it only the rule, file, line, commit and
 * fingerprint; gitleaks' own output is passed on only as its counts. The report stays in the runner's temp folder.
 */
import { spawnSync, execFileSync } from 'node:child_process'
import { readFileSync, existsSync, rmSync, appendFileSync, mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

// Binary files: gitleaks allow-lists most of these by path anyway, and git shows no text for the rest; leaving them out
// spares fetching the pictures. One token each, no spaces — gitleaks splits --log-opts on spaces.
const BINARY = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tif', 'tiff', 'ico', 'mp4', 'webm', 'mov', 'pdf', 'pptx', 'docx', 'xlsx', 'zip', 'woff', 'woff2', 'ttf', 'otf']
export const SKIP = BINARY.map((e) => `:(exclude,icase)*.${e}`)
// gitleaks' own default is `--full-history --all --diff-filter=tuxdb`; the same, with our range in place of --all.
export const passOneOpts = (range) => ['--full-history', '--diff-filter=tuxdb', ...range, '--', '.', ...SKIP]
// Merges only: pass 1 already reads every other commit's own lines.
export const passTwoOpts = (range) => ['-m', '--first-parent', '--merges', '--diff-filter=tuxdb', ...range, '--', '.', ...SKIP]

/* `bin` is the gitleaks program, or [program, ...first args] (the self-check's stand-ins run as `node scanner.mjs`). */
export function gitleaks(bin, repo, logOpts, reportPath) {
  const [exe, ...pre] = Array.isArray(bin) ? bin : [bin]
  rmSync(reportPath, { force: true })
  const args = [...pre, 'git', repo, '--redact', '--no-banner', '--exit-code', '1', '--report-format', 'json', '--report-path', reportPath, `--log-opts=${logOpts.join(' ')}`]
  const r = spawnSync(exe, args, { encoding: 'utf8', maxBuffer: 1 << 28 })
  const out = (r.stdout || '') + (r.stderr || '')
  let findings = null
  if (existsSync(reportPath)) { try { findings = JSON.parse(readFileSync(reportPath, 'utf8') || '[]') } catch { findings = null } }
  const m = out.match(/(\d+) commits scanned/)
  return { status: r.status, error: r.error ? (r.error.code || 'error') : null, findings, scanned: m ? Number(m[1]) : null, out }
}

/* How many commits of the same read add at least one text line — what gitleaks should have scanned (it counts only
   commits with additions). */
export function commitsWithAdditions(repo, logOpts) {
  const raw = execFileSync('git', ['-C', repo, 'log', '--format=%x1e', '--numstat', ...logOpts], { encoding: 'utf8', maxBuffer: 1 << 28 })
  return raw.split('\x1e').filter((block) => block.split('\n').some((l) => /^[1-9]\d*\t/.test(l))).length
}

const line = (f, tag) => `- ${f.RuleID} in ${f.File} line ${f.StartLine}, commit ${String(f.Commit || '').slice(0, 12)}${tag} — fingerprint ${f.Fingerprint}`

/* One pass: run, then judge whether the read was real. Returns findings (redacted) or an error, never a value. */
function pass(bin, repo, logOpts, reportPath) {
  const g = gitleaks(bin, repo, logOpts, reportPath)
  rmSync(reportPath, { force: true })
  if (g.error) return { error: `gitleaks could not be started (${g.error})` }
  if (g.status !== 0 && g.status !== 1) return { error: `gitleaks stopped with exit ${g.status}` }
  if (g.findings === null) return { error: 'gitleaks wrote no report' }
  if (g.status === 0 && g.findings.length) return { error: 'gitleaks found something but exited 0' }
  if (g.status === 1 && !g.findings.length) return { error: 'gitleaks exited 1 with nothing in its report (a failed scan)' }
  if (g.scanned === null) return { error: 'gitleaks did not say how many commits it scanned' }
  const expected = commitsWithAdditions(repo, logOpts)
  if (expected > 0 && g.scanned === 0) return { error: `gitleaks read nothing: 0 commits scanned where git shows ${expected} adding lines` }
  return { findings: g.findings, scanned: g.scanned, expected }
}

/* The whole scan of one mode: passes, summary, decision. Pure apart from running git and gitleaks. */
export function scan({ mode, bin, repo = '.', range = '', landed = '', event = '', tmp = tmpdir() }) {
  const dir = mkdtempSync(join(tmp, 'secrets-scan-'))
  const passes = []
  try {
    if (mode === 'change') {
      if (!range) return { exit: 1, lines: ['### Secrets scan: no range given — nothing was scanned'], annotations: ['::error title=Secrets scan::no range to scan'] }
      passes.push({ name: 'the commits', ...pass(bin, repo, passOneOpts([range]), join(dir, 'p1.json')) })
      if (landed) passes.push({ name: 'what landed (merges against their first parent)', tag: ' (as landed)', ...pass(bin, repo, passTwoOpts([landed]), join(dir, 'p2.json')) })
    } else if (mode === 'history') {
      passes.push({ name: 'every commit of every branch', ...pass(bin, repo, passOneOpts(['--all']), join(dir, 'p1.json')) })
      const main = ['origin/main', 'main'].find((r) => { try { execFileSync('git', ['-C', repo, 'rev-parse', '--verify', '--quiet', r], { stdio: 'ignore' }); return true } catch { return false } })
      if (main) passes.push({ name: `${main}'s merges against main before them`, tag: ' (as landed)', ...pass(bin, repo, passTwoOpts([main]), join(dir, 'p2.json')) })
    } else {
      return { exit: 2, lines: [`unknown mode ${mode}`], annotations: [] }
    }
  } finally { rmSync(dir, { recursive: true, force: true }) }

  const where = mode === 'change' ? 'this change' : 'the whole history'
  const errors = passes.filter((p) => p.error)
  const found = passes.flatMap((p) => (p.findings || []).map((f) => line(f, p.tag || '')))
  const lines = [`### Secrets scan: ${found.length ? `${found.length} found in ${where} (values redacted)` : `nothing found in ${where}`}`]
  for (const p of passes) lines.push(p.error ? `- ${p.name}: **could not be read** — ${p.error}` : `- ${p.name}: ${p.scanned} commits scanned (${p.expected} add lines)`)
  lines.push(...found)
  const annotations = []
  let exit = 0
  if (errors.length) { exit = 1; annotations.push(`::error title=Secrets scan::${where} could not be read — ${errors.map((e) => e.error).join('; ')}`) }
  if (found.length) {
    if (mode === 'change' || event === 'workflow_dispatch') { exit = 1; annotations.push(`::error title=Secrets scan::${found.length} found in ${where} — read the run's summary (raptor-port/docs/gates-and-deploy.md, D1408)`) }
    else annotations.push(`::warning title=Secrets in the history::${found.length} found that this change did not add — read the run's summary and decide each (raptor-port/docs/gates-and-deploy.md, D1408)`)
  }
  return { exit, lines, annotations, found: passes.flatMap((p) => p.findings || []) }
}

/* The command line, as the workflow calls it. */
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const a = process.argv.slice(2)
  const opt = (n) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] || '' : '' }
  const r = scan({ mode: a[0], bin: opt('--bin'), range: opt('--range'), landed: opt('--landed'), event: opt('--event'), tmp: process.env.RUNNER_TEMP || tmpdir() })
  console.log(r.lines.join('\n'))
  for (const n of r.annotations) console.log(n)
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, r.lines.join('\n') + '\n\n')
  process.exit(r.exit)
}

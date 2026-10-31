#!/usr/bin/env node
// THE CODE CHECK — React Doctor's "no new finding" check (his D1534, D1536 point 4, D1539; 31 Oct 26).
//
// One script, three callers, so all three read React Doctor's answer the same way:
//   - `npm run lint:changed` — by hand, before a push (raptor-port/CLAUDE.md §Coding conventions);
//   - the "code check" job in .github/workflows/deploy.yml — on every pull request into main;
//   - the end-of-session run, .claude/hooks/code-check-stop.mjs — reports the count to the chat, blocks nothing.
//
// It runs React Doctor 0.9.18 in its "changed" mode: the files this branch changes against main are read twice, as main
// has them and as the branch has them, and only the findings the branch ADDS are reported — an old finding in a touched
// file is not this change's (the other areas' old findings ride with each area's next batch, D1534).
//
// WHY THIS SCRIPT READS THE JSON REPORT AND NOT THE EXIT CODE: when React Doctor cannot work out main's side — a shallow
// copy with no shared starting point, or main's side failing to read — it quietly falls back to listing every finding in
// the changed files AND skips its own pass/fail ("baselineDegraded", read in its 0.9.18 source, 31 Oct 26): the run
// passes whatever the change holds. So a run counts only when its report says it compared (mode "baseline", not
// degraded, no check skipped); anything else is "could not compare" and fails loud.
//
// Exit codes: 0 no new finding · 1 new findings · 2 could not compare (the tool failed, or the comparison was not made).
// Usage: node scripts/code-check.mjs [--base <ref>] [--include-untracked]   (from raptor-port/; base defaults to origin/main)
import { spawn, spawnSync } from 'node:child_process'
import { appendFileSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const DOCTOR_VERSION = '0.9.18'
const PORT = join(dirname(fileURLToPath(import.meta.url)), '..')

/** On Windows `npx` is a .cmd file, which only a shell can start; each word is quoted for that shell. */
const quoteWin = (a) => (/[\s"&|<>^()]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a)

/**
 * Run the check and read its report. Never throws: every failure comes back as `{ status: 'error', reason }`.
 * Returns `{ status: 'clean' | 'new' | 'error', newCount, matchedCount, changedFiles, findings, reason, base }`.
 */
export async function runCheck({ base = 'origin/main', includeUntracked = false, timeoutMs = 10 * 60 * 1000, cwd = PORT } = {}) {
  let dir = null
  try {
    dir = mkdtempSync(join(tmpdir(), 'code-check-'))
    const out = join(dir, 'report.json')
    const run = await runTool('npx', doctorArgs({ base, includeUntracked, timeoutMs, out }), { cwd, timeoutMs })
    if (run.error) return fail(base, `React Doctor did not start: ${run.error.message}`)
    if (run.timedOut) return fail(base, `React Doctor took longer than ${Math.round(timeoutMs / 1000)} s`)
    let report
    try { report = JSON.parse(readFileSync(out, 'utf8')) } catch {
      const tail = run.out.trim().split('\n').slice(-8).join('\n')
      return fail(base, `React Doctor wrote no report (exit ${run.status})${tail ? `:\n${tail}` : ''}`)
    }
    return read(report, base)
  } catch (e) {
    return fail(base, `the check could not run: ${e && e.message ? e.message : e}`)
  } finally {
    if (dir) try { rmSync(dir, { recursive: true, force: true }) } catch { /* a temp folder left behind is harmless */ }
  }
}

/**
 * Start a program and wait for it, keeping the last of its output. Past `timeoutMs` the WHOLE tree it started is stopped —
 * not only the first process: on Windows the run goes through a shell, and a timer that kills only the shell leaves npx,
 * React Doctor and its linters running on underneath it (the fresh read's finding 1, 31 Oct 26 — proved there). So:
 * `taskkill /T` on Windows; on Linux and macOS the run is its own process group, and the group is stopped.
 */
export function runTool(cmd, args, { cwd, timeoutMs }) {
  return new Promise((done) => {
    const win = process.platform === 'win32'
    let out = ''
    let timedOut = false
    let settled = false
    // once settled, the pipes are let go: a survivor still holding one must never keep this process (or the hook) waiting
    const finish = (r) => {
      if (settled) return
      settled = true; clearTimeout(timer); clearTimeout(grace)
      try { child.stdout.destroy(); child.stderr.destroy(); child.unref() } catch { /* already closed */ }
      done({ out, timedOut, ...r })
    }
    let grace = null
    const child = spawn(win ? [cmd, ...args].map(quoteWin).join(' ') : cmd, win ? [] : args,
      { cwd, shell: win, detached: !win, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
    const keep = (d) => { out = (out + d).slice(-20000) }
    child.stdout.on('data', keep)
    child.stderr.on('data', keep)
    const timer = setTimeout(() => {
      timedOut = true
      try {
        if (win) spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, timeout: 15000 })
        else process.kill(-child.pid, 'SIGKILL')
      } catch { /* already gone */ }
      grace = setTimeout(() => finish({ status: null }), 5000) // a pipe some survivor still holds never keeps us waiting
    }, timeoutMs)
    child.on('error', (error) => finish({ error }))
    child.on('close', (status) => finish({ status }))
  })
}

/**
 * React Doctor's command line. It is also given its own time limit, 15 s inside the kill timer, so that a slow run usually
 * ends by itself, tidily, and marks its report as not compared (which `read` refuses) before anything has to be stopped.
 */
export function doctorArgs({ base, includeUntracked = false, timeoutMs, out }) {
  const args = ['-y', `react-doctor@${DOCTOR_VERSION}`, '--no-telemetry', '--no-supply-chain', '--scope', 'changed',
    '--base', base, '--blocking', 'warning', '--max-duration', String(Math.max(10, Math.floor(timeoutMs / 1000) - 15)),
    '--json', '--json-out', out]
  if (includeUntracked) args.push('--include-untracked')
  return args
}

const fail = (base, reason) => ({ status: 'error', reason, base, newCount: 0, matchedCount: 0, changedFiles: 0, findings: [] })

/** Decide from the report alone. Exported for the self-test of the hook. */
export function read(report, base) {
  if (!report || typeof report !== 'object') return fail(base, 'the report is empty')
  if (report.error) {
    const e = report.error
    return fail(base, `React Doctor reported an error: ${typeof e === 'string' ? e : e.message || JSON.stringify(e)}`)
  }
  if (report.baselineDegraded) return fail(base, `React Doctor could not read ${base}'s side, so it compared nothing (its own pass/fail is switched off then)`)
  if (report.mode !== 'baseline' || !report.baseline) return fail(base, `React Doctor did not compare against ${base} (mode "${report.mode}")`)
  const skipped = (report.projects || []).flatMap((p) => p.skippedChecks || [])
  if (skipped.length) return fail(base, `React Doctor skipped part of the check: ${skipped.map((s) => (typeof s === 'string' ? s : JSON.stringify(s))).join(', ')}`)
  const findings = (report.diagnostics || []).map((d) => ({
    file: d.filePath, line: d.line, rule: `${d.plugin ? `${d.plugin}/` : ''}${d.rule}`, severity: d.severity, title: d.title || d.message || d.rule,
  }))
  // `newCount` and the list should agree; if ever they do not, the larger is believed — a finding is never dropped.
  const newCount = Math.max(Number(report.baseline.newCount) || 0, findings.length)
  return {
    status: newCount ? 'new' : 'clean', newCount, findings, base,
    matchedCount: Number(report.baseline.matchedCount) || 0,
    changedFiles: Number(report.diff && report.diff.changedFileCount) || 0,
  }
}

/** One plain line, for the chat and the log. */
export function sentence(r) {
  if (r.status === 'error') return `Code check could not compare against ${r.base}: ${r.reason}`
  const files = `${r.changedFiles} changed file${r.changedFiles === 1 ? '' : 's'}`
  if (r.status === 'clean') return `Code check: no new finding (${files} read against ${r.base}).`
  return `Code check: ${r.newCount} new finding${r.newCount === 1 ? '' : 's'} in ${files} read against ${r.base} — fix each, or keep it with its reason in a disable comment on the line above (raptor-port/CLAUDE.md §Coding conventions).`
}

// GitHub's annotation syntax: these three characters must be escaped in a message, and `:` and `,` too in a property
// (`file=`, `title=`) — the fresh read's finding 4.
const esc = (s) => String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')
const escProp = (s) => esc(s).replace(/:/g, '%3A').replace(/,/g, '%2C')

async function main() {
  const argv = process.argv.slice(2)
  const at = argv.indexOf('--base')
  const base = at >= 0 && argv[at + 1] ? argv[at + 1] : 'origin/main'
  const r = await runCheck({ base, includeUntracked: argv.includes('--include-untracked') })
  console.log(sentence(r))
  for (const f of r.findings) console.log(`  ${f.file}:${f.line}  ${f.title}  (${f.rule}, ${f.severity})`)
  if (process.env.GITHUB_ACTIONS === 'true') {
    // a mark on the pull request's changed line, and a short note on the run's summary page
    for (const f of r.findings) console.log(`::error file=raptor-port/${escProp(f.file)},line=${Number(f.line) || 1},title=${escProp(f.rule)}::${esc(f.title)}`)
    if (r.status === 'error') console.log(`::error title=code check::${esc(r.reason)}`)
    if (process.env.GITHUB_STEP_SUMMARY) {
      const rows = r.findings.map((f) => `| \`raptor-port/${f.file}:${f.line}\` | ${f.title} | \`${f.rule}\` |`)
      try {
        appendFileSync(process.env.GITHUB_STEP_SUMMARY, [`### ${sentence(r)}`, '', ...(rows.length ? ['| Where | What | Rule |', '|---|---|---|', ...rows, ''] : [])].join('\n') + '\n')
      } catch { /* the summary page is a convenience; the log above carries the same */ }
    }
  }
  process.exitCode = r.status === 'clean' ? 0 : r.status === 'new' ? 1 : 2
}

// run only when started as a program — the hook imports runCheck/sentence without running a check
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()

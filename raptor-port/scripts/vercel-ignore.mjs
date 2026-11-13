/* VERCEL'S IGNORED BUILD STEP — his D2032 (13 Nov 26), [VERCEL-SKIP-NOTES].
 *
 * Vercel runs this (vercel.json → "ignoreCommand") from the repo root before every build. Exit 0 = SKIP the build (the
 * deployment shows as Canceled, the branch's preview link keeps the last build); exit 1 = BUILD as normal (Vercel's docs,
 * Project settings → Ignored Build Step, read 13 Nov 26).
 *
 * The rule: skip only when every file that differs from the last version Vercel BUILT for this branch is a note. The
 * base is VERCEL_GIT_PREVIOUS_SHA — "the git SHA of the last successful deployment for the project and branch", empty on
 * a branch's first deployment (Vercel's system environment variables page). A skipped deployment is not successful, so
 * the base stays at the last real build and several notes-only pushes in a row are all measured against it.
 *
 * Anything it cannot tell — no base, the base not in Vercel's shallow clone (depth 10) even after a deeper fetch, a git
 * error, no changed files listed — BUILDS: a wrong build costs a few minutes, a wrong skip leaves the live app stale.
 *
 * "A note" follows the shipping rule's "only notes" list (.claude/rules/shipping.md) as far as file names can tell it,
 * widened only where the build cannot read the file either: the rulings files, HANDOFF*.md (its archive and next-steps
 * file with it), OUTSTANDING*.md, and everything under raptor-port/docs/ (the reference documents, the evidence sheets
 * and their pictures; the working guides there too — the app's build reads nothing under docs/). Everything else builds:
 * the app, its build files, vercel.json, the scripts (this one included), .github, the agent's own guides and hooks.
 *
 * Tests: node --test raptor-port/scripts/vercel-ignore.test.mjs */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const NOTE_PATTERNS = [
  /^\.claude\/rules\/decisions\//,
  /^\.claude\/decisions-full\//,
  /^DECISIONS[^/]*\.md$/,
  /^HANDOFF[^/]*\.md$/,
  /^OUTSTANDING[^/]*\.md$/,
  /^raptor-port\/docs\//,
]

export function isNote(path) {
  return NOTE_PATTERNS.some(p => p.test(path))
}

/* files: the changed paths, or null when they could not be listed. Returns { build, reason }. */
export function decide({ base, files }) {
  if (!base) return { build: true, reason: 'no earlier build on this branch (its first deployment) — building' }
  if (files === null) return { build: true, reason: 'could not list what changed since ' + base.slice(0, 9) + ' — building to be safe' }
  if (files.length === 0) return { build: true, reason: 'no changed files listed since ' + base.slice(0, 9) + ' — building to be safe' }
  const app = files.filter(f => !isNote(f))
  if (app.length) {
    const shown = app.slice(0, 5).join(', ') + (app.length > 5 ? ' and ' + (app.length - 5) + ' more' : '')
    return { build: true, reason: app.length + ' changed file(s) are not notes (' + shown + ') — building' }
  }
  return { build: false, reason: 'all ' + files.length + ' changed file(s) since ' + base.slice(0, 9) + ' are notes — skipping the build' }
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

function hasCommit(sha) {
  try { git(['cat-file', '-e', sha + '^{commit}']); return true } catch { return false }
}

/* the changed paths between base and HEAD, or null. Deepens Vercel's shallow clone once if the base is not in it. */
export function changedFiles(base) {
  try {
    if (!hasCommit(base)) {
      try { git(['fetch', '--quiet', '--depth=200', 'origin', base]) } catch { /* not fetchable by sha — try deepening */ }
      if (!hasCommit(base)) {
        try { git(['fetch', '--quiet', '--deepen=200']) } catch { /* nothing more to try */ }
      }
      if (!hasCommit(base)) return null
    }
    /* -z: names are NUL-separated and never quoted; --no-renames: a rename lists both its old and new name */
    const out = git(['diff', '--name-only', '--no-renames', '-z', base, 'HEAD'])
    return out.split('\0').filter(Boolean)
  } catch {
    return null
  }
}

function main() {
  let result
  try {
    const base = (process.env.VERCEL_GIT_PREVIOUS_SHA || '').trim()
    result = decide({ base, files: base ? changedFiles(base) : null })
  } catch (e) {
    result = { build: true, reason: 'the check failed (' + (e && e.message) + ') — building to be safe' }
  }
  console.log('[vercel-ignore] ' + result.reason)
  process.exit(result.build ? 1 : 0)
}

if (process.argv[1] && resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1])) main()

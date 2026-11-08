#!/usr/bin/env node
// The "checks passed" summary of a pull request's run ([TESTS-REQUIRED-ON-MAIN], found by Astra 8 Nov 26; built by
// chat 19). GitHub's one ruleset on main requires only the secrets scan, so a pull request whose tests failed or timed
// out could still be merged there. One job that GitHub can REQUIRE closes that: it runs on every pull request, passes a
// notes-only one, and otherwise passes only when a whole gate run passed.
//
// Why the notes-only skip moved out of the workflow's trigger for pull requests: a workflow skipped by `paths-ignore`
// never starts, so its jobs report nothing, and a REQUIRED job that reports nothing leaves every notes-only pull request
// waiting for ever. So on a pull request the workflow always starts; its first job ("what changed") runs this script's
// `changes` mode, and the gate jobs run only when it says code changed. A push to main keeps `paths-ignore`.
//
//   node checks-passed.mjs changes   < file list   → writes code=true|false to $GITHUB_OUTPUT
//   node checks-passed.mjs verdict                 → reads NEEDS (the run's `needs` as JSON) and EVENT; exit 0 or 1
// Tests: node --test raptor-port/scripts/ci/checks-passed.test.mjs (the Docs guard runs them on every pull request)
import { appendFileSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The files a change of only notes may touch — the SAME list as deploy.yml's push `paths-ignore` (a test compares them). */
export const NOTES_ONLY = [
  '**.md',
  '.claude/**',
  '.impeccable/**',
  'raptor-port/scripts/docsize*.mjs',
  'raptor-port/scripts/backlog-archive.mjs',
  '.github/workflows/docs-guard.yml',
];
/** GitHub's pattern rules: `**` crosses folders, `*` does not. */
const toRe = (g) => new RegExp('^' + g.split(/(\*\*|\*)/).map((p) => (p === '**' ? '.*' : p === '*' ? '[^/]*' : p.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))).join('') + '$');
const PATTERNS = NOTES_ONLY.map(toRe);

/** True when every file is a note; an empty list (nothing could be read) is never notes-only — the gates run. */
export function notesOnly(files) {
  const list = files.map((f) => f.trim()).filter(Boolean);
  return list.length > 0 && list.every((f) => PATTERNS.some((re) => re.test(f)));
}

const GATES = ['pc', 'build', 'unit', 'geometry', 'tracker', 'code-check'];
const SPLIT = ['build', 'unit', 'geometry', 'tracker'];

/** { ok, why } for a run's `needs`. A job skipped by its condition reports success to GitHub, so a skipped gate is
 *  never taken as a pass: a code change passes only when the PC's whole run, or every split job, passed. */
export function verdict(needs, event) {
  const n = needs && typeof needs === 'object' ? needs : {};
  const r = (k) => (n[k] && n[k].result) || 'missing';
  if (r('changes') !== 'success') return { ok: false, why: `the first job, which decides what changed, ended "${r('changes')}"` };
  const bad = GATES.filter((k) => ['failure', 'cancelled'].includes(r(k)));
  if (bad.length) return { ok: false, why: `${bad.map((k) => `${k} ${r(k)}`).join(', ')}` };
  // only a plain "false" is notes only: a first job that passed without writing its answer (its step id or output
  // renamed) would otherwise skip every gate and pass (the Opus read, 8 Nov 26)
  const code = String(n.changes.outputs && n.changes.outputs.code);
  if (code === 'false') return { ok: true, why: 'notes only — the gates skip a change of only notes' };
  if (code !== 'true') return { ok: false, why: `the first job gave no answer on what changed (code "${code}")` };
  if (r('pc') !== 'success' && !SPLIT.every((k) => r(k) === 'success')) {
    return { ok: false, why: `no whole gate run passed (pc ${r('pc')}; ${SPLIT.map((k) => `${k} ${r(k)}`).join(', ')})` };
  }
  if (event === 'pull_request' && r('code-check') !== 'success') return { ok: false, why: `code-check ${r('code-check')}` };
  return { ok: true, why: 'every gate passed' };
}

if (process.argv[1] && basename(process.argv[1]) === basename(fileURLToPath(import.meta.url))) {
  const mode = process.argv[2];
  if (mode === 'changes') {
    const files = readFileSync(0, 'utf8').split('\n');
    const code = !notesOnly(files);
    console.log(code ? `code changed: the gates run (${files.filter(Boolean).length} files)` : 'notes only: the gates skip this change');
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `code=${code}\n`);
  } else if (mode === 'verdict') {
    let needs = null;
    try { needs = JSON.parse(process.env.NEEDS || 'null'); } catch { needs = null; }
    const v = verdict(needs, process.env.EVENT);
    console.log(`${v.ok ? 'PASSED' : 'FAILED'}: ${v.why}`);
    process.exit(v.ok ? 0 : 1);
  } else {
    console.error('usage: checks-passed.mjs changes|verdict');
    process.exit(2);
  }
}

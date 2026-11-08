// Tests for checks-passed.mjs ([TESTS-REQUIRED-ON-MAIN], chat 19, 8 Nov 26). Run: node --test raptor-port/scripts/ci/checks-passed.test.mjs
// — the Docs guard runs this file on every pull request and push to main, so the notes-only list cannot drift unseen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { NOTES_ONLY, notesOnly, verdict } from './checks-passed.mjs';

const ok = (r) => ({ result: r });
const PR = 'pull_request';
const needs = (code, rest) => ({ changes: { result: 'success', outputs: { code: String(code) } }, ...rest });
const SPLIT = { pc: ok('skipped'), build: ok('success'), unit: ok('success'), geometry: ok('success'), tracker: ok('success'), 'code-check': ok('success') };
const SKIPPED = { pc: ok('skipped'), build: ok('skipped'), unit: ok('skipped'), geometry: ok('skipped'), tracker: ok('skipped'), 'code-check': ok('skipped') };

test('a pull request that changes only notes is notes-only; one code file anywhere is not', () => {
  assert.equal(notesOnly(['HANDOFF.md', 'OUTSTANDING.md', '.claude/rules/decisions/oil.md', '.impeccable/config.json', 'raptor-port/docs/x.md']), true);
  assert.equal(notesOnly(['raptor-port/scripts/docsize.mjs', 'raptor-port/scripts/docsize-lib.mjs', 'raptor-port/scripts/backlog-archive.mjs', '.github/workflows/docs-guard.yml']), true);
  assert.equal(notesOnly(['HANDOFF.md', 'raptor-port/src/ui/board.ts']), false);
  assert.equal(notesOnly(['.github/workflows/deploy.yml']), false);
  assert.equal(notesOnly(['raptor-port/.impeccable/config.json']), false);   // only the top folder's .impeccable is skipped
  assert.equal(notesOnly(['.gitattributes']), false);
  assert.equal(notesOnly([]), false);                                         // nothing read: run the gates
});

test('the notes-only list is the same as the workflow push trigger\'s paths-ignore list', () => {
  const yml = readFileSync(fileURLToPath(new URL('../../../.github/workflows/deploy.yml', import.meta.url)), 'utf8');
  const push = /\n  push:\n[\s\S]*?paths-ignore:\n((?:      - .*\n)+)/.exec(yml);
  assert.ok(push, 'the push trigger has a paths-ignore list');
  const listed = push[1].trim().split('\n').map((l) => l.replace(/^\s*- '?|'?\s*$/g, ''));
  assert.deepEqual(listed, NOTES_ONLY);
});

test('passes a notes-only pull request, whose gates were skipped', () => {
  assert.equal(verdict(needs(false, SKIPPED), PR).ok, true);
});

test('passes a code pull request whose gates all passed — on GitHub\'s machines or on his PC', () => {
  assert.equal(verdict(needs(true, SPLIT), PR).ok, true);
  const pc = { ...SKIPPED, pc: ok('success'), 'code-check': ok('success') };
  assert.equal(verdict(needs(true, pc), PR).ok, true);
});

test('fails when any gate failed, was cancelled or timed out', () => {
  for (const k of ['build', 'unit', 'geometry', 'tracker', 'code-check']) {
    for (const r of ['failure', 'cancelled']) {
      const v = verdict(needs(true, { ...SPLIT, [k]: ok(r) }), PR);
      assert.equal(v.ok, false, `${k} ${r}`);
      assert.match(v.why, new RegExp(k));
    }
  }
});

test('fails a code pull request where no full gate run passed — every gate skipped', () => {
  assert.equal(verdict(needs(true, SKIPPED), PR).ok, false);
  assert.equal(verdict(needs(true, { ...SPLIT, geometry: ok('skipped') }), PR).ok, false);
});

test('fails a code pull request whose code check did not run', () => {
  assert.equal(verdict(needs(true, { ...SPLIT, 'code-check': ok('skipped') }), PR).ok, false);
});

test('fails when the first job, which decides what changed, did not pass', () => {
  assert.equal(verdict({ ...SKIPPED, changes: ok('failure') }, PR).ok, false);
  assert.equal(verdict({ ...SKIPPED, changes: ok('cancelled') }, PR).ok, false);
  assert.equal(verdict({ ...SPLIT }, PR).ok, false);
  assert.equal(verdict(null, PR).ok, false);
});

test('fails when the first job passed but gave no answer — never read as notes only (the Opus read, 8 Nov 26)', () => {
  for (const changes of [{ result: 'success', outputs: {} }, { result: 'success', outputs: { code: '' } }, { result: 'success' }]) {
    assert.equal(verdict({ ...SKIPPED, changes }, PR).ok, false, JSON.stringify(changes));
  }
  assert.equal(verdict(needs(false, SKIPPED), PR).ok, true);
});

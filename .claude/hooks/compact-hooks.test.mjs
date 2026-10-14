// Tests for the compaction hooks ([COMPACT-WHEN-MOD], D868, D870, D871).
// Run: node --test .claude/hooks/compact-hooks.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readFill, bandOf, gitDir } from './compact-lib.mjs';
import { reminder } from './compact-watch.mjs';
import { decide } from './compact-guard.mjs';
import { blockFor, message } from './compact-resume.mjs';
import { line } from './statusline.mjs';

const dir = mkdtempSync(join(tmpdir(), 'compact-test-'));
const asst = (input, created, read, extra = {}) => JSON.stringify({ type: 'assistant', ...extra, message: { usage: { input_tokens: input, cache_creation_input_tokens: created, cache_read_input_tokens: read, output_tokens: 9 } } });
const transcript = (name, lines) => { const p = join(dir, name); writeFileSync(p, lines.join('\n') + '\n'); return p; };

test('reads the fullness from the last main-chat request in the record', () => {
  const p = transcript('a.jsonl', [
    asst(2, 1000, 100000),
    JSON.stringify({ type: 'user', message: { content: 'x' } }),
    asst(2, 7154, 328667),
    asst(5, 5, 900000, { isSidechain: true }), // a helper's request is not this chat's fullness
    JSON.stringify({ type: 'pr-link', prNumber: 1 }),
  ]);
  assert.deepEqual(readFill(p), { tokens: 335823, pct: 33.6 });
});

test('knows nothing when the record is missing, has no counts, or a compaction came after the last request', () => {
  assert.equal(readFill(join(dir, 'none.jsonl')), null);
  assert.equal(readFill(undefined), null);
  assert.equal(readFill(transcript('b.jsonl', [JSON.stringify({ type: 'user' })])), null);
  assert.equal(readFill(transcript('c.jsonl', [asst(1, 1, 850000), JSON.stringify({ type: 'system', subtype: 'compact_boundary' })])), null);
});

test('the reminder speaks once per band from 80%, and not below', () => {
  assert.equal(bandOf(79.9), 0);
  assert.equal(bandOf(80), 80);
  assert.equal(bandOf(93), 90);
  assert.equal(reminder({ tokens: 700000, pct: 70 }, 0), '');
  const r = reminder({ tokens: 812000, pct: 81.2 }, 0);
  assert.match(r, /81% full/);
  assert.match(r, /ask him once/); // D871: nearly done and he is here → offer a handoff
  assert.match(r, /compact-ready\.mjs/);
  assert.equal(reminder({ tokens: 830000, pct: 83 }, 80), ''); // same band: silent
  assert.match(reminder({ tokens: 860000, pct: 86 }, 80), /86% full/);
  assert.equal(reminder(null, 0), '');
});

test('the guard holds an automatic compaction only under 90% and only without a fresh mark', () => {
  const f = (pct) => ({ tokens: pct * 10000, pct });
  assert.equal(decide({ trigger: 'auto', fill: f(86), ready: null }), 'hold');
  assert.equal(decide({ trigger: 'auto', fill: f(86), ready: { at: 1 } }), 'allow');
  assert.equal(decide({ trigger: 'auto', fill: f(90), ready: null }), 'allow'); // never later than the backstop
  assert.equal(decide({ trigger: 'auto', fill: null, ready: null }), 'allow'); // cannot tell → do what the app does
  assert.equal(decide({ trigger: 'manual', fill: f(50), ready: null }), 'allow'); // his /compact is never held
});

test('after a compaction it hands back this branch\'s own block, whole', () => {
  const h = ['# HANDOFF', '## Now', '<!-- now:claude/a -->', '### a', '- quotes <!-- now:claude/b --> inline', '<!-- /now -->', '', '<!-- now:claude/b -->', '### b', '<!-- /now -->'].join('\n');
  assert.equal(blockFor(h, 'claude/a'), '<!-- now:claude/a -->\n### a\n- quotes <!-- now:claude/b --> inline\n<!-- /now -->');
  assert.equal(blockFor(h, 'claude/b'), '<!-- now:claude/b -->\n### b\n<!-- /now -->');
  assert.equal(blockFor(h, 'claude/none'), '');
  assert.match(message('claude/a', 'BLOCK'), /re-read[\s\S]*BLOCK$/);
  assert.match(message('claude/x', ''), /No HANDOFF\.md block found for claude\/x/);
});

test('git answers from this folder when the folder handed in is written the POSIX way (found 15 Oct 26)', () => {
  assert.ok(gitDir('/c/no/such/folder/written/the/posix/way'));
  assert.ok(gitDir(undefined));
});

test('the status line', () => {
  assert.equal(line(36.4, false), 'Chat 36% full');
  assert.equal(line(82, false), 'Chat 82% full · compact at the next clean point');
  assert.equal(line(82, true), 'Chat 82% full · ready to compact');
  assert.equal(line(undefined, false), '');
});

test('each hook, run as the app runs it, exits 0 and fails open on rubbish input', () => {
  const here = fileURLToPath(new URL('.', import.meta.url));
  for (const f of ['compact-watch.mjs', 'compact-guard.mjs', 'compact-resume.mjs', 'statusline.mjs']) {
    const r = spawnSync(process.execPath, [join(here, f)], { input: 'not json', encoding: 'utf8' });
    assert.equal(r.status, 0, f);
  }
  const held = spawnSync(process.execPath, [join(here, 'compact-guard.mjs')], {
    input: JSON.stringify({ trigger: 'auto', transcript_path: transcript('d.jsonl', [asst(0, 0, 860000)]), cwd: dir }), encoding: 'utf8',
  });
  assert.equal(held.status, 0);
  assert.equal(JSON.parse(held.stdout).decision, 'block');
  const watch = spawnSync(process.execPath, [join(here, 'compact-watch.mjs')], {
    input: JSON.stringify({ session_id: `test-${process.pid}`, transcript_path: transcript('e.jsonl', [asst(0, 0, 815000)]) }), encoding: 'utf8',
  });
  assert.match(JSON.parse(watch.stdout).hookSpecificOutput.additionalContext, /82% full|81% full|82%|81%/);
});

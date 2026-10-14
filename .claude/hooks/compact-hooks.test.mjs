// Tests for the compaction hooks ([COMPACT-WHEN-MOD], D868, D870, D871; the fresh read of 15 Oct 26:
// raptor-port/docs/superpowers/briefs/2026-10-15-compact-set-up-read.md — its findings are pinned here by number).
// Run: node --test .claude/hooks/compact-hooks.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readFill, bandOf, gitDir, appRoom, WINDOW, BANDS, HOLD_FROM, NEVER_HOLD_AT, NEVER_HOLD_TOKENS, MODEL_WINDOW } from './compact-lib.mjs';
import { reminder, waitingNote, step } from './compact-watch.mjs';
import { decide } from './compact-guard.mjs';
import { blockFor, message } from './compact-resume.mjs';
import { line } from './statusline.mjs';

const dir = mkdtempSync(join(tmpdir(), 'compact-test-'));
/* a throwaway git folder for the marks, so no test ever sets or clears a real checkout's "ready" or "away" mark — an
   /overnight run that ran this file in its own worktree had its away mark cleared, the guard back on at night (the fresh
   read of [COMPACT-BANDS-WINDOW], finding 5) */
const gdir = mkdtempSync(join(tmpdir(), 'compact-git-'));
spawnSync('git', ['init', '-q'], { cwd: gdir });
const asst = (input, created, read, extra = {}) => JSON.stringify({ type: 'assistant', uuid: `u-${read}`, ...extra, message: { usage: { input_tokens: input, cache_creation_input_tokens: created, cache_read_input_tokens: read, output_tokens: 9 } } });
const transcript = (name, lines) => { const p = join(dir, name); writeFileSync(p, lines.join('\n') + '\n'); return p; };
const fillAt = (pct, extra = {}) => ({ tokens: pct * 10000, pct, pctNow: pct, uuid: `u${pct}`, after: 0, ...extra });

test('reads the fullness from the last main-chat request in the record, with its id', () => {
  const p = transcript('a.jsonl', [
    asst(2, 1000, 100000),
    JSON.stringify({ type: 'user', message: { content: 'x' } }),
    asst(2, 7154, 328667),
    asst(5, 5, 900000, { isSidechain: true }), // a helper's request is not this chat's fullness
  ]);
  const f = readFill(p, 1_000_000);
  assert.equal(f.tokens, 335823);
  assert.equal(f.pct, 33.6);
  assert.equal(readFill(p).pct, Math.round((335823 / WINDOW) * 1000) / 10); // by default, of the app's own room (D878)
  assert.equal(f.uuid, 'u-328667');
});

test('estimates what came in after the last request — a request that overran shows (finding 1)', () => {
  const big = JSON.stringify({ type: 'user', message: { content: 'x'.repeat(600000) } }); // ~150k tokens of tool output
  const f = readFill(transcript('over.jsonl', [asst(0, 0, 890000), big]), 1_000_000);
  assert.equal(f.pct, 89);
  assert.ok(f.after > 140000 && f.after < 160000, String(f.after));
  assert.ok(f.pctNow >= 100, String(f.pctNow));
});

test('knows nothing when the record is missing, has no counts, or a compaction came after the last request', () => {
  assert.equal(readFill(join(dir, 'none.jsonl')), null);
  assert.equal(readFill(undefined), null);
  assert.equal(readFill(transcript('b.jsonl', [JSON.stringify({ type: 'user' })])), null);
  assert.equal(readFill(transcript('c.jsonl', [asst(1, 1, 850000), JSON.stringify({ type: 'system', subtype: 'compact_boundary' })])), null);
});

test('the guard holds only an ordinary automatic compaction from 90% of the room to the backstop, once per request, without a mark', () => {
  assert.equal(decide({ trigger: 'auto', fill: fillAt(92), ready: null }), 'hold');
  assert.equal(decide({ trigger: 'auto', fill: fillAt(HOLD_FROM), ready: null }), 'hold');
  assert.equal(decide({ trigger: 'auto', fill: fillAt(92), ready: { at: 1 } }), 'allow');
  assert.equal(decide({ trigger: 'auto', fill: fillAt(NEVER_HOLD_AT), ready: null }), 'allow'); // never later than the backstop
  assert.equal(decide({ trigger: 'auto', fill: null, ready: null }), 'allow'); // cannot tell → do what the app does
  assert.equal(decide({ trigger: 'manual', fill: fillAt(92), ready: null }), 'allow'); // his /compact is never held
});

test('the guard never holds a recovery, a helper, an idle chat or a smaller model (findings 1, 5)', () => {
  assert.equal(decide({ trigger: 'auto', fill: fillAt(89, { pctNow: 104 }), ready: null }), 'allow'); // overran: first attempt goes
  assert.equal(decide({ trigger: 'auto', fill: fillAt(92), ready: null, heldUuid: 'u92' }), 'allow'); // second try, same request
  assert.equal(decide({ trigger: 'auto', fill: fillAt(92), ready: null, heldUuid: 'u91' }), 'hold'); // a new request since
  assert.equal(decide({ trigger: 'auto', agentId: 'a1', fill: fillAt(92), ready: null }), 'allow'); // inside a helper
  assert.equal(decide({ trigger: 'auto', fill: fillAt(19.5), ready: null }), 'allow'); // a 200k model's room, or idle
  assert.equal(decide({ trigger: 'auto', fill: fillAt(HOLD_FROM - 0.1), ready: null }), 'allow');
  assert.equal(decide({ trigger: 'auto', fill: fillAt(79.5), ready: null }), 'allow'); // 700,000 of 880,000: not the app's own attempt (the fresh read's finding 1)
});

test('the guard is off while he is away — an /overnight run or his word (D872)', () => {
  assert.equal(decide({ trigger: 'auto', fill: fillAt(92), ready: null, away: { at: 1 } }), 'allow');
  const here = fileURLToPath(new URL('.', import.meta.url));
  const cmd = (arg) => spawnSync(process.execPath, [join(here, 'compact-ready.mjs'), arg], { encoding: 'utf8', cwd: gdir });
  const guard = () => spawnSync(process.execPath, [join(here, 'compact-guard.mjs')], {
    input: JSON.stringify({ session_id: `away-${process.pid}-${Date.now()}`, trigger: 'auto', transcript_path: transcript('away.jsonl', [asst(0, 0, 860000)]), cwd: gdir }), encoding: 'utf8',
  }).stdout;
  try {
    assert.match(cmd('--away').stdout, /guard is off/);
    assert.equal(guard(), ''); // let through
  } finally { cmd('--back'); }
  assert.match(guard(), /"decision":"block"/); // back: held again
});

test('the first note asks for the checkpoint and the handoff judgement, once per band — not for the mark (finding 3)', () => {
  assert.equal(bandOf(74.9), 0);
  assert.equal(bandOf(75), 75);
  assert.equal(bandOf(79.9), 75);
  assert.equal(bandOf(93), 90);
  assert.equal(reminder(fillAt(70), 0), '');
  const r = reminder(fillAt(81.2), 0);
  assert.match(r, /81% full/);
  assert.match(r, /ask him once/); // D871
  assert.doesNotMatch(r.replace(/compact-ready\.mjs" --away/g, ''), /compact-ready/); // only the away switch (D872), never "ready"
  assert.match(r, /--away \(D872\)/);
  assert.equal(reminder(fillAt(83), 80), '');
  assert.match(reminder(fillAt(86), 80), /86% full/);
  assert.equal(reminder(null, 0), '');
});

test('once a compaction is held, the next tool use is told — once — to save and mark ready (finding 3)', () => {
  const held = { band: 85, waiting: true, waitingTold: false };
  assert.match(waitingNote(held), /compaction is waiting[\s\S]*git rev-parse --show-toplevel\)\/\.claude\/hooks\/compact-ready\.mjs/);
  const first = step(fillAt(86), held);
  assert.match(first.text, /compaction is waiting/);
  assert.equal(first.state.waitingTold, true);
  assert.equal(step(fillAt(86), first.state).text, ''); // said once
});

test('the band falls back when the chat is emptier, so the notes never stop for good (finding 4)', () => {
  const s = step(fillAt(40), { band: 95 });
  assert.equal(s.state.band, 0);
  assert.match(step(fillAt(81), s.state).text, /81% full/);
});

test('after a compaction it hands back this branch\'s own block, whole — or names it when too long (findings 6, 7)', () => {
  const h = ['# HANDOFF', '## Now', '<!-- now:claude/a -->', '### a', '- quotes <!-- now:claude/b --> inline', '<!-- /now -->', '', '<!-- now:claude/b -->', '### b', '<!-- /now -->'].join('\n');
  assert.equal(blockFor(h, 'claude/a'), '<!-- now:claude/a -->\n### a\n- quotes <!-- now:claude/b --> inline\n<!-- /now -->');
  assert.equal(blockFor(h, 'claude/b'), '<!-- now:claude/b -->\n### b\n<!-- /now -->');
  assert.equal(blockFor(h.replace(/\n/g, '\r\n'), 'claude/b'), '<!-- now:claude/b -->\n### b\n<!-- /now -->');
  assert.equal(blockFor(h, 'claude/none'), '');
  assert.match(message('claude/a', 'BLOCK'), /re-read[\s\S]*BLOCK$/);
  assert.match(message('claude/x', ''), /No HANDOFF\.md block found for claude\/x/);
  const long = message('claude/a', 'x'.repeat(12000));
  assert.ok(long.length < 9500);
  assert.match(long, /longer than the app passes on — open it in HANDOFF\.md now/);
});

test('the hand-back says how to get a missing working guide back — his /reload-skills, in every form of the note (D885)', () => {
  for (const m of [message('claude/a', 'BLOCK'), message('claude/x', ''), message('claude/a', 'x'.repeat(12000))]) {
    assert.match(m, /ask him to type\n?\s*\/reload-skills/);
  }
});

test('git answers from this folder when the folder handed in is written the POSIX way (found 15 Oct 26)', () => {
  assert.ok(gitDir('/c/no/such/folder/written/the/posix/way'));
  assert.ok(gitDir(undefined));
});

test('the status line', () => {
  assert.equal(line(36.4, false), 'Chat 36% full');
  assert.equal(line(82, false), 'Chat 82% full · compact at the next clean point');
  assert.equal(line(82, true), 'Chat 82% full · ready to compact');
  assert.equal(line(76, false), 'Chat 76% full · compact at the next clean point'); // from the first note (D878)
  assert.equal(line(74, false), 'Chat 74% full');
  assert.equal(line(undefined, false), '');
});

test('each hook, run as the app runs it, exits 0, fails open on rubbish, and stays silent in a helper (finding 2)', () => {
  const here = fileURLToPath(new URL('.', import.meta.url));
  const run = (f, input) => spawnSync(process.execPath, [join(here, f)], { input: typeof input === 'string' ? input : JSON.stringify(input), encoding: 'utf8' });
  for (const f of ['compact-watch.mjs', 'compact-guard.mjs', 'compact-resume.mjs', 'statusline.mjs']) assert.equal(run(f, 'not json').status, 0, f);
  const sid = `test-${process.pid}-${Date.now()}`;
  const t86 = transcript('d.jsonl', [asst(0, 0, 860000)]);
  const held = run('compact-guard.mjs', { session_id: sid, trigger: 'auto', transcript_path: t86, cwd: gdir });
  assert.equal(held.status, 0);
  assert.equal(JSON.parse(held.stdout).decision, 'block');
  assert.equal(run('compact-guard.mjs', { session_id: sid, trigger: 'auto', transcript_path: t86, cwd: gdir }).stdout, ''); // same request: goes
  assert.equal(run('compact-watch.mjs', { session_id: sid, agent_id: 'helper', transcript_path: t86 }).stdout, ''); // a helper hears nothing
  const told = JSON.parse(run('compact-watch.mjs', { session_id: sid, transcript_path: t86 }).stdout).hookSpecificOutput.additionalContext;
  assert.match(told, new RegExp(`${Math.round((860000 / WINDOW) * 100)}% full`));
  assert.match(told, /compaction is waiting/);
});

/* [COMPACT-BANDS-WINDOW] (his ruling D878, 15 Oct 26): the notes and the guard count the chat against the app's OWN room —
   the autoCompactWindow setting (880,000 here), which the app compacts at 96% of (about 845,000) — not the whole 1M. */
test('the room is the app\'s own: the setting where one is set, else the whole 1M (D878)', () => {
  const s = (name, body) => { const p = join(dir, name); writeFileSync(p, body); return p; };
  const set880 = s('set880.json', JSON.stringify({ autoCompactWindow: 880000 }));
  const none = s('none.json', JSON.stringify({ model: 'x' }));
  const silly = s('silly.json', JSON.stringify({ autoCompactWindow: 5 }));
  assert.equal(appRoom({}, [join(dir, 'missing.json'), set880]), 880000); // the first file that sets it
  assert.equal(appRoom({}, [s('local.json', JSON.stringify({ autoCompactWindow: 700000 })), set880]), 700000); // local wins
  assert.equal(appRoom({}, [none]), MODEL_WINDOW);
  assert.equal(appRoom({}, [silly, s('rubbish.json', 'not json')]), MODEL_WINDOW); // nonsense is ignored
  assert.equal(appRoom({ CLAUDE_CONTEXT_WINDOW: '200000' }, [set880]), 200000); // a test's override
});

test('this checkout counts against its own setting, and the first note leaves room before the app compacts (D878)', () => {
  assert.equal(WINDOW, 880000); // .claude/settings.json's autoCompactWindow
  const firstNote = (BANDS[0] / 100) * WINDOW, appCompacts = 0.96 * WINDOW;
  assert.equal(firstNote, 660000);
  assert.ok(appCompacts - firstNote >= 180000, `only ${appCompacts - firstNote} tokens between the first note and the compaction`);
  assert.ok(HOLD_FROM > BANDS[0] && HOLD_FROM < 96, String(HOLD_FROM)); // told first; and just below the app's own attempt
  assert.equal(HOLD_FROM, 90); // 792,000 of 880,000 (the fresh read's finding 1)
  assert.equal(NEVER_HOLD_TOKENS, 900000); // the backstop stays 90% of the model's whole room
  assert.ok(NEVER_HOLD_AT > 96, String(NEVER_HOLD_AT)); // the guard can hold the app's own attempt at about 96%
  // as first built the first note came at 800,000 — only about 45,000 before the compaction: the fault this fixes
  assert.ok(appCompacts - 800000 < 50000);
});

test('the four hooks, run as the app runs them with the room this checkout sets: the note at 660,000, not 800,000 (D878)', () => {
  const here = fileURLToPath(new URL('.', import.meta.url));
  const run = (f, input) => spawnSync(process.execPath, [join(here, f)], { input: JSON.stringify(input), encoding: 'utf8', env: { ...process.env, CLAUDE_CONTEXT_WINDOW: '' } });
  const sid = `room-${process.pid}-${Date.now()}`;
  assert.equal(run('compact-watch.mjs', { session_id: sid, transcript_path: transcript('r1.jsonl', [asst(0, 0, 650000)]) }).stdout, ''); // 74%: silent
  const at = JSON.parse(run('compact-watch.mjs', { session_id: sid, transcript_path: transcript('r2.jsonl', [asst(0, 0, 665000)]) }).stdout).hookSpecificOutput.additionalContext;
  assert.match(at, /^This chat is 76% full \(about 665k of the app's 880k; it compacts by itself at about 96%\)/);
  const g = run('compact-guard.mjs', { session_id: `${sid}-g`, trigger: 'auto', transcript_path: transcript('r3.jsonl', [asst(0, 0, 846000)]), cwd: gdir });
  assert.equal(JSON.parse(g.stdout).decision, 'block'); // the app's own attempt at ~96% is held for a clean point
  assert.equal(run('compact-guard.mjs', { session_id: `${sid}-i`, trigger: 'auto', transcript_path: transcript('r6.jsonl', [asst(0, 0, 700000)]), cwd: gdir }).stdout, ''); // 700,000: let through
  assert.equal(run('compact-guard.mjs', { session_id: `${sid}-h`, trigger: 'auto', transcript_path: transcript('r4.jsonl', [asst(0, 0, 901000)]), cwd: gdir }).stdout, ''); // past 900,000: never held
  assert.equal(spawnSync(process.execPath, [join(here, 'statusline.mjs')], { input: JSON.stringify({ transcript_path: transcript('r5.jsonl', [asst(0, 0, 665000)]) }), encoding: 'utf8', env: { ...process.env, CLAUDE_CONTEXT_WINDOW: '' } }).stdout, 'Chat 75.6% full'.replace('75.6', '76') + ' · compact at the next clean point');
});

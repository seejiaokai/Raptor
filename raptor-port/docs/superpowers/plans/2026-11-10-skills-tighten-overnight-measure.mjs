// [SKILLS-TIGHTEN] step 3 (10 Nov 26, chat 60) - the measure behind 2026-11-10-skills-tighten-overnight.md, its section G.
// Run from the repo root: node raptor-port/docs/superpowers/plans/2026-11-10-skills-tighten-overnight-measure.mjs .claude/skills/overnight/SKILL.md
// Measures the saving of each passage listed to leave / be stated once in the overnight skill.
// Each entry: [section, label, old text (whitespace-normalised), text that replaces it].
// Every old text must occur exactly once in the normalised skill, or the script fails.
import { readFileSync } from 'node:fs';
const file = process.argv[2];
const raw = readFileSync(file, 'utf8');
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const text = norm(raw);
const B = (s) => Buffer.byteLength(s, 'utf8');

const items = [
  // ---- B: no longer applies (history, dated stories, spent rulings' numbers)
  ['B1', 'what the guide replaced, and the 14 Oct worked example',
    'This guide replaces the questions he used to ask by hand each night (D596, D667, D766, D856–D859); it was approved as this command by D869. Its worked example is the night of 14 Oct 26: the rows D856–D858 and the handoff block written that night (`git show 81b65274b:HANDOFF.md`).',
    'Its rulings: D596, D667, D766, D869.'],
  ['B2', 'story: the night that began on the older guide',
    '(28 Oct 26: a night began on the main folder\'s older guide — `raptor-port/docs/gates-and-deploy.md`,',
    '(`raptor-port/docs/gates-and-deploy.md`,'],
  ['B2', 'story: two looks ready before he slept',
    '(25 Oct 26: two looks were ready ten minutes before he went to sleep without any);',
    ';'],
  ['B2', 'dates beside the timer rule', 'before its cache goes cold (21 Oct 26, 1 Nov 26).', 'before its cache goes cold.'],
  ['B3', 'the history of D1103, a replaced ruling',
    'His D1103 asked for a fresh session per job; on 21 Oct 26 the app started none from a turn his phone sent or a finished job woke, so the night ran helpers instead — this line is his approval of that change (D1416, 27 Oct 26). A session per job still works when he types',
    'A session per job is used only when he types'],
  ['B2', 'date beside the block-on-a-branch rule', 'is not on a branch cut from it (7 Nov 26).', 'is not on a branch cut from it (D1416).'],
  ['B2', 'date and note number beside the refused write', 'a file it calls a report (10 Nov 26, note 915), so', 'a file it calls a report, so'],
  ['B2', 'date beside the readers ticked', '`[NO-ASTRA-LIST]` in the same change (8 Nov 26).', '`[NO-ASTRA-LIST]` in the same change.'],
  ['B2', 'date beside the stopped helper', 'for commits made after the notice (9 Nov 26).', 'for commits made after the notice.'],
  ['B2', 'date beside the push alone in its command', 'earlier steps too, 21 Oct 26);', 'earlier steps too);'],
  ['B2', 'story: the parked question with no case',
    '(13 Oct 26: a parked question with no case was answered about something else) —', '—'],
  ['B2', 'story: the block pushed seconds after the pull request opened',
    '(17 Oct 26: the block pushed seconds after the pull request opened cancelled its first run).', '.'],
  ['B2', 'date beside D1415', '(his D1415, 27 Oct 26; D1033)', '(D1415, D1033)'],
  ['B2', 'date beside the list checked against a picture', 'is marked so (29 Oct 26);', 'is marked so;'],
  ['B4', 'spent number D857', '(D667, D857, D867)', '(D667, D867)'],
  ['B4', 'spent number D864', '(D822, D864)', '(D822)'],

  // ---- C: behind a later ruling (corrections; C1 is carried by D1 below)
  ['C2', 'checks: "gates under the lock" -> GitHub\'s run is the full check (D1086)',
    'gates under the lock (D228), the model reads',
    'the checks as `.claude/rules/shipping.md` §The checks sets them (D1086, D228), the model reads'],
  ['C2', 'the pull request opens when the job is built, not when its check closes (D1086)',
    'gets its pull request when its check closes, so GitHub\'s checks run while he sleeps;',
    'gets its pull request as soon as it is built, so GitHub\'s run goes while the app is walked (D1086);'],
  ['C3', '"merge" in the head: his "auto merge live" for the night (D1093)',
    'he did not select, to merge, to touch `main`,',
    'he did not select, to merge or touch `main` (unless he gave "auto merge live" for the night — D1093; then by `.claude/rules/shipping.md`\'s four steps),'],

  // ---- D: stated more than once
  ['D1', 'the two runs, explained in shipping.md in every chat',
    '— a push makes TWO runs (the documents guard, a minute or two; the full checks, up to about twenty), so look for any run of the branch\'s last pushed commit that is `queued` or `in_progress`, never only the newest row.',
    '— no run of the branch\'s last pushed commit `queued` or `in_progress` (two runs a push: `.claude/rules/shipping.md`, D151).'],
  ['D2', 'the "Never" list, already the head\'s "is NOT permission" paragraph',
    '**Never:** build a job he did not select, or one step 4 holds that his reply did not settle; merge; push to `main`; change his Claude settings, the hooks or a working guide; send more than one notification. If truly blocked — nothing he selected can continue — that is the one notification.',
    '**Never** what the head says the command is not, nor a job step 4 holds that his reply did not settle, nor a second notification. If truly blocked — nothing he selected can continue — that is the one notification.'],
  ['D3', 'compaction: the first note and its figures, stated three times in one bullet',
    'Not at a fixed point: from the first note (75% of the app\'s room — D878; D868\'s "about 80%") the agent chooses the moment itself, without asking him — the next clean point, so a big job does not compact twice; on a night it never stops to offer a handoff (D871 — he is away). The project\'s compaction set-up (D870) does the rest, with its guard OFF at night (D872 — step 9): a note arrives from 75% of the app\'s own room (about 300,000 of 400,000 — D878, D1671); the app\'s own compaction comes at about 96% of it (about 384,000) whenever it gets there — nothing holds it, because a compaction refused by mistake at night would end the run; after it, the chat\'s saved block is handed back.',
    'Not at a fixed point: from the first note — 75% of the app\'s room, about 300,000 of 400,000 (D878, D1671; D868\'s "about 80%") — the agent chooses the moment itself, without asking him: the next clean point, so a big job does not compact twice; on a night it never stops to offer a handoff (D871 — he is away). The compaction set-up (D870) runs with its guard OFF at night (D872 — step 9): the app\'s own compaction comes at about 96% (about 384,000) whenever it gets there — nothing holds it, because a compaction refused by mistake at night would end the run; after it, the chat\'s saved block is handed back.'],
  ['D3', 'compaction: "from the first note (75% ...)" a third time',
    'from the first note (75% of the app\'s room — D878): at the next clean point —', 'from the first note, the next clean point is:'],
  ['D4', 'after a compaction: the re-read, already the block\'s first line (step 8)',
    '**after a compaction, re-read the block, this guide and the files the step in hand touches before the next change, and note the compaction in the block with its time, read from the clock** — never carry on',
    '**after a compaction, do what the block\'s first line says (step 8)** — never carry on'],
];

let leave = 0, stay = 0;
const bySection = {};
for (const [sec, label, oldRaw, newRaw] of items) {
  const o = norm(oldRaw), n = norm(newRaw);
  const count = text.split(o).length - 1;
  if (count !== 1) { console.error(`NOT FOUND ONCE (${count}): ${sec} ${label}`); process.exitCode = 1; continue; }
  const saved = B(o) - B(n);
  leave += B(o); stay += B(n);
  const k = sec[0];
  bySection[k] = (bySection[k] || 0) + saved;
  console.log(`${sec}\t${B(o)}\t-> ${B(n)}\tsaves ${saved}\t${label}`);
}
console.log('---');
console.log(`file: ${B(raw)} bytes raw, ${B(text)} bytes with line wraps flattened`);
console.log(`listed passages: ${leave} bytes -> ${stay} bytes; net saving ${leave - stay} bytes = ${((leave - stay) / B(text) * 100).toFixed(1)}% of the flattened file`);
console.log('by section (net bytes):', JSON.stringify(bySection));
// the three closing checklists
const i = text.indexOf('## Before sending the Part 1 message');
console.log(`the three closing checklists: ${B(text.slice(i))} bytes`);

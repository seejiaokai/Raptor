// The skill review of 27 Oct 26 — install the approved drafts, or rehearse the document check with them in place.
// Run from the repo root, on the review branch, with the drafts COMMITTED:
//   node .claude/skill-updates/2026-10-27/_install/install.mjs --rehearse
//       copies every draft over its live file, runs `npm run docsize`, then restores ONLY those live paths from HEAD
//       (by name — never the whole tree, which would also roll back the drafts: observation 542).
//   node .claude/skill-updates/2026-10-27/_install/install.mjs --install [--skip <live path> ...] [--decline <n>,<n>]
//       copies the approved drafts over the live files (a path he did not approve is passed with --skip), marks each
//       OPEN observation's status from _review/dispositions.md, and archives the entries resolved before today.
//       an ASK row becomes DECLINED only when named in --decline (his word, row by row); otherwise it stays OPEN.
// The memory notes (_memory/additions.md) and the backlog additions (_docs/OUTSTANDING-items.md) are applied by hand
// with the editor tool, after this script, on his approval.
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const stage = path.resolve(here, '..');
const root = path.resolve(stage, '../../..');
const TODAY = '2026-10-27';

// The ONE list of live paths the drafts replace — the rehearsal and the install both use it.
export const LIVE = [
  'raptor-port/docs/walk-scripts.md',
  'raptor-port/docs/bug-check-order.md',
  'raptor-port/docs/gates-and-deploy.md',
  'raptor-port/docs/design-practices.md',
  'DECISIONS.md',
  '.claude/skills/brainstorming/mockups-on-the-real-app.md',
  '.claude/skills/overnight/SKILL.md',
  '.claude/skills/session-handoff/SKILL.md',
  '.claude/skills/systematic-debugging/SKILL.md',
  '.claude/skills/systematic-debugging/device-only-bugs.md',
  '.claude/skills/test-driven-development/SKILL.md',
  '.claude/skills/test-driven-development/writing-good-tests.md',
  '.claude/skills/verification-before-completion/SKILL.md',
  '.claude/skills/verification-before-completion/browser-checks.md',
  '.claude/skills/task-observer/SKILL.md',
  '.claude/skills/task-observer/references/weekly-review.md',
  '.claude/skills/TASK-OBSERVER-VENDORED.md',
  '.claude/skills/SUPERPOWERS-VENDORED.md',
  '.claude/skills/IMPECCABLE-VENDORED.md',
];

const args = process.argv.slice(2);
const mode = args.includes('--rehearse') ? 'rehearse' : args.includes('--install') ? 'install' : null;
if (!mode) { console.log('usage: --rehearse | --install [--skip <path> ...] [--decline <n>,<n>]'); process.exit(2); }
const skip = new Set();
for (let i = 0; i < args.length; i++) if (args[i] === '--skip') skip.add(args[++i]);
for (const s of skip) if (!LIVE.includes(s)) { console.log('not a draft path:', s); process.exit(2); }

const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8' });
const dirty = git('status', '--porcelain', '--', '.claude/skill-updates').trim();
if (dirty) { console.log('commit the drafts first — the holding folder has changes:\n' + dirty); process.exit(1); }
// Each draft was made from the live file as it stood when staged (its blob id in _review/live-hashes.txt). A live file
// that has changed since would be overwritten with a stale base: stop, so the draft is rebased first.
const staged = new Map(fs.readFileSync(path.join(stage, '_review/live-hashes.txt'), 'utf8').trim().split('\n')
  .map(l => l.split(' ')).map(([h, p]) => [p, h]));
for (const p of LIVE) {
  if (!fs.existsSync(path.join(stage, p))) { console.log('missing draft:', p); process.exit(1); }
  if (git('status', '--porcelain', '--', p).trim()) { console.log('the live file has uncommitted changes:', p); process.exit(1); }
  const now = git('hash-object', '--', p).trim();
  if (staged.get(p) !== now) { console.log('the live file changed since its draft was made — rebase the draft first:', p); process.exit(1); }
}

function copyDrafts(list) {
  for (const p of list) fs.copyFileSync(path.join(stage, p), path.join(root, p));
  console.log(`copied ${list.length} draft(s) over the live files`);
}

if (mode === 'rehearse') {
  copyDrafts(LIVE);
  let rc = 0;
  try {
    const out = execFileSync('npm', ['run', 'docsize'], { cwd: path.join(root, 'raptor-port'), encoding: 'utf8', shell: true });
    console.log(out.split('\n').filter(l => /FAIL|OK|over|  - /.test(l)).join('\n'));
  } catch (e) { rc = 1; console.log(String(e.stdout || '') + String(e.stderr || '')); }
  finally {
    git('checkout', 'HEAD', '--', ...LIVE);   // the live paths only, by name
    const left = git('status', '--porcelain', '--', ...LIVE).trim();
    console.log(left ? 'NOT RESTORED:\n' + left : 'live files restored; the drafts untouched');
  }
  process.exit(rc);
}

// ---- install ----
const check = path.join(here, 'check-dispositions.mjs');
execFileSync(process.execPath, [check], { cwd: root, stdio: 'inherit' });   // throws (exit 1) on any mismatch

const logPath = path.join(root, '.claude/skill-observations/log.md');
const before = fs.readFileSync(logPath, 'utf8');
fs.writeFileSync(path.join(stage, '_install', 'log-backup.md'), before);   // the pre-write backup
const table = fs.readFileSync(path.join(stage, '_review/dispositions.md'), 'utf8');
const rows = new Map();
for (const line of table.split('\n')) {
  const m = line.match(/^\| (\d+) \| ([A-Z]+) \| (.*) \|$/);
  if (m) rows.set(+m[1], { code: m[2], where: m[3] });
}
// --decline 623,703 — the ASK rows he agreed to close, each named; an ASK row not named stays OPEN.
const declined = new Set();
for (let i = 0; i < args.length; i++) if (args[i] === '--decline') String(args[++i] || '').split(',').forEach(x => declined.add(+x));
// The short names the dispositions table uses for each draft; a row naming a skipped draft stays OPEN.
const SHORT = {
  'raptor-port/docs/walk-scripts.md': 'WS', 'raptor-port/docs/bug-check-order.md': 'BCO',
  'raptor-port/docs/gates-and-deploy.md': 'GD', 'raptor-port/docs/design-practices.md': 'DP', 'DECISIONS.md': 'DEC',
  '.claude/skills/brainstorming/mockups-on-the-real-app.md': 'MOCK', '.claude/skills/overnight/SKILL.md': 'OVN',
  '.claude/skills/session-handoff/SKILL.md': 'SH', '.claude/skills/systematic-debugging/SKILL.md': 'SD',
  '.claude/skills/systematic-debugging/device-only-bugs.md': 'DOB', '.claude/skills/test-driven-development/SKILL.md': 'TDD',
  '.claude/skills/test-driven-development/writing-good-tests.md': 'WGT',
  '.claude/skills/verification-before-completion/SKILL.md': 'VBC',
  '.claude/skills/verification-before-completion/browser-checks.md': 'BC', '.claude/skills/task-observer/SKILL.md': 'TO',
  '.claude/skills/task-observer/references/weekly-review.md': 'WR', '.claude/skills/TASK-OBSERVER-VENDORED.md': 'TOV',
  '.claude/skills/SUPERPOWERS-VENDORED.md': 'SPV', '.claude/skills/IMPECCABLE-VENDORED.md': 'IMPV',
};
const skippedShort = [...skip].map(p => SHORT[p]);
const namesSkipped = (where) => skippedShort.some(s => new RegExp(`(^|[^A-Z])${s}([^A-Z]|$)`).test(where));

// One bounded edit per entry: split on headers, change the Status line inside one chunk only.
const parts = before.split(/^(?=### Observation \d+:)/m);
let changed = 0;
const out = parts.map((chunk, i) => {
  if (i === 0) return chunk;
  const n = +chunk.match(/^### Observation (\d+):/)[1];
  const r = rows.get(n);
  if (!r || r.code === 'OPEN') return chunk;
  if (r.code === 'ASK' && !declined.has(n)) return chunk;
  if (namesSkipped(r.where)) return chunk;   // a draft it lands in was not approved: it stays OPEN
  const short = r.where.replace(/\s+/g, ' ').slice(0, 300);
  const status = r.code === 'ASK'
    ? `**Status:** DECLINED (${TODAY}) — closed on his word in the skill review of 27 Oct 26: ${short}`
    : `**Status:** ACTIONED (${TODAY}) — skill review of 27 Oct 26 (${r.code.toLowerCase()}): ${short}`;
  const next = chunk.replace(/^\*\*Status:\*\*.*$/m, () => status);
  if (next !== chunk) changed++;
  return next;
});
let after = out.join('');

// Archive what was resolved BEFORE today (the grace period lives in the file): move whole entries.
const live = fs.readFileSync(logPath, 'utf8');
if (live !== before) { console.log('the log changed while this ran — re-run'); process.exit(1); }
const chunks = after.split(/^(?=### Observation \d+:)/m);
const head = chunks[0];
const keep = [], move = [];
for (const c of chunks.slice(1)) {
  const m = c.match(/^\*\*Status:\*\*\s*(ACTIONED|DECLINED)\s*\((\d{4}-\d{2}-\d{2})\)/m);
  (m && m[2] < TODAY ? move : keep).push(c);
}
const count = (s) => (s.match(/^### Observation \d+:/gm) || []).length;
after = head + keep.join('');
// The count check runs before anything is written, so a mismatch leaves every file as it was.
if (count(after) + move.length !== count(before)) { console.log('COUNT MISMATCH — nothing written'); process.exit(1); }
const archivePath = path.join(root, `.claude/skill-observations/archive/log-${TODAY}.md`);
const archiveHead = fs.existsSync(archivePath) ? fs.readFileSync(archivePath, 'utf8') : before.split(/^## /m)[0];
copyDrafts(LIVE.filter(p => !skip.has(p)));
fs.writeFileSync(archivePath, archiveHead.replace(/\s*$/, '\n\n') + move.join(''));
fs.writeFileSync(logPath, after);
fs.writeFileSync(path.join(root, '.claude/skill-observations/last-review-date.txt'), TODAY + '\n');
console.log(`statuses written: ${changed} · archived (resolved before today): ${move.length} · left in the log: ${count(after)}`);
console.log('Next, by hand: _memory/additions.md, _docs/OUTSTANDING-items.md; then delete this holding folder (D69).');

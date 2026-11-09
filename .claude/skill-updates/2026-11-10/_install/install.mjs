// The skill review of 10 Nov 26 — install the approved drafts, or rehearse the document check with them in place.
// Adapted from the 27 Oct 26 review's script (commit 38e509fd6^). Run from the repo root, on the review branch, with the
// drafts COMMITTED:
//   node .claude/skill-updates/2026-11-10/_install/install.mjs --list
//       prints the ONE list of live paths the drafts replace (every file in the holding folder outside its _ folders).
//   node .claude/skill-updates/2026-11-10/_install/install.mjs --rehearse
//       copies every draft over its live file (a draft of a new file is created), runs `npm run docsize`, then restores
//       ONLY those live paths by name and deletes only the files the drafts added — never the whole tree.
//   node .claude/skill-updates/2026-11-10/_install/install.mjs --install [--skip <live path> ...] [--decline <n>,<n>]
//       copies the approved drafts over the live files, marks each OPEN note's status from _review/dispositions.md
//       (a row naming a skipped draft stays OPEN; an ASK row becomes DECLINED only when named in --decline), and
//       archives the entries resolved before today. Memory notes and backlog additions are applied by hand after.
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const stage = path.resolve(here, '..');
const root = path.resolve(stage, '../../..');
const TODAY = new Date().toISOString().slice(0, 10);
const REVIEW = 'the skill review of 10 Nov 26';

function walk(dir, rel = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!rel && e.name.startsWith('_')) continue;
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) out.push(...walk(path.join(dir, e.name), r)); else out.push(r);
  }
  return out;
}
export const LIVE = walk(stage).sort();

const args = process.argv.slice(2);
const mode = ['--list', '--rehearse', '--install'].find(a => args.includes(a));
if (!mode) { console.log('usage: --list | --rehearse | --install [--skip <path> ...] [--decline <n>,<n>]'); process.exit(2); }
if (mode === '--list') { console.log(LIVE.join('\n')); process.exit(0); }
const skip = new Set();
for (let i = 0; i < args.length; i++) if (args[i] === '--skip') skip.add(args[++i]);
for (const s of skip) if (!LIVE.includes(s)) { console.log('not a draft path:', s); process.exit(2); }

const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8' });
const dirty = git('status', '--porcelain', '--', '.claude/skill-updates').trim();
if (dirty) { console.log('commit the drafts first — the holding folder has changes:\n' + dirty); process.exit(1); }
// Each draft was made from the live file at the base commit. A live file changed since then would be overwritten with a
// stale base: stop, so the draft is rebased first.
const base = fs.readFileSync(path.join(stage, '_review/base-commit.txt'), 'utf8').trim();
const isNew = new Set();
for (const p of LIVE) {
  let then = null;
  try { then = git('rev-parse', `${base}:${p}`).trim(); } catch { isNew.add(p); continue; }
  if (git('status', '--porcelain', '--', p).trim()) { console.log('the live file has uncommitted changes:', p); process.exit(1); }
  const now = git('hash-object', '--', p).trim();
  if (then !== now) { console.log('the live file changed since the base commit — rebase the draft first:', p); process.exit(1); }
}

function copyDrafts(list) {
  for (const p of list) { fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true }); fs.copyFileSync(path.join(stage, p), path.join(root, p)); }
  console.log(`copied ${list.length} draft(s) over the live files (${[...list].filter(p => isNew.has(p)).length} new)`);
}

if (mode === '--rehearse') {
  copyDrafts(LIVE);
  let rc = 0;
  try {
    const out = execFileSync('npm', ['run', 'docsize'], { cwd: path.join(root, 'raptor-port'), encoding: 'utf8', shell: true });
    console.log(out.split('\n').filter(l => /FAIL|OK|over|tripwire|  - /.test(l)).join('\n'));
  } catch (e) { rc = 1; console.log(String(e.stdout || '') + String(e.stderr || '')); }
  finally {
    const old = LIVE.filter(p => !isNew.has(p));
    if (old.length) git('checkout', 'HEAD', '--', ...old);   // the live paths only, by name
    for (const p of isNew) fs.rmSync(path.join(root, p));
    const left = git('status', '--porcelain', '--', ...LIVE).trim();
    console.log(left ? 'NOT RESTORED:\n' + left : 'live files restored; the drafts untouched');
  }
  process.exit(rc);
}

// ---- install ----
execFileSync(process.execPath, [path.join(here, 'check-dispositions.mjs')], { cwd: root, stdio: 'inherit' });
const logPath = path.join(root, '.claude/skill-observations/log.md');
const before = fs.readFileSync(logPath, 'utf8');
fs.writeFileSync(path.join(stage, '_install', 'log-backup.md'), before);
const rows = new Map();
for (const line of fs.readFileSync(path.join(stage, '_review/dispositions.md'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\| (\d+) \| ([A-Z]+) \| (.*) \|\s*$/);
  if (m) rows.set(+m[1], { code: m[2], where: m[3] });
}
const declined = new Set();
for (let i = 0; i < args.length; i++) if (args[i] === '--decline') String(args[++i] || '').split(',').forEach(x => declined.add(+x));
const SHORT = { 'raptor-port/docs/walk-scripts.md': 'WS', 'raptor-port/docs/bug-check-order.md': 'BCO',
  'raptor-port/docs/gates-and-deploy.md': 'GD', 'raptor-port/docs/design-practices.md': 'DP' };
const tokens = [...skip].flatMap(p => [SHORT[p], p, p.replace(/^.*\/skills\//, '')].filter(Boolean));
const namesSkipped = (where) => tokens.some(t => t.length <= 3 ? new RegExp(`(^|[^A-Z])${t}([^A-Z]|$)`).test(where) : where.includes(t));

const parts = before.split(/^(?=### Observation \d+:)/m);
let changed = 0;
const out = parts.map((chunk, i) => {
  if (i === 0) return chunk;
  const n = +chunk.match(/^### Observation (\d+):/)[1];
  const r = rows.get(n);
  if (!r || r.code === 'OPEN') return chunk;
  if (r.code === 'ASK' && !declined.has(n)) return chunk;
  if (namesSkipped(r.where)) return chunk;
  const short = r.where.replace(/\s+/g, ' ').slice(0, 300);
  const status = r.code === 'ASK'
    ? `**Status:** DECLINED (${TODAY}) — closed on his word in ${REVIEW}: ${short}`
    : `**Status:** ACTIONED (${TODAY}) — ${REVIEW} (${r.code.toLowerCase()}): ${short}`;
  const next = chunk.replace(/^(\s*-?\s*)\*\*Status:\*\*.*$/m, () => status);
  if (next !== chunk) changed++;
  return next;
});
const after = out.join('');
const count = (s) => (s.match(/^### Observation \d+:/gm) || []).length;
if (fs.readFileSync(logPath, 'utf8') !== before) { console.log('the log changed while this ran — re-run'); process.exit(1); }
if (count(after) !== count(before)) { console.log('COUNT MISMATCH — nothing written'); process.exit(1); }
copyDrafts(LIVE.filter(p => !skip.has(p)));
fs.writeFileSync(logPath, after);
fs.writeFileSync(path.join(root, '.claude/skill-observations/last-review-date.txt'), TODAY + '\n');
console.log(`statuses written: ${changed} · left OPEN: ${count(after) - changed} (archived at the next review's clean-up, dated)`);
console.log('Next, by hand: _memory/additions.md, _docs/OUTSTANDING-items.md; then delete this holding folder (D69).');

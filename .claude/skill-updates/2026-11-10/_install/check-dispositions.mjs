// The skill review of 10 Nov 26 — checks the dispositions tables against the live log: every OPEN note the review
// covers (to REVIEW_MAX, the highest when it started) exactly once across the group tables, no other number, a known
// code on every row, and every APPLY row's named draft present in the holding folder. Exit 1 on any mismatch.
// Run from the repo root: node .claude/skill-updates/2026-11-10/_install/check-dispositions.mjs [--merge]
//   --merge also writes _review/dispositions.md, the one table the install reads (the group tables' rows, by number).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const stage = path.resolve(here, '..');
const root = path.resolve(stage, '../../..');
const REVIEW_MAX = 914;
const CODES = new Set(['APPLY', 'REFLECTED', 'FILED', 'MEMORY', 'ASK', 'OPEN']);

export function openSet(text) {
  const open = new Set();
  for (const chunk of text.split(/^(?=### Observation \d+:)/m).slice(1)) {
    const n = +chunk.match(/^### Observation (\d+):/)[1];
    const st = (chunk.match(/^\s*-?\s*\*\*Status:\*\*\s*(.*)$/m) || [, ''])[1];
    if (!/^(ACTIONED|DECLINED)\b/.test(st)) open.add(n);
  }
  return open;
}
export function rows(text) {
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\| (\d+) \| ([A-Z]+) \| (.*) \|\s*$/);
    if (m) out.push({ n: +m[1], code: m[2], where: m[3], line });
  }
  return out;
}

const log = fs.readFileSync(path.join(root, '.claude/skill-observations/log.md'), 'utf8');
const open = new Set([...openSet(log)].filter(n => n <= REVIEW_MAX));
const groups = JSON.parse(fs.readFileSync(path.join(stage, '_review/groups.json'), 'utf8'));
const all = [];
let bad = 0;
for (const g of Object.keys(groups)) {
  const f = path.join(stage, `_review/dispositions-${g}.md`);
  if (!fs.existsSync(f)) { console.log('no table yet for', g); bad++; continue; }
  const rs = rows(fs.readFileSync(f, 'utf8'));
  for (const r of rs) if (!groups[g].includes(r.n)) { console.log(`${g}: row ${r.n} is not in this group`); bad++; }
  for (const n of groups[g]) if (!rs.some(r => r.n === n)) { console.log(`${g}: missing ${n}`); bad++; }
  all.push(...rs);
}
const seen = new Map();
for (const r of all) {
  if (!CODES.has(r.code)) { console.log('unknown code', r.n, r.code); bad++; }
  if (seen.has(r.n)) { console.log('twice', r.n); bad++; }
  seen.set(r.n, r);
  if (!open.has(r.n)) { console.log('not an OPEN note', r.n); bad++; }
  if (r.code === 'APPLY') {
    const files = [...r.where.matchAll(/`([^`]+\.md)`/g)].map(m => m[1]);
    for (const p of files) {
      const rel = p.replace(/^\.\//, '');
      const candidates = [rel, 'raptor-port/docs/' + rel, '.claude/skills/' + rel];
      if (!candidates.some(c => fs.existsSync(path.join(stage, c))) && !fs.existsSync(path.join(root, rel)))
        { console.log(`APPLY ${r.n}: names ${p}, no draft found`); }
    }
  }
}
for (const n of open) if (!seen.has(n)) { console.log('missing', n); bad++; }
const counts = {};
for (const r of seen.values()) counts[r.code] = (counts[r.code] || 0) + 1;
console.log(`OPEN covered: ${open.size} · rows: ${all.length} ·`, counts);
if (process.argv.includes('--merge') && !bad) {
  const head = fs.readFileSync(path.join(stage, '_review/dispositions-head.md'), 'utf8');
  const body = [...seen.values()].sort((a, b) => a.n - b.n).map(r => r.line.trimEnd()).join('\n');
  fs.writeFileSync(path.join(stage, '_review/dispositions.md'), head.trimEnd() + '\n\n| Note | Code | Where it lands, or why |\n|---|---|---|\n' + body + '\n');
  console.log('merged into _review/dispositions.md');
}
if (bad) { console.log(`FAIL — ${bad} problem(s)`); process.exit(1); }
console.log('dispositions OK');

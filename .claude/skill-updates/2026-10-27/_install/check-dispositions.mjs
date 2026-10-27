// Checks the review's dispositions table against the live log: every OPEN observation exactly once, no other number,
// a known code on every row. Prints the counts per code. Exit 1 on any mismatch.
// Run from the repo root: node .claude/skill-updates/2026-10-27/_install/check-dispositions.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const log = fs.readFileSync(path.join(root, '.claude/skill-observations/log.md'), 'utf8');
const table = fs.readFileSync(path.join(here, '../_review/dispositions.md'), 'utf8');

export function openSet(text) {
  const open = new Set();
  for (const chunk of text.split(/^(?=### Observation \d+:)/m).slice(1)) {
    const n = +chunk.match(/^### Observation (\d+):/)[1];
    const st = (chunk.match(/^\*\*Status:\*\*\s*(.*)$/m) || [, ''])[1];
    if (!/^(ACTIONED|DECLINED)\b/.test(st)) open.add(n);
  }
  return open;
}

export function rows(text) {
  const out = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^\| (\d+) \| ([A-Z]+) \| (.*) \|$/);
    if (m) out.push({ n: +m[1], code: m[2], where: m[3] });
  }
  return out;
}

const CODES = new Set(['APPLY', 'REFLECTED', 'FILED', 'MEMORY', 'ASK', 'OPEN']);
// The review covers the notes up to 721, the highest when it started; a note appended since stays OPEN for the next.
const REVIEW_MAX = 721;
const open = new Set([...openSet(log)].filter(n => n <= REVIEW_MAX));
const rs = rows(table);
const seen = new Map();
let bad = 0;
for (const r of rs) {
  if (!CODES.has(r.code)) { console.log('unknown code', r.n, r.code); bad++; }
  if (seen.has(r.n)) { console.log('twice', r.n); bad++; }
  seen.set(r.n, r.code);
  if (!open.has(r.n)) { console.log('not an OPEN observation', r.n); bad++; }
}
for (const n of open) if (!seen.has(n)) { console.log('missing', n); bad++; }
const counts = {};
for (const c of seen.values()) counts[c] = (counts[c] || 0) + 1;
console.log(`OPEN in log: ${open.size} · rows: ${rs.length} ·`, counts);
if (bad) { console.log(`FAIL — ${bad} problem(s)`); process.exit(1); }
console.log('dispositions OK');

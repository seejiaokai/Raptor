// Stages page-r5b.html and every file it references into pub/ for publishing (chat 187), and prints the list of paths.
const fs = require('fs'), path = require('path');
const q3 = process.argv[2], out = process.argv[3];
const q2 = path.join(q3, '..', '2026-11-25-msq-pick-guard-q2');
const html = fs.readFileSync(path.join(q3, 'page-r5b.html'), 'utf8');
const refs = new Set();
for (const m of html.matchAll(/(?:src|poster)="([^"#]+)(?:#[^"]*)?"/g)) refs.add(m[1]);
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'page.html'), html);
const list = [];
for (const r of [...refs].sort()) {
  const from = r.startsWith('q2/') ? path.join(q2, r.slice(3)) : path.join(q3, r);
  if (!fs.existsSync(from)) { console.error('MISSING', r); process.exitCode = 1; continue; }
  fs.mkdirSync(path.dirname(path.join(out, r)), { recursive: true });
  fs.copyFileSync(from, path.join(out, r));
  list.push(r);
}
fs.writeFileSync(path.join(out, '..', 'publist.json'), JSON.stringify(list.map(p => ({ path: p }))));
console.log(list.length, 'files');

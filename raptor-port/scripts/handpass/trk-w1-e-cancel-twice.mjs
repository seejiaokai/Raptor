/* [HUMAN-RETEST] Tracker — walker w1, walk E: answering CANCEL to one
   "Replace it?" question, and importing the SAME FILE TWICE (Fable #18, #19; D120).

   World A draws on two built-ins (a moved ball on 2026 and on Tx 2026) and adds
   a duplicate, then exports every chart.
   World B (wiped): Import, answering Cancel to 2026's question and Replace to
   the rest — what happens to 2026, and what does the closing message say?
   World C (wiped): Import, Replace everything; then the SAME file again,
   Replace everything — any duplicate chart, a changed order, a moved ball? */
import { open, shot, save, log, dlg, DESK, sleep, menu, pickSyl, curSylLabel, sylLabels, sylOptions,
  arrangeOn, arrangeOff, dragBy, drawn, exportVia, importVia, tmp } from './trk-w1-lib.mjs'

const L = log()
const FILE = tmp('w1-e-export.json')
const posOf = (d, id) => (d.balls.find(b => b.id === id) || {}).t

async function snapshotAll(page, tag) {
  const out = { labels: await sylLabels(page), charts: {} }
  for (const o of await sylOptions(page)) {
    await pickSyl(page, o.label.replace(/ ✎$/, ''))
    out.charts[o.label.replace(/ ✎$/, '')] = await drawn(page)
  }
  return out
}

/* ================= WORLD A ================= */
const A = await open({ size: DESK, who: 'a' })
const pa = A.page
await pickSyl(pa, '2026')
const ship2026 = posOf(await drawn(pa), 'ACG-03')
await arrangeOn(pa); await dragBy(pa, 'ACG-03', 140, 30); await arrangeOff(pa)
const moved2026 = posOf(await drawn(pa), 'ACG-03')
await pickSyl(pa, 'Tx 2026')
const shipTx = posOf(await drawn(pa), 'ACG-03')
await arrangeOn(pa); await dragBy(pa, 'ACG-03', -120, 40); await arrangeOff(pa)
const movedTx = posOf(await drawn(pa), 'ACG-03')
await pickSyl(pa, '2026')
await menu(pa, 'syl', 'dupSyl'); await dlg(pa, { value: '2026 COPY E' }); await sleep(900)
L.note('A: hand moves', `2026 ACG-03 ${ship2026} → ${moved2026}; Tx ACG-03 ${shipTx} → ${movedTx}; charts ${(await sylLabels(pa)).join(' · ')}`)
const ex = await exportVia(pa, { tick: 'all', file: FILE })
L.note('A: exported', ex.json.charts.sylcat.map(e => e.name).join(' · '))
await A.browser.close()

/* ================= WORLD B — Cancel to one question ================= */
const B = await open({ size: DESK, who: 'a' })
const pb = B.page
const askedB = await importVia(pb, FILE, async (msg, i, page) => {
  if (/^“2026” already exists/.test(msg)) { await shot(page, 'w1-07-B-question-2026'); return 'cancel' }
  if (/^(Brought in|Nothing)/.test(msg)) await shot(page, 'w1-07-B-closing-message')
  return 'ok'
})
L.note('B: the import asked / said', askedB.map(a => `"${a.msg}" → ${a.ans}`).join(' || '))
const closing = (askedB.find(a => /^(Brought in|Nothing)/.test(a.msg)) || {}).msg || '(none)'
L.note('B: the closing message', closing)
L.note('B: does the closing message mention the chart that was NOT brought in?', /skipp|kept|not brought|left/i.test(closing) ? 'yes' : 'no — it lists only what came in')
await pickSyl(pb, '2026')
const b2026 = posOf(await drawn(pb), 'ACG-03')
await shot(pb, 'w1-07-B-2026-after-cancel')
L.ok('B: after Cancel, 2026 is the wiped app\'s own 2026 (the hand move did not come in)', b2026 === ship2026, `ACG-03 ${b2026} (shipped ${ship2026}, his move ${moved2026})`)
await pickSyl(pb, 'Tx 2026')
const bTx = posOf(await drawn(pb), 'ACG-03')
L.ok('B: the charts answered Replace came in (Tx\'s hand move is there)', bTx === movedTx, `Tx ACG-03 ${bTx} (his move ${movedTx})`)
L.note('B: charts after', (await sylLabels(pb)).join(' · '))
await B.browser.close()

/* ================= WORLD C — the same file twice ================= */
const C = await open({ size: DESK, who: 'a' })
const pc = C.page
const asked1 = await importVia(pc, FILE)
const s1 = await snapshotAll(pc, 'C1')
await pickSyl(pc, '2026'); await shot(pc, 'w1-08-C-after-first-import')
const asked2 = await importVia(pc, FILE, async (msg, i, page) => { if (i === 0) await shot(page, 'w1-08-C-second-import-question'); return 'ok' })
L.note('C: the second import asked', asked2.map(a => `"${a.msg.slice(0, 70)}"`).join(' || '))
const s2 = await snapshotAll(pc, 'C2')
await pickSyl(pc, '2026'); await shot(pc, 'w1-08-C-after-second-import')
L.ok('C: no duplicate charts after the second import', s2.labels.length === s1.labels.length && new Set(s2.labels.map(l => l.replace(/ ✎$/, ''))).size === s2.labels.length, `after 1st: ${s1.labels.join(' · ')}  |  after 2nd: ${s2.labels.join(' · ')}`)
L.ok('C: the order is unchanged by the second import', JSON.stringify(s1.labels) === JSON.stringify(s2.labels))
let diffs = 0, sample = ''
for (const [name, d1] of Object.entries(s1.charts)) {
  const d2 = s2.charts[name]; if (!d2) { diffs++; sample = sample || `${name} missing`; continue }
  const bad = d1.balls.filter(b => { const y = d2.balls.find(z => z.id === b.id); return !y || y.t !== b.t || y.txt !== b.txt || y.fs !== b.fs })
  const lineSame = d1.lines.join('\n') === d2.lines.join('\n')
  if (bad.length || !lineSame || d1.balls.length !== d2.balls.length) { diffs++; sample = sample || `${name}: ${bad.length} balls differ, lines ${lineSame ? 'same' : 'DIFFER'}` }
}
L.ok('C: every ball and line on every chart is where the first import put it', diffs === 0, diffs ? sample : `${Object.keys(s1.charts).length} charts identical`)
L.ok('C: his hand moves survived both imports', posOf(s2.charts['2026'], 'ACG-03') === moved2026 && posOf(s2.charts['Tx 2026'], 'ACG-03') === movedTx, `2026 ACG-03 ${posOf(s2.charts['2026'], 'ACG-03')}, Tx ${posOf(s2.charts['Tx 2026'], 'ACG-03')}`)
save('w1-e-cancel-twice', { rows: L.rows, askedB, asked1, asked2, labels1: s1.labels, labels2: s2.labels, errorsA: A.errors, errorsB: B.errors, errorsC: C.errors })
console.log(`errors A ${A.errors.length} B ${B.errors.length} C ${C.errors.length}: ${[...A.errors, ...B.errors, ...C.errors].slice(0, 4).join(' | ')}`)
await C.browser.close()

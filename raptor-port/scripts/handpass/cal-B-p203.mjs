/* P2-03 — starting a run removes conflicting picked overrides in one step (D637). */
import * as B from './cal-B-lib.mjs'
const size = process.argv[2] || 'desk'
const w = await B.world(size)
const p = w.page, S = w.key
const pics = []
const J = d => `2026-07-${String(d).padStart(2, '0')}`
const DAYS = [11, 12, 13, 14, 15, 16, 17, 20, 21, 22]
const typeStr = async s => {
  if (!w.phone) { await p.keyboard.type(s); return }
  for (const ch of s) await B.press(w, B.tid(w, `fly-pad-${ch}`))
}
const nextKey = async () => { if (w.phone) await B.press(w, B.tid(w, 'fly-pad-next')); else await p.keyboard.press('Enter') }
const read = async (row = 'req-p') => { const o = {}; for (const d of DAYS) o[d] = await B.txt(B.cell(w, row, J(d))); return o }
const fmt = o => Object.entries(o).map(([d, v]) => `${d}:${v}`).join(' ')
/* go to July through the month button */
await B.press(w, B.tid(w, 'month-JUL')); await B.sleep(700)
await B.reveal(w, J(14))
console.log('JULY BASE', fmt(await read()))
/* the typed figures, through the real cell: 13..17 July = 11,12,13,14,15 (Enter moves to the next flying day) */
await B.press(w, B.cell(w, 'req-p', J(13))); await B.sleep(300)
const figsTyped = ['11', '12', '13', '14', '15']
for (let i = 0; i < 5; i++) { await typeStr(figsTyped[i]); await nextKey(); await B.sleep(250) }
/* leave the editor */
if (w.phone) await B.press(w, B.tid(w, 'fly-pad-done')); else await p.keyboard.press('Escape')
await B.sleep(300)
const typed = await read()
pics.push(await B.pic(p, `P2-03-${S}-1-typed-figures`))
console.log('TYPED', fmt(typed))
/* pick Sat 11 .. Fri 17 on the P row */
await B.reveal(w, J(14))
await B.dragPick(w, B.cell(w, 'req-p', J(11)), B.cell(w, 'req-p', J(17)))
const panelUp = (await B.tid(w, 'req-panel').count()) > 0
await B.tid(w, 'req-panel-num').fill('9')
await B.sleep(250)
const runBtn = await B.txt(B.tid(w, 'req-panel-run'))
console.log('RUN BUTTON', runBtn)
await B.press(w, B.tid(w, 'req-panel-run')); await B.sleep(300)
const panelRun = await B.txt(B.tid(w, 'req-panel'))
const litRun = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="req-p-2026-07-"].pick, [data-testid^="req-w-2026-07-"].pick')].map(e => e.getAttribute('data-testid').slice(4)))
pics.push(await B.pic(p, `P2-03-${S}-2-from-on-panel`))
await B.press(w, B.tid(w, 'req-panel-apply')); await B.sleep(600)
const after = await read()
const answers = await p.evaluate(ds => ds.map(d => [d, JSON.stringify(window.flyAnswer(d))]), DAYS.map(J))
pics.push(await B.pic(p, `P2-03-${S}-3-after-apply`))
console.log('AFTER', fmt(after))
/* one Undo */
await B.undo(w)
const undone = await read()
pics.push(await B.pic(p, `P2-03-${S}-4-one-undo`))
console.log('UNDONE', fmt(undone))
const redoBtn = w.page.locator('#redoBtn')
const checks = [
  ['panel came up', panelUp, ''],
  ['button names Mon 13 Jul (first eligible flying weekday)', /13 Jul/.test(runBtn), runBtn],
  ['after Apply: 13..17 Jul all show 9 (typed overrides gone)', [13, 14, 15, 16, 17].every(d => after[d] === '9'), fmt(after)],
  ['weekend 11/12 not given a figure by the run (dash)', after[11] === '–' && after[12] === '–', `${after[11]} ${after[12]}`],
  ['the run carries on: 20, 21, 22 Jul show 9', [20, 21, 22].every(d => after[d] === '9'), fmt(after)],
  ['ONE Undo restores the originals 11..15 on 13..17 and no run', [13, 14, 15, 16, 17].every((d, i) => undone[d] === figsTyped[i]) && [20, 21, 22].every(d => undone[d] === '–') , fmt(undone)],
]
const bad = checks.filter(c => !c[1])
B.row('P2-03', S, 'Typed 11,12,13,14,15 on Req P 13-17 Jul through the real cell (Enter advances); picked Sat 11..Fri 17 (P row) by hold/drag; 9 -> From … on -> Apply; one Undo',
  checks.map(c => `${c[1] ? 'ok' : 'XX'} ${c[0]} [${c[2]}]`).join(' | ') + ` || panel(run): ${panelRun} || lit: ${litRun.join(',')} || resolver: ${answers.map(a => a[0].slice(8) + '=' + a[1].slice(0, 70)).join(' ; ')}`,
  bad.length ? 'FAIL' : 'PASS', pics)
B.noteErrors('p203-' + S, w.errors)
await B.close(w)

/* P2-02 — a mixed selection lights only cells that will take the number (D636, D637). Then P2-03 in the same world. */
import * as B from './cal-B-lib.mjs'
const size = process.argv[2] || 'desk'
const w = await B.world(size)
const p = w.page, S = w.key
const DAYS = ['2026-01-09', '2026-01-10', '2026-01-11', '2026-01-12', '2026-01-13', '2026-01-14', '2026-01-15', '2026-01-16']
const NAMES = ['Fri9 weekday', 'Sat10 flying wkend', 'Sun11 unset wkend', 'Mon12 PH', 'Tue13 Off', 'Wed14 NF', 'Thu15 weekday', 'Fri16 weekday']
/* BACKGROUND (seeded): Sat 10 set to day flying, Wed 14 no-fly, Mon 12 a PH, Tue 13 an Off day */
await p.evaluate(() => {
  window.setFlyDays([{ iso: '2026-01-10', cls: 'day' }, { iso: '2026-01-14', cls: 'nf' }])
  window.lwSetDayEvent('2026-01-12', 0, 'PH')
  window.lwSetDayEvent('2026-01-13', 0, 'Off day')
})
await B.sleep(500)
await B.reveal(w, '2026-01-12')
const snap = async () => {
  const o = []
  for (const d of DAYS) {
    const read = async r => p.evaluate(([row, iso]) => { const e = document.querySelector(`[data-testid="${row}-${iso}"]`); if (!e) return null; const cs = getComputedStyle(e); return { t: e.innerText.trim(), cls: e.className, bg: cs.backgroundColor, sh: cs.boxShadow !== 'none' ? 'shadow' : '' } }, [r, d])
    o.push({ d, p: await read('req-p'), w: await read('req-w') })
  }
  return o
}
const fig = s => s.map(x => `${x.d.slice(8)}:${x.p?.t}/${x.w?.t}`).join(' ')
const lit = s => s.filter(x => (x.p && /\bpick\b/.test(x.p.cls)) || (x.w && /\bpick\b/.test(x.w.cls))).map(x => x.d.slice(8) + ((x.p && /\bpick\b/.test(x.p.cls)) ? 'P' : '') + ((x.w && /\bpick\b/.test(x.w.cls)) ? 'W' : ''))
const pressTid = async id => B.press(w, B.tid(w, id))
const base = await snap()
console.log('BASE', fig(base))
const pics = []
const gestures = w.phone ? ['finger'] : ['mouse', 'shift', 'hold']
const results = {}
for (const g of gestures) {
  await B.reveal(w, '2026-01-12')
  const from = B.cell(w, 'req-p', DAYS[0]), to = B.cell(w, 'req-w', DAYS[7])
  await B.dragPick(w, from, to, { shift: g === 'shift', pause: g === 'hold' ? 700 : 0 })
  const panelUp = (await B.tid(w, 'req-panel').count()) > 0
  if (!panelUp) { results[g] = { panelUp }; pics.push(await B.pic(p, `P2-02-${S}-${g}-0-nopanel`)); continue }
  const panelText0 = await B.txt(B.tid(w, 'req-panel'))
  await B.tid(w, 'req-panel-num').fill('7')
  await B.sleep(250)
  const s1 = await snap(), lit1 = lit(s1)
  const panelText1 = await B.txt(B.tid(w, 'req-panel'))
  pics.push(await B.pic(p, `P2-02-${S}-${g}-1-lit-left-out`))
  const hasInc = (await B.tid(w, 'req-panel-include').count()) > 0
  let lit2 = null, panelText2 = null, incLabel0 = null
  if (hasInc) { incLabel0 = await B.txt(B.tid(w, 'req-panel-include')); await pressTid('req-panel-include'); await B.sleep(250); const s2 = await snap(); lit2 = lit(s2); panelText2 = await B.txt(B.tid(w, 'req-panel')); pics.push(await B.pic(p, `P2-02-${S}-${g}-2-lit-included`)) }
  /* apply with Include on (if offered) */
  await pressTid('req-panel-apply'); await B.sleep(500)
  const sAfterInc = await snap()
  const panelGone = (await B.tid(w, 'req-panel').count()) === 0
  pics.push(await B.pic(p, `P2-02-${S}-${g}-3-applied-included`))
  await B.undo(w)
  const sUndo = await snap()
  /* again, without Include */
  await B.reveal(w, '2026-01-12')
  await B.dragPick(w, B.cell(w, 'req-p', DAYS[0]), B.cell(w, 'req-w', DAYS[7]), { shift: g === 'shift', pause: g === 'hold' ? 700 : 0 })
  await B.tid(w, 'req-panel-num').fill('7'); await B.sleep(250)
  const litB = lit(await snap())
  await pressTid('req-panel-apply'); await B.sleep(500)
  const sAfter = await snap()
  pics.push(await B.pic(p, `P2-02-${S}-${g}-4-applied-leftout`))
  await B.undo(w)
  const sUndo2 = await snap()
  results[g] = { panelUp, panelText0, panelText1, lit1, hasInc, incLabel0, lit2, panelText2, afterInclude: fig(sAfterInc), undone: fig(sUndo) === fig(base), litB, afterLeftOut: fig(sAfter), undone2: fig(sUndo2) === fig(base), panelGone }
  console.log(g, JSON.stringify(results[g]))
}
/* judge: expected sets */
const exp7 = (included) => { const o = { '09': 1, '10': 1, '15': 1, '16': 1 }; if (included) { o['11'] = 1; o['12'] = 1; o['13'] = 1 } return o }
const changed = (afterStr, includeOn) => {
  const m = {}; for (const part of afterStr.split(' ')) { const [d, v] = part.split(':'); const [pp, ww] = v.split('/'); m[d] = [pp, ww] }
  return m
}
const verdicts = []
for (const g of Object.keys(results)) {
  const r = results[g]; if (!r.panelUp) { verdicts.push([g, false, 'no panel']); continue }
  const incMap = changed(r.afterInclude), outMap = changed(r.afterLeftOut)
  const gotInc = Object.entries(incMap).filter(([d, v]) => v[0] === '7' && v[1] === '7').map(([d]) => d).sort()
  const gotOut = Object.entries(outMap).filter(([d, v]) => v[0] === '7' && v[1] === '7').map(([d]) => d).sort()
  const nf7 = incMap['14'][0] === '7' || outMap['14'][0] === '7' || incMap['14'][1] === '7'
  verdicts.push([g, JSON.stringify({ gotInc, gotOut, nf7, nfAfter: incMap['14'], litLeftOut: r.litB, lit1: r.lit1, lit2: r.lit2 }), r.undone && r.undone2])
}
console.log('VERDICTS', JSON.stringify(verdicts))
B.row('P2-02-raw', S, 'Mixed pick Fri 9..Fri 16 (weekdays, flying Sat, unset Sun, PH Mon, Off Tue, NF Wed) x P and W; typed 7 under These days; toggled Include; applied each way; Undo — by gesture ' + gestures.join('/'),
  JSON.stringify(results).slice(0, 3000), 'RAW', pics)
B.noteErrors('p202-' + S, w.errors)
await B.close(w)

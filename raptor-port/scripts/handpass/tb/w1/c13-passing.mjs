import * as F from './fx.mjs'
const { L } = F
console.log('w1 c13-passing v1')
const w = await L.world('phone')
const p = w.page
try {
  const crew = await F.publishSat(w, { crew: true })
  await F.toWar(w)
  const longest = await p.evaluate(() => { const W = window; return Object.keys(W.PEOPLE).map(id => [id, W.PEOPLE[id].cs]).filter(x => x[1]).sort((a, b) => String(b[1]).length - String(a[1]).length).slice(0, 4) })
  console.log('longest callsigns on the roster', JSON.stringify(longest), 'crew', JSON.stringify(crew.cs))
  const set = await p.evaluate(d => [['plasma', 'LL'], ['mamba', 'OL'], ['bapster', 'LL'], ['haowen', 'LL']].map(([id, c]) => [id, window.lwSetCell(id, d, c)]), F.SAT)
  console.log('set', JSON.stringify(set))
  await L.sleep(900)
  await p.evaluate(() => window.clearToast && window.clearToast())
  let n = await F.readNote(p)
  if (n.expanded !== 'true') { await w.press('[data-testid="clash-line"]'); await L.sleep(400); n = await F.readNote(p) }
  await p.evaluate(() => window.clearToast && window.clearToast())
  const info = { line: n.line, rows: n.rows.map(r => [r.who, r.day, r.go, r.what, 'nameCut=' + r.nameCut, 'dayLines=' + r.dayLines]), whoL: [...new Set(n.rows.map(r => r.whoL))], dayL: [...new Set(n.rows.map(r => r.dayL))], doR: [...new Set(n.rows.map(r => r.doR))], gridTop: n.gridTop, vh: await p.evaluate(() => innerHeight), overflowX: n.overflowX }
  console.log('INFO', JSON.stringify(info))
  await L.pic(w, 'passing-phone-longest-callsign-open-list')
} finally { await L.close(w) }

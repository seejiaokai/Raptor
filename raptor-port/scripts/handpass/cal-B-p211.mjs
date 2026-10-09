/* P2-11 — Undo preserves the visible location and finds hidden changes (D670, D672). */
import * as B from './cal-B-lib.mjs'
const size = process.argv[2] || 'desk'
const w = await B.world(size)
const p = w.page, S = w.key
const pics = [], log = [], checks = []
const note = (k, v) => { log.push(`${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`); console.log('  >', k, typeof v === 'string' ? v : JSON.stringify(v)) }
const chk = (name, ok, detail = '') => { checks.push([name, !!ok, detail]); console.log(ok ? '  ok' : '  XX', name, detail) }
const at = () => p.evaluate(() => ({ x: document.querySelector('.mx-wrap').scrollLeft, y: window.scrollY }))
const place = d => p.evaluate(d => {
  const wrap = document.querySelector('.mx-wrap'); const wr = wrap.getBoundingClientRect()
  const frozen = wrap.querySelector('.who').getBoundingClientRect().width + (wrap.querySelector('.bal') ? wrap.querySelector('.bal').getBoundingClientRect().width : 0)
  const h = document.querySelector(`[data-testid="head-${d}"]`); if (!h) return { drawn: false, past: 0, inView: false }
  const c = h.getBoundingClientRect()
  return { drawn: true, past: Math.round(c.left - (wr.left + frozen)), inView: c.left >= wr.left + frozen - 0.5 && c.right <= wr.right + 0.5 }
}, d)
const typeStr = async s => { if (!w.phone) { await p.keyboard.type(s); return } for (const ch of s) await B.press(w, B.tid(w, `fly-pad-${ch}`)) }
const TARGETS = {
  req: { d: '2026-02-10', name: 'a Required P figure', async edit() { await B.press(w, B.cell(w, 'req-p', this.d)); await B.sleep(250); await typeStr('15'); if (w.phone) await B.press(w, B.tid(w, 'fly-pad-done')); else { await p.keyboard.press('Enter'); await B.sleep(200); await p.keyboard.press('Escape') } await B.sleep(400) }, async state() { return (await B.txt(B.cell(w, 'req-p', this.d))) === '15' } },
  event: { d: '2026-02-11', name: 'an Event cell (PH)', async edit() { await B.press(w, B.tid(w, `event-0-${this.d}`)); await B.sleep(300); await B.press(w, B.tid(w, 'event-quick-0')); await B.press(w, B.tid(w, 'event-apply')); await B.sleep(400) }, async state() { return (await B.txt(B.tid(w, `event-0-${this.d}`))) === 'PH' } },
  person: { d: '2026-02-12', name: 'a person cell (Drifter LL)', async edit() { const c = B.cell(w, 'cell-slipway', this.d); await B.press(w, c, { dx: 8, dy: 8 }); await B.sleep(400); await B.press(w, B.tid(w, 'bid-LL')); await B.sleep(500); if (await B.tid(w, 'bid-picker').count()) { await p.keyboard.press('Escape'); await B.sleep(200) } }, async state() { return /LL/.test(await B.txt(B.cell(w, 'cell-slipway', this.d))) } },
}
const settle = () => B.sleep(450)
for (const [key, T] of Object.entries(TARGETS)) {
  /* PHASE 1: visible */
  await B.press(w, B.tid(w, 'month-FEB')); await settle()
  await p.evaluate(() => window.scrollTo(0, 0)); await B.sleep(200)
  /* bring the data row into the window vertically (the Event rows and Required rows are at the top; a person row lower) */
  if (key === 'person') { await p.evaluate(() => { const e = document.querySelector('[data-testid="cell-slipway-2026-02-12"]'); window.scrollBy(0, e.getBoundingClientRect().top - (innerHeight < 700 ? 260 : 320)) }); await B.sleep(250) }
  let pl = await place(T.d)
  if (!(pl.inView && pl.past > 60)) { await p.evaluate(n => { document.querySelector('.mx-wrap').scrollLeft += n }, pl.past - 120); await B.sleep(300); pl = await place(T.d) }
  note(`${key} start: ${T.d} placed`, JSON.stringify(pl))
  await T.edit()
  const edited = await T.state()
  const x0 = await at()
  pics.push(await B.pic(p, `P2-11-${S}-${key}-1-edited-in-view`))
  await B.undo(w); await settle()
  const u = await at(), uState = await T.state()
  chk(`${key}: Undo with the day in view — change taken back, grid not moved`, edited && !uState && Math.abs(u.x - x0.x) < 1.5 && Math.abs(u.y - x0.y) < 1.5, `edited=${edited} afterUndo=${uState} scroll ${JSON.stringify(x0)} -> ${JSON.stringify(u)}`)
  pics.push(await B.pic(p, `P2-11-${S}-${key}-2-undo-in-view`))
  await B.redo(w); await settle()
  const r = await at(), rState = await T.state()
  chk(`${key}: Redo with the day in view — change back, grid not moved`, rState && Math.abs(r.x - x0.x) < 1.5 && Math.abs(r.y - x0.y) < 1.5, `redone=${rState} scroll ${JSON.stringify(r)}`)
  /* a small nudge keeps where HE put it */
  await p.evaluate(() => { document.querySelector('.mx-wrap').scrollLeft += 40 }); await B.sleep(250)
  const pn = await place(T.d), xn = await at()
  await B.undo(w); await settle()
  const un = await at(), ns = await T.state()
  chk(`${key}: Undo after a small nudge (day still in view) — grid stays where he put it`, pn.inView && !ns && Math.abs(un.x - xn.x) < 1.5, `inView=${pn.inView} ${xn.x} -> ${un.x}`)
  await B.redo(w); await settle()
  /* PHASE 2: hidden — scroll far away (June), then Undo */
  await p.evaluate(() => window.scrollTo(0, 0)); await B.sleep(200); await B.press(w, B.tid(w, 'month-JUN')); await settle()
  if (key === 'person') { /* keep the same vertical */ }
  const hidden = await place(T.d)
  await B.undo(w); await B.sleep(250)
  const early = await B.pic(p, `P2-11-${S}-${key}-3-undo-hidden-early`)
  pics.push(early)
  await settle()
  const after = await place(T.d), hs = await T.state()
  chk(`${key}: Undo with the day scrolled away — taken back, and the grid brings the day into view`, hidden.inView === false && !hs && after.inView, `before: ${JSON.stringify(hidden)} after: ${JSON.stringify(after)} undone=${!hs}`)
  pics.push(await B.pic(p, `P2-11-${S}-${key}-4-undo-hidden-landed`))
  /* Redo hidden */
  await p.evaluate(() => window.scrollTo(0, 0)); await B.sleep(200); await B.press(w, B.tid(w, 'month-JUN')); await settle()
  const hidden2 = await place(T.d)
  await B.redo(w); await settle()
  const after2 = await place(T.d), rs = await T.state()
  chk(`${key}: Redo with the day scrolled away — brought back into view`, hidden2.inView === false && rs && after2.inView, `before: ${JSON.stringify(hidden2)} after: ${JSON.stringify(after2)} redone=${rs}`)
}
const bad = checks.filter(c => !c[1])
B.row('P2-11', S, 'For a Required figure, an Event cell and a person cell (each edited through its own control): Undo/Redo with the day in view; after a small nudge; with the day scrolled away to June',
  checks.map(c => `${c[1] ? 'ok' : 'XX'} ${c[0]} [${c[2]}]`).join(' | '), bad.length ? 'FAIL' : 'PASS', pics)
B.noteErrors('p211-' + S, w.errors)
await B.close(w)

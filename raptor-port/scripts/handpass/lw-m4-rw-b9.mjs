// Re-walk walker B, lesson 4 on a phone: (a) with "Pick dates..." open, press a line's Approve behind it; (b) with the slim bar up,
// tap another cell on the grid (the grid answers). Chromium 402x874.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot, rec } = B
console.log('[lw-m4-rw-b9 v2]')
const w = await B.newPhone(402, 874, 'chromium'); const P = w.page
const box = sel => P.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return r.height > 0 ? { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) } : null }, sel)
try {
  await B.signIn(w, 'admin')
  await B.openApprovals(w); await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  await B.press(w, T('appr-pick'), 'b9-pick-q'); await B.sleep(w, 700); await shot(w, 'b9-pick-open')
  const pk = await P.evaluate(() => { const c = [...document.querySelectorAll('*')].filter(e => /range|picker|cal/i.test(String(e.className)) && e.getBoundingClientRect().height > 100 && e.getBoundingClientRect().width > 150).map(e => ({ cls: String(e.className).slice(0, 30), id: e.dataset.testid || '' })); return c.slice(0, 5) })
  console.log('picker-like boxes', JSON.stringify(pk), 'range testid visible:', await B.vis(P, T('appr-range')))
  const open0 = await B.vis(P, T('appr-range'))
  /* the second line's Approve: is its middle covered by the picker? */
  const info = await P.evaluate(() => { const ls = [...document.querySelectorAll('[data-testid^="appr-line-"]')].filter(e => e.getBoundingClientRect().height > 0); const l = ls[0]; l.setAttribute('data-walk', 'last'); const b = l.querySelector('.appr-ok'); const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { who: l.dataset.testid, y: Math.round(r.top), covered: !(b === h || b.contains(h)), over: h ? h.tagName + '.' + String(h.className).slice(0, 30) : null, pending: document.querySelector('[data-testid="appr-sub"]').innerText.trim() } })
  console.log('last line', JSON.stringify(info))
  const c = await B.centre(P, '[data-walk="last"] .appr-ok', false); console.log('tap point', JSON.stringify(c))
  await B.tapAt(w, c.x, c.y, 'b9-behind-q'); await B.sleep(w, 700); await shot(w, 'b9-behind')
  const after = await P.evaluate(() => { const l = document.querySelector('[data-walk="last"]'); return { cls: l.className, ok: l.querySelector('.appr-ok').innerText.trim(), sub: document.querySelector('[data-testid="appr-sub"]').innerText.trim() } })
  const open1 = await B.vis(P, T('appr-range'))
  console.log('picker open before/after the press:', open0, open1, 'line', JSON.stringify(after))
  /* the rule: a press outside closes it (designer 14); whether the same press also reaches the button is read, not assumed */
  rec('B lesson 4a: Pick dates... open, press a line behind it', 'phone', open0 && !open1 ? 'PASS' : (open0 ? 'FAIL' : 'NOT WALKED'), `picker open ${open0} -> ${open1}; the pressed line's button covered by the picker: ${info.covered} (${info.over}); line now "${after.ok}" ${after.cls}; header ${info.pending} -> ${after.sub}`, ['b9-pick-open.png', 'b9-behind-q.png', 'b9-behind.png'])
  /* (b) the slim bar up, tap another cell */
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  await P.evaluate(() => { const ls = [...document.querySelectorAll('[data-testid^="appr-line-"]')].filter(e => e.getBoundingClientRect().height > 0); ls[0].setAttribute('data-walk', 'first') })
  await B.press(w, '[data-walk="first"] [data-testid="appr-dates"]', null); await B.sleep(w, 1200)
  const slim = await box(T('appr-slim'))
  const ringId = await P.evaluate(() => { const t = document.querySelector('td.lw-ring'); return t ? t.dataset.testid : null })
  const cell = await P.evaluate((ring) => [...document.querySelectorAll('td[data-testid^="cell-"]')].map(td => { const r = td.getBoundingClientRect(); return { id: td.dataset.testid, l: r.left, t: r.top, b: r.bottom, w: r.width } }).filter(c => c.id !== ring && c.l > 120 && c.l + c.w < 380 && c.t > 340 && c.b < 790).sort((a, b) => b.b - a.b)[0], ringId)
  console.log('ring on', ringId, 'slim', JSON.stringify(slim), 'another cell', JSON.stringify(cell))
  if (!slim || !cell) rec('B lesson 4b: slim bar up, tap another cell', 'phone', 'NOT WALKED', `slim ${JSON.stringify(slim)} cell ${JSON.stringify(cell)}`, [])
  else {
    await B.tapAt(w, cell.l + cell.w / 2, (cell.t + cell.b) / 2, 'b9-cell-q'); await B.sleep(w, 700); await shot(w, 'b9-cell')
    const win = await P.evaluate(() => { const e = [...document.querySelectorAll('[data-testid="bid-picker"], .bidsheet')].find(x => x.getBoundingClientRect().height > 0); return e ? { id: e.dataset.testid || e.className, txt: e.innerText.replace(/\s+/g, ' ').slice(0, 80) } : null })
    const slim2 = await box(T('appr-slim')); const ring2 = await P.evaluate(() => { const t = document.querySelector('td.lw-ring'); return t ? t.dataset.testid : null })
    rec('B lesson 4b: slim bar up, tap another cell: the grid answers', 'phone', win ? 'PASS' : 'FAIL', `tapped ${cell.id}; window ${JSON.stringify(win)}; slim bar after ${JSON.stringify(slim2)}; ring was ${ringId} now ${ring2}`, ['b9-cell-q.png', 'b9-cell.png'])
  }
} catch (e) { rec('ERROR', 'phone', 'FAIL', String(e).slice(0, 400)); await shot(w, 'b9-error').catch(() => {}) }
if (w.errs.length) rec('console', 'phone', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close()
B.writeResults('b9')
await B.closeAll()
console.log('DONE')

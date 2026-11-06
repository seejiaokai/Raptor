// Walker script 1 (6 Nov 26): S1 (a) words go to the bid they were typed for. SIZE=desk|phone  ONLY=s1
process.env.LW_OUT ||= '2026-11-06-lw-faults/walk'
process.env.WNAME = 'w1'
const { L, row, T, openNow, elAt, fresh, finish } = await import('./lw-f1106-w0.mjs')
console.log('[lw-f1106-w1 v1]', L.SIZE, L.DIST)
const SIZE = L.SIZE
const w = await fresh(SIZE)
const P = w.page
const id = await L.pidOf(P, 'Drifter')
const D = L.day(16)
const openLow = async (fy = 0.85) => { await L.reachCell(w, id, D); const l = P.locator(T(L.cellId(id, D))).first(); await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await P.waitForTimeout(200); const b = await l.boundingBox(); await L.finger(w, b.x + b.width / 2, b.y + b.height * fy); await P.waitForTimeout(450) }
const rd =() => P.evaluate(() => { const e = document.querySelector('[data-testid="bid-remarks"]'); return e ? e.value : null })
try {
  await L.openCell(w, id, D)
  await L.autoApprove(w, false)
  await L.press(w, T('portion-am'), `s1-${SIZE}-am-q`)
  await P.waitForTimeout(300)
  await P.locator(T('bid-remarks')).first().click()
  await P.keyboard.type('Am')
  await L.shot(w, `s1-${SIZE}-1-am-typed`)
  const ok1 = await L.placeLeave(w, 'LL', `s1-${SIZE}-ll-q`)
  await L.settle(w)
  const afterAm = await L.cellWords(w, id, D)
  await openLow()
  const lit = await P.evaluate(() => ['portion-full', 'portion-am', 'portion-pm'].map(t => t + ':' + (document.querySelector(`[data-testid="${t}"]`)?.getAttribute('aria-pressed') ?? document.querySelector(`[data-testid="${t}"]`)?.className)))
  const v = await rd()
  await L.shot(w, `s1-${SIZE}-2-reopen`)
  row('S1a-reopen', SIZE, 'AM + "Am" + LL, tap the day again (low half of the cell). Brief expected PM + empty box; the window instead opened on the placed AM bid', `placed=${ok1}; cell=${afterAm}; portions=${lit.join(' ')}; Remarks value on reopen=${JSON.stringify(v)}`, 'RECORD', [`s1-${SIZE}-1-am-typed`, `s1-${SIZE}-2-reopen`])
  // geometry of the open bid window
  const geo = await P.evaluate(() => { const r = t => { const e = document.querySelector(`[data-testid="${t}"]`); if (!e) return null; const b = e.getBoundingClientRect(); return { t, y: Math.round(b.top), h: Math.round(b.height), mid: Math.round(b.top + b.height / 2), x: Math.round(b.left), w: Math.round(b.width) } }
    return ['bid-remarks', 'bid-till', 'bid-tilldate', 'bid-doc-row'].map(r) })
  console.log(JSON.stringify(geo))
  await L.shot(w, `s1-${SIZE}-3-geometry`)
  const mids = geo.filter(Boolean).map(g => g.mid)
  const spread = mids.length ? Math.max(...mids) - Math.min(...mids) : null
  row('S1-lesson23', SIZE, 'measured Remarks box, till tick, till date, Document', `${geo.map(g => g ? `${g.t}: top ${g.y} h ${g.h} mid ${g.mid}` : 'missing').join('; ')}; spread of middles=${spread}px`, spread !== null && spread <= 3 && !geo.some(g => !g) ? 'PASS' : 'RECORD', [`s1-${SIZE}-3-geometry`])
  await L.press(w, T('portion-pm'), 'S1-pm-q'.toLowerCase().replace('s1', 's1-' + SIZE))
  await P.waitForTimeout(300)
  const vPm = await rd()
  await L.shot(w, 's1-' + SIZE + '-3b-pm-pressed')
  row('S1a', SIZE, 'in the reopened window press PM (a new half), read Remarks', 'Remarks value after PM pressed=' + JSON.stringify(vPm), vPm === '' ? 'PASS' : 'FAIL', ['s1-' + SIZE + '-3b-pm-pressed'])
  await P.locator(T('bid-remarks')).first().click()
  await P.keyboard.type('Pm')
  const ok2 = await L.placeLeave(w, 'OL', `s1-${SIZE}-ol-q`)
  await L.settle(w)
  const both = await L.cellWords(w, id, D)
  await L.rowShot(w, id, L.day(14), L.day(18), `s1-${SIZE}-4-row`)
  // read each half's words by opening the day (a list, or the half's window)
  const seen = []
  const halves = {}
  for (const [k, fy] of [['top', 0.2], ['low', 0.85]]) {
    await openLow(fy)
    halves[k] = await P.evaluate(() => ({ remarks: [...document.querySelectorAll('input[type=text],input:not([type]),textarea')].filter(e => e.getBoundingClientRect().width > 0 && e.id !== 'searchE' && !/search/i.test(e.id + (e.dataset.testid||''))).map(e => e.value).join('|'), lit: [...document.querySelectorAll('[data-testid]')].filter(e => /^(dl-|bid-picker|sel-sheet)/.test(e.dataset.testid) && e.getBoundingClientRect().height>0).map(e=>e.dataset.testid).slice(0,6) }))
    await L.shot(w, 's1-' + SIZE + '-5-open-' + k)
    await L.settle(w)
  }
  const state = halves
  await L.settle(w)
  await L.openApprovals(w)
  const lines = await L.apprRead(w, id)
  await L.shot(w, `s1-${SIZE}-6-approvals`)
  const am = lines.find(l => /Am\b/.test(l.text)), pm = lines.find(l => /Pm\b/.test(l.text))
  row('S1b', SIZE, 'PM + "Pm" + OL; read both halves', `placed=${ok2}; cell=${both}; window after both: ${JSON.stringify(state)}; Approvals lines: ${JSON.stringify(lines.map(l => l.text))}`, am && pm && !/Pm/.test(am.text) && !/Am\b/.test(pm.text) ? 'PASS' : 'RECORD', [`s1-${SIZE}-4-row`, `s1-${SIZE}-5-open-top`, `s1-${SIZE}-5-open-low`, `s1-${SIZE}-6-approvals`])
} catch (e) { console.log('ERR', e.stack); row('S1', SIZE, 'script', 'stopped: ' + String(e).slice(0, 300), 'NOT WALKED') }
console.log('errs', JSON.stringify(w.errs))
finish('w1-' + SIZE)
await L.closeBrowser()

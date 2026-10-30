// The small fixes of 30 Oct 26 — fix 4's other redraws (the scenario list's S4-4, S4-5): what a month's memo compares by
// identity — the period's events (a holiday's tint on every row's column) and the person (a posting's hatch) — still draws
// every month that holds it, the whole year drawn on his PC's desktop. The change is written through the war's own writers
// on the localhost bridge (the holiday's Event line, the posting out), the controls that write them being unchanged by this
// job; what is checked is the GRID's redraw, read from every drawn row. SIZE=phone for WebKit.
process.env.LW_OUT ||= '2026-10-30-lw-small-fixes/s4b'
const L = await import('./lw-sf-lib.mjs')
const SIZE = process.env.SIZE || 'desk'
console.log('[lw-sf-s4b v1]', SIZE)
L.clearOut()
const w = await L.newCtx(SIZE === 'phone' ? 'phone' : 'desk'); const P = w.page
await L.signIn(w, 'admin')
await L.gotoMonth(w, 'NOV'); await P.waitForTimeout(1200)
/* S4-4: an Off day on a weekday of a month already drawn */
const D = '2026-11-18'
const tinted = () => P.evaluate(d => { const tds = [...document.querySelectorAll(`td[data-testid^="cell-"][data-testid$="-${d}"]`)]; return { rows: tds.length, tinted: tds.filter(td => /\bev[a-z]+\b/.test(td.className)).length   /* the event column's class (evoff, evnolv …) */, cls: tds[0]?.className } }, D)
const t0 = await tinted()
await P.evaluate(d => window.lwSetDayEvent(d, 0, 'Off day', 'off'), D); await P.waitForTimeout(500)
const t1 = await tinted()
await L.rowShot(w, 'bane', '2026-11-16', '2026-11-20', 's44-a-off-day')
L.rec('S4-4 an Off day added: every drawn row’s column tinted at once', SIZE, t1.rows > 10 && t1.tinted === t1.rows && t0.tinted === 0 ? 'PASS' : 'FAIL', `before ${JSON.stringify(t0)}; after ${JSON.stringify(t1)}`, ['s44-a-off-day'])
/* S4-5: a posting out moved across a month's edge — the hatch follows in both months */
const who = await L.pidOf(P, 'Drifter')
const gone = d => P.evaluate(([who, d]) => { const td = document.querySelector(`td[data-testid="cell-${who}-${d}"]`); return td ? /\bgone\b/.test(td.className) : null }   /* the hatch of a day posted out — the last day's own PO tag is not it */, [who, d])
const read = async () => ({ n29: await gone('2026-11-29'), n30: await gone('2026-11-30'), d1: await gone('2026-12-01'), d2: await gone('2026-12-02'), d3: await gone('2026-12-03') })
await P.evaluate(who => window.lwSetPostOut(who, '2026-12-02'), who); await P.waitForTimeout(500)
const a = await read()
await P.evaluate(who => window.lwSetPostOut(who, '2026-11-30'), who); await P.waitForTimeout(500)
const b = await read()
await L.rowShot(w, who, '2026-11-28', '2026-12-04', 's45-a-postout-30nov')
await P.evaluate(who => window.lwSetPostOut(who, '2026-12-02'), who); await P.waitForTimeout(500)
const c = await read()
await L.rowShot(w, who, '2026-11-28', '2026-12-04', 's45-b-postout-2dec')
const ok = !a.d1 && a.d2 && b.n29 === false && b.n30 && b.d1 && !c.d1 && c.d2
L.rec('S4-5 a posting moved across the month’s edge: the hatch follows in both months', SIZE, ok ? 'PASS' : 'FAIL', `PO from 2 Dec ${JSON.stringify(a)} → 30 Nov ${JSON.stringify(b)} → 2 Dec ${JSON.stringify(c)}`, ['s45-a-postout-30nov', 's45-b-postout-2dec'])
console.log('errors:', w.errs.length ? w.errs : 'none')
L.writeResults('s4b-' + SIZE)
await L.closeBrowser()

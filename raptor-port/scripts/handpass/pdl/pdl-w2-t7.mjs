/* pdl-w2-t7 v1 — T7 hide only (desktop, RECORD). Ranger: Mon 27 Jul lands 19:00; Tue 28 Jul VL 12:00-13:00 and RU 14:30-15:30 (amber advisory), B blank. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w2/t7-run1')
console.log('pdl-w2-t7 v1', process.env.HP_SHOTS)
const P = await import('./pdl-w2-lib.mjs')
const { X, L, sleep, check, note, pic, W2 } = P
const w = await X.world('desktop')
const { page } = w
await P.toWeek(page, '2026-07-27')
const A = w.ID('Ranger')
await L.board(page, 0); await sleep(400)
await P.flight(w, 0, { cs: 'RU', to: '1700', ld: '1900', who: A })
await L.closeBoard(page)
await L.board(page, 1); await sleep(400)
await P.flight(w, 1, { cs: 'VL', to: '1200', ld: '1300', who: A })
await P.flight(w, 1, { cs: 'RU', to: '1430', ld: '1530', who: A })
console.log('fixture', JSON.stringify(await page.evaluate(() => [[0, 0], [1, 0], [1, 1]].map(([d, g]) => { const f = window.DAYS[d].waves[g].formations[0]; return `${d}.${g}: ${f.cs} ${f.to}-${f.ld} p=${f.aircraft[0].p}` }))))
const wl0 = await W2.warnList(page)
console.log('draft board list', JSON.stringify(wl0.lines.map(l => `${l.ix}:${/ adv\b/.test(' ' + l.cls) ? 'AMBER' : / hard\b/.test(' ' + l.cls) ? 'RED' : l.cls}:${l.text}`)))
await L.closeBoard(page)
const s0 = await P.snapshot(w, 1, A, 't7-0-tue-draft-12h')
const sp = await X.signAndPublish(w, 1)
console.log('publish ORIG', JSON.stringify({ p: sp.p, tag: sp.h.tag }))
await L.closeBoard(page)
const s1 = await P.snapshot(w, 1, A, 't7-1-tue-orig-12h')
const lg = await P.setLogic(w, 'crewRest', '13h')
console.log('crewRest', JSON.stringify(lg))
await pic(page, 't7-2-logic-crewrest-13h')
const s2 = await P.snapshot(w, 1, A, 't7-3-tue-after-13h-before-hide')
/* on the board: find the amber line and press its ✕ */
await L.board(page, 1); await sleep(600)
const wl = await W2.warnList(page)
const sevOf = l => / hard\b/.test(' ' + l.cls) ? 'RED' : / adv\b/.test(' ' + l.cls) ? 'AMBER' : 'other:' + l.cls
console.log('board list before hide', JSON.stringify(wl.lines.map(l => `${l.ix}:${sevOf(l)}:${l.state || ''}:${l.text}`)))
const amber = wl.lines.find(l => sevOf(l) === 'AMBER' && !l.hid)
check('T7.0 fixture: an amber advisory for Ranger is on the published Tuesday', !!amber, amber ? `${amber.ix}: ${amber.text}` : 'none found: ' + JSON.stringify(wl.lines.map(l => sevOf(l) + ' ' + l.text)))
const pend = async () => { await L.closeBoard(page); await L.go(page, 'editsched'); await sleep(500); const h = await L.head(page, 1); const ap = await page.evaluate(() => (document.querySelector('#alPanel') || {}).innerText || '').then(t => t.replace(/\s+/g, ' ').trim()); return { pending: h.pending, alpub: h.alpub && h.alpub.text, tag: h.tag, nys: h.nys, ap } }
let s3 = null, s4 = null, hideInfo = null, pendHide = null
if (amber) {
  await W2.hideIx(page, 1, amber.ix)
  hideInfo = await W2.warnList(page)
  console.log('board list right after hide', JSON.stringify(hideInfo.lines.map(l => `${l.ix}:${sevOf(l)}:${l.hid ? 'HID' : 'live'}:${l.btn}:${l.text}`)))
  await pic(page, 't7-4-board-right-after-hide')
  s3 = await P.snapshot(w, 1, A, 't7-5-tue-after-hide')
  pendHide = await pend(); console.log('PENDING after hide', JSON.stringify(pendHide))
  const sp2 = await X.signAndPublish(w, 1)
  console.log('publish AL', JSON.stringify({ p: sp2.p, tag: sp2.h.tag }))
  await L.closeBoard(page)
  s4 = await P.snapshot(w, 1, A, 't7-6-tue-after-AL1')
}
const fmt = s => s ? `edit ${JSON.stringify(s.edit.items)} rings ${JSON.stringify(s.edit.rings)} | view ${JSON.stringify(s.view.items)} | board ${JSON.stringify(s.board && s.board.items)}` : 'n/a'
note('T7.1 published @12h, before the change (RECORD)', fmt(s1))
note('T7.2 crew rest 13h, before hiding (RECORD)', fmt(s2))
note('T7.3 after hiding the amber advisory (RECORD): Edit Schedule, board, View-only, crew rest line', fmt(s3))
note('T7.4 after Publish AL1 (RECORD the face)', fmt(s4) + ' | tags: ' + JSON.stringify(s4 && [s4.edit.tag, s4.view.tag]))
const pnd = await pend()
note('T7.5 Edit Schedule head after AL1 (RECORD)', JSON.stringify(pnd))
note('T7.6 Edit Schedule head / Amendments panel right after the hide, before AL1 (RECORD the pending count)', JSON.stringify(pendHide))
P.finish(w, { s0, s1, s2, s3, s4, hideInfo, wl })
await w.browser.close()

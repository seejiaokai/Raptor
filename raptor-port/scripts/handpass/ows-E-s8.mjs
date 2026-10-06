/* walker E — E16: SC MAIN published FO (B 06:00); then a leave 06:00–06:30 on 18 Jul filed through the Inputs page */
import * as E from './ows-E-lib.mjs'
import * as RC from './rbl-C-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, row, say, look, sum, setB, lineOf, scWave, oilOf, SAT, SATI } = E
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
const w = await scWave(p, SAT, 0, 'bane')
await setB(p, SAT, w.gi, 0, '06:00')
const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
const e0 = await look(p, 'bane', SATI, SAT, 'E16-before')
say('E16 before', sum(e0))
judge('E16.a', 'Saturday SC, Ranger first MAIN, B 06:00, published', [
  ['ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
  ['FO, 06:00–13:00', e0.cell === 'FO' && e0.times.join(',') === '06:00–13:00', { c: e0.cell, t: e0.times }],
], e0.pics)

/* the Inputs page's own form */
await A.toWeek(p); await L.go(p, 'inputs'); await p.waitForSelector('#inRangeBtn'); await sleep(500)
const opts = await p.evaluate(() => [...document.querySelectorAll('#inType option')].map(o => o.value + '|' + o.text))
const pF = await P(p, 'E16-inputs-form')
say('E16 types', JSON.stringify(opts))
const pick = 'LL'   /* the Inputs type list offers LL, OL, OIL, CCL, PL, FCL, EL, CL, HL, OML… — LL is the plain leave */
say('E16 pick', pick)
await W.toastSpy(p)
await p.evaluate(() => { window.__w1toast = [] })
/* watch every text node that appears (toasts, notes, banners) while the form is filed */
await p.evaluate(() => { window.__e16seen = []; new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes || []) { const t = (n.nodeType === 3 ? n.data : (n.innerText || '')).replace(/\s+/g, ' ').trim(); if (t && t.length < 400) window.__e16seen.push(t) } }).observe(document.body, { childList: true, subtree: true }) })
const filed = await RC.fileInput(p, { person: 'bane', type: pick, di: SAT, allday: false, from: '06:00', to: '06:30', remarks: 'walker E leave' })
const toasts = await W.toasts(p)
const seen = await p.evaluate(() => (window.__e16seen || []).filter(t => /work|record|leave|clash|overlap|OIL|file/i.test(t)).slice(0, 12))
const pAfter = await P(p, 'E16-inputs-after')
const rowTxt = await p.evaluate(i => { const t = document.querySelector(`#inBody tr[data-iid="${i}"]`); return t ? t.innerText.replace(/\s+/g, ' ').trim() : 'NO ROW' }, filed.iid)
const bodyNote = await p.evaluate(() => { const t = document.body.innerText.replace(/\s+/g, ' '); const m = /[^.]{0,160}(working|recorded as)[^.]{0,200}/i.exec(t); return m ? m[0] : '' })
say('E16 filed', JSON.stringify(filed), JSON.stringify(toasts), JSON.stringify(seen), rowTxt, 'BODY:', bodyNote)
row('E16.note', 'RECORD the note the app gives when the leave 06:00–06:30 on 18 Jul is filed for Ranger (Inputs page)', `type "${pick}"; filed ${JSON.stringify(filed)}; toasts ${JSON.stringify(toasts)}; notes seen ${JSON.stringify(seen)}; the row reads "${rowTxt}"; text on the page about it: "${bodyNote}"`, 'RECORDED', [pF, pAfter])
const e1 = await look(p, 'bane', SATI, SAT, 'E16-after')
say('E16 after', sum(e1))
/* the Leave War day for Ranger: amber? */
await A.lwOpenMonth(p, 'JUL')
const cell = await A.lwCellOf(p, 'bane', SATI)
await p.evaluate(([i, d]) => { const c = document.querySelector(`[data-testid="cell-${i}-${d}"]`); if (c) c.scrollIntoView({ block: 'center', inline: 'center' }) }, ['bane', SATI]); await sleep(300)
const colour = await p.evaluate(([i, d]) => { const c = document.querySelector(`[data-testid="cell-${i}-${d}"]`); if (!c) return null; const cs = getComputedStyle(c); return { bg: cs.backgroundColor, cls: String(c.className), text: (c.innerText || '').trim(), title: c.getAttribute('title'), kids: [...c.querySelectorAll('*')].map(k => { const ks = getComputedStyle(k); return k.tagName + '.' + String(k.className).slice(0, 30) + ' "' + (k.innerText || '').trim().slice(0, 8) + '" color ' + ks.color + ' bg ' + ks.backgroundColor + ' border ' + ks.borderTopColor }) } }, ['bane', SATI])
const pLW = await P(p, 'E16-leavewar-day')
const sib = await p.evaluate(([i]) => { const c = document.querySelector(`[data-testid="cell-${i}-2026-07-17"]`); if (!c) return null; const cs = getComputedStyle(c); return { bg: cs.backgroundColor, cls: String(c.className) } }, ['bane'])
row('E16.lw', 'RECORD whether the Leave War day goes amber, and the cell / tracker / day after the leave is filed', `Leave War cell ${JSON.stringify(colour)} (a plain Friday for comparison ${JSON.stringify(sib)}); ${sum(e1)}`, 'RECORDED', [pLW, ...e1.pics])
const errs = E.cleanErr(errors)
console.log('ERRORS', JSON.stringify(errs))
A.savePart('ows-E-s8', { errors: errs, pics: E.pics.saved })
await browser.close()
